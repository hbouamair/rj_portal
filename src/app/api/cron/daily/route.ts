import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  runExpireStaleBookings,
  runSendBookingReminders,
} from "@/lib/booking/cron-tasks";

export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron (see vercel.json) — Hobby plan allows one run per day.
 * 07:00 UTC ≈ 08:00 Casablanca: expire unpaid bookings + send session reminders.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [expiry, reminders] = await Promise.all([
      runExpireStaleBookings(supabase),
      runSendBookingReminders(supabase),
    ]);

    return NextResponse.json({ expiry, reminders });
  } catch (err) {
    console.error("Cron daily error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
