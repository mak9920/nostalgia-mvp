export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams.get("path");
  if (!p) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin.storage.from("uploads").createSignedUrl(p, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not sign url", details: error?.message }, { status: 500 });
  }

  // Redirect auf signed URL (Video Tag kann das abspielen)
  return NextResponse.redirect(data.signedUrl);
}
