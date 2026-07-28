import { getResendClient } from "@/lib/resend-client";
import { formatResendError, getFromEmail } from "@/lib/email-config";
import { CONTACT_EMAIL } from "@/lib/constants";
import type { Booking, Settings, Studio } from "./types";
import { bookingStartUtc } from "./pricing";
import {
  getAdminNewBookingEmailHtml,
  getBookingAdminReminderEmailHtml,
  getBookingCancelledEmailHtml,
  getBookingClientReminderEmailHtml,
  getBookingConfirmedEmailHtml,
  getBookingReceivedEmailHtml,
} from "./email-templates";

const ADMIN_EMAIL =
  process.env.BOOKING_ADMIN_EMAIL ??
  process.env.CONTACT_TO_EMAIL ??
  CONTACT_EMAIL;

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

export function getTrackingUrl(reference: string): string {
  return `${getSiteUrl()}/reservation/${encodeURIComponent(reference)}`;
}

interface EmailContext {
  booking: Booking;
  studio: Pick<Studio, "name">;
  settings: Pick<Settings, "paypal_email" | "paypal_link" | "bank_details">;
}

async function send(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    const error = "RESEND_API_KEY manquant sur le serveur (Vercel → Environment Variables).";
    console.error(`Booking emails: ${error}`);
    return { ok: false, error };
  }
  const resend = getResendClient();
  if (!resend) {
    const error = "Impossible d'initialiser le client Resend (clé API invalide).";
    console.error(`Booking emails: ${error}`);
    return { ok: false, error };
  }

  const from = getFromEmail();

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });
    if (error) {
      const detail = formatResendError(error);
      console.error(`Booking email error (${subject}):`, { from, to, error });
      return { ok: false, error: detail };
    }
    if (!data?.id) {
      console.error(`Booking email no id (${subject}):`, { from, to, data });
      return { ok: false, error: "Resend n'a pas retourné d'identifiant d'email." };
    }
    return { ok: true };
  } catch (err) {
    const detail = formatResendError(err);
    console.error(`Booking email exception (${subject}):`, { from, to, err });
    return { ok: false, error: detail };
  }
}

/** Sent to the client right after the booking is created. */
export async function sendBookingReceivedEmail(ctx: EmailContext) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  return send(
    ctx.booking.customer_email,
    `[RJ Studio] Réservation reçue — ${ctx.booking.reference}`,
    getBookingReceivedEmailHtml({ ...ctx, trackingUrl })
  );
}

/** Sent to the studio admin when a new booking arrives. */
export async function sendAdminNewBookingEmail(ctx: EmailContext) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  return send(
    ADMIN_EMAIL,
    `[RJ Studio] Nouvelle réservation ${ctx.booking.reference} — ${ctx.studio.name}`,
    getAdminNewBookingEmailHtml({ ...ctx, trackingUrl })
  );
}

/** Sent to the client when the admin confirms payment. */
export async function sendBookingConfirmedEmail(ctx: EmailContext) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  return send(
    ctx.booking.customer_email,
    `[RJ Studio] Réservation confirmée — ${ctx.booking.reference}`,
    getBookingConfirmedEmailHtml({ ...ctx, trackingUrl })
  );
}

/** Sent to the client when the booking is cancelled or auto-expired. */
export async function sendBookingCancelledEmail(
  ctx: EmailContext,
  reason: "cancelled" | "expired"
) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  return send(
    ctx.booking.customer_email,
    `[RJ Studio] Réservation ${reason === "expired" ? "expirée" : "annulée"} — ${ctx.booking.reference}`,
    getBookingCancelledEmailHtml({ ...ctx, trackingUrl }, reason)
  );
}

function hoursUntilBookingStart(booking: Pick<Booking, "date" | "start_minutes">): number {
  const startMs = bookingStartUtc(booking.date, booking.start_minutes).getTime();
  return (startMs - Date.now()) / 3_600_000;
}

/** Reminder to the client before the session. */
export async function sendBookingClientReminderEmail(ctx: EmailContext) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  const hoursUntil = hoursUntilBookingStart(ctx.booking);
  const subject =
    ctx.booking.status === "pending"
      ? `[RJ Studio] Rappel — paiement en attente (${ctx.booking.reference})`
      : `[RJ Studio] Rappel — votre réservation approche (${ctx.booking.reference})`;
  return send(
    ctx.booking.customer_email,
    subject,
    getBookingClientReminderEmailHtml({ ...ctx, trackingUrl }, hoursUntil)
  );
}

/** Reminder to the admin before a session. */
export async function sendBookingAdminReminderEmail(ctx: EmailContext) {
  const trackingUrl = getTrackingUrl(ctx.booking.reference);
  const hoursUntil = hoursUntilBookingStart(ctx.booking);
  return send(
    ADMIN_EMAIL,
    `[RJ Studio] Rappel réservation ${ctx.booking.reference} — ${ctx.studio.name}`,
    getBookingAdminReminderEmailHtml({ ...ctx, trackingUrl }, hoursUntil)
  );
}
