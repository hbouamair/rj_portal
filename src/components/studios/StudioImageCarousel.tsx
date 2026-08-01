"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  rounded?: boolean;
}

/** Simple image carousel for studio galleries. */
export default function StudioImageCarousel({
  images,
  alt,
  className = "",
  aspectClassName = "aspect-[4/3]",
  priority = false,
  showDots = true,
  showArrows = true,
  rounded = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  if (count === 0) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-primary-400/30 to-secondary-500/30 ${aspectClassName} ${rounded ? "rounded-2xl" : ""} ${className}`}
        aria-hidden
      />
    );
  }

  const single = count === 1;

  return (
    <div
      className={`relative overflow-hidden group ${aspectClassName} ${rounded ? "rounded-2xl" : ""} ${className}`}
    >
      <Image
        key={images[index]}
        src={images[index]}
        alt={`${alt}${single ? "" : ` — photo ${index + 1}/${count}`}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-opacity duration-300"
        priority={priority && index === 0}
      />

      {!single && showArrows && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {!single && showDots && (
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      )}

      {!single && (
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-charcoal/45 text-white text-[10px] font-bold tabular-nums backdrop-blur-sm">
          {index + 1}/{count}
        </span>
      )}
    </div>
  );
}
