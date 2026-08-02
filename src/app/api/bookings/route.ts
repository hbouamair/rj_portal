import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Booking, CourseType, PaymentMethod } from "@/lib/booking/types";
import {
  allocatePackageTotals,
  computeBookingPriceWithDiscounts,
  computeMultiSlotPackagePrice,
  isPrivateStudio,
  REGULAR_COURSE_MIN_COUNT,
} from "@/lib/booking/discounts";
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  MIN_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
  bookingStartUtc,
  intervalsOverlap,
  nowInStudioTime,
  openingForDate,
} from "@/lib/booking/pricing";
import {
  expireStalePendingBookings,
  fetchBusySlots,
  fetchPromoByCode,
  fetchSettings,
  generateBookingReference,
  incrementPromoUses,
} from "@/lib/booking/db";
import {
  calculatePromoDiscount,
  normalizePromoCode,
  validatePromoForBooking,
} from "@/lib/booking/promo";
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
const COURSE_TYPES: CourseType[] = ["group", "private"];

interface SlotInput {
  date: string;
  startMinutes: number;
}

interface CreateBookingBody {
  studioId: number;
  courseType: CourseType;
  /** @deprecated Prefer `slots`. Kept for single-slot clients. */
  regularCourseCount?: number;
  date?: string;
  startMinutes?: number;
  slots?: SlotInput[];
  durationMinutes: number;
  name: string;
  email: string;
  phone: string;
  note?: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

function isValidSlot(slot: Partial<SlotInput> | null | undefined): slot is SlotInput {
  return (
    !!slot &&
    typeof slot.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(slot.date) &&
    Number.isInteger(slot.startMinutes) &&
    (slot.startMinutes as number) >= 0 &&
    (slot.startMinutes as number) < 1440 &&
    (slot.startMinutes as number) % SLOT_STEP_MINUTES === 0
  );
}

function validate(
  body: unknown
): { ok: true; data: CreateBookingBody & { slots: SlotInput[] } } | { ok: false; error: string } {
  const b = body as Partial<CreateBookingBody> | null;
  if (!b || typeof b !== "object") return { ok: false, error: "Requête invalide." };

  if (!Number.isInteger(b.studioId) || (b.studioId as number) <= 0)
    return { ok: false, error: "Studio invalide." };
  if (!COURSE_TYPES.includes(b.courseType as CourseType))
    return { ok: false, error: "Type de cours invalide." };

  let slots: SlotInput[] = [];
  if (Array.isArray(b.slots) && b.slots.length > 0) {
    if (b.slots.length > 1 && b.slots.length !== REGULAR_COURSE_MIN_COUNT) {
      return {
        ok: false,
        error: `Le pack comporte exactement ${REGULAR_COURSE_MIN_COUNT} séances.`,
      };
    }
    for (const slot of b.slots) {
      if (!isValidSlot(slot)) {
        return { ok: false, error: "Un des créneaux est invalide." };
      }
      slots.push({ date: slot.date, startMinutes: slot.startMinutes });
    }
  } else if (isValidSlot({ date: b.date, startMinutes: b.startMinutes })) {
    slots = [{ date: b.date!, startMinutes: b.startMinutes! }];
  } else {
    return { ok: false, error: "Sélectionnez au moins un créneau." };
  }

  // Reject duplicate identical slots
  const seen = new Set<string>();
  for (const slot of slots) {
    const key = `${slot.date}:${slot.startMinutes}`;
    if (seen.has(key)) {
      return { ok: false, error: "Deux créneaux identiques ont été sélectionnés." };
    }
    seen.add(key);
  }

  // Reject overlapping slots on the same day (same duration applied later)
  if (
    !Number.isInteger(b.durationMinutes) ||
    (b.durationMinutes as number) < MIN_DURATION_MINUTES ||
    (b.durationMinutes as number) > MAX_DURATION_MINUTES ||
    (b.durationMinutes as number) % SLOT_STEP_MINUTES !== 0
  ) {
    return { ok: false, error: "Durée invalide (minimum 1 heure, par pas de 30 minutes)." };
  }

  const duration = b.durationMinutes as number;
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].date !== slots[j].date) continue;
      if (
        intervalsOverlap(
          slots[i].startMinutes,
          slots[i].startMinutes + duration,
          slots[j].startMinutes,
          slots[j].startMinutes + duration
        )
      ) {
        return {
          ok: false,
          error: "Deux de vos créneaux se chevauchent le même jour.",
        };
      }
    }
  }

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
  if (
    b.promoCode != null &&
    (typeof b.promoCode !== "string" || normalizePromoCode(b.promoCode).length > 32)
  )
    return { ok: false, error: "Code promo invalide." };

  return {
    ok: true,
    data: {
      ...(b as CreateBookingBody),
      slots,
      durationMinutes: duration,
    },
  };
}

async function validateSlotAvailability(options: {
  studioId: number;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  settings: Settings;
  supabase: ReturnType<typeof getSupabaseAdmin>;
  /** Extra busy intervals (other slots in the same request, same day). */
  extraBusy?: { start_minutes: number; duration_minutes: number }[];
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const {
    studioId,
    date,
    startMinutes,
    durationMinutes,
    settings,
    supabase,
    extraBusy = [],
  } = options;
  const end = startMinutes + durationMinutes;

  const opening = openingForDate(settings.opening_hours, date);
  if (!opening || startMinutes < opening.open || end > opening.close) {
    return {
      ok: false,
      error: "Un créneau est en dehors des horaires d'ouverture.",
      status: 400,
    };
  }

  const { date: todayLocal, minutes: nowMinutes } = nowInStudioTime();
  if (
    date < todayLocal ||
    (date === todayLocal && startMinutes < nowMinutes + MIN_LEAD_MINUTES)
  ) {
    return {
      ok: false,
      error: "Un créneau n'est plus disponible (trop proche ou passé).",
      status: 400,
    };
  }

  const busy = await fetchBusySlots(studioId, date, supabase);
  const allBusy = [...busy, ...extraBusy];
  const conflict = allBusy.some((b) =>
    intervalsOverlap(
      startMinutes,
      end,
      b.start_minutes,
      b.start_minutes + b.duration_minutes
    )
  );
  if (conflict) {
    return {
      ok: false,
      error: "Un créneau vient d'être réservé. Choisissez un autre horaire.",
      status: 409,
    };
  }

  return { ok: true };
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
    const slots = input.slots;

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

    if (input.courseType === "private" && !isPrivateStudio(studio)) {
      return NextResponse.json(
        { error: "Le cours privé est réservé au Studio 3." },
        { status: 400 }
      );
    }

    const settings: Settings = await fetchSettings(supabase);
    await expireStalePendingBookings(supabase);

    // Validate every slot (including mutual overlaps already checked)
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const extraBusy = slots
        .filter((s, j) => j !== i && s.date === slot.date)
        .map((s) => ({
          start_minutes: s.startMinutes,
          duration_minutes: input.durationMinutes,
        }));
      const check = await validateSlotAvailability({
        studioId: input.studioId,
        date: slot.date,
        startMinutes: slot.startMinutes,
        durationMinutes: input.durationMinutes,
        settings,
        supabase,
        extraBusy,
      });
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }
    }

    const isPackage = slots.length > 1;
    const multiPricing = isPackage
      ? computeMultiSlotPackagePrice({
          studio,
          courseType: input.courseType,
          slots,
          durationMinutes: input.durationMinutes,
          peakWindows: settings.peak_windows,
        })
      : null;

    const singlePricing =
      !isPackage
        ? computeBookingPriceWithDiscounts({
            studio,
            courseType: input.courseType,
            date: slots[0].date,
            startMinutes: slots[0].startMinutes,
            durationMinutes: input.durationMinutes,
            peakWindows: settings.peak_windows,
            regularCourseCount: 1,
          })
        : null;

    const packageSubtotalMad = isPackage
      ? multiPricing!.packageSubtotalMad
      : singlePricing!.sessionPriceMad;
    const regularDiscountMad = isPackage
      ? multiPricing!.regularCourseDiscountMad
      : 0;
    const subtotalMad = isPackage
      ? multiPricing!.totalBeforePromoMad
      : singlePricing!.totalBeforePromoMad;

    let promoDiscountMad = 0;
    let appliedPromoCode: string | null = null;

    const rawPromo = input.promoCode?.trim();
    if (rawPromo) {
      const promo = await fetchPromoByCode(rawPromo, supabase);
      if (!promo) {
        return NextResponse.json(
          { error: "Code promo introuvable." },
          { status: 400 }
        );
      }
      const check = validatePromoForBooking(promo, subtotalMad);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      const discounted = calculatePromoDiscount(subtotalMad, promo);
      promoDiscountMad = discounted.discountMad;
      appliedPromoCode = promo.code;
    }

    const packageTotalMad =
      appliedPromoCode != null
        ? Math.max(0, Math.round((subtotalMad - promoDiscountMad) * 100) / 100)
        : subtotalMad;

    const chargedBeforePromo = isPackage
      ? multiPricing!.slots.map((s) => s.chargedPriceMad)
      : [singlePricing!.totalBeforePromoMad];

    const allocatedTotals = allocatePackageTotals(
      chargedBeforePromo,
      packageTotalMad
    );

    // Payment deadline: earliest session start, capped by confirmation window
    const earliestStart = Math.min(
      ...slots.map((s) => bookingStartUtc(s.date, s.startMinutes).getTime())
    );
    const deadlineMs = Math.min(
      Date.now() + settings.confirmation_deadline_hours * 3_600_000,
      earliestStart
    );

    const baseNote = input.note?.trim() || "";
    const packageGroupId = isPackage ? crypto.randomUUID() : null;
    const created: Booking[] = [];
    let lastError: { code?: string; message: string } | null = null;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const slotQuote = isPackage ? multiPricing!.slots[i] : null;
      const totalMad = allocatedTotals[i] ?? 0;

      const packageNote =
        isPackage
          ? `Séance ${i + 1}/${slots.length} du forfait${
              slotQuote?.isFree ? " (offerte)" : ""
            }`
          : "";
      const noteParts = [baseNote, packageNote].filter(Boolean);

      let booking: Booking | null = null;
      for (let attempt = 0; attempt < 2 && !booking; attempt++) {
        const row = {
          reference: generateBookingReference(),
          studio_id: input.studioId,
          date: slot.date,
          start_minutes: slot.startMinutes,
          duration_minutes: input.durationMinutes,
          total_price_mad: totalMad,
          subtotal_price_mad:
            i === 0 && (appliedPromoCode != null || regularDiscountMad > 0)
              ? packageSubtotalMad
              : null,
          discount_amount_mad:
            i === 0 && (appliedPromoCode != null || regularDiscountMad > 0)
              ? Math.round((promoDiscountMad + regularDiscountMad) * 100) / 100
              : null,
          promo_code: i === 0 ? appliedPromoCode : null,
          course_type: input.courseType,
          regular_course_count: isPackage ? slots.length : null,
          package_group_id: packageGroupId,
          package_index: isPackage ? i + 1 : null,
          customer_name: input.name.trim(),
          customer_email: input.email.trim().toLowerCase(),
          customer_phone: input.phone.trim(),
          note: noteParts.length ? noteParts.join(" · ") : null,
          payment_method: input.paymentMethod,
          status: "pending",
          payment_deadline: new Date(deadlineMs).toISOString(),
        };

        let { data, error } = await supabase
          .from("bookings")
          .insert(row)
          .select("*")
          .single();

        // Fallback if package columns migration not applied yet
        if (
          error &&
          (error.code === "42703" ||
            error.message?.includes("package_group_id") ||
            error.message?.includes("package_index"))
        ) {
          const legacyRow = { ...row };
          delete (legacyRow as { package_group_id?: string | null })
            .package_group_id;
          delete (legacyRow as { package_index?: number | null }).package_index;
          ({ data, error } = await supabase
            .from("bookings")
            .insert(legacyRow)
            .select("*")
            .single());
        }

        if (data) {
          booking = data as Booking;
        } else {
          lastError = error;
          if (error?.code === "23P01") break;
        }
      }

      if (!booking) {
        if (created.length > 0) {
          await supabase
            .from("bookings")
            .delete()
            .in(
              "id",
              created.map((b) => b.id)
            );
        }

        if (lastError?.code === "23P01") {
          return NextResponse.json(
            {
              error:
                "Un créneau vient d'être réservé. Choisissez un autre horaire.",
            },
            { status: 409 }
          );
        }
        if (lastError?.code === "42501") {
          console.error("Booking insert error (RLS):", lastError);
          return NextResponse.json(
            {
              error:
                "Configuration serveur incorrecte. Sur Vercel, vérifiez que SUPABASE_SECRET_KEY est la clé secret (sb_secret_…), pas la clé anon (eyJ…).",
            },
            { status: 503 }
          );
        }
        console.error("Booking insert error:", lastError);
        return NextResponse.json(
          { error: "Impossible de créer la réservation. Réessayez plus tard." },
          { status: 500 }
        );
      }

      created.push(booking);
    }

    // Enrich notes with sibling references for package bookings
    if (created.length > 1) {
      const refs = created.map((b) => b.reference).join(", ");
      await Promise.all(
        created.map((b, i) => {
          const slotNote = `Séance ${i + 1}/${created.length} du forfait${
            multiPricing!.slots[i].isFree ? " (offerte)" : ""
          } · Refs : ${refs}`;
          const fullNote = baseNote ? `${baseNote} · ${slotNote}` : slotNote;
          return supabase
            .from("bookings")
            .update({ note: fullNote })
            .eq("id", b.id);
        })
      );
    }

    if (appliedPromoCode) {
      await incrementPromoUses(appliedPromoCode, supabase);
    }

    // Email: primary booking with package total for display
    const primary = { ...created[0] };
    if (created.length > 1) {
      primary.total_price_mad = packageTotalMad;
      primary.subtotal_price_mad = packageSubtotalMad;
      primary.discount_amount_mad =
        promoDiscountMad + regularDiscountMad > 0
          ? Math.round((promoDiscountMad + regularDiscountMad) * 100) / 100
          : null;
      const sessionLines = created
        .map(
          (b, i) =>
            `${b.date} ${String(Math.floor(b.start_minutes / 60)).padStart(2, "0")}:${String(b.start_minutes % 60).padStart(2, "0")}${
              multiPricing!.slots[i].isFree ? " (offerte)" : ""
            } [${b.reference}]`
        )
        .join("\n");
      primary.note = baseNote
        ? `${baseNote}\n\nForfait ${created.length} séances :\n${sessionLines}`
        : `Forfait ${created.length} séances :\n${sessionLines}`;
    }

    const emailCtx = { booking: primary, studio, settings };
    const [clientEmailResult, adminEmailResult] = await Promise.all([
      sendBookingReceivedEmail(emailCtx),
      sendAdminNewBookingEmail(emailCtx),
    ]);
    if (!clientEmailResult.ok) {
      console.error("Client booking email failed:", clientEmailResult.error);
    }
    if (!adminEmailResult.ok) {
      console.error("Admin booking email failed:", adminEmailResult.error);
    }

    return NextResponse.json({
      success: true,
      reference: created[0].reference,
      references: created.map((b) => b.reference),
      slots: created.map((b) => ({
        reference: b.reference,
        date: b.date,
        startMinutes: b.start_minutes,
        totalPriceMad: b.total_price_mad,
      })),
      totalPriceMad: packageTotalMad,
      subtotalPriceMad:
        appliedPromoCode != null || regularDiscountMad > 0
          ? packageSubtotalMad
          : null,
      discountAmountMad:
        promoDiscountMad + regularDiscountMad > 0
          ? Math.round((promoDiscountMad + regularDiscountMad) * 100) / 100
          : null,
      promoCode: appliedPromoCode,
      paymentDeadline: new Date(deadlineMs).toISOString(),
      emailSent: clientEmailResult.ok,
      ...(clientEmailResult.ok
        ? {}
        : { emailError: clientEmailResult.error }),
    });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite." },
      { status: 500 }
    );
  }
}
