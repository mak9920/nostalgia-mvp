"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/create";

    if (!code) {
      router.replace("/login?error=1");
      return;
    }

    // server exchange (sets cookies) + redirect
    window.location.replace(
      `/api/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
    );
  }, [router]);

  return null;
}
