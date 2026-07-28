import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { runSendBookingReminders } from "@/lib/booking/cron-tasks";



export const dynamic = "force-dynamic";



/** Manual or external trigger — production schedule is `/api/cron/daily`. */

export async function GET(request: NextRequest) {

  const auth = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  try {

    const supabase = getSupabaseAdmin();

    const result = await runSendBookingReminders(supabase);

    return NextResponse.json(result);

  } catch (err) {

    console.error("Cron send-reminders error:", err);

    return NextResponse.json({ error: "Internal error" }, { status: 500 });

  }

}


