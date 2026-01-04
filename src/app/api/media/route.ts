export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const Q = z.object({
  path: z.string().min(1),
});

function normalizeStoragePath(p: string) {
  // akzeptiere sowohl "uploads/<orderId>/file.mp4" als auch "<orderId>/file.mp4"
  const s = p.replace(/^\/+/, "");
  return s.startsWith("uploads/") ? s.slice("uploads/".length) : s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse({ path: url.searchParams.get("path") || "" });
  if (!parsed.success) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const storagePath = normalizeStoragePath(parsed.data.path);
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .storage
    .from("uploads")
    .createSignedUrl(storagePath, 60 * 60); // 1h

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not sign url", details: error?.message }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
