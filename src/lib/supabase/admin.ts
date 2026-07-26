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

/** Returns null when the service key is missing or invalid (e.g. publishable key on Vercel). */
export function tryGetSupabaseAdmin(): SupabaseClient | null {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}
