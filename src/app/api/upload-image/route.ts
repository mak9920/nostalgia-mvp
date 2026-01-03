export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import sharp from "sharp";

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
type MotionStyle =
  | "mystery"
  | "friendly_wave"
  | "playful"
  | "warm_hug"
  | "sweet_kiss"
  | "natural_walk"
  | "blossoming_flowers";

const ALLOWED_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];
const ALLOWED_MOTIONS: MotionStyle[] = [
  "mystery",
  "friendly_wave",
  "playful",
  "warm_hug",
  "sweet_kiss",
  "natural_walk",
  "blossoming_flowers",
];

function parseAspectRatio(v: unknown): AspectRatio {
  const s = String(v || "").trim() as AspectRatio;
  return ALLOWED_RATIOS.includes(s) ? s : "16:9";
}
function parseMotionStyle(v: unknown): MotionStyle {
  const s = String(v || "").trim() as MotionStyle;
  return ALLOWED_MOTIONS.includes(s) ? s : "mystery";
}

function targetSizeForRatio(r: AspectRatio) {
  switch (r) {
    case "16:9":
      return { w: 1280, h: 720 };
    case "9:16":
      return { w: 720, h: 1280 };
    case "1:1":
      return { w: 960, h: 960 };
    case "4:5":
      return { w: 960, h: 1200 };
  }
}

async function makeLetterboxedImage(input: Buffer, ratio: AspectRatio) {
  const { w, h } = targetSizeForRatio(ratio);

  const bg = await sharp(input)
    .rotate()
    .resize(w, h, { fit: "cover" })
    .blur(18)
    .modulate({ brightness: 0.9, saturation: 0.9 })
    .toBuffer();

  const fg = await sharp(input)
    .rotate()
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp(bg)
    .composite([{ input: fg, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const supabaseAdmin = getSupabaseAdmin();

    const orderId = String(form.get("orderId") || "");
    const file = form.get("file");

    const aspectRatio = parseAspectRatio(form.get("aspectRatio"));
    const motionStyle = parseMotionStyle(form.get("motionStyle"));

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
    }

    // Order prüfen
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id,status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Bild-Buffer
    const originalBuf = Buffer.from(await file.arrayBuffer());

    // ✅ Preprocess: contain/letterbox
    const preparedBuf = await makeLetterboxedImage(originalBuf, aspectRatio);

    // ✅ In Supabase Storage speichern
    const prepName = `prep_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`;
    const storagePath = `uploads/${orderId}/${prepName}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("uploads")
      .upload(storagePath, preparedBuf, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (upErr) {
      return NextResponse.json({ error: "Storage upload failed", details: upErr.message }, { status: 500 });
    }

    // ✅ Job anlegen (input_image_key = Storage-Pfad)
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("media_jobs")
      .insert({
        order_id: orderId,
        input_image_key: storagePath,
        status: "queued",
        aspect_ratio: aspectRatio,
        motion_style: motionStyle,
      })
      .select("id, status, input_image_key, aspect_ratio, motion_style")
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job insert failed", supabase: jobErr }, { status: 500 });
    }

    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    return NextResponse.json({ error: "Upload failed", details: String(e?.message || e) }, { status: 500 });
  }
}
