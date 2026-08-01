"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Link2,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import StudioImageCarousel from "@/components/studios/StudioImageCarousel";
import { isValidImageUrl } from "@/lib/booking/studio-images";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  studioId: number;
  studioName: string;
}

const MAX_IMAGES = 12;

export default function StudioGalleryEditor({
  images,
  onChange,
  studioId,
  studioName,
}: Props) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addUrl() {
    setError(null);
    const url = urlInput.trim();
    if (!isValidImageUrl(url)) {
      setError("URL invalide (doit commencer par http:// ou https://).");
      return;
    }
    if (images.includes(url)) {
      setError("Cette image est déjà dans la galerie.");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images par studio.`);
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
  }

  async function uploadFile(file: File) {
    setError(null);
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images par studio.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Seuls les fichiers image sont acceptés.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop volumineuse (max 5 Mo).");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("studioId", String(studioId));

      const res = await fetch("/api/admin/studio-images", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Échec de l'upload.");
        return;
      }
      if (images.includes(json.url)) {
        setError("Cette image est déjà dans la galerie.");
        return;
      }
      onChange([...images, json.url as string]);
    } catch {
      setError("Impossible d'envoyer l'image. Réessayez.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
          Galerie photos
        </p>
        <StudioImageCarousel
          images={images}
          alt={studioName}
          aspectClassName="aspect-[16/10]"
          showArrows
          showDots
        />
        <p className="text-[11px] text-white/30 mt-2">
          La 1<sup>re</sup> photo est l&apos;image principale (réservation & site).
          {images.length > 0 && ` · ${images.length}/${MAX_IMAGES}`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Link2
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
            aria-hidden
          />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://…"
            className="admin-input pl-9"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim()}
          className="admin-btn-ghost min-h-10 shrink-0"
        >
          <ImagePlus className="w-4 h-4" />
          Ajouter URL
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="admin-btn-ghost min-h-10 shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Importer
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-300">{error}</p>
      )}

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex items-center gap-3 p-2 rounded-xl border border-white/[0.08] bg-white/[0.02]"
            >
              <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                  {i === 0 ? "Couverture" : `Photo ${i + 1}`}
                </p>
                <p className="text-xs text-white/50 truncate">{url}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-25"
                  aria-label="Monter"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-25"
                  aria-label="Descendre"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="p-2 rounded-lg text-rose-300/70 hover:text-rose-300 hover:bg-rose-400/10"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
