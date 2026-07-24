"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  OPENING_HOURS_DISPLAY,
} from "@/lib/constants";

const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent("rue biranzarane casablanca")}&output=embed`;

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormState("error");
        setErrorMessage(data.error || "Une erreur s'est produite. Réessayez.");
        return;
      }
      setFormState("sent");
      form.reset();
    } catch {
      setFormState("error");
      setErrorMessage("Problème de connexion. Réessayez plus tard.");
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen pt-[88px] sm:pt-[96px] md:pt-[104px] pb-16 md:pb-24 overflow-hidden font-body"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(30,58,95,0.06),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500 mb-3 font-nav">
            Contact
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-charcoal tracking-tight">
            Venez nous voir
          </h1>
          <p className="mt-4 text-lg text-soft-charcoal max-w-2xl mx-auto font-body">
            Rue Biranzarane, Casablanca — Réservez ou posez vos questions.
          </p>
        </motion.div>

        {/* Map + Form grid — 2026 layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Map block */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10 ring-1 ring-black/5 h-[320px] sm:h-[380px] lg:h-full min-h-[320px]">
              <iframe
                src={GOOGLE_MAPS_EMBED}
                title="RJ Studio - Rue Biranzarane, Casablanca"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Map marker pin — centered overlay */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 flex flex-col items-center"
                aria-hidden
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Pulse ring under pin */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-500/40 animate-ping" style={{ animationDuration: "2s" }} />
                  <MapPin
                    className="w-12 h-12 sm:w-14 sm:h-14 text-primary-500 relative z-10"
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))" }}
                  />
                </motion.div>
              </div>
              {/* Glass address bar over map */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 text-white flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                    <p className="text-xs font-medium text-white/80 uppercase tracking-wider font-nav">Adresse</p>
                    <p className="font-semibold font-body">{CONTACT_ADDRESS}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("rue biranzarane casablanca")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white/90 hover:text-white underline underline-offset-2 font-body"
                  >
                    Ouvrir dans Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form block — 2026 glass card */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="relative rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden border border-black/5 shadow-xl shadow-black/5"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(253,251,247,0.98) 100%)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/8 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary-500/8 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-1">
                  Envoyez un message
                </h2>
                <p className="text-soft-charcoal text-sm sm:text-base mb-6 font-body">
                  Réponse sous 24h en général.
                </p>

                {formState === "sent" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center rounded-2xl bg-secondary-500/10 border border-secondary-500/20"
                  >
                    <p className="text-lg font-semibold text-charcoal font-body">Message envoyé</p>
                    <p className="text-sm text-soft-charcoal mt-1 font-body">Nous vous recontacterons rapidement.</p>
                  </motion.div>
                ) : formState === "error" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-6 px-6 rounded-2xl bg-red-50 border border-red-200"
                  >
                    <p className="text-sm font-semibold text-red-800 font-body">Échec de l&apos;envoi</p>
                    <p className="text-sm text-red-700 mt-1 font-body">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => { setFormState("idle"); setErrorMessage(""); }}
                      className="mt-4 text-sm font-medium text-primary-500 hover:text-primary-600 font-nav"
                    >
                      Réessayer
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group relative"
                      >
                        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2 group-focus-within:text-primary-500 transition-colors font-nav">
                          Nom
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Votre nom"
                          className="contact-input w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white/70 backdrop-blur-sm text-charcoal placeholder:text-soft-charcoal/50 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,58,95,0.08)] outline-none transition-all duration-300 font-body"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="group relative"
                      >
                        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2 group-focus-within:text-primary-500 transition-colors font-nav">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="vous@exemple.com"
                          className="contact-input w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white/70 backdrop-blur-sm text-charcoal placeholder:text-soft-charcoal/50 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,58,95,0.08)] outline-none transition-all duration-300 font-body"
                        />
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="group relative"
                    >
                      <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2 group-focus-within:text-primary-500 transition-colors font-nav">
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={CONTACT_PHONE_DISPLAY}
                        className="contact-input w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white/70 backdrop-blur-sm text-charcoal placeholder:text-soft-charcoal/50 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,58,95,0.08)] outline-none transition-all duration-300 font-body"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="group relative"
                    >
                      <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-2 group-focus-within:text-primary-500 transition-colors font-nav">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        placeholder="Décrivez votre demande..."
                        className="contact-input w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white/70 backdrop-blur-sm text-charcoal placeholder:text-soft-charcoal/50 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(30,58,95,0.08)] outline-none transition-all duration-300 resize-none min-h-[120px] font-body"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-2"
                    >
                      <motion.button
                        type="submit"
                        disabled={formState === "sending"}
                        className="group/btn relative w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white overflow-hidden disabled:opacity-70 font-nav"
                        style={{
                          background: "linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 100%)",
                          boxShadow: "0 4px 14px rgba(30, 58, 95, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 12px 32px rgba(42, 157, 143, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {formState === "sending" ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              Envoyer le message
                              <Send className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                            </>
                          )}
                        </span>
                        {/* 2026 shine on hover */}
                        <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-[200%] transition-transform duration-700 ease-out" style={{ width: "50%" }} />
                      </motion.button>
                    </motion.div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact infos — compact strip */}
        <motion.div
          className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: MapPin, label: "Adresse", value: CONTACT_ADDRESS },
            { icon: Phone, label: "Téléphone", value: CONTACT_PHONE_DISPLAY },
            { icon: Mail, label: "Email", value: CONTACT_EMAIL },
            { icon: Clock, label: "Horaires", value: OPENING_HOURS_DISPLAY },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl p-4 bg-white/60 backdrop-blur-sm border border-black/5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal font-nav">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-charcoal truncate font-body">{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
