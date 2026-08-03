"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
  MapPin,
  XCircle,
} from "lucide-react";
import type { BookingWithStudio, Settings } from "@/lib/booking/types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/booking/types";
import {
  formatDurationLabel,
  formatMad,
  minutesToTimeString,
} from "@/lib/booking/pricing";
import { CONTACT_ADDRESS } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const STATUS_META: Record<
  string,
  { className: string; icon: ReactNode }
> = {
  pending: {
    className: "book-status book-status--pending",
    icon: <Hourglass className="w-4 h-4" aria-hidden />,
  },
  confirmed: {
    className: "book-status book-status--confirmed",
    icon: <CheckCircle2 className="w-4 h-4" aria-hidden />,
  },
  completed: {
    className: "book-status book-status--confirmed",
    icon: <CheckCircle2 className="w-4 h-4" aria-hidden />,
  },
  cancelled: {
    className: "book-status book-status--cancelled",
    icon: <XCircle className="w-4 h-4" aria-hidden />,
  },
  expired: {
    className: "book-status book-status--cancelled",
    icon: <XCircle className="w-4 h-4" aria-hidden />,
  },
};

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

function DetailRow({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3 book-detail-row"
    >
      <span className="book-detail-icon">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-soft-charcoal mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-charcoal capitalize mt-0.5">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function BookingTrackingView({
  booking,
  settings,
}: {
  booking: BookingWithStudio;
  settings: Settings;
}) {
  const status = STATUS_META[booking.status] ?? STATUS_META.pending;
  const endMinutes = booking.start_minutes + booking.duration_minutes;

  const paymentIcon =
    booking.payment_method === "paypal" ? (
      <CreditCard className="w-4 h-4" />
    ) : booking.payment_method === "virement" ? (
      <Building2 className="w-4 h-4" />
    ) : (
      <Banknote className="w-4 h-4" />
    );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <motion.header {...fadeUp} className="text-center mb-2">
        <p className="book-kicker mb-4">Suivi de réservation</p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal tracking-tight">
          Référence{" "}
          <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            {booking.reference}
          </span>
        </h1>
      </motion.header>

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.06 }}
        className="book-frame"
      >
        <div className="book-frame-inner space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-soft-charcoal mb-1">
                Statut
              </p>
              <span className={`inline-flex items-center gap-2 ${status.className}`}>
                {status.icon}
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-soft-charcoal mb-1">
                Total
              </p>
              <p className="text-2xl sm:text-3xl font-display font-bold text-charcoal tabular-nums">
                {formatMad(Number(booking.total_price_mad))}
              </p>
            </div>
          </div>

          <div className="book-panel p-4 sm:p-5 space-y-4">
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Date"
              value={formatDateFr(booking.date)}
              delay={0.1}
            />
            <DetailRow
              icon={<Clock className="w-4 h-4" />}
              label="Horaire"
              value={`${minutesToTimeString(booking.start_minutes)} – ${minutesToTimeString(endMinutes)} (${formatDurationLabel(booking.duration_minutes)})`}
              delay={0.14}
            />
            <DetailRow
              icon={paymentIcon}
              label="Paiement"
              value={PAYMENT_METHOD_LABELS[booking.payment_method]}
              delay={0.18}
            />
            <DetailRow
              icon={<MapPin className="w-4 h-4" />}
              label="Studio"
              value={booking.studios?.name ?? "Studio"}
              delay={0.22}
            />
          </div>
        </div>
      </motion.div>

      {booking.status === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="book-card p-6 border-l-4 border-accent-500"
        >
          <h2 className="font-display font-bold text-charcoal mb-3 tracking-tight">
            Comment confirmer votre réservation
          </h2>
          <div className="text-sm text-soft-charcoal leading-relaxed space-y-3">
            {booking.payment_method === "paypal" && (
              <p>
                Envoyez le montant total via PayPal à{" "}
                <strong className="text-charcoal">
                  {settings.paypal_link ?? settings.paypal_email}
                </strong>{" "}
                en indiquant la référence{" "}
                <strong className="text-charcoal">{booking.reference}</strong>.
              </p>
            )}
            {booking.payment_method === "virement" && (
              <>
                <p>
                  Effectuez un virement bancaire avec la référence{" "}
                  <strong className="text-charcoal">{booking.reference}</strong> en
                  motif :
                </p>
                <pre className="whitespace-pre-wrap book-panel p-4 text-sm text-charcoal rounded-2xl">
                  {settings.bank_details}
                </pre>
              </>
            )}
            {booking.payment_method === "cash" && (
              <p>
                Passez régler votre réservation en espèces au studio ({CONTACT_ADDRESS}) avant la date limite.
              </p>
            )}
            <p className="font-semibold text-accent-500">
              Date limite : {formatDeadlineFr(booking.payment_deadline)}. Passé
              ce délai, la réservation sera automatiquement annulée.
            </p>
          </div>
        </motion.div>
      )}

      {booking.status === "confirmed" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="book-panel-accent p-6"
        >
          <p className="text-sm text-charcoal leading-relaxed">
            Votre paiement a bien été reçu — votre réservation est confirmée.
            Nous vous attendons au studio, {CONTACT_ADDRESS}. À très
            bientôt !
          </p>
        </motion.div>
      )}

      {(booking.status === "cancelled" || booking.status === "expired") && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="book-card p-6 border-l-4 border-red-400"
        >
          <p className="text-sm text-charcoal leading-relaxed">
            {booking.status === "expired"
              ? "Cette réservation a expiré car le paiement n'a pas été reçu dans les délais. Le créneau a été libéré."
              : "Cette réservation a été annulée."}{" "}
            Vous pouvez effectuer une nouvelle réservation à tout moment.
          </p>
          <Link href="/reservation" className="book-btn-primary inline-flex mt-5 min-h-12">
            Nouvelle réservation
          </Link>
        </motion.div>
      )}

      <div className="text-center pt-2">
        <Link href="/reservation" className="book-btn-ghost inline-flex min-h-11 text-sm">
          Nouvelle réservation
        </Link>
      </div>
    </div>
  );
}
