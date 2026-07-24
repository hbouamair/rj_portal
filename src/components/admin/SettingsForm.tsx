"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { OpeningHours, PeakWindow, Settings } from "@/lib/booking/types";
import { updateSettings } from "@/app/admin/actions";

// Monday-first display order; values are JS weekday numbers (0 = Sunday)
const WEEKDAYS: Array<{ value: number; label: string; short: string }> = [
  { value: 1, label: "Lundi", short: "Lu" },
  { value: 2, label: "Mardi", short: "Ma" },
  { value: 3, label: "Mercredi", short: "Me" },
  { value: 4, label: "Jeudi", short: "Je" },
  { value: 5, label: "Vendredi", short: "Ve" },
  { value: 6, label: "Samedi", short: "Sa" },
  { value: 0, label: "Dimanche", short: "Di" },
];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    settings.opening_hours
  );
  const [peakWindows, setPeakWindows] = useState<PeakWindow[]>(
    settings.peak_windows
  );
  const [paypalEmail, setPaypalEmail] = useState(settings.paypal_email ?? "");
  const [paypalLink, setPaypalLink] = useState(settings.paypal_link ?? "");
  const [bankDetails, setBankDetails] = useState(settings.bank_details ?? "");
  const [deadlineHours, setDeadlineHours] = useState(
    String(settings.confirmation_deadline_hours)
  );
  const [reminderHours, setReminderHours] = useState(
    String(settings.reminder_hours_before ?? 24)
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSettings({
        opening_hours: openingHours,
        peak_windows: peakWindows,
        paypal_email: paypalEmail,
        paypal_link: paypalLink,
        bank_details: bankDetails,
        confirmation_deadline_hours: Number(deadlineHours),
        reminder_hours_before: Number(reminderHours),
      });
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function setDayOpen(day: number, open: boolean) {
    setOpeningHours((prev) => ({
      ...prev,
      [String(day)]: open ? { open: "08:00", close: "22:00" } : null,
    }));
  }

  function setDayTime(day: number, field: "open" | "close", value: string) {
    setOpeningHours((prev) => {
      const entry = prev[String(day)];
      if (!entry) return prev;
      return { ...prev, [String(day)]: { ...entry, [field]: value } };
    });
  }

  function updateWindow(index: number, patch: Partial<PeakWindow>) {
    setPeakWindows((prev) =>
      prev.map((w, i) => (i === index ? { ...w, ...patch } : w))
    );
  }

  function toggleWindowDay(index: number, day: number) {
    setPeakWindows((prev) =>
      prev.map((w, i) => {
        if (i !== index) return w;
        const days = w.days.includes(day)
          ? w.days.filter((d) => d !== day)
          : [...w.days, day];
        return { ...w, days };
      })
    );
  }

  const inputClass = "admin-input";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className="space-y-4">
      {/* Opening hours */}
      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-lg font-display font-bold text-white tracking-tight mb-4">
          Horaires d&apos;ouverture
        </h2>
        <div className="space-y-3">
          {WEEKDAYS.map(({ value, label }) => {
            const entry = openingHours[String(value)];
            return (
              <div key={value} className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 w-32">
                  <input
                    type="checkbox"
                    checked={entry !== null && entry !== undefined}
                    onChange={(e) => setDayOpen(value, e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-400"
                  />
                  <span className="text-sm font-semibold text-white/85">
                    {label}
                  </span>
                </label>
                {entry ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={entry.open}
                      onChange={(e) => setDayTime(value, "open", e.target.value)}
                      className={inputClass}
                    />
                    <span className="text-white/30">→</span>
                    <input
                      type="time"
                      value={entry.close}
                      onChange={(e) => setDayTime(value, "close", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-white/35">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Peak windows */}
      <section className="admin-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-display font-bold text-white tracking-tight">
            Heures pleines
          </h2>
          <button
            type="button"
            onClick={() =>
              setPeakWindows((prev) => [
                ...prev,
                { days: [1, 2, 3, 4, 5], start: "17:00", end: "22:00" },
              ])
            }
            className="admin-btn-ghost min-h-9 text-teal-300 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une plage
          </button>
        </div>
        <p className="text-sm text-white/40 mb-4">
          En dehors de ces plages, le tarif « heures creuses » s&apos;applique.
        </p>
        <div className="space-y-4">
          {peakWindows.map((w, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {WEEKDAYS.map(({ value, short }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWindowDay(i, value)}
                    className={`min-w-11 min-h-11 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${
                      w.days.includes(value)
                        ? "bg-teal-400/15 text-teal-300 border border-teal-400/40 shadow-[0_0_10px_rgba(45,212,191,0.15)]"
                        : "bg-white/[0.04] border border-white/10 text-white/40 hover:border-teal-400/40 hover:text-white/70"
                    }`}
                  >
                    {short}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPeakWindows((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="ml-auto p-2 rounded-lg text-rose-300 hover:bg-rose-400/10 transition-colors"
                  aria-label="Supprimer la plage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={w.start}
                  onChange={(e) => updateWindow(i, { start: e.target.value })}
                  className={inputClass}
                />
                <span className="text-white/30">→</span>
                <input
                  type="time"
                  value={w.end}
                  onChange={(e) => updateWindow(i, { end: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
          {peakWindows.length === 0 && (
            <p className="text-sm text-white/40">
              Aucune plage définie : tout est facturé en heures creuses.
            </p>
          )}
        </div>
      </section>

      {/* Payment details */}
      <section className="admin-card p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-display font-bold text-white tracking-tight">
          Coordonnées de paiement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email PayPal</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className={`${inputClass} w-full`}
              placeholder="paiement@rjstudio.ma"
            />
          </div>
          <div>
            <label className={labelClass}>Lien PayPal.Me (optionnel)</label>
            <input
              type="url"
              value={paypalLink}
              onChange={(e) => setPaypalLink(e.target.value)}
              className={`${inputClass} w-full`}
              placeholder="https://paypal.me/rjstudio"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>
            Coordonnées bancaires (RIB / IBAN) — affichées au client
          </label>
          <textarea
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            rows={5}
            className={`${inputClass} w-full resize-none`}
          />
        </div>
        <div>
          <label className={labelClass}>
            Délai de confirmation du paiement (heures)
          </label>
          <input
            type="number"
            min={1}
            max={336}
            value={deadlineHours}
            onChange={(e) => setDeadlineHours(e.target.value)}
            className={`${inputClass} w-32`}
          />
          <p className="text-xs text-white/35 mt-1.5">
            Les réservations non payées après ce délai sont annulées
            automatiquement et le créneau est libéré.
          </p>
        </div>
        <div>
          <label className={labelClass}>
            Relance avant la séance (heures)
          </label>
          <input
            type="number"
            min={1}
            max={168}
            value={reminderHours}
            onChange={(e) => setReminderHours(e.target.value)}
            className={`${inputClass} w-32`}
          />
          <p className="text-xs text-white/35 mt-1.5">
            Envoie un email de rappel au client et à l&apos;admin lorsqu&apos;il
            reste ce délai avant le début de la réservation (confirmée ou en
            attente de paiement).
          </p>
        </div>
      </section>

      {error && (
        <p className="text-sm font-semibold text-rose-300 bg-rose-400/10 border border-rose-400/25 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={save}
        className="admin-btn-primary min-h-11 px-8"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enregistrement…
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Enregistré
          </>
        ) : (
          "Enregistrer les paramètres"
        )}
      </button>
    </div>
  );
}
