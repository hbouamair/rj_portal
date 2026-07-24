"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  Booking,
  OpeningHours,
  PaymentMethod,
  PeakWindow,
  Settings,
  Studio,
} from "@/lib/booking/types";
import {
  computeBookingPrice,
  bookingStartUtc,
  intervalsOverlap,
  openingForDate,
} from "@/lib/booking/pricing";
import {
  expireStalePendingBookings,
  fetchBusySlots,
  fetchSettings,
  generateBookingReference,
} from "@/lib/booking/db";
import {
  sendBookingCancelledEmail,
  sendBookingConfirmedEmail,
  sendBookingReceivedEmail,
} from "@/lib/booking/emails";

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  warning?: string;
}

async function requireAdmin(): Promise<void> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorisé");
}

async function fetchBookingWithStudio(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, studios(id, name)")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Réservation introuvable");
  return data as Booking & { studios: Pick<Studio, "id" | "name"> };
}

async function updateBookingStatus(
  id: string,
  status: string
): Promise<Booking> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Mise à jour impossible");
  return data as Booking;
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/income");
}

/** Admin confirms that payment was received. Sends the confirmation email. */
export async function confirmBooking(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await fetchBookingWithStudio(id);
    if (existing.status !== "pending") {
      return { ok: false, error: "Seules les réservations en attente peuvent être confirmées." };
    }
    const booking = await updateBookingStatus(id, "confirmed");
    const settings = await fetchSettings();
    const emailResult = await sendBookingConfirmedEmail({
      booking,
      studio: existing.studios,
      settings,
    });
    revalidateAdmin();
    if (!emailResult.ok) {
      return {
        ok: true,
        warning: `Réservation confirmée, mais l'email client n'a pas pu être envoyé : ${emailResult.error}`,
      };
    }
    return {
      ok: true,
      message: `Réservation confirmée. Email de confirmation envoyé à ${existing.customer_email}.`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

/** Resend the confirmation email for an already confirmed booking. */
export async function resendBookingConfirmationEmail(
  id: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await fetchBookingWithStudio(id);
    if (existing.status !== "confirmed") {
      return {
        ok: false,
        error: "Seules les réservations confirmées peuvent recevoir un email de confirmation.",
      };
    }
    const settings = await fetchSettings();
    const emailResult = await sendBookingConfirmedEmail({
      booking: existing,
      studio: existing.studios,
      settings,
    });
    if (!emailResult.ok) {
      return { ok: false, error: emailResult.error };
    }
    return {
      ok: true,
      message: `Email de confirmation renvoyé à ${existing.customer_email}.`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await fetchBookingWithStudio(id);
    if (!["pending", "confirmed"].includes(existing.status)) {
      return { ok: false, error: "Cette réservation ne peut pas être annulée." };
    }
    const booking = await updateBookingStatus(id, "cancelled");
    const settings = await fetchSettings();
    await sendBookingCancelledEmail(
      { booking, studio: existing.studios, settings },
      "cancelled"
    );
    revalidateAdmin();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export async function completeBooking(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await fetchBookingWithStudio(id);
    if (existing.status !== "confirmed") {
      return { ok: false, error: "Seules les réservations confirmées peuvent être terminées." };
    }
    await updateBookingStatus(id, "completed");
    revalidateAdmin();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export async function saveAdminNote(
  id: string,
  note: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("bookings")
      .update({
        admin_note: note.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateAdmin();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export interface ManualBookingInput {
  studioId: number;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  name: string;
  email: string;
  phone: string;
  note?: string;
  paymentMethod: PaymentMethod;
  status: "pending" | "confirmed";
  sendEmail: boolean;
}

/** Manual booking created by the admin (phone / WhatsApp reservations). */
export async function createManualBooking(
  input: ManualBookingInput
): Promise<ActionResult & { reference?: string }> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: studioData } = await supabase
      .from("studios")
      .select("*")
      .eq("id", input.studioId)
      .single();
    if (!studioData) return { ok: false, error: "Studio introuvable." };
    const studio = studioData as Studio;
    const settings = await fetchSettings(supabase);

    const opening = openingForDate(settings.opening_hours, input.date);
    const end = input.startMinutes + input.durationMinutes;
    if (!opening || input.startMinutes < opening.open || end > opening.close) {
      return { ok: false, error: "Créneau en dehors des horaires d'ouverture." };
    }

    await expireStalePendingBookings(supabase);
    const busy = await fetchBusySlots(input.studioId, input.date, supabase);
    if (
      busy.some((b) =>
        intervalsOverlap(
          input.startMinutes,
          end,
          b.start_minutes,
          b.start_minutes + b.duration_minutes
        )
      )
    ) {
      return { ok: false, error: "Ce créneau est déjà réservé." };
    }

    const price = computeBookingPrice(
      studio,
      input.date,
      input.startMinutes,
      input.durationMinutes,
      settings.peak_windows
    );

    const deadlineMs =
      input.status === "confirmed"
        ? bookingStartUtc(input.date, input.startMinutes).getTime()
        : Math.min(
            Date.now() + settings.confirmation_deadline_hours * 3_600_000,
            bookingStartUtc(input.date, input.startMinutes).getTime()
          );

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
        status: input.status,
        payment_deadline: new Date(deadlineMs).toISOString(),
        admin_note: "Créée manuellement par l'admin",
      })
      .select("*")
      .single();
    if (error || !data) {
      if (error?.code === "23P01") {
        return { ok: false, error: "Ce créneau est déjà réservé." };
      }
      throw new Error(error?.message ?? "Insertion impossible");
    }
    const booking = data as Booking;

    if (input.sendEmail) {
      const ctx = { booking, studio, settings };
      if (input.status === "confirmed") {
        const emailResult = await sendBookingConfirmedEmail(ctx);
        if (!emailResult.ok) {
          return {
            ok: true,
            reference: booking.reference,
            warning: `Réservation créée, mais l'email de confirmation n'a pas pu être envoyé : ${emailResult.error}`,
          };
        }
      } else {
        await sendBookingReceivedEmail(ctx);
      }
    }

    revalidateAdmin();
    return { ok: true, reference: booking.reference };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export interface StudioUpdateInput {
  name: string;
  subtitle: string;
  size_label: string;
  capacity_label: string;
  price_peak_mad: number;
  price_offpeak_mad: number;
  popular: boolean;
  active: boolean;
}

export async function updateStudio(
  id: number,
  input: StudioUpdateInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (
      !input.name.trim() ||
      !Number.isFinite(input.price_peak_mad) ||
      !Number.isFinite(input.price_offpeak_mad) ||
      input.price_peak_mad < 0 ||
      input.price_offpeak_mad < 0
    ) {
      return { ok: false, error: "Valeurs invalides." };
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("studios")
      .update({
        name: input.name.trim(),
        subtitle: input.subtitle.trim() || null,
        size_label: input.size_label.trim() || null,
        capacity_label: input.capacity_label.trim() || null,
        price_peak_mad: Math.round(input.price_peak_mad),
        price_offpeak_mad: Math.round(input.price_offpeak_mad),
        popular: input.popular,
        active: input.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/studios");
    revalidatePath("/reservation");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export interface SettingsUpdateInput {
  opening_hours: OpeningHours;
  peak_windows: PeakWindow[];
  paypal_email: string;
  paypal_link: string;
  bank_details: string;
  confirmation_deadline_hours: number;
  reminder_hours_before: number;
}

export async function updateSettings(
  input: SettingsUpdateInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (
      !Number.isInteger(input.confirmation_deadline_hours) ||
      input.confirmation_deadline_hours < 1 ||
      input.confirmation_deadline_hours > 336
    ) {
      return { ok: false, error: "Délai de confirmation invalide (1 à 336 heures)." };
    }
    if (
      !Number.isInteger(input.reminder_hours_before) ||
      input.reminder_hours_before < 1 ||
      input.reminder_hours_before > 168
    ) {
      return {
        ok: false,
        error: "Délai de relance invalide (1 à 168 heures avant la séance).",
      };
    }
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const day of Object.keys(input.opening_hours)) {
      const entry = input.opening_hours[day];
      if (entry === null) continue;
      if (
        !timeRegex.test(entry.open) ||
        !timeRegex.test(entry.close) ||
        entry.open >= entry.close
      ) {
        return { ok: false, error: "Horaires d'ouverture invalides." };
      }
    }
    for (const w of input.peak_windows) {
      if (
        !Array.isArray(w.days) ||
        !timeRegex.test(w.start) ||
        !timeRegex.test(w.end) ||
        w.start >= w.end
      ) {
        return { ok: false, error: "Plages d'heures pleines invalides." };
      }
    }

    const supabase = getSupabaseAdmin();
    const update: Partial<Settings> & { updated_at: string } = {
      opening_hours: input.opening_hours,
      peak_windows: input.peak_windows,
      paypal_email: input.paypal_email.trim() || null,
      paypal_link: input.paypal_link.trim() || null,
      bank_details: input.bank_details.trim() || null,
      confirmation_deadline_hours: input.confirmation_deadline_hours,
      reminder_hours_before: input.reminder_hours_before,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("settings").update(update).eq("id", 1);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/settings");
    revalidatePath("/reservation");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}
