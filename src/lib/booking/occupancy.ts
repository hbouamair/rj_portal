import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { OpeningHours, Settings } from "./types";
import { dayOfWeekForDate, openingForDate } from "./pricing";

export interface OccupancySlot {
  studioId: number;
  date: string;
  bookedMinutes: number;
  openMinutes: number;
}

interface BookingSlice {
  studio_id: number;
  date: string;
  duration_minutes: number;
  status: string;
}

const ACTIVE_STATUSES = new Set(["pending", "confirmed", "completed"]);

/** Open minutes for one studio on one date. */
export function openMinutesForDate(
  openingHours: OpeningHours,
  date: string
): number {
  const opening = openingForDate(openingHours, date);
  if (!opening) return 0;
  return opening.close - opening.open;
}

function datesInRange(from: string, to: string): string[] {
  const result: string[] = [];
  const [y0, m0, d0] = from.split("-").map(Number);
  const [y1, m1, d1] = to.split("-").map(Number);
  const cur = new Date(y0, m0 - 1, d0);
  const end = new Date(y1, m1 - 1, d1);
  while (cur <= end) {
    result.push(format(cur, "yyyy-MM-dd"));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export function computeOccupancyByStudio(options: {
  settings: Pick<Settings, "opening_hours">;
  bookings: BookingSlice[];
  activeStudioIds: number[];
  from: string;
  to: string;
}): Map<number, { bookedMinutes: number; openMinutes: number; rate: number }> {
  const dates = datesInRange(options.from, options.to);
  const bookedByStudio = new Map<number, number>();

  for (const b of options.bookings) {
    if (!ACTIVE_STATUSES.has(b.status)) continue;
    if (b.date < options.from || b.date > options.to) continue;
    bookedByStudio.set(
      b.studio_id,
      (bookedByStudio.get(b.studio_id) ?? 0) + b.duration_minutes
    );
  }

  const result = new Map<
    number,
    { bookedMinutes: number; openMinutes: number; rate: number }
  >();

  for (const studioId of options.activeStudioIds) {
    let openMinutes = 0;
    for (const date of dates) {
      openMinutes += openMinutesForDate(options.settings.opening_hours, date);
    }
    const bookedMinutes = bookedByStudio.get(studioId) ?? 0;
    const rate =
      openMinutes > 0
        ? Math.min(100, Math.round((bookedMinutes / openMinutes) * 100))
        : 0;
    result.set(studioId, { bookedMinutes, openMinutes, rate });
  }

  return result;
}

export function weekRange(reference: Date = new Date()): {
  from: string;
  to: string;
} {
  const start = startOfWeek(reference, { weekStartsOn: 1 });
  const end = endOfWeek(reference, { weekStartsOn: 1 });
  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  };
}

export function monthRange(reference: Date = new Date()): {
  from: string;
  to: string;
} {
  return {
    from: format(startOfMonth(reference), "yyyy-MM-dd"),
    to: format(endOfMonth(reference), "yyyy-MM-dd"),
  };
}

/** Overall occupancy across all active studios for a date range. */
export function overallOccupancyRate(
  byStudio: Map<number, { bookedMinutes: number; openMinutes: number; rate: number }>
): number {
  let booked = 0;
  let open = 0;
  for (const v of byStudio.values()) {
    booked += v.bookedMinutes;
    open += v.openMinutes;
  }
  return open > 0 ? Math.min(100, Math.round((booked / open) * 100)) : 0;
}

export { dayOfWeekForDate, addDays };
