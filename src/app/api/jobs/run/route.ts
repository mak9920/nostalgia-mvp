export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const Body = z.object({
  jobId: z.string().uuid(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]).optional(),
  motionStyle: z
    .enum([
      "mystery",
      "friendly_wave",
      "playful",
      "warm_hug",
      "sweet_kiss",
      "natural_walk",
      "blossoming_flowers",
    ])
    .optional(),
});

const supabaseAdmin = getSupabaseAdmin();

const RUNWAY_HOST = "https://api.dev.runwayml.com";
const RUNWAY_VERSION = "2024-11-06";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getRunwayApiKey() {
  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) throw new Error("RUNWAYML_API_SECRET missing in .env.local");
  return apiKey;
}

function motionPrompt(style: string) {
  const base =
    "Use the provided image as the single source of truth. " +
    "Do not add new people, objects, text, logos, or background elements. " +
    "Do not change identity, face, clothing, or environment. " +
    "Keep motion subtle, natural, and realistic.";

  const specific =
    style === "friendly_wave"
      ? "Add a gentle friendly wave. Keep it minimal and natural."
      : style === "playful"
      ? "Add subtle playful motion (small joyful micro-movements)."
      : style === "warm_hug"
      ? "Add a calm warm hug gesture. Keep it subtle and tasteful."
      : style === "sweet_kiss"
      ? "Add a very subtle sweet kiss gesture. Keep it tasteful and minimal."
      : style === "natural_walk"
      ? "Add calm lifelike motion as if slowly walking through time."
      : style === "blossoming_flowers"
      ? "Add gentle blossoming flowers or soft particles around the subject. Do not cover faces."
      : "Choose the best fitting subtle motion for the photo.";

  return `${base} ${specific}`;
}

async function runwayEphemeralUpload(imageBuf: Buffer, filename: string, contentType: string) {
  const apiKey = getRunwayApiKey();

  const createRes = await fetch(`${RUNWAY_HOST}/v1/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Runway-Version": RUNWAY_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "ephemeral",
      filename,
      contentType,
    }),
  });

  const createJson: any = await createRes.json();
  if (!createRes.ok) throw new Error(`Runway upload create failed: ${JSON.stringify(createJson)}`);

  const uploadUrl = createJson.uploadUrl;
  const fields = createJson.fields;
  const runwayUri = createJson.runwayUri;

  if (!uploadUrl || !fields || !runwayUri) {
    throw new Error("Runway upload response missing uploadUrl/fields/runwayUri");
  }

  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, String(v));
  const bytes = new Uint8Array(imageBuf);
  form.append("file", new Blob([bytes], { type: contentType }), filename);

  const postRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!(postRes.status === 204 || postRes.status === 201 || postRes.ok)) {
    const t = await postRes.text().catch(() => "");
    throw new Error(`S3 upload failed (${postRes.status}): ${t}`);
  }

  return runwayUri as string;
}

async function runwayImageToVideo(runwayImageUri: string, promptText: string, ratio: string) {
  const apiKey = getRunwayApiKey();

  const createRes = await fetch(`${RUNWAY_HOST}/v1/image_to_video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Runway-Version": RUNWAY_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gen4_turbo",
      promptImage: runwayImageUri,
      promptText,
      duration: 4,
      ratio, // e.g. "16:9"
    }),
  });

  const job: any = await createRes.json();
  if (!createRes.ok) throw new Error(`image_to_video create failed: ${JSON.stringify(job)}`);

  const taskId = job.id;
  if (!taskId) throw new Error("No task id returned from runway");

  while (true) {
    await sleep(5000);

    const statusRes = await fetch(`${RUNWAY_HOST}/v1/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": RUNWAY_VERSION,
      },
    });

    const status: any = await statusRes.json();
    const state = String(status?.status || "").toLowerCase();

    if (state === "succeeded") return status;
    if (state === "failed") throw new Error(`Runway task failed: ${JSON.stringify(status)}`);
  }
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { jobId } = parsed.data;
  const aspectRatio = parsed.data.aspectRatio ?? "16:9";
  const motionStyle = parsed.data.motionStyle ?? "mystery";

  // Job laden
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("media_jobs")
    .select("id, order_id, input_image_key, status")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status === "done") return NextResponse.json({ ok: true, job, note: "Already done" });
  if (job.status === "processing") return NextResponse.json({ error: "Job is already processing" }, { status: 409 });

  await supabaseAdmin
    .from("media_jobs")
    .update({ status: "processing", error: null, aspect_ratio: aspectRatio, motion_style: motionStyle })
    .eq("id", jobId);

  try {
    // ✅ Input aus Supabase Storage laden
    const { data: dl, error: dlErr } = await supabaseAdmin.storage.from("uploads").download(job.input_image_key);
    if (dlErr || !dl) throw new Error(`Storage download failed: ${dlErr?.message || "no data"}`);

    const imageBuf = Buffer.from(await dl.arrayBuffer());
    const runwayUri = await runwayEphemeralUpload(imageBuf, "input.jpg", "image/jpeg");

    const promptText = motionPrompt(motionStyle);
    const result = await runwayImageToVideo(runwayUri, promptText, aspectRatio);

    const out0 = Array.isArray(result.output) ? result.output[0] : null;
    const videoUrl =
      typeof out0 === "string"
        ? out0
        : out0 && typeof out0 === "object" && "url" in out0
        ? (out0 as any).url
        : null;

    if (!videoUrl || typeof videoUrl !== "string") {
      throw new Error(`No output video URL in runway result: ${JSON.stringify(result.output)}`);
    }

    // Video downloaden
    const vidRes = await fetch(videoUrl);
    if (!vidRes.ok) throw new Error(`Failed to download video: ${vidRes.status}`);
    const mp4Buf = Buffer.from(await vidRes.arrayBuffer());

    // ✅ Output in Supabase Storage speichern
    const outputKey = `uploads/${job.order_id}/output_${Date.now()}.mp4`;
    const { error: upErr } = await supabaseAdmin.storage.from("uploads").upload(outputKey, mp4Buf, {
      contentType: "video/mp4",
      upsert: true,
    });
    if (upErr) throw new Error(`Storage upload mp4 failed: ${upErr.message}`);

    // DB updaten
    const { data: updated, error: updErr } = await supabaseAdmin
      .from("media_jobs")
      .update({
        status: "done",
        output_video_key: outputKey,
        output_video_url: null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .select("id,status,output_video_key,finished_at")
      .single();

    if (updErr || !updated) throw new Error("Failed to update job in DB");

    return NextResponse.json({ ok: true, job: updated });
  } catch (e: any) {
    await supabaseAdmin.from("media_jobs").update({ status: "failed", error: String(e?.message || e) }).eq("id", jobId);
    return NextResponse.json({ error: "Job failed", details: String(e?.message || e) }, { status: 500 });
  }
}
