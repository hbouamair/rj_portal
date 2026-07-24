"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lazy background video layer for the hero.
 * - Starts playback only after first paint (keeps LCP on the poster image)
 * - Respects prefers-reduced-motion and Data Saver (poster only)
 * - Hides itself gracefully if /hero.mp4 (or /hero.webm) doesn't exist yet
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    if (reducedMotion || saveData) return;

    // Defer video start until the browser is idle so it never competes
    // with the poster image / first paint.
    const start = () => setEnabled(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (enabled && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — poster stays visible, nothing to do
      });
    }
  }, [enabled]);

  if (!enabled || failed) return null;

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      onCanPlay={(e) => {
        e.currentTarget.dataset.ready = "true";
      }}
      onError={() => setFailed(true)}
    >
      <source src="/hero.webm" type="video/webm" />
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  );
}
