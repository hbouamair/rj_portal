"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, ArrowRight } from "lucide-react";
import { DanceClass } from "@/data/types";
import { BOOKING_URL } from "@/lib/constants";

interface ClassCardProps {
  danceClass: DanceClass;
  index: number;
}

export default function ClassCard({ danceClass, index }: ClassCardProps) {
  return (
    <motion.div
      className="group relative overflow-hidden bg-white rounded-3xl border border-charcoal/5 hover:border-charcoal/10 transition-all duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      layoutId={`class-${danceClass.id}`}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl shadow-sm"
        style={{ backgroundColor: danceClass.color }}
        layoutId={`accent-${danceClass.id}`}
      />

      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${danceClass.color}05 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 p-8 h-full flex flex-col">
        <div className="mb-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-4 bg-charcoal text-white shadow-sm"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {danceClass.style}
          </motion.div>

          <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-3 leading-tight group-hover:text-primary-500 transition-colors">
            {danceClass.title}
          </h3>

          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
            {danceClass.description}
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-charcoal/15 to-transparent my-6" />

        <div className="space-y-4 mb-6 flex-grow">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cream border border-charcoal/10 shadow-sm w-fit">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="font-bold text-sm text-charcoal">{danceClass.duration} min</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cream border border-charcoal/10 shadow-sm w-fit">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="font-bold text-sm text-charcoal">{danceClass.level}</span>
          </div>
        </div>

        <motion.a
          href={BOOKING_URL}
          className="w-full py-4 px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          style={{
            backgroundColor: "#1A1A1A",
            color: "#ffffff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(to right, #1E3A5F, #182E4C)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1A1A1A";
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Voir le planning
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>

      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 20px 60px ${danceClass.color}15`,
        }}
      />
    </motion.div>
  );
}
