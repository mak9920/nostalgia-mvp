import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureDir, getOrderUploadDir } from "@/lib/localUpload";
import fs from "fs";
import path from "path";
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
  // Solide Defaults: nicht riesig, aber genug Details für AI
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

  // Hintergrund: Bild "cover" + blur
  const bg = await sharp(input)
    .rotate()
    .resize(w, h, { fit: "cover" })
    .blur(18)
    .modulate({ brightness: 0.9, saturation: 0.9 })
    .toBuffer();

  // Vordergrund: Bild "contain" (keine Crops), leicht “eingepasst”
  const fg = await sharp(input)
    .rotate()
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Zusammensetzen: bg + fg
  const out = await sharp(bg)
    .composite([{ input: fg, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();

  return out;
}

// Wichtig: Next.js App Router kann Request.formData() nativ!
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const supabaseAdmin = getSupabaseAdmin();

    const orderId = String(form.get("orderId") || "");
    const file = form.get("file");

    // ✅ neue Felder aus FormData
    const aspectRatio = parseAspectRatio(form.get("aspectRatio"));
    const motionStyle = parseMotionStyle(form.get("motionStyle"));

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Basic file checks
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
    }

    const uploadDir = getOrderUploadDir(orderId);
    ensureDir(uploadDir);

    // Original speichern (optional, aber hilfreich fürs Debuggen)
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
    const originalName = `orig_${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;
    const originalPath = path.join(uploadDir, originalName);

    const arrayBuffer = await file.arrayBuffer();
    const originalBuf = Buffer.from(arrayBuffer);

    fs.writeFileSync(originalPath, originalBuf);

    // ✅ Preprocessing: contain/letterbox in gewünschtes Format
    const preparedBuf = await makeLetterboxedImage(originalBuf, aspectRatio);

    // Prepared speichern (Runway soll dieses Bild bekommen)
    const preparedName = `prep_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`;
    const preparedPath = path.join(uploadDir, preparedName);
    fs.writeFileSync(preparedPath, preparedBuf);

    // Job soll mit PREP Bild arbeiten:
    const relativePreparedPath = `uploads/${orderId}/${preparedName}`;

    // media_jobs anlegen (✅ neue Felder speichern)
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("media_jobs")
      .insert({
        order_id: orderId,
        input_image_key: relativePreparedPath,
        status: "queued",
        aspect_ratio: aspectRatio,
        motion_style: motionStyle,
      })
      .select("id, status, input_image_key, aspect_ratio, motion_style")
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job insert failed", supabase: jobErr }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      job,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upload failed", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
