import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseFromEmail(raw: string | undefined): {
  display: string | null;
  address: string | null;
  domain: string | null;
} {
  if (!raw?.trim()) {
    return { display: null, address: null, domain: null };
  }
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  const match = trimmed.match(/<([^>]+)>/);
  const address = (match?.[1] ?? trimmed).trim().toLowerCase();
  const domain = address.includes("@") ? address.split("@")[1] : null;
  return { display: trimmed, address, domain };
}

/** Visit /api/health/email after deploy — checks Resend env (no secrets exposed). */
export async function GET() {
  const from = parseFromEmail(process.env.RESEND_FROM_EMAIL);
  const hasKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const keyPrefix = process.env.RESEND_API_KEY?.trim().slice(0, 3) ?? "";

  const issues: string[] = [];

  if (!hasKey) {
    issues.push("RESEND_API_KEY manquant sur Vercel.");
  } else if (keyPrefix !== "re_") {
    issues.push("RESEND_API_KEY semble invalide (doit commencer par re_).");
  }

  if (!from.address) {
    issues.push(
      "RESEND_FROM_EMAIL manquant. Exemple : RJ Studio <contact@rjstudio.ma>"
    );
  } else if (from.domain !== "rjstudio.ma") {
    issues.push(
      `RESEND_FROM_EMAIL utilise @${from.domain} — votre domaine vérifié dans Resend est rjstudio.ma. ` +
        "Utilisez une adresse @rjstudio.ma (ex. contact@rjstudio.ma), pas @studiorj.ma."
    );
  }

  if (from.display?.includes("onboarding@resend.dev")) {
    issues.push(
      "RESEND_FROM_EMAIL pointe encore vers onboarding@resend.dev (mode test — emails limités)."
    );
  }

  return NextResponse.json({
    ok: issues.length === 0,
    checks: {
      resendKey: hasKey,
      fromEmail: from.address,
      fromDomain: from.domain,
      expectedDomain: "rjstudio.ma",
      adminEmail:
        process.env.BOOKING_ADMIN_EMAIL?.trim() ??
        process.env.CONTACT_TO_EMAIL?.trim() ??
        null,
    },
    issues,
    hint:
      issues.length === 0
        ? "Config OK côté env. Si les emails n'arrivent pas : vérifiez Resend → Emails (logs), le dossier spam, et redéployez après toute modification d'env."
        : undefined,
  });
}
