"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next") || "/create";

    // CASE 1: PKCE Code Flow (?code=...)
    const code = url.searchParams.get("code");
    if (code) {
      window.location.replace(
        `/api/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
      );
      return;
    }

    // CASE 2: Implicit Flow (#access_token=...&refresh_token=...)
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    if (access_token && refresh_token) {
      (async () => {
        const res = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token, next }),
        });

        if (res.ok) {
          window.location.replace(next);
        } else {
          window.location.replace("/login?error=1");
        }
      })();
      return;
    }

    // nothing usable
    window.location.replace("/login?error=1");
  }, []);

  return null;
}
