import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/create";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=1`, url.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, anonKey);

  // Exchange code -> session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL(`/login?error=1`, url.origin));
  }

  // IMPORTANT:
  // Middleware/Server braucht Cookies. Supabase-js setzt im Browser localStorage,
  // daher setzen wir hier einfache Tokens als Cookies (für deinen aktuellen Guard).
  const res = NextResponse.redirect(new URL(next, url.origin));

  res.cookies.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set("sb-refresh-token", data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
