/**
 * Supabase env access. Supports both the legacy names (anon / service_role)
 * and the new API key names (publishable / secret).
 *
 * NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline
 * them into client bundles.
 */

export function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!;
}

export function supabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
}

/** Server-only: service_role (legacy) or secret (sb_secret_...) key. */
export function supabaseServiceKey(): string {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;
  if (!key?.trim()) {
    throw new Error(
      "Missing Supabase server key. Add SUPABASE_SECRET_KEY (sb_secret_...) or " +
        "SUPABASE_SERVICE_ROLE_KEY to .env.local — Supabase Dashboard → Project Settings → API Keys."
    );
  }
  return key;
}
