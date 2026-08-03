import Link from "next/link";
import { ArrowRight, Check, Music, Sparkles, Users } from "lucide-react";
import StudioImageCarousel from "@/components/studios/StudioImageCarousel";
import { fetchActiveStudios } from "@/lib/booking/db";
import { formatMad } from "@/lib/booking/pricing";
import { getStudioImages } from "@/lib/booking/studio-images";
import { BOOKING_URL, BASE_PATH } from "@/lib/constants";

/** Homepage studios grid — loads gallery photos from Supabase. */
export default async function HomeStudiosSection() {
  let studios: Awaited<ReturnType<typeof fetchActiveStudios>> = [];

  try {
    studios = await fetchActiveStudios();
  } catch {
    studios = [];
  }

  return (
    <section
      id="studios-selection"
      className="relative py-16 md:py-24 bg-gradient-to-b from-cream via-warm-gold/25 to-cream content-auto"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 2xl:max-w-8xl">
        <header className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-gold/60 border border-warm-gold text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal mb-4">
            <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
            Nos studios
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-charcoal mb-4">
            Réservez votre espace
          </h2>
          <p className="text-base md:text-lg text-soft-charcoal leading-relaxed">
            Location à l&apos;heure — cours privés, répétitions ou ateliers.
          </p>
        </header>

        {studios.length === 0 ? (
          <p className="text-center text-soft-charcoal text-sm">
            Les studios seront affichés ici dès qu&apos;ils seront disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {studios.map((studio, index) => (
              <article
                key={studio.id}
                className="book-card overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="relative h-44 overflow-hidden">
                  <StudioImageCarousel
                    images={getStudioImages(studio)}
                    alt={studio.name}
                    className="absolute inset-0 h-full w-full rounded-none transition-transform duration-300 group-hover:scale-105"
                    aspectClassName="h-full"
                    priority={index === 0}
                    rounded={false}
                    showArrows={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent pointer-events-none" />
                  {studio.popular && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500 text-white text-[10px] font-bold uppercase">
                      <Sparkles className="w-3 h-3" aria-hidden />
                      Populaire
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                    <h3 className="text-xl font-display font-bold text-white">
                      {studio.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                  {studio.subtitle && (
                    <p className="text-sm text-soft-charcoal line-clamp-2">
                      {studio.subtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-soft-charcoal">
                    {studio.size_label && (
                      <span className="inline-flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-primary-500" aria-hidden />
                        {studio.size_label}
                      </span>
                    )}
                    {studio.capacity_label && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-secondary-500" aria-hidden />
                        {studio.capacity_label}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm border-t border-charcoal/5 pt-3">
                    <span className="text-soft-charcoal">Dès</span>
                    <span className="font-display font-bold text-charcoal">
                      {formatMad(studio.price_offpeak_mad)}/h
                    </span>
                  </div>
                  {studio.features.length > 0 && (
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
                  )}
                  <Link href={BOOKING_URL} className="book-btn-primary w-full min-h-11 text-sm">
                    Réserver
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

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
