import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const Body = z.object({
  jobId: z.string().uuid(),
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

async function runwayEphemeralUpload(imageBuf: Buffer, filename: string, contentType: string) {
  const apiKey = getRunwayApiKey();

  // 1) Create upload
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
  if (!createRes.ok) {
    throw new Error(`Runway upload create failed: ${JSON.stringify(createJson)}`);
  }

  const uploadUrl = createJson.uploadUrl;
  const fields = createJson.fields;
  const runwayUri = createJson.runwayUri;

  if (!uploadUrl || !fields || !runwayUri) {
    throw new Error("Runway upload response missing uploadUrl/fields/runwayUri");
  }

  // 2) Presigned POST to S3
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

async function runwayImageToVideo(runwayImageUri: string) {
  const apiKey = getRunwayApiKey();

  // Create task
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
      promptText: "subtle natural motion, slight head movement, blinking, realistic lighting",
      duration: 4,
      ratio: "960:960",
    }),
  });

  const job: any = await createRes.json();
  if (!createRes.ok) throw new Error(`image_to_video create failed: ${JSON.stringify(job)}`);

  const taskId = job.id;
  if (!taskId) throw new Error("No task id returned from runway");

  // Poll
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

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { jobId } = parsed.data;

  // Job laden
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("media_jobs")
    .select("id, order_id, input_image_key, status")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Schutz: nicht doppelt verarbeiten
  if (job.status === "done") {
    return NextResponse.json({ ok: true, job, note: "Already done" });
  }
  if (job.status === "processing") {
    return NextResponse.json({ error: "Job is already processing" }, { status: 409 });
  }

  // Status setzen
  await supabaseAdmin.from("media_jobs").update({ status: "processing", error: null }).eq("id", jobId);

  try {
    // Input ist relativ zu /public (z.B. uploads/<orderId>/<file>.jpg)
    const inputPath = path.join(process.cwd(), "public", job.input_image_key);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Output-Ordner
    const outDir = path.join(process.cwd(), "public", "uploads", String(job.order_id));
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outputKey = `uploads/${job.order_id}/output_${Date.now()}.mp4`;
    const outputPath = path.join(process.cwd(), "public", outputKey);

    // 1) Bild laden
    const imageBuf = fs.readFileSync(inputPath);

    // 2) Ephemeral Upload zu Runway
const ext = path.extname(inputPath).toLowerCase();
const contentType =
  ext === ".png" ? "image/png" :
  ext === ".webp" ? "image/webp" :
  "image/jpeg";

const runwayUri = await runwayEphemeralUpload(imageBuf, `input${ext || ".jpg"}`, contentType);
    // 3) AI Video generieren
    const result = await runwayImageToVideo(runwayUri);

    // 4) Output Video URL auslesen
    const out0 = Array.isArray(result.output) ? result.output[0] : null;

const videoUrl =
  typeof out0 === "string"
    ? out0
    : (out0 && typeof out0 === "object" && "url" in out0 ? (out0 as any).url : null);

if (!videoUrl || typeof videoUrl !== "string") {
  throw new Error(`No output video URL in runway result: ${JSON.stringify(result.output)}`);
}


    // 5) MP4 downloaden und speichern
    const vidRes = await fetch(videoUrl);
    if (!vidRes.ok) throw new Error(`Failed to download video: ${vidRes.status}`);

    const arr = new Uint8Array(await vidRes.arrayBuffer());
    fs.writeFileSync(outputPath, arr);

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Output MP4 wurde nicht erstellt: ${outputPath}`);
    }

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

    if (updErr || !updated) {
      throw new Error("Failed to update job in DB");
    }

    return NextResponse.json({ ok: true, job: updated });
  } catch (e: any) {
    await supabaseAdmin
      .from("media_jobs")
      .update({ status: "failed", error: String(e?.message || e) })
      .eq("id", jobId);

    return NextResponse.json(
      { error: "Job failed", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
