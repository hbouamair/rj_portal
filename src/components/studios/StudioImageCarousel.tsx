"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
}

const TRANSITION = { duration: 0.65, ease: [0.4, 0, 0.2, 1] as const };

/** Image carousel for studio galleries with smooth crossfade / slide transitions. */
export default function StudioImageCarousel({
  images,
  alt,
  className = "",
  aspectClassName = "aspect-[4/3]",
  priority = false,
  showDots = true,
  showArrows = true,
  rounded = true,
  autoPlay = false,
  autoPlayIntervalMs = 5000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = images.length;

  useEffect(() => {
    setIndex(0);
    setDirection(1);
  }, [images]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (next: number, delta: number) => {
      if (count <= 1) return;
      setDirection(delta >= 0 ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setDirection(delta >= 0 ? 1 : -1);
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!autoPlay || count <= 1 || paused || reduceMotion) return;

    const id = window.setInterval(() => go(1), autoPlayIntervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayIntervalMs, count, go, paused, reduceMotion]);

  if (count === 0) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-primary-400/30 to-secondary-500/30 ${aspectClassName} ${rounded ? "rounded-2xl" : ""} ${className}`}
        aria-hidden
      />
    );
  }

  const single = count === 1;
  const currentSrc = images[index];

  return (
    <div
      className={`relative overflow-hidden group ${aspectClassName} ${rounded ? "rounded-2xl" : ""} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSrc}
          custom={direction}
          className="absolute inset-0"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: direction > 0 ? "6%" : "-6%", scale: 1.03 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, x: direction > 0 ? "-6%" : "6%", scale: 1.01 }
          }
          transition={reduceMotion ? { duration: 0 } : TRANSITION}
        >
          <Image
            src={currentSrc}
            alt={`${alt}${single ? "" : ` — photo ${index + 1}/${count}`}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={priority && index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {!single && showArrows && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {!single && showDots && (
        <div className="absolute bottom-2.5 left-0 right-0 z-10 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
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
        <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-charcoal/45 text-white text-[10px] font-bold tabular-nums backdrop-blur-sm">
          {index + 1}/{count}
        </span>
      )}
    </div>
  );
}
