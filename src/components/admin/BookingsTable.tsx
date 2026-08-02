"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  Layers,
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
  groupBookingsForAdmin,
  packageDateRangeLabel,
  packageStatusSummary,
  packageTotalMad,
} from "@/lib/booking/package-groups";
import {
  cancelBooking,
  cancelPackageBookings,
  completeBooking,
  confirmBooking,
  confirmPackageBookings,
  resendBookingConfirmationEmail,
  saveAdminNote,
} from "@/app/admin/actions";
import { useAdminFeedback } from "@/components/admin/AdminFeedback";

const STATUS_BADGES: Record<string, string> = {
  pending: "admin-badge-pending",
  confirmed: "admin-badge-confirmed",
  completed: "admin-badge-completed",
  cancelled: "admin-badge-cancelled",
  expired: "admin-badge-neutral",
};

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}

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
  const items = useMemo(() => groupBookingsForAdmin(bookings), [bookings]);

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
      <div className="admin-scroll-area overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.07] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-white/40">
              <th className="px-4 py-3.5">Référence</th>
              <th className="px-4 py-3.5">Studio</th>
              <th className="px-4 py-3.5">Date séance</th>
              <th className="px-4 py-3.5">Créée le</th>
              <th className="px-4 py-3.5">Client</th>
              <th className="px-4 py-3.5">Prix</th>
              <th className="px-4 py-3.5">Paiement</th>
              <th className="px-4 py-3.5">Statut</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              item.kind === "single" ? (
                <BookingRow key={item.booking.id} booking={item.booking} />
              ) : (
                <PackageRow
                  key={item.key}
                  bookings={item.bookings}
                />
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageRow({ bookings }: { bookings: BookingWithStudio[] }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { confirm, toast } = useAdminFeedback();

  const primary = bookings[0];
  const { first, last } = packageDateRangeLabel(bookings);
  const total = packageTotalMad(bookings);
  const status = packageStatusSummary(bookings);
  const ids = bookings.map((b) => b.id);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const cancellableCount = bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status)
  ).length;
  const studioName =
    primary.studios?.name ?? `Studio ${primary.studio_id}`;
  const createdAt = bookings.reduce((latest, b) =>
    b.created_at > latest ? b.created_at : latest
  , bookings[0].created_at);

  function run(
    action: () => Promise<{
      ok: boolean;
      error?: string;
      message?: string;
      warning?: string;
    }>,
    successTitle: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error("Échec", result.error ?? "Une erreur s'est produite.");
        return;
      }
      if (result.warning) {
        toast.warning(successTitle, result.warning);
        return;
      }
      toast.success(successTitle, result.message);
    });
  }

  return (
    <>
      <tr
        className="border-b border-white/[0.05] hover:bg-white/[0.03] cursor-pointer transition-colors duration-150 bg-teal-400/[0.03]"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 font-bold text-white tracking-wide">
            <Layers className="w-3.5 h-3.5 text-teal-300 shrink-0" aria-hidden />
            Forfait
          </span>
          <span className="block text-[11px] text-white/40 mt-1">
            {bookings.length} séances · {primary.reference}
            {bookings.length > 1 ? "…" : ""}
          </span>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-white/80">
          {studioName}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className="capitalize font-medium text-white/85">
            {formatDateShort(first.date)}
            {first.date !== last.date && (
              <> → {formatDateShort(last.date)}</>
            )}
          </span>
          <span className="block text-xs text-white/40 mt-0.5">
            Voir les {bookings.length} créneaux
          </span>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-white/55 text-xs">
          {formatCreatedAt(createdAt)}
        </td>
        <td className="px-4 py-3.5">
          <span className="block font-semibold text-white/90">
            {primary.customer_name}
          </span>
          <span className="block text-xs text-white/40 mt-0.5">
            {primary.customer_phone}
          </span>
        </td>
        <td className="px-4 py-3.5 font-display font-bold whitespace-nowrap text-teal-300">
          {formatMad(total)}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-white/50">
          {PAYMENT_METHOD_LABELS[primary.payment_method]}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className={STATUS_BADGES[status] ?? "admin-badge-neutral"}>
            {BOOKING_STATUS_LABELS[status]}
          </span>
          {pendingCount > 0 && pendingCount < bookings.length && (
            <span className="block text-[11px] text-amber-300/80 mt-1">
              {pendingCount} en attente
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
                {pendingCount > 0 && (
                  <ActionButton
                    label="Confirmer forfait"
                    tone="green"
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Confirmer le forfait ?",
                        description: `Confirmer les ${pendingCount} séance(s) en attente. Un seul email sera envoyé à ${primary.customer_email}.`,
                        confirmLabel: "Confirmer le forfait",
                        tone: "primary",
                      });
                      if (ok) {
                        run(
                          () => confirmPackageBookings(ids),
                          "Forfait confirmé"
                        );
                      }
                    }}
                  />
                )}
                {cancellableCount > 0 && (
                  <ActionButton
                    label="Annuler forfait"
                    tone="red"
                    icon={<X className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Annuler le forfait ?",
                        description: `Annuler les ${cancellableCount} séance(s) de ce forfait. Le client recevra un email d'annulation.`,
                        confirmLabel: "Annuler le forfait",
                        tone: "danger",
                      });
                      if (ok) {
                        run(
                          () => cancelPackageBookings(ids),
                          "Forfait annulé"
                        );
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
          <td colSpan={9} className="px-4 py-4 sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/35 mb-3">
              Séances du forfait
            </p>
            <div className="admin-scroll-area overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-white/35 border-b border-white/[0.06]">
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Réf.</th>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">Horaire</th>
                    <th className="px-3 py-2 font-semibold">Prix</th>
                    <th className="px-3 py-2 font-semibold">Statut</th>
                    <th className="px-3 py-2 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <PackageSessionRow
                      key={booking.id}
                      booking={booking}
                      index={booking.package_index ?? index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-sm text-white/50">
              <a
                href={`mailto:${primary.customer_email}`}
                className="font-semibold text-teal-300 hover:underline"
              >
                {primary.customer_email}
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PackageSessionRow({
  booking,
  index,
}: {
  booking: BookingWithStudio;
  index: number;
}) {
  const [isPending, startTransition] = useTransition();
  const { confirm, toast } = useAdminFeedback();

  function run(
    action: () => Promise<{
      ok: boolean;
      error?: string;
      message?: string;
      warning?: string;
    }>,
    successTitle: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error("Échec", result.error ?? "Une erreur s'est produite.");
        return;
      }
      if (result.warning) {
        toast.warning(successTitle, result.warning);
        return;
      }
      toast.success(successTitle, result.message);
    });
  }

  return (
    <tr className="border-b border-white/[0.04] last:border-0">
      <td className="px-3 py-2.5 text-white/40 tabular-nums">{index}</td>
      <td className="px-3 py-2.5 font-semibold text-white whitespace-nowrap">
        {booking.reference}
      </td>
      <td className="px-3 py-2.5 text-white/80 capitalize whitespace-nowrap">
        {formatDateShort(booking.date)}
      </td>
      <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">
        {minutesToTimeString(booking.start_minutes)} –{" "}
        {minutesToTimeString(
          booking.start_minutes + booking.duration_minutes
        )}
      </td>
      <td className="px-3 py-2.5 text-teal-300/90 font-semibold whitespace-nowrap">
        {formatMad(Number(booking.total_price_mad))}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className={STATUS_BADGES[booking.status] ?? "admin-badge-neutral"}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />
          ) : (
            <>
              {booking.status === "pending" && (
                <ActionButton
                  label="OK"
                  tone="green"
                  icon={<Check className="w-3 h-3" />}
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Confirmer cette séance ?",
                      description: `Confirmer uniquement ${booking.reference}. Le client recevra un email.`,
                      confirmLabel: "Confirmer",
                      tone: "primary",
                    });
                    if (ok) {
                      run(
                        () => confirmBooking(booking.id),
                        "Séance confirmée"
                      );
                    }
                  }}
                />
              )}
              {booking.status === "confirmed" && (
                <ActionButton
                  label="Fin"
                  tone="blue"
                  icon={<Flag className="w-3 h-3" />}
                  onClick={() =>
                    run(
                      () => completeBooking(booking.id),
                      "Séance terminée"
                    )
                  }
                />
              )}
              {(booking.status === "pending" ||
                booking.status === "confirmed") && (
                <ActionButton
                  label="×"
                  tone="red"
                  icon={<X className="w-3 h-3" />}
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Annuler cette séance ?",
                      description: `Annuler uniquement ${booking.reference}.`,
                      confirmLabel: "Annuler la séance",
                      tone: "danger",
                    });
                    if (ok) {
                      run(
                        () => cancelBooking(booking.id),
                        "Séance annulée"
                      );
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function BookingRow({ booking }: { booking: BookingWithStudio }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(booking.admin_note ?? "");
  const [isPending, startTransition] = useTransition();
  const { confirm, toast } = useAdminFeedback();

  function run(
    action: () => Promise<{
      ok: boolean;
      error?: string;
      message?: string;
      warning?: string;
    }>,
    successTitle: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error("Échec", result.error ?? "Une erreur s'est produite.");
        return;
      }
      if (result.warning) {
        toast.warning(successTitle, result.warning);
        return;
      }
      toast.success(successTitle, result.message);
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
        <td className="px-4 py-3.5 whitespace-nowrap text-white/55 text-xs">
          {formatCreatedAt(booking.created_at)}
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
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Confirmer la réservation ?",
                        description: `Confirmer ${booking.reference}. Le client recevra un email à ${booking.customer_email}.`,
                        confirmLabel: "Confirmer",
                        tone: "primary",
                      });
                      if (ok) {
                        run(
                          () => confirmBooking(booking.id),
                          "Réservation confirmée"
                        );
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
                      onClick={() =>
                        run(
                          () => completeBooking(booking.id),
                          "Réservation terminée"
                        )
                      }
                    />
                    <ActionButton
                      label="Renvoyer email"
                      tone="blue"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() =>
                        run(
                          () => resendBookingConfirmationEmail(booking.id),
                          "Email renvoyé"
                        )
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
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Annuler la réservation ?",
                        description: `Annuler ${booking.reference}. Le client recevra un email d'annulation.`,
                        confirmLabel: "Annuler la réservation",
                        tone: "danger",
                      });
                      if (ok) {
                        run(
                          () => cancelBooking(booking.id),
                          "Réservation annulée"
                        );
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
          <td colSpan={9} className="px-6 py-5">
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
                    onClick={() =>
                      run(
                        () => saveAdminNote(booking.id, note),
                        "Note enregistrée"
                      )
                    }
                    className="admin-btn-primary px-4 min-h-10"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
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
