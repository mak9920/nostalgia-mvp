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
    (async () => {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") || "/create"; // default: /create

      // PKCE code flow
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        router.replace(error ? "/login?error=1" : next);
        return;
      }

      // fallback (hash / existing session)
      const { data, error } = await supabase.auth.getSession();
      router.replace(error || !data.session ? "/login?error=1" : next);
    })();
  }, [router]);

  return null;
}
