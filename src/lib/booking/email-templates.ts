import type { Booking, Settings, Studio } from "./types";
import { PAYMENT_METHOD_LABELS } from "./types";
import { formatDurationLabel, formatMad, minutesToTimeString } from "./pricing";
import { CONTACT_ADDRESS } from "@/lib/constants";

/**
 * HTML emails for the booking flow. Inline styles only, same visual
 * language as the contact email template.
 */

const BRAND = {
  primary: "#1E3A5F",
  secondary: "#2A9D8F",
  accent: "#E76F51",
  cream: "#FDFBF7",
  warmGold: "#F2E7AF",
  charcoal: "#2D2D2D",
  softCharcoal: "#5C5C5C",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

function formatDateFr(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDeadlineFr(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}

interface BookingEmailContext {
  booking: Booking;
  studio: Pick<Studio, "name">;
  settings: Pick<Settings, "paypal_email" | "paypal_link" | "bank_details">;
  trackingUrl: string;
}

function shell(title: string, tagline: string, bodyRows: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12);">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%); padding: 36px 40px; text-align: center;">
              <span style="display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.9); margin-bottom: 8px;">Réservation</span>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">RJ Studio</h1>
              <p style="margin: 12px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">${escapeHtml(tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${bodyRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; background-color: ${BRAND.cream}; border-top: 1px solid rgba(0,0,0,0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.softCharcoal};">
                RJ Studio · ${CONTACT_ADDRESS} · +212 661 77 74 21
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function card(content: string, accentColor?: string): string {
  const border = accentColor
    ? `border-left: 4px solid ${accentColor}; border-top: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); border-bottom: 1px solid rgba(0,0,0,0.06);`
    : `border: 1px solid rgba(0,0,0,0.06);`;
  return `
    <tr>
      <td style="padding-bottom: 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.cream}; border-radius: 16px; ${border}">
          <tr><td style="padding: 20px 24px;">${content}</td></tr>
        </table>
      </td>
    </tr>
  `;
}

function summaryCard(ctx: BookingEmailContext): string {
  const { booking, studio } = ctx;
  const endMinutes = booking.start_minutes + booking.duration_minutes;
  const rows: Array<[string, string]> = [
    ["Référence", booking.reference],
    ["Studio", studio.name],
    ["Date", formatDateFr(booking.date)],
    [
      "Horaire",
      `${minutesToTimeString(booking.start_minutes)} – ${minutesToTimeString(endMinutes)} (${formatDurationLabel(booking.duration_minutes)})`,
    ],
    ["Prix total", formatMad(Number(booking.total_price_mad))],
    ["Paiement", PAYMENT_METHOD_LABELS[booking.payment_method]],
  ];
  const content = rows
    .map(
      ([label, value]) => `
        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">${escapeHtml(label)}</p>
        <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(value)}</p>`
    )
    .join("");
  return card(content);
}

function paymentInstructions(ctx: BookingEmailContext): string {
  const { booking, settings } = ctx;
  let details = "";

  if (booking.payment_method === "paypal") {
    const target = settings.paypal_link
      ? `<a href="${escapeHtml(settings.paypal_link)}" style="color: ${BRAND.primary}; font-weight: 600;">${escapeHtml(settings.paypal_link)}</a>`
      : `<strong>${escapeHtml(settings.paypal_email ?? "")}</strong>`;
    details = `Envoyez le montant total via PayPal à : ${target}<br><br>Indiquez votre référence <strong>${escapeHtml(booking.reference)}</strong> dans la note du paiement.`;
  } else if (booking.payment_method === "virement") {
    const bank = escapeHtml(settings.bank_details ?? "").replace(/\n/g, "<br>");
    details = `Effectuez un virement bancaire avec les coordonnées suivantes :<br><br>${bank}<br><br>Indiquez votre référence <strong>${escapeHtml(booking.reference)}</strong> dans le motif du virement.`;
  } else {
    details = `Vous avez choisi de payer en espèces au studio. Merci de passer régler votre réservation <strong>avant la date limite ci-dessous</strong> pour la confirmer.<br><br>Adresse : ${CONTACT_ADDRESS}.`;
  }

  const deadline = formatDeadlineFr(booking.payment_deadline);
  return (
    card(
      `<p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Comment payer</p>
       <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${BRAND.charcoal};">${details}</p>`
    ) +
    card(
      `<p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.accent};">Important — Date limite</p>
       <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${BRAND.charcoal};">Votre réservation doit être payée et confirmée avant le <strong>${escapeHtml(deadline)}</strong>. Passé ce délai, elle sera automatiquement annulée et le créneau sera libéré.</p>`,
      BRAND.accent
    )
  );
}

function trackingButton(trackingUrl: string): string {
  return `
    <tr>
      <td style="padding: 8px 0 4px; text-align: center;">
        <a href="${escapeHtml(trackingUrl)}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 999px;">Suivre ma réservation</a>
      </td>
    </tr>
  `;
}

function intro(text: string): string {
  return `
    <tr>
      <td style="padding-bottom: 24px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${BRAND.charcoal};">${text}</p>
      </td>
    </tr>
  `;
}

export function getBookingReceivedEmailHtml(ctx: BookingEmailContext): string {
  const body =
    intro(
      `Bonjour <strong>${escapeHtml(ctx.booking.customer_name)}</strong>,<br><br>Nous avons bien reçu votre demande de réservation. Elle est <strong>en attente de paiement</strong> : suivez les instructions ci-dessous pour la confirmer.`
    ) +
    summaryCard(ctx) +
    paymentInstructions(ctx) +
    trackingButton(ctx.trackingUrl);
  return shell(
    "Réservation reçue - RJ Studio",
    "Votre demande de réservation a bien été reçue",
    body
  );
}

export function getBookingConfirmedEmailHtml(ctx: BookingEmailContext): string {
  const body =
    intro(
      `Bonjour <strong>${escapeHtml(ctx.booking.customer_name)}</strong>,<br><br>Bonne nouvelle ! Votre paiement a été reçu et votre réservation est <strong style="color: ${BRAND.secondary};">confirmée</strong>. Nous vous attendons au studio.`
    ) +
    summaryCard(ctx) +
    trackingButton(ctx.trackingUrl);
  return shell(
    "Réservation confirmée - RJ Studio",
    "Votre réservation est confirmée",
    body
  );
}

export function getBookingCancelledEmailHtml(
  ctx: BookingEmailContext,
  reason: "cancelled" | "expired"
): string {
  const message =
    reason === "expired"
      ? `Votre réservation <strong>${escapeHtml(ctx.booking.reference)}</strong> a été <strong>annulée automatiquement</strong> car le paiement n'a pas été reçu avant la date limite. Le créneau a été libéré.<br><br>Vous pouvez effectuer une nouvelle réservation à tout moment sur notre site.`
      : `Votre réservation <strong>${escapeHtml(ctx.booking.reference)}</strong> a été <strong>annulée</strong>.<br><br>Si vous avez des questions ou souhaitez re-réserver, contactez-nous ou effectuez une nouvelle réservation sur notre site.`;
  const body =
    intro(
      `Bonjour <strong>${escapeHtml(ctx.booking.customer_name)}</strong>,<br><br>${message}`
    ) + summaryCard(ctx);
  return shell(
    "Réservation annulée - RJ Studio",
    reason === "expired" ? "Réservation expirée" : "Réservation annulée",
    body
  );
}

export function getAdminNewBookingEmailHtml(ctx: BookingEmailContext): string {
  const { booking } = ctx;
  const customer = card(
    `<p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Client</p>
     <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(booking.customer_name)}</p>
     <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Email</p>
     <p style="margin: 0 0 14px 0; font-size: 16px;"><a href="mailto:${escapeHtml(booking.customer_email)}" style="color: ${BRAND.primary}; font-weight: 600; text-decoration: none;">${escapeHtml(booking.customer_email)}</a></p>
     <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Téléphone</p>
     <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(booking.customer_phone)}</p>
     ${booking.note ? `<p style="margin: 14px 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Note</p><p style="margin: 0; font-size: 15px; color: ${BRAND.charcoal};">${escapeHtml(booking.note)}</p>` : ""}`
  );
  const body =
    intro(
      `Nouvelle réservation <strong>en attente de paiement</strong> (${escapeHtml(PAYMENT_METHOD_LABELS[booking.payment_method])}). À confirmer dans le tableau de bord une fois le paiement reçu.`
    ) +
    summaryCard(ctx) +
    customer;
  return shell(
    "Nouvelle réservation - RJ Studio",
    `Nouvelle réservation ${escapeHtml(booking.reference)}`,
    body
  );
}

function formatHoursUntil(hours: number): string {
  if (hours >= 48) {
    const days = Math.round(hours / 24);
    return days === 1 ? "demain" : `dans ${days} jours`;
  }
  const rounded = Math.max(1, Math.round(hours));
  return rounded === 1 ? "dans environ 1 heure" : `dans environ ${rounded} heures`;
}

/** Reminder sent to the client before the session. */
export function getBookingClientReminderEmailHtml(
  ctx: BookingEmailContext,
  hoursUntilStart: number
): string {
  const when = formatHoursUntil(hoursUntilStart);
  const isPending = ctx.booking.status === "pending";
  const introText = isPending
    ? `Bonjour <strong>${escapeHtml(ctx.booking.customer_name)}</strong>,<br><br>Votre créneau au studio approche (<strong>${when}</strong>), mais votre réservation est <strong>toujours en attente de paiement</strong>. Merci de finaliser le règlement avant la date limite pour conserver votre créneau.`
    : `Bonjour <strong>${escapeHtml(ctx.booking.customer_name)}</strong>,<br><br>Petit rappel : votre réservation au studio a lieu <strong>${when}</strong>. Nous vous attendons à l'adresse indiquée ci-dessous.`;
  const body =
    intro(introText) +
    summaryCard(ctx) +
    (isPending ? paymentInstructions(ctx) : "") +
    card(
      `<p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Adresse</p>
       <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${BRAND.charcoal};">RJ Studio · ${CONTACT_ADDRESS}<br>Tél. +212 661 77 74 21</p>`
    ) +
    trackingButton(ctx.trackingUrl);
  return shell(
    "Rappel de réservation - RJ Studio",
    isPending ? "Votre créneau approche — paiement en attente" : "Votre réservation approche",
    body
  );
}

/** Reminder sent to the admin before a session. */
export function getBookingAdminReminderEmailHtml(
  ctx: BookingEmailContext,
  hoursUntilStart: number
): string {
  const { booking } = ctx;
  const when = formatHoursUntil(hoursUntilStart);
  const statusLabel =
    booking.status === "pending" ? "En attente de paiement" : "Confirmée";
  const customer = card(
    `<p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Client</p>
     <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(booking.customer_name)}</p>
     <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Email</p>
     <p style="margin: 0 0 14px 0; font-size: 16px;"><a href="mailto:${escapeHtml(booking.customer_email)}" style="color: ${BRAND.primary}; font-weight: 600; text-decoration: none;">${escapeHtml(booking.customer_email)}</a></p>
     <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Téléphone</p>
     <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(booking.customer_phone)}</p>
     ${booking.note ? `<p style="margin: 14px 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Note client</p><p style="margin: 0; font-size: 15px; color: ${BRAND.charcoal};">${escapeHtml(booking.note)}</p>` : ""}`
  );
  const body =
    intro(
      `Rappel : une réservation a lieu <strong>${when}</strong> (${escapeHtml(statusLabel)} · ${escapeHtml(PAYMENT_METHOD_LABELS[booking.payment_method])}).`
    ) +
    summaryCard(ctx) +
    customer;
  return shell(
    "Rappel réservation - RJ Studio",
    `Rappel — ${escapeHtml(booking.reference)} ${when}`,
    body
  );
}
