import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("media_jobs")
    .select("id,status,output_video_key,error,finished_at,order_id")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, job: data });
}
