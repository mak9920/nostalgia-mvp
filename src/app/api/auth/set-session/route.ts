import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { access_token?: string; refresh_token?: string; next?: string }
    | null;

  const access_token = body?.access_token;
  const refresh_token = body?.refresh_token;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false }, { status: 400 });
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

  return res;
}
