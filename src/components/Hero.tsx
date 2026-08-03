import { ArrowRight, Building2, CalendarCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import { BOOKING_URL, BASE_PATH } from "@/lib/constants";

/** Grain texture — kills the "stock video" look (inline SVG, no request). */
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * Cinematic hero — video background with poster fallback.
 * Drop your footage at public/hero.mp4 (and optionally public/hero.webm);
 * until then the poster image is shown, nothing breaks.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-charcoal"
    >
      {/* Media layer: poster first (LCP), video fades in on top when ready */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero-background.png"
          alt="Studio RJ à Casablanca — salle lumineuse avec miroirs et logo"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
          quality={85}
        />
        <HeroVideo />

        {/* Light brand wash — keeps text readable without hiding the photo */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,58,95,0.28) 0%, rgba(42,157,143,0.18) 100%)",
          }}
          aria-hidden
        />

        {/* Scrim — vignette + bottom-left shadow for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 110% 85% at 50% 45%, transparent 35%, rgba(10,16,28,0.3) 100%), linear-gradient(180deg, rgba(10,16,28,0.22) 0%, rgba(10,16,28,0.08) 38%, rgba(10,16,28,0.42) 70%, rgba(10,16,28,0.78) 100%), linear-gradient(90deg, rgba(10,16,28,0.62) 0%, rgba(10,16,28,0.12) 52%)",
          }}
          aria-hidden
        />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: NOISE_DATA_URI }}
          aria-hidden
        />
      </div>

      {/* Content — asymmetric, bottom-left third */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pt-[88px] sm:pt-[96px] md:pt-[104px] pb-28 sm:pb-32">
        <div className="max-w-7xl 2xl:max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div className="max-w-2xl">
            {/* Availability chip — glass accent + social proof */}
            <Link
              href={BOOKING_URL}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-4 py-2 mb-6 text-white/95 hover:bg-white/20 transition-colors animate-fade-up"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-400" />
              </span>
              <span className="text-xs sm:text-sm font-semibold font-nav">
                Studios disponibles aujourd&apos;hui · dès 150 MAD/h
              </span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.02] tracking-tight text-white animate-fade-up stagger-1"
              style={{ textShadow: "0 4px 32px rgba(0,0,0,0.55)" }}
            >
              Chaque projet
              <br />
              mérite{" "}
              <span
                className="text-[#F2E7AF]"
                style={{ textShadow: "0 4px 24px rgba(0,0,0,0.55)" }}
              >
                son espace.
              </span>
            </h1>

            <p
              className="mt-5 text-base sm:text-lg text-white/85 font-medium max-w-md leading-relaxed animate-fade-up stagger-2"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}
            >
              Studios de danse et fitness à la location à Casablanca — à
              l&apos;heure, sans engagement.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-up stagger-3">
              <a
                href={BOOKING_URL}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 100%)",
                  boxShadow: "0 8px 24px rgba(30, 58, 95, 0.45)",
                }}
              >
                <CalendarCheck className="w-4 h-4" aria-hidden />
                Réserver un créneau
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150"
                  aria-hidden
                />
              </a>
              <a
                href={`${BASE_PATH}/studios`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-white border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors hover:scale-[1.03] active:scale-[0.98]"
              >
                <Building2 className="w-4 h-4" aria-hidden />
                Nos studios
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-3 gap-y-1.5 animate-fade-up stagger-4">
              {[
                "Réservation en ligne 24/7",
                "Paiement flexible",
                "Sans engagement",
              ].map((item, i) => (
                <span
                  key={item}
                  className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/65"
                >
                  {i > 0 && (
                    <span className="text-white/30" aria-hidden>
                      •
                    </span>
                  )}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <a
        href="#studios-selection"
        className="absolute bottom-7 right-6 sm:right-10 flex flex-col items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors animate-fade-up stagger-5"
        aria-label="Faire défiler vers le contenu"
      >
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
          Explorer
        </span>
        <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1.5 animate-scroll-cue">
          <div className="w-1 h-1.5 rounded-full bg-white/80 animate-scroll-dot" />
        </div>
      </a>
    </section>
  );
}
