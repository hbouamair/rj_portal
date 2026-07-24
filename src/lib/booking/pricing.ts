import type { OpeningHours, PeakWindow, Settings, Studio } from "./types";

/**
 * Pure pricing / availability helpers, shared by the booking wizard (client)
 * and the booking API (server — the server result is authoritative).
 *
 * All times are minutes from midnight in the studio's local time
 * (Africa/Casablanca, UTC+1 year-round).
 */

export const SLOT_STEP_MINUTES = 30;
export const MIN_DURATION_MINUTES = 60;
export const MAX_DURATION_MINUTES = 8 * 60;
/** Minimum lead time before a same-day booking can start. */
export const MIN_LEAD_MINUTES = 60;
/** Africa/Casablanca offset from UTC, in minutes. */
export const STUDIO_UTC_OFFSET_MINUTES = 60;

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDurationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m} min`;
  return `${h}h30`;
}

/** Day of week (0 = Sunday .. 6 = Saturday) for a YYYY-MM-DD date string. */
export function dayOfWeekForDate(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** UTC Date of the booking start (local studio time minus the UTC offset). */
export function bookingStartUtc(date: string, startMinutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, 0, startMinutes - STUDIO_UTC_OFFSET_MINUTES, 0)
  );
}

/** Current date/time in studio local time: { date: "YYYY-MM-DD", minutes } */
export function nowInStudioTime(now: Date = new Date()): {
  date: string;
  minutes: number;
} {
  const local = new Date(now.getTime() + STUDIO_UTC_OFFSET_MINUTES * 60_000);
  const date = local.toISOString().slice(0, 10);
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  return { date, minutes };
}

export function isPeakBlock(
  dayOfWeek: number,
  blockStartMinutes: number,
  peakWindows: PeakWindow[]
): boolean {
  return peakWindows.some(
    (w) =>
      w.days.includes(dayOfWeek) &&
      blockStartMinutes >= timeStringToMinutes(w.start) &&
      blockStartMinutes < timeStringToMinutes(w.end)
  );
}

export interface PriceBreakdown {
  totalMad: number;
  peakMinutes: number;
  offPeakMinutes: number;
}

/**
 * Price computed per 30-minute block: each block is billed at the peak or
 * off-peak hourly rate (divided by 2) depending on where the block starts.
 */
export function computeBookingPrice(
  studio: Pick<Studio, "price_peak_mad" | "price_offpeak_mad">,
  date: string,
  startMinutes: number,
  durationMinutes: number,
  peakWindows: PeakWindow[]
): PriceBreakdown {
  const dayOfWeek = dayOfWeekForDate(date);
  let total = 0;
  let peakMinutes = 0;
  let offPeakMinutes = 0;

  for (
    let block = startMinutes;
    block < startMinutes + durationMinutes;
    block += SLOT_STEP_MINUTES
  ) {
    if (isPeakBlock(dayOfWeek, block, peakWindows)) {
      total += studio.price_peak_mad / 2;
      peakMinutes += SLOT_STEP_MINUTES;
    } else {
      total += studio.price_offpeak_mad / 2;
      offPeakMinutes += SLOT_STEP_MINUTES;
    }
  }

  return {
    totalMad: Math.round(total * 100) / 100,
    peakMinutes,
    offPeakMinutes,
  };
}

export interface BusyInterval {
  start_minutes: number;
  duration_minutes: number;
}

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function openingForDate(
  openingHours: OpeningHours,
  date: string
): { open: number; close: number } | null {
  const entry = openingHours[String(dayOfWeekForDate(date))];
  if (!entry) return null;
  return {
    open: timeStringToMinutes(entry.open),
    close: timeStringToMinutes(entry.close),
  };
}

/**
 * All valid start times (30-min steps) for a duration on a given date,
 * within opening hours, avoiding busy intervals, and respecting the
 * same-day minimum lead time.
 */
export function computeAvailableStartTimes(options: {
  settings: Pick<Settings, "opening_hours">;
  date: string;
  durationMinutes: number;
  busy: BusyInterval[];
  now?: Date;
}): number[] {
  const { settings, date, durationMinutes, busy } = options;
  const opening = openingForDate(settings.opening_hours, date);
  if (!opening) return [];

  const { date: todayLocal, minutes: nowMinutes } = nowInStudioTime(
    options.now
  );
  if (date < todayLocal) return [];
  const minStart =
    date === todayLocal ? nowMinutes + MIN_LEAD_MINUTES : opening.open;

  const result: number[] = [];
  for (
    let start = opening.open;
    start + durationMinutes <= opening.close;
    start += SLOT_STEP_MINUTES
  ) {
    if (start < minStart) continue;
    const end = start + durationMinutes;
    const blocked = busy.some((b) =>
      intervalsOverlap(
        start,
        end,
        b.start_minutes,
        b.start_minutes + b.duration_minutes
      )
    );
    if (!blocked) result.push(start);
  }
  return result;
}

/** Duration options: 1h minimum, then +30 min steps. */
export function durationOptions(): number[] {
  const options: number[] = [];
  for (
    let d = MIN_DURATION_MINUTES;
    d <= MAX_DURATION_MINUTES;
    d += SLOT_STEP_MINUTES
  ) {
    options.push(d);
  }
  return options;
}

export function formatMad(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2);
  return `${text} MAD`;
}
