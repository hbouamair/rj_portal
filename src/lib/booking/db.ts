import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Booking, Settings, Studio } from "./types";
import type { BusyInterval } from "./pricing";
import { bookingStartUtc, nowInStudioTime } from "./pricing";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const SCHEMA_HINT =
  "Exécutez le fichier supabase/migration.sql dans l'éditeur SQL Supabase (Dashboard → SQL Editor).";

function formatDbError(context: string, error: { message?: string; code?: string }): Error {
  const message = error.message ?? "Unknown error";
  if (
    error.code === "42P01" ||
    message.includes("does not exist") ||
    message.includes("Could not find the table")
  ) {
    return new Error(`${context}: tables manquantes. ${SCHEMA_HINT}`);
  }
  if (message.includes("fetch failed") || message.includes("ECONNRESET")) {
    return new Error(
      `${context}: impossible de joindre Supabase. Vérifiez votre connexion internet et NEXT_PUBLIC_SUPABASE_URL dans .env.local.`
    );
  }
  return new Error(`${context}: ${message}`);
}

export function generateBookingReference(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code +=
      REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `RJ-${code}`;
}

export async function fetchActiveStudios(
  client: SupabaseClient = getSupabaseAdmin()
): Promise<Studio[]> {
  const { data, error } = await client
    .from("studios")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw formatDbError("fetchActiveStudios", error);
  return (data ?? []) as Studio[];
}

export async function fetchAllStudios(
  client: SupabaseClient = getSupabaseAdmin()
): Promise<Studio[]> {
  const { data, error } = await client
    .from("studios")
    .select("*")
    .order("sort_order");
  if (error) throw formatDbError("fetchAllStudios", error);
  return (data ?? []) as Studio[];
}

export async function fetchSettings(
  client: SupabaseClient = getSupabaseAdmin()
): Promise<Settings> {
  const { data, error } = await client
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw formatDbError("fetchSettings", error);
  return data as Settings;
}

/**
 * Flip pending bookings past their payment deadline to "expired".
 * Best-effort only — never throws, so booking/availability keep working
 * if this housekeeping step fails (e.g. tables not migrated yet).
 */
export async function expireStalePendingBookings(
  client: SupabaseClient = getSupabaseAdmin()
): Promise<Booking[]> {
  try {
    const { data, error } = await client
      .from("bookings")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "pending")
      .lt("payment_deadline", new Date().toISOString())
      .select("*");

    if (error) {
      console.error("expireStalePendingBookings:", formatDbError("", error).message);
      return [];
    }
    return (data ?? []) as Booking[];
  } catch (err) {
    console.error("expireStalePendingBookings:", err);
    return [];
  }
}

/** Active (pending or confirmed) intervals blocking a studio on a date. */
export async function fetchBusySlots(
  studioId: number,
  date: string,
  client: SupabaseClient = getSupabaseAdmin()
): Promise<BusyInterval[]> {
  const { data, error } = await client
    .from("bookings")
    .select("start_minutes, duration_minutes")
    .eq("studio_id", studioId)
    .eq("date", date)
    .in("status", ["pending", "confirmed"]);
  if (error) throw formatDbError("fetchBusySlots", error);
  return (data ?? []) as BusyInterval[];
}

export interface BookingWithStudioName extends Booking {
  studios: Pick<Studio, "id" | "name"> | null;
}

/** Bookings due for a session reminder (client and/or admin). */
export async function fetchBookingsNeedingReminder(
  reminderHoursBefore: number,
  client: SupabaseClient = getSupabaseAdmin()
): Promise<BookingWithStudioName[]> {
  const { date: today } = nowInStudioTime();
  const reminderMs = reminderHoursBefore * 3_600_000;
  const now = Date.now();

  const { data, error } = await client
    .from("bookings")
    .select("*, studios(id, name)")
    .in("status", ["pending", "confirmed"])
    .gte("date", today)
    .or("client_reminder_sent_at.is.null,admin_reminder_sent_at.is.null");

  if (error) {
    console.error("fetchBookingsNeedingReminder:", formatDbError("", error).message);
    return [];
  }

  return ((data ?? []) as BookingWithStudioName[]).filter((booking) => {
    const startMs = bookingStartUtc(booking.date, booking.start_minutes).getTime();
    const msUntilStart = startMs - now;
    if (msUntilStart <= 0 || msUntilStart > reminderMs) return false;
    return (
      !booking.client_reminder_sent_at || !booking.admin_reminder_sent_at
    );
  });
}

export async function markBookingReminderSent(
  bookingId: string,
  target: "client" | "admin",
  client: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  const column =
    target === "client" ? "client_reminder_sent_at" : "admin_reminder_sent_at";
  const { error } = await client
    .from("bookings")
    .update({
      [column]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) {
    console.error(`markBookingReminderSent (${target}):`, error.message);
  }
}
