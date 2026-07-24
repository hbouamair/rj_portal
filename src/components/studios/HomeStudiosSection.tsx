import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Music, Sparkles, Users } from "lucide-react";
import { HOME_STUDIOS } from "@/data/home-studios";
import { BOOKING_URL, BASE_PATH } from "@/lib/constants";

/** Lightweight server-rendered studios grid for the homepage (no JS). */
export default function HomeStudiosSection() {
  return (
    <section
      id="studios-selection"
      className="relative py-16 md:py-24 bg-cream content-auto"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 2xl:max-w-8xl">
        <header className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-charcoal/5 text-[11px] font-bold uppercase tracking-[0.16em] text-soft-charcoal mb-4">
            <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
            Nos studios
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-charcoal mb-4">
            Réservez votre{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              espace
            </span>
          </h2>
          <p className="text-base md:text-lg text-soft-charcoal leading-relaxed">
            Location à l&apos;heure — cours privés, répétitions ou ateliers.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {HOME_STUDIOS.map((studio, index) => (
            <article
              key={studio.id}
              className="book-card overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={studio.image}
                  alt={studio.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
                {studio.popular && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500 text-white text-[10px] font-bold uppercase">
                    <Sparkles className="w-3 h-3" aria-hidden />
                    Populaire
                  </span>
                )}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-display font-bold text-white">
                    {studio.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 gap-4">
                <p className="text-sm text-soft-charcoal line-clamp-2">
                  {studio.subtitle}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-soft-charcoal">
                  <span className="inline-flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                    {studio.size}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-secondary-500" aria-hidden />
                    {studio.capacity}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-charcoal/5 pt-3">
                  <span className="text-soft-charcoal">Dès</span>
                  <span className="font-display font-bold text-charcoal">
                    {studio.priceOffPeak}
                  </span>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {studio.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-soft-charcoal"
                    >
                      <Check className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={BOOKING_URL} className="book-btn-primary w-full min-h-11 text-sm">
                  Réserver
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center mt-10">
          <Link
            href={`${BASE_PATH}/studios`}
            className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
          >
            Voir tarifs complets & détails →
          </Link>
        </p>
      </div>
    </section>
  );
}
