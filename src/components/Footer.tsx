"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import Logo from "./Logo";
import {
  BASE_PATH,
  BOOKING_URL,
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  HOME_URL,
  INSTAGRAM_URL,
} from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-charcoal via-charcoal to-charcoal/95 text-cream py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Static background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl opacity-15" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl opacity-15" />
      
      <div className="relative z-10 max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-3 sm:mb-4">
              <Link href={HOME_URL}>
                <Logo size="lg" variant="white" />
              </Link>
            </div>
            <p className="text-base text-cream/85 mb-4 sm:mb-6 leading-relaxed">
              Location de studios de danse à l&apos;heure à Casablanca — pour
              cours privés, répétitions et ateliers.
            </p>
            
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RJ Studio sur Instagram"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-cream/90 hover:text-white hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Liens Rapides</h4>
            <ul className="space-y-3">
              {[
                { name: "Réserver", href: BOOKING_URL },
                { name: "Studios", href: `${BASE_PATH}/studios` },
                { name: "À propos", href: `${BASE_PATH}/about` },
                { name: "Contact", href: `${BASE_PATH}/contact` },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/85 hover:text-white transition-colors text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services — location à l'heure (pas de cours fixes) */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Location
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Réservation en ligne", href: BOOKING_URL },
                { name: "Tarifs & espaces", href: `${BASE_PATH}/studios` },
                { name: "Cours privés & répétitions", href: `${BASE_PATH}/studios` },
                { name: "Ateliers & événements", href: `${BASE_PATH}/studios` },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/85 hover:text-white transition-colors text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Contactez-nous</h4>
            <ul className="space-y-2 sm:space-y-3 text-base text-cream/85 leading-relaxed">
              <li>{CONTACT_ADDRESS}</li>
              <li><a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-white transition-colors">{CONTACT_PHONE_DISPLAY}</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">{CONTACT_EMAIL}</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar - Copyright & Made by Smarty */}
        <div className="pt-10 border-t border-cream/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-cream/90 text-base text-center md:text-left font-medium">
            © 2026 RJ Studio. Tous droits réservés.
          </p>
          
          <p className="text-cream/90 text-base text-center md:text-left font-medium tracking-wide">
            Made by{" "}
            <a
              href="https://smarty.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-signature font-bold text-white text-xl md:text-2xl hover:text-secondary-400 transition-colors underline underline-offset-2 decoration-white/50 hover:decoration-white"
            >
              Smarty
            </a>
          </p>
          
          <div className="flex gap-6 text-base">
            <Link
              href={`${BASE_PATH}/mentions-legales`}
              className="text-cream/80 hover:text-white transition-colors font-medium"
            >
              Mentions légales
            </Link>
            <Link
              href={`${BASE_PATH}/cgu`}
              className="text-cream/80 hover:text-white transition-colors font-medium"
            >
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

