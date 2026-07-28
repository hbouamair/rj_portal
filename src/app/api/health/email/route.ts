import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend-client";
import { formatResendError, getFromEmail, getFromAddress } from "@/lib/email-config";

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
  const runtimeFrom = getFromAddress();
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
      runtimeFromEmail: runtimeFrom,
      expectedDomain: "rjstudio.ma",
      adminEmail:
        process.env.BOOKING_ADMIN_EMAIL?.trim() ??
        process.env.CONTACT_TO_EMAIL?.trim() ??
        null,
    },
    issues,
    hint:
      issues.length === 0
        ? "Config OK côté env. Test d'envoi : POST /api/health/email avec Authorization: Bearer CRON_SECRET et body { \"to\": \"votre@email.com\" }."
        : undefined,
  });
}

/** Send a test email (Authorization: Bearer CRON_SECRET). */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({ error: "RESEND_API_KEY manquant." }, { status: 503 });
  }

  let to = "";
  try {
    const body = await request.json();
    to = typeof body?.to === "string" ? body.to.trim() : "";
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Champ \"to\" email invalide." }, { status: 400 });
  }

  const from = getFromEmail();
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "[RJ Studio] Test email Resend",
    html: "<p>Si vous recevez ceci, Resend fonctionne correctement.</p>",
  });

  if (error) {
    return NextResponse.json(
      { ok: false, from, to, error: formatResendError(error) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, from, to, id: data?.id });
}
