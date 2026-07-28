import { NextRequest, NextResponse } from "next/server";
import { getContactEmailHtml } from "@/lib/contact-email-template";
import { CONTACT_EMAIL } from "@/lib/constants";
import { getResendClient } from "@/lib/resend-client";
import { formatResendError, getFromEmail } from "@/lib/email-config";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL;

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_PHONE = 30;
const MAX_MESSAGE = 5000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const rateLimit = new Map<string, { count: number; reset: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.error("Contact API: RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Le service de contact est temporairement indisponible." },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    }
    if (name.trim().length > MAX_NAME) {
      return NextResponse.json({ error: "Le nom est trop long." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "L'email est requis." }, { status: 400 });
    }
    if (email.trim().length > MAX_EMAIL) {
      return NextResponse.json({ error: "L'email est trop long." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Le message est requis." }, { status: 400 });
    }
    if (message.trim().length > MAX_MESSAGE) {
      return NextResponse.json({ error: "Le message est trop long." }, { status: 400 });
    }
    if (phone && typeof phone === "string" && phone.trim().length > MAX_PHONE) {
      return NextResponse.json({ error: "Le numéro de téléphone est trop long." }, { status: 400 });
    }

    const html = getContactEmailHtml({
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
      message: message.trim(),
    });

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [TO_EMAIL],
      replyTo: email.trim(),
      subject: `[RJ Studio] Message de ${name.trim()}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: formatResendError(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite." },
      { status: 500 }
    );
  }
}
