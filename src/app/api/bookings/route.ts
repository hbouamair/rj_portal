import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Booking, PaymentMethod } from "@/lib/booking/types";
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  MIN_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
  bookingStartUtc,
  computeBookingPrice,
  intervalsOverlap,
  nowInStudioTime,
  openingForDate,
} from "@/lib/booking/pricing";
import {
  expireStalePendingBookings,
  fetchBusySlots,
  fetchSettings,
  generateBookingReference,
} from "@/lib/booking/db";
import {
  sendAdminNewBookingEmail,
  sendBookingReceivedEmail,
} from "@/lib/booking/emails";
import type { Settings, Studio } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateLimit = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYMENT_METHODS: PaymentMethod[] = ["paypal", "virement", "cash"];

interface CreateBookingBody {
  studioId: number;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  name: string;
  email: string;
  phone: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

function validate(body: unknown): { ok: true; data: CreateBookingBody } | { ok: false; error: string } {
  const b = body as Partial<CreateBookingBody> | null;
  if (!b || typeof b !== "object") return { ok: false, error: "Requête invalide." };

  if (!Number.isInteger(b.studioId) || (b.studioId as number) <= 0)
    return { ok: false, error: "Studio invalide." };
  if (typeof b.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.date))
    return { ok: false, error: "Date invalide." };
  if (
    !Number.isInteger(b.startMinutes) ||
    (b.startMinutes as number) < 0 ||
    (b.startMinutes as number) >= 1440 ||
    (b.startMinutes as number) % SLOT_STEP_MINUTES !== 0
  )
    return { ok: false, error: "Heure de début invalide." };
  if (
    !Number.isInteger(b.durationMinutes) ||
    (b.durationMinutes as number) < MIN_DURATION_MINUTES ||
    (b.durationMinutes as number) > MAX_DURATION_MINUTES ||
    (b.durationMinutes as number) % SLOT_STEP_MINUTES !== 0
  )
    return { ok: false, error: "Durée invalide (minimum 1 heure, par pas de 30 minutes)." };
  if (typeof b.name !== "string" || !b.name.trim() || b.name.trim().length > 100)
    return { ok: false, error: "Le nom est requis." };
  if (
    typeof b.email !== "string" ||
    !EMAIL_REGEX.test(b.email.trim()) ||
    b.email.trim().length > 254
  )
    return { ok: false, error: "Adresse email invalide." };
  if (typeof b.phone !== "string" || !b.phone.trim() || b.phone.trim().length > 30)
    return { ok: false, error: "Le numéro de téléphone est requis." };
  if (b.note != null && (typeof b.note !== "string" || b.note.length > 1000))
    return { ok: false, error: "La note est trop longue." };
  if (!PAYMENT_METHODS.includes(b.paymentMethod as PaymentMethod))
    return { ok: false, error: "Mode de paiement invalide." };

  return { ok: true, data: b as CreateBookingBody };
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const parsed = validate(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const input = parsed.data;

    const supabase = getSupabaseAdmin();

    const { data: studioData, error: studioError } = await supabase
      .from("studios")
      .select("*")
      .eq("id", input.studioId)
      .eq("active", true)
      .single();

    if (studioError || !studioData) {
      if (studioError?.code === "PGRST116") {
        return NextResponse.json({ error: "Studio introuvable." }, { status: 404 });
      }
      console.error("Studio lookup error:", studioError);
      const hint =
        studioError?.message?.includes("does not exist") ||
        studioError?.code === "42P01"
          ? "Exécutez le fichier supabase/migration.sql dans l'éditeur SQL Supabase."
          : "Vérifiez votre connexion Supabase et redémarrez le serveur de dev.";
      return NextResponse.json(
        { error: `Base de données inaccessible. ${hint}` },
        { status: 503 }
      );
    }
    const studio = studioData as Studio;
    const settings: Settings = await fetchSettings(supabase);

    // Opening hours check
    const opening = openingForDate(settings.opening_hours, input.date);
    const end = input.startMinutes + input.durationMinutes;
    if (!opening || input.startMinutes < opening.open || end > opening.close) {
      return NextResponse.json(
        { error: "Ce créneau est en dehors des horaires d'ouverture." },
        { status: 400 }
      );
    }

    // Not in the past (with lead time for same-day bookings)
    const { date: todayLocal, minutes: nowMinutes } = nowInStudioTime();
    if (
      input.date < todayLocal ||
      (input.date === todayLocal &&
        input.startMinutes < nowMinutes + MIN_LEAD_MINUTES)
    ) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible (trop proche ou passé)." },
        { status: 400 }
      );
    }

    // Availability check (the DB exclusion constraint is the final guard)
    await expireStalePendingBookings(supabase);
    const busy = await fetchBusySlots(input.studioId, input.date, supabase);
    const conflict = busy.some((b) =>
      intervalsOverlap(
        input.startMinutes,
        end,
        b.start_minutes,
        b.start_minutes + b.duration_minutes
      )
    );
    if (conflict) {
      return NextResponse.json(
        { error: "Ce créneau vient d'être réservé. Choisissez un autre horaire." },
        { status: 409 }
      );
    }

    // Authoritative server-side price
    const price = computeBookingPrice(
      studio,
      input.date,
      input.startMinutes,
      input.durationMinutes,
      settings.peak_windows
    );

    // Payment deadline: 48h (configurable), capped at the booking start
    const deadlineMs = Math.min(
      Date.now() + settings.confirmation_deadline_hours * 3_600_000,
      bookingStartUtc(input.date, input.startMinutes).getTime()
    );

    // Insert (retry once on the unlikely reference collision)
    let booking: Booking | null = null;
    let lastError: { code?: string; message: string } | null = null;
    for (let attempt = 0; attempt < 2 && !booking; attempt++) {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          reference: generateBookingReference(),
          studio_id: input.studioId,
          date: input.date,
          start_minutes: input.startMinutes,
          duration_minutes: input.durationMinutes,
          total_price_mad: price.totalMad,
          customer_name: input.name.trim(),
          customer_email: input.email.trim().toLowerCase(),
          customer_phone: input.phone.trim(),
          note: input.note?.trim() || null,
          payment_method: input.paymentMethod,
          status: "pending",
          payment_deadline: new Date(deadlineMs).toISOString(),
        })
        .select("*")
        .single();
      if (data) {
        booking = data as Booking;
      } else {
        lastError = error;
        // 23P01 = exclusion constraint (slot raced away) — don't retry
        if (error?.code === "23P01") break;
      }
    }

    if (!booking) {
      if (lastError?.code === "23P01") {
        return NextResponse.json(
          { error: "Ce créneau vient d'être réservé. Choisissez un autre horaire." },
          { status: 409 }
        );
      }
      console.error("Booking insert error:", lastError);
      return NextResponse.json(
        { error: "Impossible de créer la réservation. Réessayez plus tard." },
        { status: 500 }
      );
    }

    // Emails: never fail the booking if they error
    const emailCtx = { booking, studio, settings };
    await Promise.allSettled([
      sendBookingReceivedEmail(emailCtx),
      sendAdminNewBookingEmail(emailCtx),
    ]);

    return NextResponse.json({
      success: true,
      reference: booking.reference,
      totalPriceMad: booking.total_price_mad,
      paymentDeadline: booking.payment_deadline,
    });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite." },
      { status: 500 }
    );
  }
}
