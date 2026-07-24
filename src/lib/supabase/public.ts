import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Server-side read-only client (anon key + RLS).
 * Use for public pages (/studios, /reservation) so they work when only
 * NEXT_PUBLIC_* vars are set on Vercel — no service role required for reads.
 */
export function getSupabasePublic(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
