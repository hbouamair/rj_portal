"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { PromoCode } from "@/lib/booking/types";
import { formatPromoDiscountLabel } from "@/lib/booking/promo";
import {
  createPromoCode,
  deletePromoCode,
  updatePromoCode,
  type PromoCodeInput,
} from "@/app/admin/actions";
import { useAdminFeedback } from "@/components/admin/AdminFeedback";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}

function PromoCodeForm({
  initial,
  promoId,
  onDeleted,
}: {
  initial?: PromoCode;
  promoId?: number;
  onDeleted?: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    initial?.discount_type ?? "percent"
  );
  const [discountValue, setDiscountValue] = useState(
    String(initial?.discount_value ?? 10)
  );
  const [minAmount, setMinAmount] = useState(
    initial?.min_amount_mad != null ? String(initial.min_amount_mad) : ""
  );
  const [maxUses, setMaxUses] = useState(
    initial?.max_uses != null ? String(initial.max_uses) : ""
  );
  const [validFrom, setValidFrom] = useState(toDatetimeLocal(initial?.valid_from ?? null));
  const [validUntil, setValidUntil] = useState(
    toDatetimeLocal(initial?.valid_until ?? null)
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { confirm, toast } = useAdminFeedback();

  const inputClass = "admin-input";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  function buildInput(): PromoCodeInput {
    return {
      code,
      label,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_amount_mad: minAmount.trim() ? Number(minAmount) : null,
      max_uses: maxUses.trim() ? Number(maxUses) : null,
      valid_from: fromDatetimeLocal(validFrom),
      valid_until: fromDatetimeLocal(validUntil),
      active,
    };
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = promoId
        ? await updatePromoCode(promoId, buildInput())
        : await createPromoCode(buildInput());
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        toast.error("Échec", result.error ?? "Impossible d'enregistrer.");
        return;
      }
      setSaved(true);
      toast.success(
        promoId ? "Code mis à jour" : "Code créé",
        code.trim().toUpperCase()
      );
      if (!promoId) {
        setCode("");
        setLabel("");
        setDiscountValue("10");
        setMinAmount("");
        setMaxUses("");
        setValidFrom("");
        setValidUntil("");
        setActive(true);
      }
      setTimeout(() => setSaved(false), 2500);
    });
  }

  async function remove() {
    if (!promoId) return;
    const ok = await confirm({
      title: "Supprimer ce code promo ?",
      description: `Le code ${code} sera définitivement supprimé.`,
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deletePromoCode(promoId);
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        toast.error("Échec", result.error ?? "Suppression impossible.");
        return;
      }
      toast.success("Code promo supprimé", code);
      onDeleted?.();
    });
  }

  return (
    <div className={`admin-card p-5 sm:p-6 space-y-4 ${!active && promoId ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-white tracking-tight">
            {promoId ? code : "Nouveau code promo"}
          </h2>
          {promoId && (
            <p className="text-xs text-white/45 mt-1">
              {formatPromoDiscountLabel({
                discount_type: discountType,
                discount_value: Number(discountValue) || 0,
              } as PromoCode)}{" "}
              · {initial?.uses_count ?? 0} utilisation
              {(initial?.uses_count ?? 0) !== 1 ? "s" : ""}
              {initial?.max_uses != null ? ` / ${initial.max_uses}` : ""}
            </p>
          )}
        </div>
        {!active && promoId && <span className="admin-badge-neutral">Inactif</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Code *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={inputClass}
            placeholder="ETE2026"
            maxLength={32}
          />
        </div>
        <div>
          <label className={labelClass}>Libellé (optionnel)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
            placeholder="Promo été"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Type de réduction</label>
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as "percent" | "fixed")
            }
            className={inputClass}
          >
            <option value="percent">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (MAD)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Valeur {discountType === "percent" ? "(%)" : "(MAD)"}
          </label>
          <input
            type="number"
            min={1}
            max={discountType === "percent" ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Montant min. (MAD)</label>
          <input
            type="number"
            min={0}
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className={inputClass}
            placeholder="Optionnel"
          />
        </div>
        <div>
          <label className={labelClass}>Utilisations max</label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className={inputClass}
            placeholder="Illimité"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Valide à partir de</label>
          <input
            type="datetime-local"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Valide jusqu&apos;au</label>
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-white/20"
        />
        Code actif
      </label>

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={isPending || !code.trim()}
          className="admin-btn-primary"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : null}
          {promoId ? "Enregistrer" : "Créer le code"}
        </button>
        {promoId && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="admin-btn-ghost text-red-300 hover:text-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

export default function PromoCodeManager({
  promos: initialPromos,
}: {
  promos: PromoCode[];
}) {
  const [promos, setPromos] = useState(initialPromos);

  return (
    <div className="space-y-4">
      <PromoCodeForm />
      {promos.length === 0 ? (
        <p className="admin-card p-6 text-sm text-white/50 text-center">
          Aucun code promo pour le moment. Créez-en un ci-dessus.
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {promos.map((promo) => (
            <PromoCodeForm
              key={promo.id}
              promoId={promo.id}
              initial={promo}
              onDeleted={() => setPromos((list) => list.filter((p) => p.id !== promo.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
