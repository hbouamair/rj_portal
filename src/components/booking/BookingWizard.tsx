"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  Music,
  PartyPopper,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import type { CourseType, PaymentMethod, Settings, Studio } from "@/lib/booking/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/booking/types";
import type { BusyInterval } from "@/lib/booking/pricing";
import {
  computeAvailableStartTimes,
  durationOptions,
  formatDurationLabel,
  formatMad,
  minutesToTimeString,
} from "@/lib/booking/pricing";
import {
  computeBookingPriceWithDiscounts,
  computeMultiSlotPackagePrice,
  filterStudiosForCourseType,
  getEffectiveStudioPrices,
  getPaidCoursesForPackage,
  PRIVATE_COURSE_DISCOUNT_PERCENT,
  REGULAR_COURSE_MIN_COUNT,
  regularCourseOfferLabel,
  type BookingSlotInput,
  type MultiSlotPackageBreakdown,
} from "@/lib/booking/discounts";
import { getStudioImages } from "@/lib/booking/studio-images";
import StudioImageCarousel from "@/components/studios/StudioImageCarousel";

interface Props {
  studios: Studio[];
  settings: Settings;
}

type SessionMode = "single" | "multi";

interface BookingResult {
  reference: string;
  references?: string[];
  slots?: Array<{
    reference: string;
    date: string;
    startMinutes: number;
    totalPriceMad: number;
  }>;
  totalPriceMad: number;
  subtotalPriceMad?: number | null;
  discountAmountMad?: number | null;
  promoCode?: string | null;
  paymentDeadline: string;
  emailSent?: boolean;
}

interface AppliedPromo {
  code: string;
  label: string | null;
  discountMad: number;
  totalMad: number;
}

const STEPS = [
  "Type de cours",
  "Séances",
  "Studio",
  "Créneaux",
  "Coordonnées",
  "Confirmé",
];
const MIN_MULTI_SESSIONS = 2;
const MAX_MULTI_SESSIONS = 52;

const stepMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export default function BookingWizard({ studios, settings }: Props) {
  const [step, setStep] = useState(0);
  const [courseType, setCourseType] = useState<CourseType | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode | null>(null);
  const [multiCount, setMultiCount] = useState(MIN_MULTI_SESSIONS);
  const [studio, setStudio] = useState<Studio | null>(null);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [startMinutes, setStartMinutes] = useState<number | null>(null);
  const [confirmedSlots, setConfirmedSlots] = useState<BookingSlotInput[]>([]);
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);
  const skipInitialScroll = useRef(true);

  const targetSlotCount = sessionMode === "multi" ? multiCount : 1;
  const isMulti = sessionMode === "multi";

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    const el = wizardRef.current;
    if (!el) return;
    const navOffset = 112;
    const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [step]);

  const loadAvailability = useCallback(
    async (studioId: number, date: string) => {
      setLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/availability?studioId=${studioId}&date=${date}`
        );
        const json = await res.json();
        setBusy(res.ok ? (json.busy ?? []) : []);
      } catch {
        setBusy([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  useEffect(() => {
    if (studio && selectedDate) {
      setStartMinutes(null);
      loadAvailability(studio.id, selectedDate);
    }
  }, [studio, selectedDate, loadAvailability]);

  const busyWithLocal = useMemo(() => {
    if (!selectedDate) return busy;
    const local = confirmedSlots
      .filter((s) => s.date === selectedDate)
      .map((s) => ({
        start_minutes: s.startMinutes,
        duration_minutes: duration,
      }));
    return [...busy, ...local];
  }, [busy, confirmedSlots, selectedDate, duration]);

  const availableStarts = useMemo(() => {
    if (!selectedDate) return [];
    return computeAvailableStartTimes({
      settings,
      date: selectedDate,
      durationMinutes: duration,
      busy: busyWithLocal,
    });
  }, [settings, selectedDate, duration, busyWithLocal]);

  useEffect(() => {
    if (startMinutes !== null && !availableStarts.includes(startMinutes)) {
      setStartMinutes(null);
    }
  }, [availableStarts, startMinutes]);

  const visibleStudios = useMemo(
    () => (courseType ? filterStudiosForCourseType(studios, courseType) : studios),
    [studios, courseType]
  );

  const effectiveStudio = useMemo(
    () =>
      studio && courseType
        ? { ...studio, ...getEffectiveStudioPrices(studio, courseType) }
        : studio,
    [studio, courseType]
  );

  // Peak / off-peak / mixed classification + per-session price for each start
  const slotInfo = useMemo(() => {
    const map = new Map<
      number,
      { total: number; kind: "peak" | "off" | "mixed" }
    >();
    if (!studio || !courseType || !selectedDate) return map;
    for (const m of availableStarts) {
      const p = computeBookingPriceWithDiscounts({
        studio,
        courseType,
        date: selectedDate,
        startMinutes: m,
        durationMinutes: duration,
        peakWindows: settings.peak_windows,
        regularCourseCount: 1,
      });
      const base = p.basePrice;
      map.set(m, {
        total: p.sessionPriceMad,
        kind:
          base.peakMinutes > 0 && base.offPeakMinutes > 0
            ? "mixed"
            : base.peakMinutes > 0
              ? "peak"
              : "off",
      });
    }
    return map;
  }, [
    studio,
    courseType,
    selectedDate,
    duration,
    availableStarts,
    settings.peak_windows,
  ]);

  const singlePriceBreakdown = useMemo(() => {
    if (
      isMulti ||
      !studio ||
      !courseType ||
      !selectedDate ||
      startMinutes === null
    ) {
      return null;
    }
    return computeBookingPriceWithDiscounts({
      studio,
      courseType,
      date: selectedDate,
      startMinutes,
      durationMinutes: duration,
      peakWindows: settings.peak_windows,
      regularCourseCount: 1,
    });
  }, [
    isMulti,
    studio,
    courseType,
    selectedDate,
    startMinutes,
    duration,
    settings.peak_windows,
  ]);

  const multiPriceBreakdown: MultiSlotPackageBreakdown | null = useMemo(() => {
    if (!isMulti || !studio || !courseType || confirmedSlots.length === 0)
      return null;
    return computeMultiSlotPackagePrice({
      studio,
      courseType,
      slots: confirmedSlots,
      durationMinutes: duration,
      peakWindows: settings.peak_windows,
    });
  }, [
    isMulti,
    studio,
    courseType,
    confirmedSlots,
    duration,
    settings.peak_windows,
  ]);

  const packageReady =
    !isMulti
      ? singlePriceBreakdown != null
      : confirmedSlots.length === targetSlotCount && multiPriceBreakdown != null;

  const totalBeforePromoMad = isMulti
    ? multiPriceBreakdown?.totalBeforePromoMad ?? null
    : singlePriceBreakdown?.totalBeforePromoMad ?? null;

  const displayTotalMad =
    appliedPromo?.totalMad ?? totalBeforePromoMad ?? null;

  function resetSchedule() {
    setSelectedDate(null);
    setStartMinutes(null);
    setConfirmedSlots([]);
    setAppliedPromo(null);
  }

  function handleDurationChange(next: number) {
    setDuration(next);
    setStartMinutes(null);
    if (isMulti) {
      setConfirmedSlots([]);
      setAppliedPromo(null);
    }
  }

  function selectStartTime(m: number) {
    if (!selectedDate) return;
    if (!isMulti) {
      setStartMinutes(m);
      return;
    }
    if (confirmedSlots.length >= targetSlotCount) return;
    const exists = confirmedSlots.some(
      (s) => s.date === selectedDate && s.startMinutes === m
    );
    if (exists) return;
    setConfirmedSlots((prev) => [
      ...prev,
      { date: selectedDate, startMinutes: m },
    ]);
    setStartMinutes(null);
    setAppliedPromo(null);
  }

  function removeConfirmedSlot(index: number) {
    setConfirmedSlots((prev) => prev.filter((_, i) => i !== index));
    setAppliedPromo(null);
  }

  async function applyPromoCode() {
    if (totalBeforePromoMad == null || !promoInput.trim()) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await fetch(
        `/api/promo/validate?code=${encodeURIComponent(promoInput.trim())}&subtotal=${totalBeforePromoMad}`
      );
      const json = await res.json();
      if (!json.valid) {
        setAppliedPromo(null);
        setPromoError(json.error ?? "Code promo invalide.");
        return;
      }
      setAppliedPromo({
        code: json.code,
        label: json.label ?? null,
        discountMad: json.discountMad,
        totalMad: json.totalMad,
      });
    } catch {
      setPromoError("Impossible de vérifier le code promo.");
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  }

  function clearPromo() {
    setPromoInput("");
    setAppliedPromo(null);
    setPromoError(null);
  }

  async function submitBooking() {
    if (!studio || !courseType || !packageReady) return;

    const slots: BookingSlotInput[] = isMulti
      ? confirmedSlots
      : selectedDate && startMinutes !== null
        ? [{ date: selectedDate, startMinutes }]
        : [];

    if (slots.length !== targetSlotCount) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId: studio.id,
          courseType,
          slots,
          durationMinutes: duration,
          name,
          email,
          phone,
          note: note || undefined,
          paymentMethod,
          promoCode: appliedPromo?.code,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur s'est produite.");
        if (res.status === 409) {
          if (selectedDate) loadAvailability(studio.id, selectedDate);
          setStep(3);
        }
        return;
      }
      setResult(json as BookingResult);
      setStep(5);
    } catch {
      setError(
        "Impossible d'envoyer la réservation. Vérifiez votre connexion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const scheduleComplete = isMulti
    ? confirmedSlots.length === targetSlotCount
    : selectedDate != null && startMinutes !== null;

  const detailsValid =
    name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length >= 8;

  return (
    <div ref={wizardRef} className="max-w-5xl mx-auto scroll-mt-28">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div key={step} {...stepMotion}>
          {step === 0 && (
            <CourseTypeStep
              selected={courseType}
              onSelect={(type) => {
                setCourseType(type);
                setStudio(null);
                setSessionMode(null);
                resetSchedule();
                setStep(1);
              }}
            />
          )}

          {step === 1 && courseType && (
            <SessionCountStep
              mode={sessionMode}
              multiCount={multiCount}
              onMultiCountChange={(n) => {
                setMultiCount(n);
                setConfirmedSlots([]);
                setAppliedPromo(null);
              }}
              onSelect={(mode) => {
                setSessionMode(mode);
                resetSchedule();
                setStep(2);
              }}
              onBack={() => setStep(0)}
            />
          )}

          {step === 2 && courseType && sessionMode && (
            <StudioStep
              studios={visibleStudios}
              courseType={courseType}
              selected={studio}
              onSelect={(s) => {
                setStudio(s);
                resetSchedule();
                setStep(3);
              }}
              onBack={() => setStep(1)}
              backLabel="Nombre de séances"
            />
          )}

          {step === 3 && studio && courseType && sessionMode && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-charcoal/5 text-xs font-semibold text-charcoal shadow-sm">
                  <Users className="w-3.5 h-3.5 text-secondary-500" aria-hidden />
                  {courseType === "private" ? "Cours privé" : "Cours en groupe"}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-charcoal/5 text-xs font-semibold text-charcoal shadow-sm">
                  <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                  {studio.name}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-charcoal/5 text-xs font-semibold text-charcoal shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-secondary-500" aria-hidden />
                  {isMulti ? `${targetSlotCount} séances` : "1 séance"}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-500 cursor-pointer transition-colors duration-200"
                >
                  Changer de studio
                </button>
              </div>

              {isMulti && (
                <div className="book-card px-4 py-3 sm:px-5 border-secondary-100/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-charcoal text-sm sm:text-base">
                        Sélectionnez {targetSlotCount} créneaux
                        <span className="ml-2 font-semibold text-primary-600 tabular-nums">
                          {confirmedSlots.length}/{targetSlotCount}
                        </span>
                      </p>
                      <p className="text-xs text-soft-charcoal mt-0.5 truncate">
                        {regularCourseOfferLabel()}
                      </p>
                    </div>
                    <div
                      className="h-1.5 w-full sm:w-40 sm:flex-none rounded-full bg-charcoal/5 overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (confirmedSlots.length / targetSlotCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div
                className={
                  isMulti
                    ? "grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
                    : "grid grid-cols-1 lg:grid-cols-2 gap-5"
                }
              >
                <div
                  className={
                    isMulti
                      ? "lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5"
                      : "contents"
                  }
                >
                <div className="book-card p-5 sm:p-6">
                  <h3 className="flex items-center gap-2.5 font-display font-bold text-charcoal mb-5">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" aria-hidden />
                    </span>
                    {isMulti && confirmedSlots.length < targetSlotCount
                      ? `Date — séance ${confirmedSlots.length + 1}`
                      : "Date"}
                  </h3>
                  <MonthCalendar
                    month={month}
                    onMonthChange={setMonth}
                    selectedDate={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setStartMinutes(null);
                    }}
                    settings={settings}
                    markedDates={confirmedSlots.map((s) => s.date)}
                  />
                </div>

                <div className="book-card p-5 sm:p-6 flex flex-col">
                  <h3 className="flex items-center gap-2.5 font-display font-bold text-charcoal mb-5">
                    <span className="w-9 h-9 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" aria-hidden />
                    </span>
                    Durée & horaire
                  </h3>

                  <p className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2.5">
                    Durée · min. 1h
                    {isMulti && (
                      <span className="normal-case font-medium tracking-normal ml-1">
                        (identique pour toutes les séances)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[60, 90, 120, 150, 180, 240].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDurationChange(d)}
                        className={
                          duration === d ? "book-chip-active" : "book-chip-idle"
                        }
                      >
                        {formatDurationLabel(d)}
                      </button>
                    ))}
                    <select
                      value={
                        durationOptions().includes(duration) && duration > 240
                          ? duration
                          : ""
                      }
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v) handleDurationChange(v);
                      }}
                      className={`book-input w-auto min-h-11 ${
                        duration > 240
                          ? "ring-2 ring-primary-500/40 bg-white"
                          : ""
                      }`}
                      aria-label="Durée plus longue"
                    >
                      <option value="">+ de 4h…</option>
                      {durationOptions()
                        .filter((d) => d > 240)
                        .map((d) => (
                          <option key={d} value={d}>
                            {formatDurationLabel(d)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-1.5">
                    Heure de début
                    {isMulti && confirmedSlots.length < targetSlotCount && (
                      <span className="normal-case font-medium tracking-normal ml-1 text-primary-600">
                        — cliquez pour ajouter
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] font-medium text-soft-charcoal">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full bg-amber-400"
                        aria-hidden
                      />
                      Heures pleines ·{" "}
                      {effectiveStudio?.price_peak_mad ?? studio.price_peak_mad}{" "}
                      MAD/h
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full bg-secondary-500"
                        aria-hidden
                      />
                      Heures creuses ·{" "}
                      {effectiveStudio?.price_offpeak_mad ??
                        studio.price_offpeak_mad}{" "}
                      MAD/h
                    </span>
                    {courseType === "private" && (
                      <span className="text-secondary-600 font-semibold">
                        −{PRIVATE_COURSE_DISCOUNT_PERCENT}% cours privé
                      </span>
                    )}
                  </div>
                  {isMulti && confirmedSlots.length >= targetSlotCount ? (
                    <p className="text-sm text-secondary-700 bg-secondary-50 border border-secondary-100 rounded-2xl px-4 py-4">
                      Les {targetSlotCount} créneaux sont sélectionnés. Vous
                      pouvez en retirer un ci-dessus pour le remplacer.
                    </p>
                  ) : !selectedDate ? (
                    <p className="text-sm text-soft-charcoal py-6 text-center rounded-2xl bg-charcoal/[0.02] border border-dashed border-charcoal/10">
                      Sélectionnez d&apos;abord une date.
                    </p>
                  ) : loadingSlots ? (
                    <div className="flex items-center justify-center gap-2 text-soft-charcoal py-10">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Chargement des créneaux…</span>
                    </div>
                  ) : availableStarts.length === 0 ? (
                    <p className="text-sm text-accent-700 bg-accent-50 border border-accent-200/80 rounded-2xl px-4 py-4">
                      Aucun créneau disponible pour cette date et cette durée.
                      Essayez une autre date ou une durée plus courte.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto max-h-60 pr-1">
                      {availableStarts.map((m) => {
                        const info = slotInfo.get(m);
                        const kindLabel =
                          info?.kind === "peak"
                            ? "heures pleines"
                            : info?.kind === "off"
                              ? "heures creuses"
                              : "tarif mixte";
                        const active =
                          !isMulti && startMinutes === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => selectStartTime(m)}
                            className={`${
                              active ? "book-chip-active" : "book-chip-idle"
                            } gap-1.5`}
                            title={
                              info
                                ? `${formatMad(info.total)} · ${kindLabel}`
                                : undefined
                            }
                          >
                            <span
                              className="inline-flex items-center gap-0.5 shrink-0"
                              aria-hidden
                            >
                              {(info?.kind === "peak" ||
                                info?.kind === "mixed") && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              )}
                              {(info?.kind === "off" ||
                                info?.kind === "mixed") && (
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                              )}
                            </span>
                            {minutesToTimeString(m)}
                            <span className="sr-only">— {kindLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                </div>

                {isMulti && (
                  <aside className="book-card p-4 sm:p-5 border-secondary-100/80 lg:sticky lg:top-28 flex flex-col min-h-0 max-h-[22rem] lg:max-h-[min(36rem,calc(100vh-9rem))]">
                    <div className="shrink-0 mb-3">
                      <h3 className="font-display font-bold text-charcoal text-sm">
                        Séances sélectionnées
                      </h3>
                      <p className="text-xs text-soft-charcoal mt-0.5">
                        {confirmedSlots.length === 0
                          ? "Choisissez une date puis une heure."
                          : `${confirmedSlots.length} sur ${targetSlotCount}`}
                      </p>
                    </div>

                    {confirmedSlots.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-charcoal/10 bg-charcoal/[0.02] px-3 py-6">
                        <p className="text-xs text-soft-charcoal text-center leading-relaxed">
                          Aucun créneau pour l&apos;instant.
                        </p>
                      </div>
                    ) : (
                      <ul className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1.5 pr-1 -mr-0.5">
                        {confirmedSlots.map((slot, index) => {
                          const quote = multiPriceBreakdown?.slots[index];
                          const showFree =
                            confirmedSlots.length === targetSlotCount &&
                            quote?.isFree;
                          return (
                            <li
                              key={`${slot.date}-${slot.startMinutes}`}
                              className="flex items-center justify-between gap-2 rounded-lg bg-charcoal/[0.02] border border-charcoal/5 px-2.5 py-1.5 text-xs"
                            >
                              <span className="text-charcoal capitalize min-w-0 leading-snug">
                                <span className="font-semibold text-soft-charcoal mr-1.5">
                                  {index + 1}.
                                </span>
                                {format(parseDateString(slot.date), "EEE d MMM", {
                                  locale: fr,
                                })}{" "}
                                · {minutesToTimeString(slot.startMinutes)}
                                {showFree && (
                                  <span className="ml-1.5 text-[10px] font-bold text-secondary-600">
                                    Offerte
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                {quote && (
                                  <span className="font-semibold tabular-nums text-charcoal">
                                    {showFree
                                      ? formatMad(0)
                                      : formatMad(quote.sessionPriceMad)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeConfirmedSlot(index)}
                                  className="min-w-8 min-h-8 inline-flex items-center justify-center rounded-lg text-soft-charcoal hover:text-accent-600 hover:bg-accent-50 transition-colors cursor-pointer"
                                  aria-label={`Retirer la séance ${index + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {multiPriceBreakdown &&
                      confirmedSlots.length === targetSlotCount && (
                        <div className="shrink-0 mt-3 pt-3 border-t border-charcoal/5">
                          <MultiPackageBreakdown
                            breakdown={multiPriceBreakdown}
                          />
                        </div>
                      )}
                  </aside>
                )}
              </div>

              {!isMulti &&
                singlePriceBreakdown &&
                selectedDate &&
                startMinutes !== null &&
                effectiveStudio && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="book-card p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-charcoal capitalize">
                        {format(parseDateString(selectedDate), "EEEE d MMMM", {
                          locale: fr,
                        })}{" "}
                        · {minutesToTimeString(startMinutes)} –{" "}
                        {minutesToTimeString(startMinutes + duration)}
                      </p>
                      <p className="text-xs text-soft-charcoal mt-1">
                        {singlePriceBreakdown.basePrice.peakMinutes > 0 &&
                          `${formatDurationLabel(singlePriceBreakdown.basePrice.peakMinutes)} heures pleines (${formatMad(
                            (singlePriceBreakdown.basePrice.peakMinutes / 60) *
                              effectiveStudio.price_peak_mad
                          )})`}
                        {singlePriceBreakdown.basePrice.peakMinutes > 0 &&
                          singlePriceBreakdown.basePrice.offPeakMinutes > 0 &&
                          " · "}
                        {singlePriceBreakdown.basePrice.offPeakMinutes > 0 &&
                          `${formatDurationLabel(singlePriceBreakdown.basePrice.offPeakMinutes)} heures creuses (${formatMad(
                            (singlePriceBreakdown.basePrice.offPeakMinutes /
                              60) *
                              effectiveStudio.price_offpeak_mad
                          )})`}
                      </p>
                    </div>
                    <div className="text-3xl font-display font-bold text-charcoal tracking-tight">
                      {formatMad(singlePriceBreakdown.totalBeforePromoMad)}
                    </div>
                  </motion.div>
                )}

              <WizardNav
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                nextDisabled={!scheduleComplete}
              />
            </div>
          )}

          {step === 4 &&
            studio &&
            courseType &&
            sessionMode &&
            scheduleComplete && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 book-card p-5 sm:p-7 space-y-5">
                  <div>
                    <h3 className="font-display font-bold text-xl text-charcoal tracking-tight">
                      Vos coordonnées
                    </h3>
                    <p className="text-sm text-soft-charcoal mt-1">
                      Nous vous enverrons la confirmation et les instructions
                      de paiement.
                    </p>
                  </div>

                  <Field label="Nom complet *">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="book-input min-h-12"
                      placeholder="Votre nom"
                      autoComplete="name"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email *">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={254}
                        className="book-input min-h-12"
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Téléphone *">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={30}
                        className="book-input min-h-12"
                        placeholder="+212 6 00 00 00 00"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                  <Field label="Note (optionnel)">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className="book-input resize-none"
                      placeholder="Type d'activité, besoins particuliers…"
                    />
                  </Field>

                  <div className="border-t border-charcoal/5 pt-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-500" aria-hidden />
                      <h3 className="font-display font-bold text-charcoal tracking-tight">
                        Code promo
                      </h3>
                      <span className="text-xs text-soft-charcoal">(optionnel)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (appliedPromo) setAppliedPromo(null);
                          setPromoError(null);
                        }}
                        maxLength={32}
                        className="book-input min-h-12 flex-1 uppercase"
                        placeholder="ETE2026"
                        disabled={Boolean(appliedPromo)}
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={clearPromo}
                          className="book-btn-ghost min-h-12 shrink-0"
                        >
                          Retirer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={applyPromoCode}
                          disabled={
                            !promoInput.trim() ||
                            validatingPromo ||
                            totalBeforePromoMad == null
                          }
                          className="book-btn-ghost min-h-12 shrink-0"
                        >
                          {validatingPromo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Appliquer"
                          )}
                        </button>
                      )}
                    </div>
                    {appliedPromo && (
                      <p className="text-sm font-medium text-secondary-700 bg-secondary-50 border border-secondary-100 rounded-xl px-3 py-2">
                        Code <strong>{appliedPromo.code}</strong> appliqué
                        {appliedPromo.label ? ` — ${appliedPromo.label}` : ""}.
                        Réduction : {formatMad(appliedPromo.discountMad)}.
                      </p>
                    )}
                    {promoError && (
                      <p className="text-sm text-accent-700">{promoError}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <h3 className="font-display font-bold text-charcoal tracking-tight mb-1">
                      Mode de paiement
                    </h3>
                    <p className="text-sm text-soft-charcoal mb-4">
                      À régler sous {settings.confirmation_deadline_hours}h pour
                      confirmer le créneau.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <PaymentOption
                        icon={<CreditCard className="w-5 h-5" />}
                        label="PayPal"
                        description="En ligne"
                        selected={paymentMethod === "paypal"}
                        onClick={() => setPaymentMethod("paypal")}
                      />
                      <PaymentOption
                        icon={<Building2 className="w-5 h-5" />}
                        label="Virement"
                        description="Bancaire"
                        selected={paymentMethod === "virement"}
                        onClick={() => setPaymentMethod("virement")}
                      />
                      <PaymentOption
                        icon={<Banknote className="w-5 h-5" />}
                        label="Espèces"
                        description="Au studio"
                        selected={paymentMethod === "cash"}
                        onClick={() => setPaymentMethod("cash")}
                      />
                    </div>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-accent-700 bg-accent-50 border border-accent-200/80 rounded-2xl px-4 py-3"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="book-btn-ghost min-h-12"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden />
                      Retour
                    </button>
                    <button
                      type="button"
                      disabled={!detailsValid || submitting}
                      onClick={submitBooking}
                      className="book-btn-primary min-h-12"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                          Envoi…
                        </>
                      ) : (
                        <>
                          Confirmer la réservation
                          <ArrowRight className="w-4 h-4" aria-hidden />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <aside className="lg:col-span-2">
                  <div className="book-card p-5 sm:p-6 lg:sticky lg:top-28 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-soft-charcoal">
                      Récapitulatif
                    </p>
                    <SummaryRow
                      label="Type"
                      value={
                        courseType === "private"
                          ? "Cours privé"
                          : "Cours en groupe"
                      }
                    />
                    <SummaryRow label="Studio" value={studio.name} />
                    <SummaryRow
                      label="Séances"
                      value={
                        isMulti
                          ? `${confirmedSlots.length} créneaux`
                          : "1 séance"
                      }
                    />
                    {!isMulti && selectedDate && startMinutes !== null && (
                      <>
                        <SummaryRow
                          label="Date"
                          value={format(
                            parseDateString(selectedDate),
                            "EEE d MMM yyyy",
                            { locale: fr }
                          )}
                        />
                        <SummaryRow
                          label="Horaire"
                          value={`${minutesToTimeString(startMinutes)} – ${minutesToTimeString(startMinutes + duration)}`}
                        />
                      </>
                    )}
                    {isMulti &&
                      confirmedSlots.map((slot, i) => (
                        <SummaryRow
                          key={`${slot.date}-${slot.startMinutes}`}
                          label={`Séance ${i + 1}`}
                          value={`${format(parseDateString(slot.date), "EEE d MMM", { locale: fr })} · ${minutesToTimeString(slot.startMinutes)}`}
                        />
                      ))}
                    <SummaryRow
                      label="Durée"
                      value={formatDurationLabel(duration)}
                    />
                    <SummaryRow
                      label="Paiement"
                      value={PAYMENT_METHOD_LABELS[paymentMethod]}
                    />
                    {multiPriceBreakdown &&
                      multiPriceBreakdown.freeCoursesIncluded > 0 && (
                        <SummaryRow
                          label={`Cours offert${multiPriceBreakdown.freeCoursesIncluded > 1 ? "s" : ""}`}
                          value={`−${formatMad(multiPriceBreakdown.regularCourseDiscountMad)}`}
                        />
                      )}
                    {appliedPromo && totalBeforePromoMad != null && (
                      <>
                        <SummaryRow
                          label="Avant promo"
                          value={formatMad(totalBeforePromoMad)}
                        />
                        <SummaryRow
                          label={`Promo ${appliedPromo.code}`}
                          value={`-${formatMad(appliedPromo.discountMad)}`}
                        />
                      </>
                    )}
                    <div className="border-t border-charcoal/5 pt-4 flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-soft-charcoal">
                        Total
                      </span>
                      <span className="text-2xl font-display font-bold text-charcoal tracking-tight">
                        {displayTotalMad != null
                          ? formatMad(displayTotalMad)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            )}

          {step === 5 && result && studio && courseType && (
              <ConfirmationStep
                result={result}
                studio={studio}
                courseType={courseType}
                settings={settings}
                slots={
                  result.slots?.map((s) => ({
                    date: s.date,
                    startMinutes: s.startMinutes,
                  })) ??
                  (selectedDate && startMinutes !== null
                    ? [{ date: selectedDate, startMinutes }]
                    : confirmedSlots)
                }
                duration={duration}
                paymentMethod={paymentMethod}
              />
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function parseDateString(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function StepIndicator({ current }: { current: number }) {
  const progress = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-10 md:mb-12">
      <div className="flex items-center justify-between gap-2 mb-3">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-2 min-w-0"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-secondary-500 text-white shadow-md shadow-secondary-500/25"
                    : active
                      ? "bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-105"
                      : "bg-white text-soft-charcoal border border-charcoal/10"
                }`}
              >
                {done ? <Check className="w-4 h-4" aria-hidden /> : i + 1}
              </div>
              <span
                className={`hidden sm:block text-[11px] font-semibold font-nav truncate max-w-full ${
                  active || done ? "text-charcoal" : "text-soft-charcoal"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 rounded-full bg-charcoal/5 overflow-hidden mx-4 sm:mx-8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function SessionCountStep({
  mode,
  multiCount,
  onMultiCountChange,
  onSelect,
  onBack,
}: {
  mode: SessionMode | null;
  multiCount: number;
  onMultiCountChange: (n: number) => void;
  onSelect: (mode: SessionMode) => void;
  onBack: () => void;
}) {
  const [localMode, setLocalMode] = useState<SessionMode | null>(mode);
  // Draft string so mobile users can type "10" without being clamped to 2 on the first digit.
  const [countDraft, setCountDraft] = useState(String(multiCount));
  const [countError, setCountError] = useState<string | null>(null);

  function clampMultiCount(n: number) {
    return Math.min(
      MAX_MULTI_SESSIONS,
      Math.max(MIN_MULTI_SESSIONS, Math.round(n))
    );
  }

  function commitCountDraft(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setCountError(
        `Indiquez un nombre entre ${MIN_MULTI_SESSIONS} et ${MAX_MULTI_SESSIONS}.`
      );
      return null;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      setCountError("Nombre invalide.");
      return null;
    }
    const clamped = clampMultiCount(n);
    setCountDraft(String(clamped));
    setCountError(null);
    onMultiCountChange(clamped);
    return clamped;
  }

  const previewCount = (() => {
    const n = Number(countDraft);
    return Number.isFinite(n) && n >= MIN_MULTI_SESSIONS
      ? clampMultiCount(n)
      : multiCount;
  })();

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-charcoal tracking-tight">
            Combien de séances ?
          </h2>
          <p className="text-sm text-soft-charcoal mt-1">
            Une séance unique, ou plusieurs créneaux à choisir un par un.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="book-btn-ghost min-h-10 text-xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Type de cours
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onClick={() => {
            setLocalMode("single");
            onSelect("single");
          }}
          className={`book-card text-left p-6 sm:p-8 group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            localMode === "single"
              ? "ring-2 ring-primary-500 ring-offset-2"
              : ""
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal mb-2">
            Une séance
          </h3>
          <p className="text-sm text-soft-charcoal leading-relaxed">
            Réservez une date et une heure — le parcours classique.
          </p>
        </motion.button>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          onClick={() => setLocalMode("multi")}
          className={`book-card text-left p-6 sm:p-8 group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            localMode === "multi"
              ? "ring-2 ring-primary-500 ring-offset-2"
              : ""
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal mb-2">
            Plusieurs séances
          </h3>
          <p className="text-sm text-soft-charcoal leading-relaxed">
            Choisissez plusieurs dates et horaires.{" "}
            {regularCourseOfferLabel()}
          </p>
        </motion.button>
      </div>

      {localMode === "multi" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="book-card p-5 sm:p-6 space-y-4 border-secondary-100/80"
        >
          <Field label="Nombre de séances à réserver">
            <div className="flex items-center gap-2 max-w-xs">
              <button
                type="button"
                aria-label="Diminuer"
                disabled={previewCount <= MIN_MULTI_SESSIONS}
                onClick={() => {
                  const next = clampMultiCount(previewCount - 1);
                  setCountDraft(String(next));
                  setCountError(null);
                  onMultiCountChange(next);
                }}
                className="book-btn-ghost min-h-12 min-w-12 px-0 justify-center disabled:opacity-40"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={countDraft}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setCountDraft(raw);
                  setCountError(null);
                  const n = Number(raw);
                  if (
                    Number.isFinite(n) &&
                    n >= MIN_MULTI_SESSIONS &&
                    n <= MAX_MULTI_SESSIONS
                  ) {
                    onMultiCountChange(n);
                  }
                }}
                onBlur={() => {
                  commitCountDraft(countDraft);
                }}
                className="book-input min-h-12 text-center text-lg font-semibold tabular-nums"
              />
              <button
                type="button"
                aria-label="Augmenter"
                disabled={previewCount >= MAX_MULTI_SESSIONS}
                onClick={() => {
                  const next = clampMultiCount(previewCount + 1);
                  setCountDraft(String(next));
                  setCountError(null);
                  onMultiCountChange(next);
                }}
                className="book-btn-ghost min-h-12 min-w-12 px-0 justify-center disabled:opacity-40"
              >
                +
              </button>
            </div>
          </Field>
          {countError && (
            <p className="text-xs font-medium text-rose-600">{countError}</p>
          )}
          <p className="text-xs text-soft-charcoal">
            Entre {MIN_MULTI_SESSIONS} et {MAX_MULTI_SESSIONS} séances. Exemple :{" "}
            {REGULAR_COURSE_MIN_COUNT} cours → vous payez{" "}
            {REGULAR_COURSE_MIN_COUNT - 1}, le {REGULAR_COURSE_MIN_COUNT}
            <sup>e</sup> est offert (les séances les moins chères).
          </p>
          {previewCount >= REGULAR_COURSE_MIN_COUNT && (
            <p className="text-sm font-medium text-secondary-700 bg-secondary-50 border border-secondary-100 rounded-xl px-3 py-2">
              Forfait {previewCount} séances ·{" "}
              {Math.floor(previewCount / REGULAR_COURSE_MIN_COUNT)} offerte
              {Math.floor(previewCount / REGULAR_COURSE_MIN_COUNT) > 1
                ? "s"
                : ""}{" "}
              · vous payez {getPaidCoursesForPackage(previewCount)}
            </p>
          )}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                const committed = commitCountDraft(countDraft);
                if (committed == null) return;
                onSelect("multi");
              }}
              className="book-btn-primary min-h-12"
            >
              Continuer
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CourseTypeStep({
  selected,
  onSelect,
}: {
  selected: CourseType | null;
  onSelect: (type: CourseType) => void;
}) {
  const options: {
    type: CourseType;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      type: "group",
      title: "Cours en groupe",
      description: "3 personnes et plus. Accès à tous les studios.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      type: "private",
      title: "Cours privé",
      description: "Maximum 3 personnes. Studio 3 uniquement, −50% sur tous les tarifs.",
      icon: <Sparkles className="w-6 h-6" />,
      badge: "−50%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
      {options.map((opt, index) => (
        <motion.button
          key={opt.type}
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.08 }}
          onClick={() => onSelect(opt.type)}
          className={`book-card text-left p-6 sm:p-8 group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            selected === opt.type
              ? "ring-2 ring-primary-500 ring-offset-2"
              : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              {opt.icon}
            </div>
            {opt.badge && (
              <span className="px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-bold">
                {opt.badge}
              </span>
            )}
          </div>
          <h3 className="text-xl font-display font-bold text-charcoal mb-2">
            {opt.title}
          </h3>
          <p className="text-sm text-soft-charcoal leading-relaxed mb-4">
            {opt.description}
          </p>
          <span className="inline-flex items-center gap-2 text-primary-600 font-semibold font-nav text-sm group-hover:gap-3 transition-all duration-200">
            Choisir
            <ArrowRight className="w-4 h-4" aria-hidden />
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function StudioStep({
  studios,
  courseType,
  selected,
  onSelect,
  onBack,
  backLabel = "Retour",
}: {
  studios: Studio[];
  courseType: CourseType;
  selected: Studio | null;
  onSelect: (s: Studio) => void;
  onBack: () => void;
  backLabel?: string;
}) {
  const effectivePrices = (studio: Studio) =>
    getEffectiveStudioPrices(studio, courseType);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        {courseType === "group" ? (
          <p className="text-sm text-soft-charcoal">
            Cours en groupe — choisissez votre studio.
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onBack}
          className="book-btn-ghost min-h-10 text-xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          {backLabel}
        </button>
      </div>
      <div
        className={`grid gap-5 ${
          studios.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 md:grid-cols-3"
        }`}
      >
      {studios.map((studio, index) => {
        const prices = effectivePrices(studio);
        return (
        <motion.div
          key={studio.id}
          role="button"
          tabIndex={0}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          onClick={() => onSelect(studio)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(studio);
            }
          }}
          className={`book-card text-left overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            selected?.id === studio.id
              ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent"
              : ""
          }`}
        >
          <div
            className="relative h-40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <StudioImageCarousel
              images={getStudioImages(studio)}
              alt={studio.name}
              className="h-full"
              aspectClassName="h-40"
              rounded={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
            {courseType === "private" && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md">
                −{PRIVATE_COURSE_DISCOUNT_PERCENT}%
              </span>
            )}
            {studio.popular && courseType !== "private" && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md">
                <Sparkles className="w-3 h-3" aria-hidden />
                Populaire
              </span>
            )}
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-display font-bold text-white">
                {studio.name}
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-soft-charcoal leading-relaxed line-clamp-2">
              {studio.subtitle}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-soft-charcoal">
              {studio.size_label && (
                <span className="inline-flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                  {studio.size_label}
                </span>
              )}
              {studio.capacity_label && (
                <span className="inline-flex items-center gap-1.5">
                  <Users
                    className="w-3.5 h-3.5 text-secondary-500"
                    aria-hidden
                  />
                  {courseType === "private" ? "Max 3 personnes" : studio.capacity_label}
                </span>
              )}
            </div>
            <div className="border-t border-charcoal/5 pt-3 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-wider text-soft-charcoal font-bold">
                  Heures pleines
                </span>
                <span className="font-display font-bold text-charcoal">
                  {formatMad(prices.price_peak_mad)}
                  <span className="text-xs font-semibold text-soft-charcoal">
                    /h
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-wider text-soft-charcoal font-bold">
                  Heures creuses
                </span>
                <span className="font-display font-bold text-secondary-600">
                  {formatMad(prices.price_offpeak_mad)}
                  <span className="text-xs font-semibold text-soft-charcoal">
                    /h
                  </span>
                </span>
              </div>
              {courseType === "private" && (
                <p className="text-[10px] text-secondary-600 font-semibold pt-1">
                  Tarif standard barré : {formatMad(studio.price_peak_mad)}/h plein · {formatMad(studio.price_offpeak_mad)}/h creux
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold font-nav text-sm group-hover:gap-3 transition-all duration-200">
              Choisir ce studio
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </div>
        </motion.div>
      );
      })}
      </div>
    </div>
  );
}

function MonthCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelect,
  settings,
  markedDates = [],
}: {
  month: Date;
  onMonthChange: (m: Date) => void;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  settings: Settings;
  markedDates?: string[];
}) {
  const marked = new Set(markedDates);
  const today = startOfToday();
  const maxMonth = startOfMonth(addMonths(today, 6));
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  const firstDayOffset = (getDay(startOfMonth(month)) + 6) % 7;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={isSameMonth(month, today)}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl border border-charcoal/10 bg-white disabled:opacity-30 hover:bg-charcoal/[0.02] transition-colors duration-200 cursor-pointer"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold font-nav text-charcoal capitalize text-sm">
          {format(month, "MMMM yyyy", { locale: fr })}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={!isBefore(startOfMonth(month), maxMonth)}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl border border-charcoal/10 bg-white disabled:opacity-30 hover:bg-charcoal/[0.02] transition-colors duration-200 cursor-pointer"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-soft-charcoal mb-2">
        {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const closed = !settings.opening_hours[String(getDay(day))];
          const disabled = isBefore(day, today) || closed;
          const isSelected =
            selectedDate !== null &&
            isSameDay(day, parseDateString(selectedDate));
          const isMarked = marked.has(dateStr);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`relative aspect-square min-h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                  : disabled
                    ? "text-charcoal/20 cursor-not-allowed"
                    : isMarked
                      ? "text-secondary-700 bg-secondary-50 hover:bg-secondary-100 cursor-pointer ring-1 ring-secondary-200"
                      : isToday
                        ? "text-primary-600 bg-primary-50 hover:bg-primary-100 cursor-pointer"
                        : "text-charcoal hover:bg-primary-50 cursor-pointer"
              }`}
            >
              {format(day, "d")}
              {isMarked && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary-500"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <button type="button" onClick={onBack} className="book-btn-ghost min-h-12">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Retour
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className="book-btn-primary min-h-12"
      >
        Continuer
        <ArrowRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function PaymentOption({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-h-[5.5rem] ${
        selected
          ? "border-primary-500 bg-primary-50/60 shadow-sm ring-1 ring-primary-500/30"
          : "border-charcoal/8 bg-charcoal/[0.02] hover:border-primary-300 hover:bg-white"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
          selected
            ? "bg-primary-500 text-white"
            : "bg-white text-soft-charcoal border border-charcoal/8"
        }`}
      >
        {icon}
      </div>
      <p className="font-semibold text-charcoal text-sm">{label}</p>
      <p className="text-xs text-soft-charcoal mt-0.5">{description}</p>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-soft-charcoal">{label}</span>
      <span className="font-semibold text-charcoal text-right capitalize">
        {value}
      </span>
    </div>
  );
}

function MultiPackageBreakdown({
  breakdown: b,
}: {
  breakdown: MultiSlotPackageBreakdown;
}) {
  const paid = getPaidCoursesForPackage(b.packageCourseCount);
  return (
    <div className="rounded-2xl bg-secondary-50/80 border border-secondary-100 px-4 py-3 space-y-1.5 text-sm">
      <div className="flex justify-between gap-3 text-charcoal">
        <span>Sous-total {b.packageCourseCount} séances</span>
        <span className="font-semibold tabular-nums">
          {formatMad(b.packageSubtotalMad)}
        </span>
      </div>
      {b.freeCoursesIncluded > 0 && (
        <div className="flex justify-between gap-3 text-secondary-700">
          <span>
            {b.freeCoursesIncluded} séance{b.freeCoursesIncluded > 1 ? "s" : ""}{" "}
            offerte{b.freeCoursesIncluded > 1 ? "s" : ""} (les moins chères)
          </span>
          <span className="font-semibold tabular-nums">
            −{formatMad(b.regularCourseDiscountMad)}
          </span>
        </div>
      )}
      <div className="flex justify-between gap-3 pt-1.5 border-t border-secondary-200/80 font-display font-bold text-charcoal">
        <span>
          Vous payez {paid} séance{paid > 1 ? "s" : ""}
        </span>
        <span className="tabular-nums">{formatMad(b.totalBeforePromoMad)}</span>
      </div>
    </div>
  );
}

function ConfirmationStep({
  result,
  studio,
  courseType,
  settings,
  slots,
  duration,
  paymentMethod,
}: {
  result: BookingResult;
  studio: Studio;
  courseType: CourseType;
  settings: Settings;
  slots: BookingSlotInput[];
  duration: number;
  paymentMethod: PaymentMethod;
}) {
  const deadline = new Date(result.paymentDeadline).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
  const isPackage = slots.length > 1;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="book-card p-8 sm:p-10 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center border border-secondary-100">
          <PartyPopper className="w-7 h-7" aria-hidden />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-charcoal tracking-tight mb-2">
          Réservation reçue !
        </h2>
        <p className="text-soft-charcoal mb-6 leading-relaxed">
          {result.emailSent === false ? (
            <>
              Votre réservation est enregistrée, mais l&apos;email n&apos;a pas
              pu être envoyé automatiquement. Conservez votre référence ci-dessous
              et suivez les instructions de paiement sur cette page.
            </>
          ) : (
            <>
              Un email vient de vous être envoyé. Votre référence
              {isPackage ? " principale" : ""} :
            </>
          )}
        </p>
        <div className="inline-block px-6 py-3 rounded-2xl bg-primary-50 text-primary-600 font-display font-bold text-2xl tracking-[0.12em] mb-7 border border-primary-100">
          {result.reference}
        </div>
        <div className="text-left space-y-3 border-t border-charcoal/5 pt-6">
          <SummaryRow
            label="Type"
            value={courseType === "private" ? "Cours privé" : "Cours en groupe"}
          />
          <SummaryRow label="Studio" value={studio.name} />
          {slots.map((slot, i) => (
            <SummaryRow
              key={`${slot.date}-${slot.startMinutes}`}
              label={isPackage ? `Séance ${i + 1}` : "Date & horaire"}
              value={`${format(parseDateString(slot.date), "EEEE d MMMM yyyy", {
                locale: fr,
              })} · ${minutesToTimeString(slot.startMinutes)} – ${minutesToTimeString(slot.startMinutes + duration)}`}
            />
          ))}
          {result.references && result.references.length > 1 && (
            <SummaryRow
              label="Références"
              value={result.references.join(" · ")}
            />
          )}
          {result.subtotalPriceMad != null && (
            <SummaryRow
              label="Sous-total"
              value={formatMad(Number(result.subtotalPriceMad))}
            />
          )}
          {result.discountAmountMad != null && Number(result.discountAmountMad) > 0 && (
            <SummaryRow
              label={result.promoCode ? `Réductions (${result.promoCode})` : "Réductions"}
              value={`-${formatMad(Number(result.discountAmountMad))}`}
            />
          )}
          <SummaryRow
            label="Total"
            value={formatMad(Number(result.totalPriceMad))}
          />
          <SummaryRow
            label="Paiement"
            value={PAYMENT_METHOD_LABELS[paymentMethod]}
          />
        </div>
      </motion.div>

      <div className="book-card p-6 border-l-4 border-accent-500">
        <h3 className="font-display font-bold text-charcoal mb-2 tracking-tight">
          Comment confirmer
        </h3>
        <div className="text-sm text-soft-charcoal leading-relaxed space-y-3">
          {paymentMethod === "paypal" && (
            <p>
              Envoyez le montant via PayPal à{" "}
              <strong className="text-charcoal">
                {settings.paypal_link ?? settings.paypal_email}
              </strong>{" "}
              avec la référence{" "}
              <strong className="text-charcoal">{result.reference}</strong>.
            </p>
          )}
          {paymentMethod === "virement" && (
            <>
              <p>
                Effectuez un virement avec la référence{" "}
                <strong className="text-charcoal">{result.reference}</strong>{" "}
                en motif :
              </p>
              <pre className="whitespace-pre-wrap bg-charcoal/[0.03] rounded-2xl p-4 text-charcoal text-sm border border-charcoal/5">
                {settings.bank_details}
              </pre>
            </>
          )}
          {paymentMethod === "cash" && (
            <p>
              Passez régler en espèces au studio (Rue Biranzarane, Casablanca)
              avant la date limite.
            </p>
          )}
          <p className="font-semibold text-accent-600">
            Date limite : {deadline}. Passé ce délai, le créneau est libéré.
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href={`/reservation/${result.reference}`}
          className="book-btn-primary inline-flex min-h-12"
        >
          Suivre ma réservation
          <ArrowRight className="w-4 h-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
