import { NextRequest, NextResponse } from "next/server";
import {
  expireStalePendingBookings,
  fetchBusySlots,
} from "@/lib/booking/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?studioId=1&date=2026-08-01
 * Returns the busy intervals for a studio on a date. The client computes
 * selectable start times from these + the opening hours it already has.
 */
export async function GET(request: NextRequest) {
  const studioId = Number(request.nextUrl.searchParams.get("studioId"));
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!Number.isInteger(studioId) || studioId <= 0) {
    return NextResponse.json({ error: "studioId invalide." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date invalide." }, { status: 400 });
  }

  try {
    await expireStalePendingBookings();
    const busy = await fetchBusySlots(studioId, date);
    return NextResponse.json({ busy });
  } catch (err) {
    console.error("Availability API error:", err);
    const message =
      err instanceof Error && err.message.includes("does not exist")
        ? "La base de données n'est pas initialisée. Exécutez supabase/migration.sql dans Supabase."
        : "Impossible de charger les disponibilités.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
