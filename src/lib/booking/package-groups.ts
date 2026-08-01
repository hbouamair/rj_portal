import type { Booking, BookingStatus, BookingWithStudio } from "./types";

export type AdminBookingItem =
  | { kind: "single"; booking: BookingWithStudio }
  | { kind: "package"; key: string; bookings: BookingWithStudio[] };

/** Extract sibling references from package notes written by the booking API. */
export function parsePackageRefsFromNote(note: string | null | undefined): string[] {
  if (!note) return [];
  const match = note.match(/Refs\s*:\s*([A-Za-z0-9,\s-]+)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

/**
 * True for rows that should appear as a list entry (single booking or
 * séance 1 of a package). Used for admin pagination.
 */
export function isListPrimaryBooking(booking: {
  package_index?: number | null;
  package_group_id?: string | null;
  note?: string | null;
  regular_course_count?: number | null;
}): boolean {
  if (booking.package_index != null) {
    return booking.package_index === 1;
  }
  // Legacy package sessions 2..N written as "Séance 2/10 du forfait…"
  if (booking.note && /Séance\s+([2-9]|\d{2,})\s*\//i.test(booking.note)) {
    return false;
  }
  return true;
}

/** Stable group key for a booking, or null if it is a standalone session. */
export function getPackageGroupKey(
  booking: Pick<
    Booking,
    "package_group_id" | "regular_course_count" | "note" | "reference"
  >
): string | null {
  if (booking.package_group_id) {
    return `id:${booking.package_group_id}`;
  }

  const refs = parsePackageRefsFromNote(booking.note);
  if (refs.length >= 2 || (booking.regular_course_count ?? 0) > 1) {
    if (refs.length >= 2) {
      return `refs:${[...refs].sort().join(",")}`;
    }
  }

  return null;
}

function sortPackageSessions(a: BookingWithStudio, b: BookingWithStudio): number {
  const ai = a.package_index ?? Number.MAX_SAFE_INTEGER;
  const bi = b.package_index ?? Number.MAX_SAFE_INTEGER;
  if (ai !== bi) return ai - bi;
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.start_minutes - b.start_minutes;
}

/** Group flat bookings into singles + packages for admin list display. */
export function groupBookingsForAdmin(
  bookings: BookingWithStudio[]
): AdminBookingItem[] {
  const byKey = new Map<string, BookingWithStudio[]>();
  const singles: BookingWithStudio[] = [];
  const seenIds = new Set<string>();

  for (const booking of bookings) {
    if (seenIds.has(booking.id)) continue;
    seenIds.add(booking.id);

    const key = getPackageGroupKey(booking);
    if (!key) {
      singles.push(booking);
      continue;
    }
    const list = byKey.get(key) ?? [];
    list.push(booking);
    byKey.set(key, list);
  }

  const items: AdminBookingItem[] = [];

  for (const booking of singles) {
    items.push({ kind: "single", booking });
  }

  for (const [key, list] of byKey) {
    const sorted = [...list].sort(sortPackageSessions);
    if (sorted.length === 1) {
      // Incomplete hydrate or orphan — still show as single
      items.push({ kind: "single", booking: sorted[0] });
    } else {
      items.push({ kind: "package", key, bookings: sorted });
    }
  }

  // Keep newest activity first (created_at of primary / first session)
  items.sort((a, b) => {
    const aBooking = a.kind === "single" ? a.booking : a.bookings[0];
    const bBooking = b.kind === "single" ? b.booking : b.bookings[0];
    const aTime = a.kind === "package"
      ? Math.max(...a.bookings.map((x) => new Date(x.created_at).getTime()))
      : new Date(aBooking.created_at).getTime();
    const bTime = b.kind === "package"
      ? Math.max(...b.bookings.map((x) => new Date(x.created_at).getTime()))
      : new Date(bBooking.created_at).getTime();
    return bTime - aTime;
  });

  return items;
}

export function packageTotalMad(bookings: BookingWithStudio[]): number {
  return (
    Math.round(
      bookings.reduce((sum, b) => sum + Number(b.total_price_mad), 0) * 100
    ) / 100
  );
}

/** Aggregate status for a package badge. */
export function packageStatusSummary(
  bookings: BookingWithStudio[]
): BookingStatus {
  const statuses = new Set(bookings.map((b) => b.status));
  if (statuses.has("pending")) return "pending";
  if (statuses.has("confirmed")) return "confirmed";
  if (statuses.has("completed") && statuses.size === 1) return "completed";
  if (statuses.has("completed")) return "confirmed";
  if (statuses.has("cancelled")) return "cancelled";
  if (statuses.has("expired")) return "expired";
  return bookings[0]?.status ?? "pending";
}

export function packageDateRangeLabel(bookings: BookingWithStudio[]): {
  first: BookingWithStudio;
  last: BookingWithStudio;
} {
  const sorted = [...bookings].sort(sortPackageSessions);
  return { first: sorted[0], last: sorted[sorted.length - 1] };
}
