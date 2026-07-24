"use client";

import { motion } from "framer-motion";
import { Music, Users, Sparkles, Check, ArrowRight } from "lucide-react";
import { BOOKING_URL } from "@/lib/constants";
import { useState } from "react";

interface StudioPlan {
  id: string;
  name: string;
  subtitle: string;
  pricePeak: string;
  priceOffPeak: string;
  size?: string;
  capacity?: string;
  offer: string;
  image: string;
  popular: boolean;
  color: string;
  features: string[];
}

const studios: StudioPlan[] = [
  {
    id: "1",
    name: "Studio 1",
    subtitle: "Idéal pour les groupes et les ateliers",
    pricePeak: "400 MAD/h",
    priceOffPeak: "300 MAD/h",
    size: "Grand - 49m²",
    capacity: "10-16 personnes",
    offer: "Forfait 10h + 1h gratuite",
    image: "/studio-image.jpg",
    popular: true,
    color: "from-primary-500 to-primary-600",
    features: ["Système son Bluetooth", "Climatisation", "Grand miroirs"]
  },
  {
    id: "2",
    name: "Studio 2",
    subtitle: "Parfait pour les cours de danse ou fitness en groupe",
    pricePeak: "300 MAD/h",
    priceOffPeak: "200 MAD/h",
    size: "Moyen - 34m²",
    capacity: "7-12 personnes",
    offer: "Forfait 10h + 1h gratuite",
    image: "/studio-image.jpg",
    popular: false,
    color: "from-secondary-500 to-secondary-600",
    features: ["Système son Bluetooth", "Climatisation", "Grand miroirs"]
  },
  {
    id: "3",
    name: "Studio 3",
    subtitle: "Parfait pour les cours privés, répétitions ou petits groupes",
    pricePeak: "250 MAD/h",
    priceOffPeak: "150 MAD/h",
    size: "Moyen - 30m²",
    capacity: "6-10 personnes",
    offer: "Forfait 10h + 1h gratuite",
    image: "/studio-image.jpg",
    popular: false,
    color: "from-accent-500 to-accent-600",
    features: ["Système son Bluetooth", "Climatisation", "Grand miroirs"]
  }
];

function StudioPlanCard({ studio, index }: { studio: StudioPlan; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
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

      <motion.div
        whileHover={{ y: -8 }}
        className={`relative skeu-card overflow-hidden ${
          studio.popular ? "ring-2 ring-accent-500 ring-offset-4 ring-offset-white" : ""
        }`}
      >
        <div className="relative h-80 sm:h-96 md:h-[28rem] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
            style={{
              backgroundImage: `url("${studio.image}")`,
              transform: hovered ? "scale(1.1)" : "scale(1)"
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${studio.color} opacity-60`} />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">
              {studio.name}
            </h3>
            <p className="text-white/90 text-base sm:text-lg">{studio.subtitle}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {studio.size && studio.capacity && (
            <div className="flex items-center justify-between text-base sm:text-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-soft-charcoal font-medium">{studio.size}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary-500" />
                <span className="text-soft-charcoal font-medium">{studio.capacity}</span>
              </div>
            </div>
          )}

          <div className="py-5 border-y border-charcoal/10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-semibold uppercase tracking-wider text-soft-charcoal">
                  Heures pleines
                </span>
                <span className="text-3xl sm:text-4xl font-display font-bold text-charcoal">
                  {studio.pricePeak}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-semibold uppercase tracking-wider text-soft-charcoal">
                  Heures creuses
                </span>
                <span className="text-2xl sm:text-3xl font-display font-bold text-secondary-500">
                  {studio.priceOffPeak}
                </span>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-base sm:text-lg text-soft-charcoal">
              <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
              <span>{studio.offer}</span>
            </li>
            {studio.features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="flex items-center gap-3 text-base sm:text-lg text-soft-charcoal"
              >
                <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.a
            href={BOOKING_URL}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r ${studio.color} text-white font-nav`}
          >
            <span>Réserver</span>
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FlexiblePlans() {
  return (
    <section
      id="flexible-plans"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Modern gradient background with animated overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cream/30 to-white" />
      
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-20 -right-40 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 blur-3xl hidden md:block"
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-secondary-500/10 to-accent-500/10 blur-3xl hidden md:block"
        animate={{ 
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative z-10 max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        {/* Modern Header - 2026 Design */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-lg font-semibold text-sm mb-4 sm:mb-6"
            style={{
              background: 'linear-gradient(135deg, #1E3A5F, #2A9D8F)',
              color: '#ffffff'
            }}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <Sparkles className="w-4 h-4 text-white" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Nos Formules</span>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </motion.div>
          
          {/* Title with modern typography */}
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-4 sm:mb-5 px-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-charcoal">DES FORMULES</span>
            <br />
            <span className="relative inline-block">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                FLEXIBLES
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
            <br />
            <span className="text-charcoal">ADAPTÉES À VOTRE RYTHME</span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-soft-charcoal max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Choisissez la formule qui correspond à vos besoins et à votre rythme
          </motion.p>
        </motion.div>
        
        {/* Studio Cards — full width, stacked vertically */}
        <div className="grid grid-cols-1 gap-8 max-w-7xl 2xl:max-w-8xl mx-auto">
          {studios.map((studio, index) => (
            <StudioPlanCard key={studio.id} studio={studio} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
