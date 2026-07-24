import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/** Quick Supabase connectivity check (no secrets exposed). Visit /api/health/supabase after deploy. */
export async function GET() {
  const checks = {
    url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    anonKey: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    ),
    secretKey: Boolean(
      process.env.SUPABASE_SECRET_KEY?.trim() ??
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    ),
    resendKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? null,
  };

  if (!checks.url || !checks.anonKey) {
    return NextResponse.json({
      ok: false,
      checks,
      error:
        "Variables Supabase publiques manquantes sur Vercel (URL + anon key).",
    });
  }

  try {
    const supabase = getSupabasePublic();
    const [{ count: studioCount, error: studioErr }, { data: settings, error: settingsErr }] =
      await Promise.all([
        supabase
          .from("studios")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
        supabase.from("settings").select("id").eq("id", 1).maybeSingle(),
      ]);

    if (studioErr?.message.includes("does not exist")) {
      return NextResponse.json({
        ok: false,
        checks,
        error:
          "Tables Supabase absentes — exécutez supabase/migration.sql dans le SQL Editor.",
      });
    }

    if (studioErr || settingsErr) {
      return NextResponse.json({
        ok: false,
        checks,
        error: studioErr?.message ?? settingsErr?.message ?? "Erreur Supabase",
      });
    }

    return NextResponse.json({
      ok: true,
      checks,
      activeStudios: studioCount ?? 0,
      settingsRow: Boolean(settings),
      hint:
        (studioCount ?? 0) === 0
          ? "Connexion OK mais aucun studio actif — lancez migration.sql ou créez des studios dans l'admin."
          : undefined,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      checks,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    });
  }
}
