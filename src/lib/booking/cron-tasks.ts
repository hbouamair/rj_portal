import type { SupabaseClient } from "@supabase/supabase-js";
import {
  expireStalePendingBookings,
  fetchBookingsNeedingReminder,
  fetchSettings,
  markBookingReminderSent,
} from "@/lib/booking/db";
import {
  sendBookingAdminReminderEmail,
  sendBookingCancelledEmail,
  sendBookingClientReminderEmail,
} from "@/lib/booking/emails";
import type { Studio } from "@/lib/booking/types";

export async function runExpireStaleBookings(supabase: SupabaseClient) {
  const expired = await expireStalePendingBookings(supabase);

  if (expired.length > 0) {
    const settings = await fetchSettings(supabase);
    const { data: studiosData } = await supabase.from("studios").select("id, name");
    const studios = (studiosData ?? []) as Array<Pick<Studio, "id" | "name">>;

    await Promise.allSettled(
      expired.map((booking) => {
        const studio =
          studios.find((s) => s.id === booking.studio_id) ??
          ({ id: booking.studio_id, name: "Studio" } as Pick<Studio, "id" | "name">);
        return sendBookingCancelledEmail({ booking, studio, settings }, "expired");
      })
    );
  }

  return { expired: expired.length };
}

export async function runSendBookingReminders(supabase: SupabaseClient) {
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

  return {
    checked: bookings.length,
    clientRemindersSent: clientSent,
    adminRemindersSent: adminSent,
    reminderHoursBefore: reminderHours,
  };
}
