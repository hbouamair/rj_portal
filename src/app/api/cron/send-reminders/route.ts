import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  fetchBookingsNeedingReminder,
  fetchSettings,
  markBookingReminderSent,
} from "@/lib/booking/db";
import {
  sendBookingAdminReminderEmail,
  sendBookingClientReminderEmail,
} from "@/lib/booking/emails";
import type { Studio } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

/**
 * Hourly Vercel Cron: sends reminder emails to clients and admin when a
 * booking session is within the configured reminder window.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const settings = await fetchSettings(supabase);
    const reminderHours = settings.reminder_hours_before ?? 24;
    const bookings = await fetchBookingsNeedingReminder(reminderHours, supabase);

    let clientSent = 0;
    let adminSent = 0;

    for (const booking of bookings) {
      const studio =
        booking.studios ??
        ({ id: booking.studio_id, name: "Studio" } as Pick<Studio, "id" | "name">);
      const ctx = { booking, studio, settings };

      if (!booking.client_reminder_sent_at) {
        const result = await sendBookingClientReminderEmail(ctx);
        if (result.ok) {
          await markBookingReminderSent(booking.id, "client", supabase);
          clientSent++;
        }
      }

      if (!booking.admin_reminder_sent_at) {
        const result = await sendBookingAdminReminderEmail(ctx);
        if (result.ok) {
          await markBookingReminderSent(booking.id, "admin", supabase);
          adminSent++;
        }
      }
    }

    return NextResponse.json({
      checked: bookings.length,
      clientRemindersSent: clientSent,
      adminRemindersSent: adminSent,
      reminderHoursBefore: reminderHours,
    });
  } catch (err) {
    console.error("Cron send-reminders error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
