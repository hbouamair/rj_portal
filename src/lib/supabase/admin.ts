import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceKey, supabaseUrl } from "./env";

/**
 * Service-role Supabase client. Bypasses RLS — server-side only.
 * Never import this from client components.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
