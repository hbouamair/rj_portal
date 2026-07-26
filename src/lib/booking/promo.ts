import type { PromoCode } from "./types";

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculatePromoDiscount(
  subtotalMad: number,
  promo: Pick<PromoCode, "discount_type" | "discount_value">
): { discountMad: number; totalMad: number } {
  let discountMad =
    promo.discount_type === "percent"
      ? subtotalMad * (promo.discount_value / 100)
      : promo.discount_value;

  discountMad = Math.min(Math.round(discountMad * 100) / 100, subtotalMad);
  const totalMad = Math.max(
    0,
    Math.round((subtotalMad - discountMad) * 100) / 100
  );
  return { discountMad, totalMad };
}

export function validatePromoForBooking(
  promo: PromoCode,
  subtotalMad: number,
  now: Date = new Date()
): { ok: true } | { ok: false; error: string } {
  if (!promo.active) {
    return { ok: false, error: "Ce code promo n'est plus actif." };
  }
  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return { ok: false, error: "Ce code promo n'est pas encore valide." };
  }
  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return { ok: false, error: "Ce code promo a expiré." };
  }
  if (promo.max_uses != null && promo.uses_count >= promo.max_uses) {
    return {
      ok: false,
      error: "Ce code promo a atteint sa limite d'utilisation.",
    };
  }
  if (promo.min_amount_mad != null && subtotalMad < promo.min_amount_mad) {
    return {
      ok: false,
      error: `Montant minimum requis : ${promo.min_amount_mad} MAD.`,
    };
  }
  if (promo.discount_type === "percent" && promo.discount_value > 100) {
    return { ok: false, error: "Code promo invalide." };
  }
  return { ok: true };
}

export function formatPromoDiscountLabel(promo: PromoCode): string {
  if (promo.discount_type === "percent") {
    return `-${promo.discount_value}%`;
  }
  return `-${promo.discount_value} MAD`;
}
