import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin, tryGetSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabasePublic } from "@/lib/supabase/public";
import type { Booking, Settings, Studio, PromoCode } from "./types";
import type { BusyInterval } from "./pricing";
import { bookingStartUtc, nowInStudioTime } from "./pricing";
import { normalizePromoCode } from "./promo";

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
  client: SupabaseClient = getSupabasePublic()
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
  client: SupabaseClient = getSupabasePublic()
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
  client?: SupabaseClient
): Promise<Booking[]> {
  const db = client ?? tryGetSupabaseAdmin();
  if (!db) return [];

  try {
    const { data, error } = await db
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
  client?: SupabaseClient
): Promise<BusyInterval[]> {
  const publicClient = client ?? getSupabasePublic();

  const { data, error } = await publicClient.rpc("get_busy_slots", {
    p_studio_id: studioId,
    p_date: date,
  });

  if (!error) {
    return (data ?? []) as BusyInterval[];
  }

  const rpcMissing =
    error.code === "42883" ||
    error.message.includes("get_busy_slots") ||
    error.message.includes("Could not find the function");

  if (rpcMissing) {
    const admin = client ?? tryGetSupabaseAdmin();
    if (!admin) {
      throw formatDbError("fetchBusySlots", error);
    }
    const legacy = await admin
      .from("bookings")
      .select("start_minutes, duration_minutes")
      .eq("studio_id", studioId)
      .eq("date", date)
      .in("status", ["pending", "confirmed"]);
    if (legacy.error) throw formatDbError("fetchBusySlots", legacy.error);
    return (legacy.data ?? []) as BusyInterval[];
  }

  throw formatDbError("fetchBusySlots", error);
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

export async function fetchAllPromoCodes(
  client: SupabaseClient = getSupabaseAdmin()
): Promise<PromoCode[]> {
  const { data, error } = await client
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw formatDbError("fetchAllPromoCodes", error);
  return (data ?? []) as PromoCode[];
}

export async function fetchPromoByCode(
  code: string,
  client: SupabaseClient = getSupabaseAdmin()
): Promise<PromoCode | null> {
  const normalized = normalizePromoCode(code);
  if (!normalized) return null;
  const { data, error } = await client
    .from("promo_codes")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();
  if (error) throw formatDbError("fetchPromoByCode", error);
  return (data as PromoCode | null) ?? null;
}

export async function incrementPromoUses(
  code: string,
  client: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  const normalized = normalizePromoCode(code);
  const { data, error } = await client
    .from("promo_codes")
    .select("uses_count")
    .eq("code", normalized)
    .single();
  if (error || !data) return;
  await client
    .from("promo_codes")
    .update({
      uses_count: (data.uses_count as number) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("code", normalized);
}
