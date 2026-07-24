import { Activity } from "lucide-react";
import type { Studio } from "@/lib/booking/types";
import { minutesToTimeString } from "@/lib/booking/pricing";

export interface PulseBooking {
  studio_id: number;
  start_minutes: number;
  duration_minutes: number;
  status: string;
  customer_name: string;
}

const SEG_CLASSES: Record<string, string> = {
  pending: "admin-track-seg admin-track-seg-pending",
  confirmed: "admin-track-seg admin-track-seg-confirmed",
  completed: "admin-track-seg admin-track-seg-completed",
};

const STATUS_FR: Record<string, string> = {
  pending: "en attente",
  confirmed: "confirmée",
  completed: "terminée",
};

/**
 * Timeline of today's sessions, one glowing track per studio,
 * from opening to closing, with a live "now" cursor.
 */
export default function TodayPulse({
  studios,
  opening,
  bookings,
  nowMinutes,
}: {
  studios: Studio[];
  opening: { open: number; close: number } | null;
  bookings: PulseBooking[];
  nowMinutes: number;
}) {
  return (
    <section className="admin-card p-5 sm:p-6" aria-label="Occupation du jour">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-teal-400/10 text-teal-300 flex items-center justify-center">
            <Activity className="w-4 h-4" aria-hidden />
          </span>
          <h2 className="text-base font-display font-bold text-white">
            Pulse du jour
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] text-white/40">
          <Legend className="admin-track-seg-pending" label="En attente" />
          <Legend className="admin-track-seg-confirmed" label="Confirmée" />
          <Legend className="admin-track-seg-completed" label="Terminée" />
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-px h-3 bg-accent-500 shadow-[0_0_6px_rgba(231,111,81,0.9)]"
              aria-hidden
            />
            Maintenant
          </span>
        </div>
      </div>

      {!opening ? (
        <p className="text-sm text-white/40 py-6 text-center rounded-xl bg-white/[0.03] border border-dashed border-white/10">
          Le studio est fermé aujourd&apos;hui.
        </p>
      ) : (
        <TimelineBody
          studios={studios}
          opening={opening}
          bookings={bookings}
          nowMinutes={nowMinutes}
        />
      )}
    </section>
  );
}

function TimelineBody({
  studios,
  opening,
  bookings,
  nowMinutes,
}: {
  studios: Studio[];
  opening: { open: number; close: number };
  bookings: PulseBooking[];
  nowMinutes: number;
}) {
  const { open, close } = opening;
  const span = Math.max(close - open, 1);
  const pct = (minutes: number) =>
    Math.min(Math.max(((minutes - open) / span) * 100, 0), 100);

  const showNow = nowMinutes >= open && nowMinutes <= close;

  // Hour ticks every 2h, starting at the first even hour inside opening
  const ticks: number[] = [];
  for (let t = Math.ceil(open / 120) * 120; t <= close; t += 120) {
    ticks.push(t);
  }

  return (
    <div className="space-y-3">
      {studios.map((studio) => {
        const segs = bookings
          .filter((b) => b.studio_id === studio.id)
          .sort((a, b) => a.start_minutes - b.start_minutes);
        return (
          <div key={studio.id} className="flex items-center gap-3">
            <span className="w-24 sm:w-32 shrink-0 text-xs font-semibold text-white/60 truncate">
              {studio.name}
            </span>
            <div className="admin-track flex-1">
              {segs.map((b, i) => {
                const left = pct(b.start_minutes);
                const width =
                  pct(b.start_minutes + b.duration_minutes) - left;
                return (
                  <div
                    key={i}
                    className={SEG_CLASSES[b.status] ?? "admin-track-seg"}
                    style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                    title={`${minutesToTimeString(b.start_minutes)} – ${minutesToTimeString(
                      b.start_minutes + b.duration_minutes
                    )} · ${b.customer_name} · ${STATUS_FR[b.status] ?? b.status}`}
                  />
                );
              })}
              {showNow && (
                <div
                  className="admin-track-now"
                  style={{ left: `${pct(nowMinutes)}%` }}
                  aria-hidden
                />
              )}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3" aria-hidden>
        <span className="w-24 sm:w-32 shrink-0" />
        <div className="relative flex-1 h-4">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[10px] font-semibold text-white/30 tabular-nums"
              style={{ left: `${pct(t)}%` }}
            >
              {minutesToTimeString(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block w-3 h-2 rounded-sm ${className}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
