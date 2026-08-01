"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingWithStudio } from "@/lib/booking/types";
import { minutesToTimeString } from "@/lib/booking/pricing";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-amber-400 bg-amber-400/10",
  confirmed: "border-teal-400 bg-teal-400/10",
  completed: "border-sky-400 bg-sky-400/10",
  cancelled: "border-rose-400/60 bg-rose-400/[0.07] opacity-70",
  expired: "border-white/20 bg-white/[0.04] opacity-70",
};

export default function WeekCalendar({
  bookings,
  weekStart,
}: {
  bookings: BookingWithStudio[];
  weekStart: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const start = useMemo(() => new Date(`${weekStart}T00:00:00`), [weekStart]);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const navigateWeek = useCallback(
    (offsetDays: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("week", format(addDays(start, offsetDays), "yyyy-MM-dd"));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, start]
  );

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="admin-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigateWeek(-7)}
          className="admin-btn-ghost min-w-11 min-h-11 p-0"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold font-nav text-white capitalize text-sm sm:text-base">
          {format(start, "d MMM", { locale: fr })} –{" "}
          {format(addDays(start, 6), "d MMM yyyy", { locale: fr })}
        </span>
        <button
          type="button"
          onClick={() => navigateWeek(7)}
          className="admin-btn-ghost min-w-11 min-h-11 p-0"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayBookings = bookings
            .filter((b) => b.date === dateStr)
            .sort((a, b) => a.start_minutes - b.start_minutes);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={`rounded-xl border min-h-[7.5rem] p-2.5 transition-colors duration-200 ${
                isToday
                  ? "border-teal-400/40 bg-teal-400/[0.05] shadow-[0_0_20px_rgba(45,212,191,0.07)]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 capitalize ${
                  isToday ? "text-teal-300" : "text-white/40"
                }`}
              >
                {format(day, "EEE d", { locale: fr })}
              </p>
              <div className="space-y-1.5">
                {dayBookings.length === 0 && (
                  <p className="text-xs text-white/15">—</p>
                )}
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-lg border-l-[3px] px-2 py-1.5 text-xs ${STATUS_COLORS[b.status] ?? ""}`}
                    title={`${b.reference} · ${b.customer_name}`}
                  >
                    <p className="font-bold text-white/90">
                      {minutesToTimeString(b.start_minutes)} –{" "}
                      {minutesToTimeString(
                        b.start_minutes + b.duration_minutes
                      )}
                    </p>
                    <p className="text-white/50 truncate mt-0.5">
                      {b.studios?.name ?? `Studio ${b.studio_id}`}
                    </p>
                    <p className="text-white/50 truncate">{b.customer_name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-5 text-[11px] text-white/40">
        <LegendDot className="border-amber-400 bg-amber-400/15" label="En attente" />
        <LegendDot className="border-teal-400 bg-teal-400/15" label="Confirmée" />
        <LegendDot className="border-sky-400 bg-sky-400/15" label="Terminée" />
        <LegendDot
          className="border-rose-400/60 bg-rose-400/10"
          label="Annulée / expirée"
        />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block w-3 h-3 rounded border-l-[3px] ${className}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
