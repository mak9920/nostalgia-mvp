"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase OAuth callback verarbeitet typischerweise URL Hash/Query
    // und setzt Session-Cookies / Tokens
    (async () => {
      // je nach Flow:
      // await supabase.auth.getSession();
      // oder
      // await supabase.auth.exchangeCodeForSession(window.location.href);

      // Wenn du PKCE Code Flow nutzt:
      const url = window.location.href;
      const { error } = await supabase.auth.exchangeCodeForSession(url);

      // Danach wohin du willst
      router.replace(error ? "/login?error=1" : "/");
    })();
  }, [router]);

  return null;
}
