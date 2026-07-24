"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  Users,
} from "lucide-react";
import type { PaymentMethod, Settings, Studio } from "@/lib/booking/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/booking/types";
import type { BusyInterval } from "@/lib/booking/pricing";
import {
  computeAvailableStartTimes,
  computeBookingPrice,
  durationOptions,
  formatDurationLabel,
  formatMad,
  minutesToTimeString,
} from "@/lib/booking/pricing";

interface Props {
  studios: Studio[];
  settings: Settings;
}

interface BookingResult {
  reference: string;
  totalPriceMad: number;
  paymentDeadline: string;
}

const STEPS = ["Studio", "Date & heure", "Coordonnées", "Confirmé"];

const stepMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export default function BookingWizard({ studios, settings }: Props) {
  const [step, setStep] = useState(0);
  const [studio, setStudio] = useState<Studio | null>(null);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [startMinutes, setStartMinutes] = useState<number | null>(null);
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

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

  const availableStarts = useMemo(() => {
    if (!selectedDate) return [];
    return computeAvailableStartTimes({
      settings,
      date: selectedDate,
      durationMinutes: duration,
      busy,
    });
  }, [settings, selectedDate, duration, busy]);

  useEffect(() => {
    if (startMinutes !== null && !availableStarts.includes(startMinutes)) {
      setStartMinutes(null);
    }
  }, [availableStarts, startMinutes]);

  // Peak / off-peak / mixed classification + price for every selectable slot
  const slotInfo = useMemo(() => {
    const map = new Map<
      number,
      { total: number; kind: "peak" | "off" | "mixed" }
    >();
    if (!studio || !selectedDate) return map;
    for (const m of availableStarts) {
      const p = computeBookingPrice(
        studio,
        selectedDate,
        m,
        duration,
        settings.peak_windows
      );
      map.set(m, {
        total: p.totalMad,
        kind:
          p.peakMinutes > 0 && p.offPeakMinutes > 0
            ? "mixed"
            : p.peakMinutes > 0
              ? "peak"
              : "off",
      });
    }
    return map;
  }, [studio, selectedDate, duration, availableStarts, settings.peak_windows]);

  const price = useMemo(() => {
    if (!studio || !selectedDate || startMinutes === null) return null;
    return computeBookingPrice(
      studio,
      selectedDate,
      startMinutes,
      duration,
      settings.peak_windows
    );
  }, [studio, selectedDate, startMinutes, duration, settings.peak_windows]);

  async function submitBooking() {
    if (!studio || !selectedDate || startMinutes === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId: studio.id,
          date: selectedDate,
          startMinutes,
          durationMinutes: duration,
          name,
          email,
          phone,
          note: note || undefined,
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur s'est produite.");
        if (res.status === 409 && selectedDate) {
          loadAvailability(studio.id, selectedDate);
          setStep(1);
        }
        return;
      }
      setResult(json as BookingResult);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(
        "Impossible d'envoyer la réservation. Vérifiez votre connexion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const detailsValid =
    name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length >= 8;

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div key={step} {...stepMotion}>
          {step === 0 && (
            <StudioStep
              studios={studios}
              selected={studio}
              onSelect={(s) => {
                setStudio(s);
                setStep(1);
              }}
            />
          )}

          {step === 1 && studio && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-charcoal/5 text-xs font-semibold text-charcoal shadow-sm">
                  <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                  {studio.name}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-500 cursor-pointer transition-colors duration-200"
                >
                  Changer de studio
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="book-card p-5 sm:p-6">
                  <h3 className="flex items-center gap-2.5 font-display font-bold text-charcoal mb-5">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" aria-hidden />
                    </span>
                    Date
                  </h3>
                  <MonthCalendar
                    month={month}
                    onMonthChange={setMonth}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    settings={settings}
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
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[60, 90, 120, 150, 180, 240].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={
                          duration === d ? "book-chip-active" : "book-chip-idle"
                        }
                      >
                        {formatDurationLabel(d)}
                      </button>
                    ))}
                    <select
                      value={durationOptions().includes(duration) && duration > 240 ? duration : ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v) setDuration(v);
                      }}
                      className={`book-input w-auto min-h-11 ${
                        duration > 240 ? "ring-2 ring-primary-500/40 bg-white" : ""
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
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] font-medium text-soft-charcoal">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full bg-amber-400"
                        aria-hidden
                      />
                      Heures pleines · {studio.price_peak_mad} MAD/h
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full bg-secondary-500"
                        aria-hidden
                      />
                      Heures creuses · {studio.price_offpeak_mad} MAD/h
                    </span>
                  </div>
                  {!selectedDate ? (
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
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setStartMinutes(m)}
                            className={`${
                              startMinutes === m
                                ? "book-chip-active"
                                : "book-chip-idle"
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

              {price && selectedDate && startMinutes !== null && (
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
                      {price.peakMinutes > 0 &&
                        `${formatDurationLabel(price.peakMinutes)} heures pleines (${formatMad(
                          (price.peakMinutes / 60) * studio.price_peak_mad
                        )})`}
                      {price.peakMinutes > 0 &&
                        price.offPeakMinutes > 0 &&
                        " · "}
                      {price.offPeakMinutes > 0 &&
                        `${formatDurationLabel(price.offPeakMinutes)} heures creuses (${formatMad(
                          (price.offPeakMinutes / 60) * studio.price_offpeak_mad
                        )})`}
                    </p>
                  </div>
                  <div className="text-3xl font-display font-bold text-charcoal tracking-tight">
                    {formatMad(price.totalMad)}
                  </div>
                </motion.div>
              )}

              <WizardNav
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
                nextDisabled={startMinutes === null}
              />
            </div>
          )}

          {step === 2 &&
            studio &&
            selectedDate &&
            startMinutes !== null && (
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
                      onClick={() => setStep(1)}
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
                    <SummaryRow label="Studio" value={studio.name} />
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
                    <SummaryRow
                      label="Durée"
                      value={formatDurationLabel(duration)}
                    />
                    <SummaryRow
                      label="Paiement"
                      value={PAYMENT_METHOD_LABELS[paymentMethod]}
                    />
                    <div className="border-t border-charcoal/5 pt-4 flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-soft-charcoal">
                        Total
                      </span>
                      <span className="text-2xl font-display font-bold text-charcoal tracking-tight">
                        {price ? formatMad(price.totalMad) : "—"}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            )}

          {step === 3 &&
            result &&
            studio &&
            selectedDate &&
            startMinutes !== null && (
              <ConfirmationStep
                result={result}
                studio={studio}
                settings={settings}
                date={selectedDate}
                startMinutes={startMinutes}
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

function StudioStep({
  studios,
  selected,
  onSelect,
}: {
  studios: Studio[];
  selected: Studio | null;
  onSelect: (s: Studio) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {studios.map((studio, index) => (
        <motion.button
          key={studio.id}
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          onClick={() => onSelect(studio)}
          className={`book-card text-left overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            selected?.id === studio.id
              ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent"
              : ""
          }`}
        >
          <div className="relative h-40 overflow-hidden">
            {studio.image_url ? (
              <Image
                src={studio.image_url}
                alt={studio.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
            {studio.popular && (
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
                  {studio.capacity_label}
                </span>
              )}
            </div>
            <div className="border-t border-charcoal/5 pt-3 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-wider text-soft-charcoal font-bold">
                  Heures pleines
                </span>
                <span className="font-display font-bold text-charcoal">
                  {formatMad(studio.price_peak_mad)}
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
                  {formatMad(studio.price_offpeak_mad)}
                  <span className="text-xs font-semibold text-soft-charcoal">
                    /h
                  </span>
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold font-nav text-sm group-hover:gap-3 transition-all duration-200">
              Choisir ce studio
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function MonthCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelect,
  settings,
}: {
  month: Date;
  onMonthChange: (m: Date) => void;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  settings: Settings;
}) {
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
          const isToday = isSameDay(day, today);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square min-h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                  : disabled
                    ? "text-charcoal/20 cursor-not-allowed"
                    : isToday
                      ? "text-primary-600 bg-primary-50 hover:bg-primary-100 cursor-pointer"
                      : "text-charcoal hover:bg-primary-50 cursor-pointer"
              }`}
            >
              {format(day, "d")}
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

function ConfirmationStep({
  result,
  studio,
  settings,
  date,
  startMinutes,
  duration,
  paymentMethod,
}: {
  result: BookingResult;
  studio: Studio;
  settings: Settings;
  date: string;
  startMinutes: number;
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
          Un email vient de vous être envoyé. Votre référence :
        </p>
        <div className="inline-block px-6 py-3 rounded-2xl bg-primary-50 text-primary-600 font-display font-bold text-2xl tracking-[0.12em] mb-7 border border-primary-100">
          {result.reference}
        </div>
        <div className="text-left space-y-3 border-t border-charcoal/5 pt-6">
          <SummaryRow label="Studio" value={studio.name} />
          <SummaryRow
            label="Date"
            value={format(parseDateString(date), "EEEE d MMMM yyyy", {
              locale: fr,
            })}
          />
          <SummaryRow
            label="Horaire"
            value={`${minutesToTimeString(startMinutes)} – ${minutesToTimeString(startMinutes + duration)}`}
          />
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
