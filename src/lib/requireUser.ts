import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function requireUser() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("sb-access-token")?.value;

  if (!access_token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${access_token}` } } }
  );

  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}
