"use client";

import { motion } from "framer-motion";
import { Music, Users, Sparkles, Check, ArrowRight } from "lucide-react";
import Image from "next/image";
import { BOOKING_URL } from "@/lib/constants";
import { BASE_PATH } from "@/lib/constants";

const studios = [
  {
    id: 1,
    name: "Studio 1",
    subtitle: "Idéal pour les groupes et les ateliers",
    size: "Grand - 49m²",
    capacity: "10-16 personnes",
    pricePeak: "400 MAD/h",
    priceOffPeak: "300 MAD/h",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    features: [
      "Système son Bluetooth",
      "Climatisation",
      "Grand miroirs",
      "Forfait 10h + 1h gratuite"
    ],
    popular: true,
    color: "from-primary-500 to-primary-600"
  },
  {
    id: 2,
    name: "Studio 2",
    subtitle: "Parfait pour les cours de danse ou fitness en groupe",
    size: "Moyen - 34m²",
    capacity: "7-12 personnes",
    pricePeak: "300 MAD/h",
    priceOffPeak: "200 MAD/h",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    features: [
      "Système son Bluetooth",
      "Climatisation",
      "Grand miroirs",
      "Forfait 10h + 1h gratuite"
    ],
    popular: false,
    color: "from-secondary-500 to-secondary-600"
  },
  {
    id: 3,
    name: "Studio 3",
    subtitle: "Parfait pour les cours privés, répétitions ou petits groupes",
    size: "Moyen - 30m²",
    capacity: "6-10 personnes",
    pricePeak: "250 MAD/h",
    priceOffPeak: "150 MAD/h",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80",
    features: [
      "Système son Bluetooth",
      "Climatisation",
      "Grand miroirs",
      "Forfait 10h + 1h gratuite"
    ],
    popular: false,
    color: "from-accent-500 to-accent-600"
  }
];

export default function StudioSelection() {
  return (
    <section id="studios-selection" className="relative py-24 md:py-32 overflow-hidden bg-cream">
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-br from-accent-500/10 to-tertiary-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 2xl:max-w-8xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 mb-6"
          >
            <Music className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-semibold font-nav text-charcoal">Nos Formules</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-charcoal">
            Réservez Votre{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Studio
            </span>
          </h2>

          <p className="text-lg md:text-xl text-soft-charcoal leading-relaxed">
            Choisissez le studio parfait pour votre pratique, répétition ou cours privé.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl 2xl:max-w-8xl mx-auto items-stretch">
          {studios.map((studio, index) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative h-full flex flex-col group/card"
            >
              {studio.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full shadow-lg"
                >
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">Populaire</span>
                  </div>
                </motion.div>
              )}

              <div
                className={`relative skeu-card overflow-hidden flex flex-col h-full transition-transform group-hover/card:-translate-y-2 ${
                  studio.popular ? "ring-2 ring-accent-500 ring-offset-4 ring-offset-cream" : ""
                }`}
              >
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <Image
                    src={studio.image}
                    alt={studio.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${studio.color} opacity-60`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-display font-bold text-white mb-1">
                      {studio.name}
                    </h3>
                    <p className="text-white/90 text-sm">{studio.subtitle}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Music className="w-4 h-4 text-primary-500" />
                      </div>
                      <span className="text-soft-charcoal">{studio.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-secondary-500" />
                      <span className="text-soft-charcoal">{studio.capacity}</span>
                    </div>
                  </div>

                  <div className="py-4 border-y border-charcoal/10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal">
                          Heures pleines
                        </span>
                        <span className="text-2xl md:text-3xl font-display font-bold text-charcoal">
                          {studio.pricePeak}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal">
                          Heures creuses
                        </span>
                        <span className="text-xl md:text-2xl font-display font-bold text-secondary-500">
                          {studio.priceOffPeak}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {studio.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="flex items-center gap-2 text-sm text-soft-charcoal"
                      >
                        <Check className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.a
                    href={BOOKING_URL}
                    className={`mt-auto w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${studio.color} text-white font-semibold font-nav rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <span>Réserver</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-soft-charcoal mb-4">
            Besoin d&apos;aide pour choisir ?
          </p>
          <a
            href={`${BASE_PATH}/contact`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary-500 text-primary-500 font-semibold font-nav rounded-full shadow-md hover:bg-primary-500 hover:text-white transition-colors hover:scale-[1.05] active:scale-[0.95]"
          >
            Contactez-nous
          </a>
        </motion.div>
      </div>
    </section>
  );
}
