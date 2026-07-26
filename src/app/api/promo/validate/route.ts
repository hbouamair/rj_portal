import { NextRequest, NextResponse } from "next/server";
import { fetchPromoByCode } from "@/lib/booking/db";
import {
  calculatePromoDiscount,
  normalizePromoCode,
  validatePromoForBooking,
} from "@/lib/booking/promo";

export const dynamic = "force-dynamic";

/**
 * GET /api/promo/validate?code=SUMMER20&subtotal=500
 * Preview promo discount for the booking wizard (server-authoritative).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const subtotal = Number(request.nextUrl.searchParams.get("subtotal"));

  const normalized = normalizePromoCode(code);
  if (!normalized || normalized.length > 32) {
    return NextResponse.json(
      { valid: false, error: "Code promo invalide." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json(
      { valid: false, error: "Montant invalide." },
      { status: 400 }
    );
  }

  try {
    const promo = await fetchPromoByCode(normalized);
    if (!promo) {
      return NextResponse.json({
        valid: false,
        error: "Code promo introuvable.",
      });
    }

    const check = validatePromoForBooking(promo, subtotal);
    if (!check.ok) {
      return NextResponse.json({ valid: false, error: check.error });
    }

    const { discountMad, totalMad } = calculatePromoDiscount(subtotal, promo);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      label: promo.label,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      discountMad,
      subtotalMad: subtotal,
      totalMad,
    });
  } catch (err) {
    console.error("Promo validate error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("promo_codes") || msg.includes("does not exist")) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Codes promo non configurés. Exécutez supabase/promo-codes-migration.sql.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { valid: false, error: "Impossible de vérifier le code promo." },
      { status: 503 }
    );
  }
}
