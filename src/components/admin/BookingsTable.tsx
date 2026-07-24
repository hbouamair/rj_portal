"use client";

import { useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  Loader2,
  X,
} from "lucide-react";
import type { BookingWithStudio } from "@/lib/booking/types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/booking/types";
import {
  formatDurationLabel,
  formatMad,
  minutesToTimeString,
} from "@/lib/booking/pricing";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  resendBookingConfirmationEmail,
  saveAdminNote,
} from "@/app/admin/actions";

const STATUS_BADGES: Record<string, string> = {
  pending: "admin-badge-pending",
  confirmed: "admin-badge-confirmed",
  completed: "admin-badge-completed",
  cancelled: "admin-badge-cancelled",
  expired: "admin-badge-neutral",
};

function formatDateShort(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BookingsTable({
  bookings,
}: {
  bookings: BookingWithStudio[];
}) {
  if (bookings.length === 0) {
    return (
      <div className="admin-card p-14 text-center">
        <p className="text-white/40 text-sm">
          Aucune réservation trouvée avec ces filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.07] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-white/40">
              <th className="px-4 py-3.5">Référence</th>
              <th className="px-4 py-3.5">Studio</th>
              <th className="px-4 py-3.5">Date & heure</th>
              <th className="px-4 py-3.5">Client</th>
              <th className="px-4 py-3.5">Prix</th>
              <th className="px-4 py-3.5">Paiement</th>
              <th className="px-4 py-3.5">Statut</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingWithStudio }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(booking.admin_note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{
      ok: boolean;
      error?: string;
      message?: string;
      warning?: string;
    }>
  ) {
    setError(null);
    setMessage(null);
    setWarning(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      if (result.warning) setWarning(result.warning);
      if (result.message) setMessage(result.message);
    });
  }

  const deadline = new Date(booking.payment_deadline).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });

  return (
    <>
      <tr
        className="border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer transition-colors duration-150"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap tracking-wide">
          {booking.reference}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-white/80">
          {booking.studios?.name ?? `Studio ${booking.studio_id}`}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className="capitalize font-medium text-white/85">
            {formatDateShort(booking.date)}
          </span>
          <span className="block text-xs text-white/40 mt-0.5">
            {minutesToTimeString(booking.start_minutes)} –{" "}
            {minutesToTimeString(
              booking.start_minutes + booking.duration_minutes
            )}{" "}
            ({formatDurationLabel(booking.duration_minutes)})
          </span>
        </td>
        <td className="px-4 py-3.5">
          <span className="block font-semibold text-white/90">
            {booking.customer_name}
          </span>
          <span className="block text-xs text-white/40 mt-0.5">
            {booking.customer_phone}
          </span>
        </td>
        <td className="px-4 py-3.5 font-display font-bold whitespace-nowrap text-teal-300">
          {formatMad(Number(booking.total_price_mad))}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-white/50">
          {PAYMENT_METHOD_LABELS[booking.payment_method]}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className={STATUS_BADGES[booking.status] ?? "admin-badge-neutral"}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
          {booking.status === "pending" && (
            <span className="block text-[11px] text-white/40 mt-1.5">
              Limite : {deadline}
            </span>
          )}
        </td>
        <td className="px-4 py-3.5">
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/40" />
            ) : (
              <>
                {booking.status === "pending" && (
                  <ActionButton
                    label="Confirmer"
                    tone="green"
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Confirmer la réservation ${booking.reference} ? Le client recevra un email de confirmation à ${booking.customer_email}.`
                        )
                      ) {
                        run(() => confirmBooking(booking.id));
                      }
                    }}
                  />
                )}
                {booking.status === "confirmed" && (
                  <>
                    <ActionButton
                      label="Terminer"
                      tone="blue"
                      icon={<Flag className="w-3.5 h-3.5" />}
                      onClick={() => run(() => completeBooking(booking.id))}
                    />
                    <ActionButton
                      label="Renvoyer email"
                      tone="blue"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() =>
                        run(() => resendBookingConfirmationEmail(booking.id))
                      }
                    />
                  </>
                )}
                {(booking.status === "pending" ||
                  booking.status === "confirmed") && (
                  <ActionButton
                    label="Annuler"
                    tone="red"
                    icon={<X className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Annuler la réservation ${booking.reference} ? Le client recevra un email d'annulation.`
                        )
                      ) {
                        run(() => cancelBooking(booking.id));
                      }
                    }}
                  />
                )}
              </>
            )}
            <span className="w-8 h-8 flex items-center justify-center text-white/40">
              {expanded ? (
                <ChevronUp className="w-4 h-4" aria-hidden />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden />
              )}
            </span>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/[0.05] bg-white/[0.02]">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-white/40">Email :</span>{" "}
                  <a
                    href={`mailto:${booking.customer_email}`}
                    className="font-semibold text-teal-300 hover:underline cursor-pointer"
                  >
                    {booking.customer_email}
                  </a>
                </p>
                <p>
                  <span className="text-white/40">Créée le :</span>{" "}
                  <span className="text-white/85">
                    {new Date(booking.created_at).toLocaleString("fr-FR", {
                      timeZone: "Africa/Casablanca",
                    })}
                  </span>
                </p>
                {booking.note && (
                  <p>
                    <span className="text-white/40">Note client :</span>{" "}
                    <span className="text-white/85">{booking.note}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                  Note interne
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="admin-input flex-1"
                    placeholder="Ex : paiement reçu par virement le…"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(() => saveAdminNote(booking.id, note))}
                    className="admin-btn-primary px-4 min-h-10"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm font-semibold text-rose-300">
                {error}
              </p>
            )}
            {warning && (
              <p role="status" className="mt-3 text-sm font-semibold text-amber-300">
                {warning}
              </p>
            )}
            {message && (
              <p role="status" className="mt-3 text-sm font-semibold text-teal-300">
                {message}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function ActionButton({
  label,
  tone,
  icon,
  onClick,
}: {
  label: string;
  tone: "green" | "red" | "blue";
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const tones = {
    green:
      "bg-teal-400/15 text-teal-300 border border-teal-400/30 hover:bg-teal-400/25",
    red: "bg-rose-400/10 text-rose-300 border border-rose-400/25 hover:bg-rose-400/20",
    blue: "bg-sky-400/10 text-sky-300 border border-sky-400/25 hover:bg-sky-400/20",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-btn min-h-8 px-3 py-1.5 rounded-lg text-[11px] font-bold ${tones[tone]}`}
    >
      {icon}
      {label}
    </button>
  );
}
