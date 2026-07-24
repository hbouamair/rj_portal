"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { PaymentMethod, Studio } from "@/lib/booking/types";
import {
  durationOptions,
  formatDurationLabel,
  minutesToTimeString,
  SLOT_STEP_MINUTES,
} from "@/lib/booking/pricing";
import { createManualBooking } from "@/app/admin/actions";

/** Start-time options every 30 min between 06:00 and 23:30. */
const START_OPTIONS = Array.from(
  { length: (24 - 6) * 2 },
  (_, i) => 6 * 60 + i * SLOT_STEP_MINUTES
);

export default function ManualBookingButton({ studios }: { studios: Studio[] }) {
  const [open, setOpen] = useState(false);
  const [studioId, setStudioId] = useState(studios[0]?.id ?? 0);
  const [date, setDate] = useState("");
  const [startMinutes, setStartMinutes] = useState(18 * 60);
  const [duration, setDuration] = useState(60);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<"pending" | "confirmed">("confirmed");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    setSuccess(null);
    if (!date || !name.trim() || !email.trim() || !phone.trim()) {
      setError("Date, nom, email et téléphone sont requis.");
      return;
    }
    startTransition(async () => {
      const result = await createManualBooking({
        studioId,
        date,
        startMinutes,
        durationMinutes: duration,
        name,
        email,
        phone,
        note: note || undefined,
        paymentMethod,
        status,
        sendEmail,
      });
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      setSuccess(`Réservation ${result.reference} créée.`);
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
    });
  }

  const inputClass = "admin-input";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-btn-primary min-h-11"
      >
        <Plus className="w-4 h-4" aria-hidden />
        Réservation manuelle
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-booking-title"
        >
          <div
            className="admin-card-soft w-full max-w-lg p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                id="manual-booking-title"
                className="text-xl font-display font-bold text-white tracking-tight"
              >
                Réservation manuelle
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="admin-btn-ghost min-w-11 min-h-11 p-0"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Studio</label>
                  <select
                    value={studioId}
                    onChange={(e) => setStudioId(Number(e.target.value))}
                    className={inputClass}
                  >
                    {studios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Heure de début</label>
                  <select
                    value={startMinutes}
                    onChange={(e) => setStartMinutes(Number(e.target.value))}
                    className={inputClass}
                  >
                    {START_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {minutesToTimeString(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Durée</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className={inputClass}
                  >
                    {durationOptions().map((d) => (
                      <option key={d} value={d}>
                        {formatDurationLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Nom du client</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Note (optionnel)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className={inputClass}
                  >
                    <option value="cash">Espèces au studio</option>
                    <option value="virement">Virement bancaire</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Statut</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "pending" | "confirmed")
                    }
                    className={inputClass}
                  >
                    <option value="confirmed">Confirmée (payée)</option>
                    <option value="pending">En attente de paiement</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-400"
                />
                Envoyer un email au client
              </label>

              {error && (
                <p className="text-sm font-semibold text-rose-300 bg-rose-400/10 border border-rose-400/25 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm font-semibold text-teal-300 bg-teal-400/10 border border-teal-400/25 rounded-xl px-4 py-3">
                  {success}
                </p>
              )}

              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="admin-btn-primary w-full min-h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  "Créer la réservation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
