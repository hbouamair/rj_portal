"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { BookingWithStudio, OpeningHours } from "@/lib/booking/types";
import { openingForDate } from "@/lib/booking/pricing";
import { formatExportDateFr } from "@/lib/booking/export-filters";
import {
  downloadBookingsExcel,
  downloadDailyStatsExcel,
  type DailyStatRow,
} from "@/lib/booking/excel-export";
import { fetchBookingsForExportDay } from "@/app/admin/actions";

function datesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const [y0, m0, d0] = from.split("-").map(Number);
  const [y1, m1, d1] = to.split("-").map(Number);
  const cur = new Date(y0, m0 - 1, d0);
  const end = new Date(y1, m1 - 1, d1);
  while (cur <= end) {
    dates.push(format(cur, "yyyy-MM-dd"));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Aggregate booking stats one row per calendar day. */
function buildDailyStats(
  bookings: BookingWithStudio[],
  from: string,
  to: string,
  openingHours: OpeningHours | undefined,
  activeStudioCount: number
): DailyStatRow[] {
  const byDate = new Map<string, BookingWithStudio[]>();
  for (const b of bookings) {
    if (b.date < from || b.date > to) continue;
    const list = byDate.get(b.date) ?? [];
    list.push(b);
    byDate.set(b.date, list);
  }

  return datesInRange(from, to).map((date) => {
    const dayBookings = byDate.get(date) ?? [];
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let expired = 0;
    let bookedMinutes = 0;
    let revenueMad = 0;

    for (const b of dayBookings) {
      if (b.status === "pending") pending += 1;
      else if (b.status === "confirmed") confirmed += 1;
      else if (b.status === "completed") completed += 1;
      else if (b.status === "cancelled") cancelled += 1;
      else if (b.status === "expired") expired += 1;

      if (
        b.status === "pending" ||
        b.status === "confirmed" ||
        b.status === "completed"
      ) {
        bookedMinutes += b.duration_minutes;
      }
      if (b.status === "confirmed" || b.status === "completed") {
        revenueMad += Number(b.total_price_mad);
      }
    }

    const opening = openingHours
      ? openingForDate(openingHours, date)
      : null;
    const openMinutes = opening
      ? (opening.close - opening.open) * Math.max(activeStudioCount, 1)
      : 0;
    const occupancyPct =
      openMinutes > 0
        ? Math.min(100, Math.round((bookedMinutes / openMinutes) * 100))
        : 0;

    return {
      date,
      sessions: dayBookings.length,
      pending,
      confirmed,
      completed,
      cancelled,
      expired,
      bookedMinutes,
      revenueMad: Math.round(revenueMad * 100) / 100,
      openMinutes,
      occupancyPct,
    };
  });
}

interface Props {
  /** Which admin page — changes available choices and labels. */
  context: "reservations" | "statistiques";
  /** Bookings already matching status / studio / search / date filters. */
  bookings: BookingWithStudio[];
  /** Human-readable summary of filters applied to `bookings`. */
  activeFilterLabel: string;
  weekFrom: string;
  weekTo: string;
  monthFrom: string;
  monthTo: string;
  /** Default date for “journée exacte” (YYYY-MM-DD). */
  defaultDay?: string;
  /** Optional filters applied when fetching a specific day. */
  dayFilters?: { status?: string; studioId?: number };
  /** Required for daily occupancy % on statistiques export. */
  openingHours?: OpeningHours;
  activeStudioCount?: number;
}

/** Excel (.xlsx) export with explicit scope choice and visible active filters. */
export default function ExportCsvButton({
  context,
  bookings,
  activeFilterLabel,
  weekFrom,
  weekTo,
  monthFrom,
  monthTo,
  defaultDay,
  dayFilters,
  openingHours,
  activeStudioCount = 1,
}: Props) {
  const [open, setOpen] = useState(false);
  const [exactDay, setExactDay] = useState(
    defaultDay ?? format(new Date(), "yyyy-MM-dd")
  );
  const [dayError, setDayError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const weekRows = useMemo(
    () => bookings.filter((b) => b.date >= weekFrom && b.date <= weekTo),
    [bookings, weekFrom, weekTo]
  );
  const monthRows = useMemo(
    () => bookings.filter((b) => b.date >= monthFrom && b.date <= monthTo),
    [bookings, monthFrom, monthTo]
  );

  const dailyWeek = useMemo(
    () =>
      context === "statistiques"
        ? buildDailyStats(
            bookings,
            weekFrom,
            weekTo,
            openingHours,
            activeStudioCount
          )
        : [],
    [
      context,
      bookings,
      weekFrom,
      weekTo,
      openingHours,
      activeStudioCount,
    ]
  );

  const dailyMonth = useMemo(
    () =>
      context === "statistiques"
        ? buildDailyStats(
            bookings,
            monthFrom,
            monthTo,
            openingHours,
            activeStudioCount
          )
        : [],
    [
      context,
      bookings,
      monthFrom,
      monthTo,
      openingHours,
      activeStudioCount,
    ]
  );

  const showFiltered = context === "reservations";
  const cachedDayCount = useMemo(
    () => bookings.filter((b) => b.date === exactDay).length,
    [bookings, exactDay]
  );

  async function exportRows(
    rows: BookingWithStudio[],
    filename: string,
    subtitle?: string
  ) {
    if (rows.length === 0) return;
    await downloadBookingsExcel({
      bookings: rows,
      filename,
      subtitle: subtitle ?? activeFilterLabel,
    });
    setOpen(false);
  }

  async function exportDaily(
    rows: DailyStatRow[],
    filename: string,
    subtitle?: string
  ) {
    if (rows.length === 0) return;
    await downloadDailyStatsExcel({
      rows,
      filename,
      subtitle,
    });
    setOpen(false);
  }

  function runExport(task: () => Promise<void>) {
    startTransition(async () => {
      try {
        await task();
      } catch {
        setDayError("Impossible de générer le fichier Excel.");
      }
    });
  }

  function loadExactDay(mode: "detail" | "stats") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exactDay)) {
      setDayError("Choisissez une date valide.");
      return;
    }
    setDayError(null);
    runExport(async () => {
      const result = await fetchBookingsForExportDay(exactDay, dayFilters);
      if (!result.ok) {
        setDayError(result.error ?? "Impossible de charger ce jour.");
        return;
      }
      const dayBookings = result.bookings as BookingWithStudio[];
      if (dayBookings.length === 0) {
        setDayError("Aucune réservation pour cette journée.");
        return;
      }
      if (mode === "stats") {
        const rows = buildDailyStats(
          dayBookings,
          exactDay,
          exactDay,
          openingHours,
          activeStudioCount
        );
        await exportDaily(
          rows,
          `stats-jour-${exactDay}.xlsx`,
          `Journée du ${formatExportDateFr(exactDay)}`
        );
      } else {
        await exportRows(
          dayBookings,
          `reservations-jour-${exactDay}.xlsx`,
          `Journée du ${formatExportDateFr(exactDay)}`
        );
      }
    });
  }

  const contextTitle =
    context === "reservations" ? "Réservations" : "Statistiques";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="admin-btn-ghost min-h-11 gap-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download className="w-4 h-4" aria-hidden />
        Exporter Excel
        <ChevronDown className="w-3.5 h-3.5 opacity-60" aria-hidden />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-1.5 z-50 w-[min(100vw-2rem,20rem)] rounded-xl border border-white/10 bg-[#1a1f2e] shadow-xl py-2"
          >
            <div className="px-4 pb-2 border-b border-white/[0.06] mb-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/35">
                Export · {contextTitle}
              </p>
              <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
                <span className="text-white/35">Filtres : </span>
                {activeFilterLabel}
              </p>
            </div>

            {showFiltered && (
              <ExportMenuItem
                title="Filtre actuel"
                subtitle={activeFilterLabel}
                count={bookings.length}
                disabled={bookings.length === 0}
                onClick={() =>
                  runExport(() =>
                    exportRows(
                      bookings,
                      `reservations-filtre-${format(new Date(), "yyyy-MM-dd")}.xlsx`
                    )
                  )
                }
              />
            )}

            <div className="px-4 py-3 border-b border-white/[0.06] mb-1 space-y-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 mb-1.5">
                  Journée exacte
                </p>
                <input
                  type="date"
                  value={exactDay}
                  onChange={(e) => {
                    setExactDay(e.target.value);
                    setDayError(null);
                  }}
                  className="admin-input min-h-10"
                  aria-label="Choisir une journée"
                />
                <p className="text-[11px] text-white/35 mt-1.5">
                  {cachedDayCount > 0
                    ? `${cachedDayCount} réservation(s) déjà chargée(s) pour ce jour`
                    : "La journée sera chargée depuis la base"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={isPending || !exactDay}
                  onClick={() => loadExactDay("detail")}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/5 disabled:opacity-40 border border-white/[0.06]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {context === "statistiques"
                        ? "Détail de la journée"
                        : "Exporter cette journée"}
                    </span>
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />
                    ) : (
                      <span className="text-[11px] text-teal-300/90">
                        {formatExportDateFr(exactDay)}
                      </span>
                    )}
                  </span>
                </button>
                {context === "statistiques" && (
                  <button
                    type="button"
                    disabled={isPending || !exactDay}
                    onClick={() => loadExactDay("stats")}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/5 disabled:opacity-40 border border-white/[0.06]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">Stats de la journée</span>
                      <span className="text-[11px] text-teal-300/90">
                        1 ligne
                      </span>
                    </span>
                  </button>
                )}
              </div>
              {dayError && (
                <p className="text-xs font-medium text-rose-300">{dayError}</p>
              )}
            </div>

            <ExportMenuItem
              title="Semaine affichée"
              subtitle={`${formatExportDateFr(weekFrom)} → ${formatExportDateFr(weekTo)}`}
              count={weekRows.length}
              disabled={weekRows.length === 0}
              onClick={() =>
                runExport(() =>
                  exportRows(
                    weekRows,
                    `reservations-semaine-${weekFrom}.xlsx`
                  )
                )
              }
            />

            <ExportMenuItem
              title="Mois en cours"
              subtitle={`${formatExportDateFr(monthFrom)} → ${formatExportDateFr(monthTo)}`}
              count={monthRows.length}
              disabled={monthRows.length === 0}
              onClick={() =>
                runExport(() =>
                  exportRows(
                    monthRows,
                    `reservations-mois-${monthFrom.slice(0, 7)}.xlsx`
                  )
                )
              }
            />

            {context === "statistiques" && (
              <>
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
                    Stats agrégées (période)
                  </p>
                </div>
                <ExportMenuItem
                  title="Stats par journée — semaine"
                  subtitle={`${formatExportDateFr(weekFrom)} → ${formatExportDateFr(weekTo)} · 1 ligne / jour`}
                  count={dailyWeek.length}
                  disabled={dailyWeek.length === 0}
                  onClick={() =>
                    runExport(() =>
                      exportDaily(
                        dailyWeek,
                        `stats-jour-semaine-${weekFrom}.xlsx`,
                        `Semaine ${formatExportDateFr(weekFrom)} → ${formatExportDateFr(weekTo)}`
                      )
                    )
                  }
                />
                <ExportMenuItem
                  title="Stats par journée — mois"
                  subtitle={`${formatExportDateFr(monthFrom)} → ${formatExportDateFr(monthTo)} · 1 ligne / jour`}
                  count={dailyMonth.length}
                  disabled={dailyMonth.length === 0}
                  onClick={() =>
                    runExport(() =>
                      exportDaily(
                        dailyMonth,
                        `stats-jour-mois-${monthFrom.slice(0, 7)}.xlsx`,
                        `Mois ${formatExportDateFr(monthFrom)} → ${formatExportDateFr(monthTo)}`
                      )
                    )
                  }
                />
                <div className="px-4 pt-2 pb-1 border-t border-white/[0.06] mt-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
                    Détail réservations
                  </p>
                </div>
                <ExportMenuItem
                  title="Détail — semaine + mois"
                  subtitle="Une ligne par réservation"
                  count={bookings.length}
                  disabled={bookings.length === 0}
                  onClick={() =>
                    runExport(() =>
                      exportRows(
                        bookings,
                        `statistiques-detail-${format(new Date(), "yyyy-MM-dd")}.xlsx`
                      )
                    )
                  }
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ExportMenuItem({
  title,
  subtitle,
  count,
  disabled,
  onClick,
}: {
  title: string;
  subtitle: string;
  count: number;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white/85">{title}</span>
        <span className="text-xs font-bold tabular-nums text-teal-300/90">
          {count}
        </span>
      </span>
      <span className="block text-[11px] text-white/40 mt-0.5 leading-snug truncate">
        {subtitle}
      </span>
    </button>
  );
}
