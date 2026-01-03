import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureDir, getOrderUploadDir } from "@/lib/localUpload";
import fs from "fs";
import path from "path";

// Wichtig: Next.js App Router kann Request.formData() nativ!
export async function POST(req: Request) {
  try {
    const form = await req.formData();
const supabaseAdmin = getSupabaseAdmin();

    const orderId = String(form.get("orderId") || "");
    const file = form.get("file");

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

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;
    const filePath = path.join(uploadDir, fileName);

    // File speichern
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const relativePath = `uploads/${orderId}/${fileName}`;

    // media_jobs anlegen
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("media_jobs")
      .insert({
        order_id: orderId,
        input_image_key: relativePath,
        status: "queued",
      })
      .select("id, status, input_image_key")
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job insert failed", supabase: jobErr }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      job,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Upload failed", details: String(e?.message || e) }, { status: 500 });
  }
}
