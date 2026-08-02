import type { CourseType, Studio } from "./types";
import { computeBookingPrice, formatMad, type PriceBreakdown } from "./pricing";
import type { PeakWindow } from "./types";

/** Studio reserved for private courses (max 3 people). */
export const PRIVATE_STUDIO_NAME = "Studio 3";

export const PRIVATE_COURSE_DISCOUNT_PERCENT = 50;
/** Minimum courses in a package to unlock free sessions. */
export const REGULAR_COURSE_MIN_COUNT = 10;

export function isPrivateStudio(studio: Pick<Studio, "name">): boolean {
  return studio.name === PRIVATE_STUDIO_NAME;
}

/** Effective hourly rates after course-type adjustment (private = −50%). */
export function getEffectiveStudioPrices(
  studio: Pick<Studio, "name" | "price_peak_mad" | "price_offpeak_mad">,
  courseType: CourseType
): Pick<Studio, "price_peak_mad" | "price_offpeak_mad"> {
  if (courseType !== "private") {
    return {
      price_peak_mad: studio.price_peak_mad,
      price_offpeak_mad: studio.price_offpeak_mad,
    };
  }
  const factor = 1 - PRIVATE_COURSE_DISCOUNT_PERCENT / 100;
  return {
    price_peak_mad: Math.round(studio.price_peak_mad * factor * 100) / 100,
    price_offpeak_mad: Math.round(studio.price_offpeak_mad * factor * 100) / 100,
  };
}

export function filterStudiosForCourseType(
  studios: Studio[],
  courseType: CourseType
): Studio[] {
  if (courseType === "private") {
    return studios.filter(isPrivateStudio);
  }
  return studios;
}

/** Free sessions included: 1 free course per block of 10 in the package. */
export function getFreeCoursesForPackage(courseCount: number): number {
  if (courseCount < REGULAR_COURSE_MIN_COUNT) return 0;
  return Math.floor(courseCount / REGULAR_COURSE_MIN_COUNT);
}

export function getPaidCoursesForPackage(courseCount: number): number {
  return courseCount - getFreeCoursesForPackage(courseCount);
}

export interface BookingDiscountBreakdown {
  basePrice: PriceBreakdown;
  /** Price of one session (same slot & duration). */
  sessionPriceMad: number;
  /** Number of courses billed (1 = single booking, no forfait). */
  packageCourseCount: number;
  /** sessionPrice × packageCourseCount, before free-course offer. */
  packageSubtotalMad: number;
  courseTypeDiscountMad: number;
  freeCoursesIncluded: number;
  regularCourseDiscountMad: number;
  totalBeforePromoMad: number;
}

export function computeBookingPriceWithDiscounts(options: {
  studio: Studio;
  courseType: CourseType;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  peakWindows: PeakWindow[];
  regularCourseCount?: number;
}): BookingDiscountBreakdown {
  const effective = getEffectiveStudioPrices(options.studio, options.courseType);
  const basePrice = computeBookingPrice(
    effective,
    options.date,
    options.startMinutes,
    options.durationMinutes,
    options.peakWindows
  );

  const sessionPriceMad = basePrice.totalMad;
  let courseTypeDiscountMad = 0;

  if (options.courseType === "private") {
    const fullPrice = computeBookingPrice(
      options.studio,
      options.date,
      options.startMinutes,
      options.durationMinutes,
      options.peakWindows
    );
    courseTypeDiscountMad =
      Math.round((fullPrice.totalMad - sessionPriceMad) * 100) / 100;
  }

  const hasPackage =
    options.regularCourseCount != null && options.regularCourseCount >= 1;
  const packageCourseCount = hasPackage ? options.regularCourseCount! : 1;

  const packageSubtotalMad =
    Math.round(sessionPriceMad * packageCourseCount * 100) / 100;

  const freeCoursesIncluded = hasPackage
    ? getFreeCoursesForPackage(packageCourseCount)
    : 0;
  const regularCourseDiscountMad =
    Math.round(sessionPriceMad * freeCoursesIncluded * 100) / 100;

  const totalBeforePromoMad = Math.max(
    0,
    Math.round((packageSubtotalMad - regularCourseDiscountMad) * 100) / 100
  );

  return {
    basePrice,
    sessionPriceMad,
    packageCourseCount,
    packageSubtotalMad,
    courseTypeDiscountMad: hasPackage
      ? Math.round(courseTypeDiscountMad * packageCourseCount * 100) / 100
      : courseTypeDiscountMad,
    freeCoursesIncluded,
    regularCourseDiscountMad,
    totalBeforePromoMad,
  };
}

/** Short label for the pack-10 offer (UI). */
export function regularCourseOfferLabel(): string {
  return `Pack ${REGULAR_COURSE_MIN_COUNT} : payez ${REGULAR_COURSE_MIN_COUNT - 1}, la ${REGULAR_COURSE_MIN_COUNT}e séance est offerte (~10 % de remise).`;
}

/** One-line package summary for receipts and confirmation. */
export function formatPackageSummary(b: BookingDiscountBreakdown): string | null {
  if (b.packageCourseCount <= 1) return null;
  const paid = getPaidCoursesForPackage(b.packageCourseCount);
  if (b.freeCoursesIncluded > 0) {
    return `${b.packageCourseCount} cours · vous payez ${paid} (${b.freeCoursesIncluded} offert${b.freeCoursesIncluded > 1 ? "s" : ""}) · ${formatMad(b.totalBeforePromoMad)}`;
  }
  return `${b.packageCourseCount} cours × ${formatMad(b.sessionPriceMad)} = ${formatMad(b.packageSubtotalMad)}`;
}

export interface BookingSlotInput {
  date: string;
  startMinutes: number;
}

export interface SlotQuote {
  date: string;
  startMinutes: number;
  sessionPriceMad: number;
  chargedPriceMad: number;
  isFree: boolean;
  courseTypeDiscountMad: number;
}

export interface MultiSlotPackageBreakdown {
  slots: SlotQuote[];
  packageCourseCount: number;
  packageSubtotalMad: number;
  freeCoursesIncluded: number;
  regularCourseDiscountMad: number;
  courseTypeDiscountMad: number;
  totalBeforePromoMad: number;
}

/**
 * Price N distinct slots as a package.
 * Free sessions (1 per block of 10) are applied to the cheapest slots.
 */
export function computeMultiSlotPackagePrice(options: {
  studio: Studio;
  courseType: CourseType;
  slots: BookingSlotInput[];
  durationMinutes: number;
  peakWindows: PeakWindow[];
}): MultiSlotPackageBreakdown {
  const { studio, courseType, slots, durationMinutes, peakWindows } = options;
  const packageCourseCount = slots.length;

  const quoted = slots.map((slot) => {
    const single = computeBookingPriceWithDiscounts({
      studio,
      courseType,
      date: slot.date,
      startMinutes: slot.startMinutes,
      durationMinutes,
      peakWindows,
      regularCourseCount: 1,
    });
    return {
      date: slot.date,
      startMinutes: slot.startMinutes,
      sessionPriceMad: single.sessionPriceMad,
      courseTypeDiscountMad: single.courseTypeDiscountMad,
    };
  });

  const freeCoursesIncluded = getFreeCoursesForPackage(packageCourseCount);
  const orderByCheapest = quoted
    .map((q, index) => ({ index, price: q.sessionPriceMad }))
    .sort((a, b) => a.price - b.price || a.index - b.index);
  const freeIndexes = new Set(
    orderByCheapest.slice(0, freeCoursesIncluded).map((x) => x.index)
  );

  const slotQuotes: SlotQuote[] = quoted.map((q, index) => {
    const isFree = freeIndexes.has(index);
    return {
      ...q,
      isFree,
      chargedPriceMad: isFree ? 0 : q.sessionPriceMad,
    };
  });

  const packageSubtotalMad =
    Math.round(
      slotQuotes.reduce((sum, s) => sum + s.sessionPriceMad, 0) * 100
    ) / 100;
  const regularCourseDiscountMad =
    Math.round(
      slotQuotes
        .filter((s) => s.isFree)
        .reduce((sum, s) => sum + s.sessionPriceMad, 0) * 100
    ) / 100;
  const courseTypeDiscountMad =
    Math.round(
      slotQuotes.reduce((sum, s) => sum + s.courseTypeDiscountMad, 0) * 100
    ) / 100;
  const totalBeforePromoMad =
    Math.round((packageSubtotalMad - regularCourseDiscountMad) * 100) / 100;

  return {
    slots: slotQuotes,
    packageCourseCount,
    packageSubtotalMad,
    freeCoursesIncluded,
    regularCourseDiscountMad,
    courseTypeDiscountMad,
    totalBeforePromoMad,
  };
}

/** Distribute a final package total across charged slots (proportional). */
export function allocatePackageTotals(
  chargedPrices: number[],
  finalTotalMad: number
): number[] {
  const sum = chargedPrices.reduce((a, b) => a + b, 0);
  if (sum <= 0 || chargedPrices.length === 0) {
    return chargedPrices.map(() => 0);
  }
  const allocated = chargedPrices.map(
    (p) => Math.round(((p / sum) * finalTotalMad) * 100) / 100
  );
  // Fix rounding drift on the last non-zero slot
  const drift =
    Math.round((finalTotalMad - allocated.reduce((a, b) => a + b, 0)) * 100) /
    100;
  if (drift !== 0) {
    for (let i = allocated.length - 1; i >= 0; i--) {
      if (chargedPrices[i] > 0 || i === 0) {
        allocated[i] = Math.round((allocated[i] + drift) * 100) / 100;
        break;
      }
    }
  }
  return allocated;
}
