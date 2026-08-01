"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Studio } from "@/lib/booking/types";
import { getStudioImages } from "@/lib/booking/studio-images";
import { updateStudio } from "@/app/admin/actions";
import StudioGalleryEditor from "@/components/admin/StudioGalleryEditor";

export default function StudioEditor({ studio }: { studio: Studio }) {
  const [name, setName] = useState(studio.name);
  const [subtitle, setSubtitle] = useState(studio.subtitle ?? "");
  const [sizeLabel, setSizeLabel] = useState(studio.size_label ?? "");
  const [capacityLabel, setCapacityLabel] = useState(studio.capacity_label ?? "");
  const [pricePeak, setPricePeak] = useState(String(studio.price_peak_mad));
  const [priceOffPeak, setPriceOffPeak] = useState(
    String(studio.price_offpeak_mad)
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    getStudioImages(studio)
  );
  const [popular, setPopular] = useState(studio.popular);
  const [active, setActive] = useState(studio.active);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateStudio(studio.id, {
        name,
        subtitle,
        size_label: sizeLabel,
        capacity_label: capacityLabel,
        price_peak_mad: Number(pricePeak),
        price_offpeak_mad: Number(priceOffPeak),
        popular,
        active,
        gallery_urls: galleryUrls,
      });
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  const inputClass = "admin-input";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className={`admin-card p-5 sm:p-6 space-y-5 ${!active ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-white tracking-tight">
          {studio.name}
        </h2>
        {!active && <span className="admin-badge-neutral">Désactivé</span>}
      </div>

      <StudioGalleryEditor
        images={galleryUrls}
        onChange={setGalleryUrls}
        studioId={studio.id}
        studioName={name}
      />

      <div className="border-t border-white/[0.06] pt-4 space-y-4">
        <div>
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description courte</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Taille</label>
            <input
              type="text"
              value={sizeLabel}
              onChange={(e) => setSizeLabel(e.target.value)}
              className={inputClass}
              placeholder="Grand - 49m²"
            />
          </div>
          <div>
            <label className={labelClass}>Capacité</label>
            <input
              type="text"
              value={capacityLabel}
              onChange={(e) => setCapacityLabel(e.target.value)}
              className={inputClass}
              placeholder="10-16 personnes"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Heures pleines (MAD/h)</label>
            <input
              type="number"
              min={0}
              value={pricePeak}
              onChange={(e) => setPricePeak(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Heures creuses (MAD/h)</label>
            <input
              type="number"
              min={0}
              value={priceOffPeak}
              onChange={(e) => setPriceOffPeak(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-4 h-4 rounded accent-teal-400"
            />
            Badge « Populaire »
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded accent-teal-400"
            />
            Réservable
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm font-semibold text-rose-300">{error}</p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={save}
        className="admin-btn-primary w-full min-h-10"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Enregistré
          </>
        ) : (
          "Enregistrer"
        )}
      </button>
    </div>
  );
}
