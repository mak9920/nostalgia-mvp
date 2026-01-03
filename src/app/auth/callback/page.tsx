"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next") || "/create";

    // Supabase implicit flow sends tokens in the hash
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const params = new URLSearchParams(hash);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      window.location.replace("/login?error=1");
      return;
    }

    (async () => {
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token, next }),
      });

      window.location.replace(res.ok ? next : "/login?error=1");
    })();
  }, []);

  return null;
}
