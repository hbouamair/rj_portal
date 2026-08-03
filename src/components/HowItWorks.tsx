"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, CreditCard, Sparkles } from "lucide-react";
import { BOOKING_URL } from "@/lib/constants";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Calendar,
      title: "Je choisis un studio",
      description: "Sélectionnez parmi nos studios disponibles et équipés"
    },
    {
      number: "2",
      icon: Clock,
      title: "Je choisis une date et un horaire",
      description: "Choisissez le créneau qui vous convient le mieux"
    },
    {
      number: "3",
      icon: CreditCard,
      title: "Je choisis mon offre et paye en ligne",
      description: "Paiement sécurisé, confirmation immédiate par email"
    }
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Gradient background — CSS animation instead of JS */}
      <div
        className="absolute inset-0 animate-gradient-slow"
        style={{
          background: "linear-gradient(135deg, #2A9D8F 0%, #1E3A5F 50%, #2A9D8F 100%)",
        }}
      />

      {/* Static background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10 max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        {/* Modern Header */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-md mb-4 sm:mb-5 bg-white/15 border border-white/30"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Processus Simple</span>
          </motion.div>
          
          {/* Title */}
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-4 sm:mb-5 px-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span
              className="text-white block"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)" }}
            >
              COMMENT
            </span>
            <span className="relative inline-block mt-1">
              <span
                className="text-[#F2E7AF]"
                style={{ textShadow: "0 4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)" }}
              >
                ÇA MARCHE
              </span>
              <motion.div
                className="absolute -bottom-3 left-0 right-0 h-1.5 bg-warm-gold rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Trois étapes simples pour réserver votre studio en quelques minutes
          </motion.p>
        </motion.div>
        
        {/* Modern Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl 2xl:max-w-7xl mx-auto relative items-stretch">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-white/20 via-white/40 to-white/20 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.8 }}
            />
          </div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative z-10"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4 + index * 0.2,
                type: "spring",
                stiffness: 100
              }}
            >
              {/* Step Card with Glassmorphism */}
              <motion.div
                className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/20 shadow-2xl h-full flex flex-col transition-transform hover:-translate-y-3 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-40" />

                <div className="relative mb-4 sm:mb-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center mx-auto shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500" />
                    <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-white flex items-center justify-center">
                      <span
                        className="text-2xl sm:text-3xl font-black"
                        style={{
                          color: "#1E3A5F",
                          fontWeight: 900,
                        }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>

                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative text-center flex-1 flex flex-col justify-center">
                  <motion.h3 
                    className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center"
                    style={{
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
              </motion.div>
              
              {/* Arrow connector (desktop only, between steps) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 z-20">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* CTA Section */}
        <motion.div
          className="text-center mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <a
            href={BOOKING_URL}
            className="group relative inline-flex px-8 sm:px-10 py-4 sm:py-5 bg-white text-primary-700 font-bold rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.05] active:scale-[0.95]"
            style={{
              color: "#1E3A5F",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Commencer Maintenant
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
