/**
 * Supabase env access. Supports both the legacy names (anon / service_role)
 * and the new API key names (publishable / secret).
 *
 * NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline
 * them into client bundles.
 */

export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL manquant. Ajoutez-le dans Vercel → Settings → Environment Variables."
    );
  }
  return url;
}

export function supabaseAnonKey(): string {
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY manquant (clé JWT eyJ…). " +
        "Supabase → Project Settings → API → anon public. " +
        "Ajoutez-la dans Vercel → Environment Variables."
    );
  }
  return key;
}

/** Server-only: service_role (legacy) or secret (sb_secret_...) key. */
export function supabaseServiceKey(): string {
  const fromServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const fromSecret = process.env.SUPABASE_SECRET_KEY?.trim();
  const source = fromServiceRole
    ? "SUPABASE_SERVICE_ROLE_KEY"
    : fromSecret
      ? "SUPABASE_SECRET_KEY"
      : null;
  const key = fromServiceRole ?? fromSecret;

  if (!key || !source) {
    throw new Error(
      "SUPABASE_SECRET_KEY manquant (sb_secret_…). " +
        "Supabase → Project Settings → API Keys → secret. " +
        "Requis pour l'admin et les réservations — ajoutez-le dans Vercel."
    );
  }

  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      `${source} ne doit pas être la clé publishable (sb_publishable_…). ` +
        "Utilisez la clé secret (sb_secret_…) ou le JWT service_role (eyJ…, rôle service_role) " +
        "depuis Supabase → Project Settings → API Keys. " +
        "Sur Vercel, vérifiez aussi qu'aucune variable SUPABASE_SERVICE_ROLE_KEY incorrecte ne remplace SUPABASE_SECRET_KEY."
    );
  }

  const anon = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();
  if (anon && key === anon) {
    throw new Error(
      "SUPABASE_SECRET_KEY est identique à la clé anon. " +
        "Sur Vercel, la clé secret (sb_secret_…) doit être différente de NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return key;
}
