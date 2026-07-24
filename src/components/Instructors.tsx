"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Award, Heart, Star } from "lucide-react";
import { instructors } from "@/data/instructors";
import { useRef } from "react";
import { BASE_PATH, BOOKING_URL } from "@/lib/constants";

export default function Instructors() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  return (
    <section
      ref={containerRef}
      id="instructors"
      className="relative pt-[88px] sm:pt-[96px] md:pt-[104px] pb-12 sm:pb-16 md:pb-20 lg:pb-24 overflow-hidden"
    >
      {/* Smooth gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream" />
      
      {/* Animated overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-secondary-500/3 via-transparent to-primary-500/3"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Smooth Parallax Backgrounds */}
      <motion.div
        className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-secondary-500/6 to-transparent blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-40 left-10 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary-500/6 to-transparent blur-3xl"
        style={{ y: y2 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary-500/4 to-transparent blur-3xl"
        style={{ y: y3 }}
      />
      
      <div className="relative z-10 max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Floating Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm mb-6 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #1E3A5F, #2A9D8F)',
              color: '#ffffff'
            }}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(30, 58, 95, 0.4)" }}
          >
            <Star className="w-4 h-4 fill-white text-white" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Professeurs & Artistes</span>
            <Star className="w-4 h-4 fill-white text-white" style={{ color: '#ffffff' }} />
          </motion.div>
          
          {/* Main Heading with animated gradient */}
          <div className="relative inline-block mb-6">
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-charcoal">Des professionnels</span>
              <br />
              <span className="relative inline-block">
                <span className="text-secondary-500">indépendants</span>
                {/* Animated underline */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </motion.h2>
          </div>
          
          {/* Description */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-soft-charcoal max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            RJ Studio met ses espaces à disposition de professeurs, coachs et artistes indépendants.
            <span className="block mt-2 text-secondary-500 font-medium">Chacun organise ses propres cours, ateliers et répétitions en toute autonomie.</span>
          </motion.p>
        </motion.div>
        
        {/* Instructors Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[240px]">
          {instructors.map((instructor, index) => {
            // Bento grid layout pattern - varying sizes
            const isLarge = index === 0 || index === 3;
            const isTall = index === 1 || index === 6;
            const gridClass = isLarge 
              ? "lg:col-span-7 lg:row-span-2" 
              : isTall 
              ? "lg:col-span-5 lg:row-span-2"
              : "lg:col-span-4";
            
            return (
              <motion.div
                key={instructor.id}
                className={`group relative ${gridClass}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className="relative h-full rounded-4xl overflow-hidden shadow-skeu-md"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Background Image/Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-secondary-500/30 to-primary-500/40">
                    {/* Animated gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-secondary-500/20 to-primary-500/20"
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  
                  {/* Glassmorphic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/60 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                    {/* Experience Badge */}
                    {instructor.yearsExperience > 0 && (
                      <motion.div
                        className="absolute top-4 right-4 px-4 py-2 rounded-full shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #1E3A5F, #2A9D8F)',
                          color: '#ffffff'
                        }}
                        whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 8px 20px rgba(30, 58, 95, 0.4)" }}
                      >
                        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#ffffff' }}>
                          <Award className="w-4 h-4 text-white fill-white" style={{ color: '#ffffff' }} />
                          <span style={{ color: '#ffffff', fontWeight: 700 }}>{instructor.yearsExperience} ans</span>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Decorative element */}
                    <motion.div
                      className="absolute top-8 left-8 w-16 h-16 rounded-full bg-primary-500/20 blur-2xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    
                    {/* Name & Title */}
                    <div className="space-y-2 mb-4">
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-cream group-hover:text-white transition-colors">
                        {instructor.name}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-primary-500 font-semibold">
                        {instructor.title}
                      </p>
                    </div>
                    
                    {/* Bio - only show on larger cards */}
                    {(isLarge || isTall) && (
                      <p className="text-sm text-cream/80 leading-relaxed mb-4 line-clamp-3">
                        {instructor.bio}
                      </p>
                    )}
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {instructor.specialties.slice(0, isLarge || isTall ? 3 : 2).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9), rgba(42, 157, 143, 0.9))',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-secondary-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />
                  
                  {/* Border glow on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-4xl ring-2 ring-primary-500/0 group-hover:ring-primary-500/50 transition-all duration-300"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* CTA Section - Modern Design */}
        <motion.div
          className="mt-16 sm:mt-20 md:mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative max-w-5xl 2xl:max-w-6xl mx-auto rounded-5xl overflow-hidden shadow-2xl">
            {/* Beautiful vibrant gradient background */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 50%, #1E3A5F 100%)',
              backgroundSize: '200% 200%'
            }}>
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 50%, #1E3A5F 100%)',
                  backgroundSize: '200% 200%'
                }}
              />
              {/* Animated overlay layers */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(45deg, rgba(30, 58, 95, 0.6), rgba(42, 157, 143, 0.6))'
                }}
                animate={{ 
                  opacity: [0.6, 0.85, 0.6],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(225deg, rgba(231, 111, 81, 0.2), rgba(30, 58, 95, 0.3))'
                }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
            
            {/* Beautiful decorative elements with vibrant colors */}
            <motion.div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(231, 111, 81, 0.25)' }}
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(42, 157, 143, 0.25)' }}
              animate={{ 
                scale: [1.2, 1, 1.2],
                x: [0, -30, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(30, 58, 95, 0.2)' }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Content */}
            <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20 text-center">
              {/* Beautiful animated icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/30 backdrop-blur-md mb-6 sm:mb-8 shadow-lg"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.15, rotate: 360 }}
              >
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-accent-500 fill-accent-500" />
              </motion.div>
              
              {/* Text container with beautiful styling */}
              <div className="relative mb-8 sm:mb-10">
                {/* Elegant background glow */}
                <motion.div 
                  className="absolute inset-0 -mx-16 -my-8 bg-white/10 rounded-3xl blur-2xl"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <motion.h3 
                  className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white mb-4 sm:mb-6 leading-tight" 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  style={{ 
                    textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,1)',
                    color: '#ffffff',
                    fontWeight: 900,
                    letterSpacing: '-0.03em'
                  }}
                >
                  Envie de commencer ?
                  <motion.span 
                    className="block text-white"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,1)'
                    }}
                  >
                    Prêt à réserver ?
                  </motion.span>
                </motion.h3>
                
                <motion.p 
                  className="relative text-lg sm:text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed font-semibold" 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ 
                    textShadow: '0 3px 15px rgba(0,0,0,0.7), 0 1px 5px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  Louez un studio ou consultez le planning des cours proposés par nos partenaires.
                </motion.p>
              </div>
              
              {/* Beautiful buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.a
                  href={BOOKING_URL}
                  className="group relative w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-full overflow-hidden shadow-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #2A9D8F, #1E3A5F)',
                    color: '#ffffff'
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -4,
                    boxShadow: "0 25px 50px rgba(42, 157, 143, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2" style={{ color: '#ffffff', fontWeight: 700 }}>
                    Réserver
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ color: '#ffffff' }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent-500 to-secondary-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white" style={{ color: '#ffffff', fontWeight: 700 }}>
                    Réserver
                    <span style={{ color: '#ffffff' }}>→</span>
                  </span>
                </motion.a>
                
                <motion.a
                  href={`${BASE_PATH}/classes`}
                  className="group w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-full border-2 backdrop-blur-md transition-all"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: '#1E3A5F',
                    textShadow: 'none'
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -4,
                    backgroundColor: "rgba(255,255,255,1)",
                    borderColor: "rgba(255,255,255,1)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir les disciplines
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

