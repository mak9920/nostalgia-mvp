import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const BodySchema = z.object({
  email: z.string().email(),
  locale: z.string().optional().default("de"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
const supabaseAdmin = getSupabaseAdmin();

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, locale } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({ email, locale, status: "created" })
    .select("id,email,status,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "DB insert failed", supabase: error }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
