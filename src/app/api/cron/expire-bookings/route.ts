import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  expireStalePendingBookings,
  fetchSettings,
} from "@/lib/booking/db";
import { sendBookingCancelledEmail } from "@/lib/booking/emails";
import type { Studio } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

/**
 * Hourly Vercel Cron (see vercel.json): expires pending bookings past
 * their payment deadline, frees the slots and emails the clients.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const expired = await expireStalePendingBookings(supabase);

    if (expired.length > 0) {
      const settings = await fetchSettings(supabase);
      const { data: studiosData } = await supabase
        .from("studios")
        .select("id, name");
      const studios = (studiosData ?? []) as Array<Pick<Studio, "id" | "name">>;

      await Promise.allSettled(
        expired.map((booking) => {
          const studio =
            studios.find((s) => s.id === booking.studio_id) ??
            ({ id: booking.studio_id, name: "Studio" } as Pick<
              Studio,
              "id" | "name"
            >);
          return sendBookingCancelledEmail(
            { booking, studio, settings },
            "expired"
          );
        })
      );
    }

    return NextResponse.json({ expired: expired.length });
  } catch (err) {
    console.error("Cron expire-bookings error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
