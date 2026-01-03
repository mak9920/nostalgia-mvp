import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
type MotionStyle =
  | "mystery"
  | "friendly_wave"
  | "playful"
  | "warm_hug"
  | "sweet_kiss"
  | "natural_walk"
  | "blossoming_flowers";

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

function runwayRatioFromAspect(aspect: AspectRatio): string {
  // Runway expects ratio strings like "16:9"
  // (You currently used "960:960" – that’s basically 1:1. We change to proper ratios.)
  return aspect;
}

function motionPrompt(style: MotionStyle): string {
  // Base guardrails: reduces "random stuff"
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

async function runwayImageToVideo(runwayImageUri: string, promptText: string, ratio: string) {
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
      promptText,
      duration: 4,
      ratio,
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
    return NextResp
