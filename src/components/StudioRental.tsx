"use client";

import { motion } from "framer-motion";
import { Building2, Clock, Calendar, Sparkles, ArrowRight } from "lucide-react";

export default function StudioRental() {
  return (
    <section
      id="studio-rental"
      className="relative pt-[88px] sm:pt-[96px] md:pt-[104px] pb-12 sm:pb-16 md:pb-20 lg:pb-24 overflow-hidden"
    >
      {/* Modern gradient background with animated overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cream/30 to-white" />
      
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-20 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-primary-500/8 to-secondary-500/8 blur-3xl hidden md:block"
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary-500/8 to-accent-500/8 blur-3xl hidden md:block"
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
          className="text-center mb-10 sm:mb-12"
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
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Location de Studio</span>
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
            <span className="text-charcoal">LOUEZ UN STUDIO DE DANSE</span>
            <br />
            <span className="relative inline-block">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                PROFESSIONNEL
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
            <span className="text-charcoal">SANS ENGAGEMENT</span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-soft-charcoal max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Réservez nos studios modernes et équipés pour vos cours, répétitions ou événements.
            <span className="block mt-2 text-primary-500 font-medium">Disponibilité flexible, réservation en ligne, paiement sécurisé.</span>
          </motion.p>
        </motion.div>
        
        {/* Modern Features Grid - 2026 Design */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl 2xl:max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            {
              icon: Building2,
              title: "Studios Modernes",
              description: "Équipés de miroirs, système audio et éclairage professionnel"
            },
            {
              icon: Clock,
              title: "Disponibilité Flexible",
              description: "Réservation à l'heure, demi-journée ou journée complète"
            },
            {
              icon: Calendar,
              title: "Réservation Simple",
              description: "Réservez en ligne en quelques clics, sans engagement"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/50 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -12,
                scale: 1.03,
                boxShadow: '0 25px 50px rgba(30, 58, 95, 0.2)'
              }}
              style={{ perspective: "1000px" }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
              />
              
              {/* Icon with modern design */}
              <motion.div 
                className="relative mb-5"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center relative overflow-hidden">
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20"
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 relative z-10" />
                  
                  {/* Glow effect */}
                  <motion.div
                    className="absolute -inset-4 bg-primary-500/20 rounded-full blur-xl opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-charcoal mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-soft-charcoal text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/5 to-transparent rounded-bl-full" />
              
              {/* Hover arrow indicator */}
              <motion.div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <ArrowRight className="w-5 h-5 text-primary-500" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Add keyframes for gradient animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  );
}
