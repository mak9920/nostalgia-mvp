import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL(req.url);

  const body = await req.json().catch(() => null) as
    | { access_token?: string; refresh_token?: string; next?: string }
    | null;

  const access_token = body?.access_token;
  const refresh_token = body?.refresh_token;
  const next = body?.next || "/create";

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: "Missing tokens" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  const secure = process.env.NODE_ENV === "production";

  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });

  // optional: auch Next als Cookie, falls du es brauchst
  res.cookies.set("sb-next", next, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  });

  return res;
}
