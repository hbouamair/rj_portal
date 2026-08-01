"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Music,
  Sparkles,
  Users,
} from "lucide-react";
import type { PeakWindow, Settings, Studio } from "@/lib/booking/types";
import { formatMad } from "@/lib/booking/pricing";
import { getStudioImages } from "@/lib/booking/studio-images";
import StudioImageCarousel from "@/components/studios/StudioImageCarousel";
import { BOOKING_URL } from "@/lib/constants";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Snappy ease-out — short durations feel responsive */
const SNAPPY = [0.25, 0.1, 0.25, 1] as const;
const FAST = { duration: 0.22, ease: SNAPPY };
const SPRING = { type: "spring" as const, stiffness: 520, damping: 32 };

function formatPeakWindows(windows: PeakWindow[]): string {
  return windows
    .map((w) => {
      const days = w.days.map((d) => DAY_LABELS[d]).join(", ");
      return `${days} · ${w.start}–${w.end}`;
    })
    .join("  ·  ");
}

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: FAST },
};

const benefitContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const benefitItem = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: FAST },
};

export default function StudiosShowcase({
  studios,
  settings,
}: {
  studios: Studio[];
  settings: Settings;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {!reduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -top-10 right-0 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl"
            aria-hidden
            animate={{ x: [0, 20, 0], y: [0, 12, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl"
            aria-hidden
            animate={{ x: [0, -16, 0], y: [0, 18, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <motion.header
        className="relative max-w-2xl mx-auto text-center mb-10 md:mb-14"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={heroItem}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-charcoal/5 text-[11px] font-bold uppercase tracking-[0.16em] text-soft-charcoal mb-5 shadow-sm"
        >
          Nos espaces
        </motion.p>
        <motion.h1
          variants={heroItem}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal tracking-tight mb-4"
        >
          Trois studios{" "}
          <motion.span
            className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent bg-[length:200%_100%]"
            animate={
              reduceMotion
                ? undefined
                : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            prêts à accueillir
          </motion.span>{" "}
          votre projet
        </motion.h1>
        <motion.p
          variants={heroItem}
          className="text-base md:text-lg text-soft-charcoal leading-relaxed"
        >
          Du cours privé au grand atelier — choisissez la salle adaptée à votre
          groupe, réservez en ligne et payez à votre rythme.
        </motion.p>
      </motion.header>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 md:mb-16"
        variants={benefitContainer}
        initial="hidden"
        animate="show"
      >
        {[
          {
            icon: Building2,
            title: "Équipement pro",
            text: "Miroirs, son Bluetooth, climatisation",
          },
          {
            icon: Clock,
            title: "Créneaux flexibles",
            text: "À l'heure, minimum 1 h, par pas de 30 min",
          },
          {
            icon: Calendar,
            title: "Réservation simple",
            text: "En ligne en quelques clics, sans engagement",
          },
        ].map((item) => (
          <motion.div
            key={item.title}
            variants={benefitItem}
            whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
            transition={SPRING}
            className="book-card p-5 text-center sm:text-left flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 cursor-default"
          >
            <motion.div
              className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 sm:mb-3"
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              transition={SPRING}
            >
              <item.icon className="w-5 h-5" aria-hidden />
            </motion.div>
            <div>
              <h2 className="font-display font-bold text-charcoal text-sm mb-1">
                {item.title}
              </h2>
              <p className="text-xs text-soft-charcoal leading-relaxed">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {studios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={FAST}
          className="book-card max-w-lg mx-auto p-8 text-center"
        >
          <p className="text-sm text-soft-charcoal">
            Aucun studio disponible pour le moment. Revenez bientôt ou
            contactez-nous.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8 max-w-5xl mx-auto">
          {studios.map((studio, index) => (
            <StudioCard
              key={studio.id}
              studio={studio}
              index={index}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={FAST}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        className="book-card max-w-5xl mx-auto mt-10 md:mt-14 p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft-charcoal mb-2">
              Tarification
            </p>
            <h2 className="font-display font-bold text-xl text-charcoal mb-2">
              Heures pleines & heures creuses
            </h2>
            <p className="text-sm text-soft-charcoal leading-relaxed">
              Le prix affiché sur chaque studio correspond au tarif horaire.
              Les <strong className="text-charcoal">heures pleines</strong>{" "}
              s&apos;appliquent aux créneaux indiqués ci-dessous ; le reste du
              temps ouvert est en{" "}
              <strong className="text-charcoal">heures creuses</strong>.
            </p>
            <p className="mt-3 text-xs text-soft-charcoal font-medium leading-relaxed">
              {formatPeakWindows(settings.peak_windows)}
            </p>
          </div>
          <AnimatedCta href={BOOKING_URL} reduceMotion={!!reduceMotion}>
            Voir les créneaux disponibles
          </AnimatedCta>
        </div>
      </motion.div>
    </>
  );
}

function AnimatedCta({
  href,
  children,
  reduceMotion,
  className = "book-btn-primary min-h-12 shrink-0",
}: {
  href: string;
  children: ReactNode;
  reduceMotion: boolean;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={SPRING}
    >
      <Link href={href} className={`${className} group`}>
        {children}
        <ArrowRight
          className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </motion.div>
  );
}

function StudioCard({
  studio,
  index,
  reduceMotion,
}: {
  studio: Studio;
  index: number;
  reduceMotion: boolean;
}) {
  const imageFirst = index % 2 === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...FAST, delay: index * 0.03 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="book-card overflow-hidden group"
    >
      <div
        className={`grid md:grid-cols-2 ${imageFirst ? "" : "md:[direction:rtl]"}`}
      >
        <div className="relative h-56 sm:h-64 md:h-auto md:min-h-[280px] md:[direction:ltr] overflow-hidden">
          <StudioImageCarousel
            images={getStudioImages(studio)}
            alt={studio.name}
            className="absolute inset-0 h-full w-full rounded-none"
            aspectClassName="h-full min-h-[280px]"
            priority={index === 0}
            rounded={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent md:bg-gradient-to-r md:from-charcoal/40 md:via-transparent pointer-events-none" />
          {studio.popular && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md">
              <Sparkles className="w-3 h-3" aria-hidden />
              Populaire
            </span>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col md:[direction:ltr]">
          <div className="flex-1">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-charcoal mb-1">
              {studio.name}
            </h2>
            {studio.subtitle && (
              <p className="text-sm text-soft-charcoal leading-relaxed mb-5">
                {studio.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-soft-charcoal mb-6">
              {studio.size_label && (
                <span className="inline-flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary-500" aria-hidden />
                  {studio.size_label}
                </span>
              )}
              {studio.capacity_label && (
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary-500" aria-hidden />
                  {studio.capacity_label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-charcoal/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-soft-charcoal mb-1">
                  Heures pleines
                </p>
                <p className="font-display font-bold text-2xl text-charcoal">
                  {formatMad(studio.price_peak_mad)}
                  <span className="text-sm font-semibold text-soft-charcoal">
                    /h
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-soft-charcoal mb-1">
                  Heures creuses
                </p>
                <p className="font-display font-bold text-2xl text-secondary-600">
                  {formatMad(studio.price_offpeak_mad)}
                  <span className="text-sm font-semibold text-soft-charcoal">
                    /h
                  </span>
                </p>
              </div>
            </div>

            {studio.features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {studio.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-soft-charcoal"
                  >
                    <Check
                      className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <AnimatedCta
            href={BOOKING_URL}
            reduceMotion={reduceMotion}
            className="book-btn-primary w-full sm:w-auto min-h-12 self-start"
          >
            Réserver {studio.name}
          </AnimatedCta>
        </div>
      </div>
    </motion.article>
  );
}
