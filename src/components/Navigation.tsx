"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { BOOKING_URL, BASE_PATH, HOME_URL } from "@/lib/constants";

/** Pages with a dark hero — navbar starts transparent, glass on scroll. */
function hasHeroOverlay(pathname: string): boolean {
  return pathname === HOME_URL || pathname === `${BASE_PATH}/preview`;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === HOME_URL) return pathname === HOME_URL;
  return pathname === href;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const onHeroPage = hasHeroOverlay(pathname);
  const glassActive = isScrolled || !onHeroPage;

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 24);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Accueil", href: HOME_URL },
    { name: "Studios", href: `${BASE_PATH}/studios` },
    { name: "À Propos", href: `${BASE_PATH}/about` },
    { name: "Contact", href: `${BASE_PATH}/contact` },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ease-out",
        glassActive ? "nav-glass" : "nav-glass-dark"
      )}
    >
      <div className="max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="flex items-center justify-between h-20">
          <Link href={HOME_URL} className="flex items-center">
            <Logo
              size="md"
              variant={glassActive ? "default" : "white"}
              priority
              className="cursor-interactive"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                scroll={item.href === HOME_URL}
                className={cn(
                  "relative px-4 lg:px-5 py-2.5 font-nav font-medium cursor-interactive transition-all duration-200 group rounded-xl",
                  glassActive
                    ? "hover:bg-white/50 hover:shadow-sm"
                    : "hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "block transition-colors duration-200",
                    glassActive
                      ? isNavActive(pathname, item.href)
                        ? "text-primary-600"
                        : "text-soft-charcoal group-hover:text-charcoal"
                      : isNavActive(pathname, item.href)
                        ? "text-white"
                        : "text-white/90 group-hover:text-white"
                  )}
                >
                  {item.name}
                </span>
                {isNavActive(pathname, item.href) && (
                  <div
                    className={cn(
                      "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                      glassActive ? "bg-primary-500" : "bg-white"
                    )}
                  />
                )}
              </Link>
            ))}

            <a href={BOOKING_URL} className="ml-4 group/btn">
              <span
                className="relative inline-flex items-center justify-center gap-2 px-6 py-3 font-nav font-bold text-white rounded-full overflow-hidden cursor-pointer border transition-transform hover:scale-[1.04] active:scale-[0.97]"
                style={{
                  background: glassActive
                    ? "linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 100%)"
                    : "linear-gradient(135deg, #2A9D8F 0%, #1E3A5F 100%)",
                  borderColor: glassActive
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.2)",
                  boxShadow: glassActive
                    ? "0 6px 20px rgba(30, 58, 95, 0.25)"
                    : "0 4px 14px rgba(0,0,0,0.3)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Réserver
                  <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                    →
                  </span>
                </span>
              </span>
            </a>
          </div>

          <button
            type="button"
            className={cn(
              "md:hidden w-11 h-11 flex items-center justify-center rounded-full border cursor-interactive transition-all hover:scale-105 active:scale-90",
              glassActive
                ? "bg-white/60 border-white/80 shadow-sm backdrop-blur-md"
                : "bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-md"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X
                className={cn(
                  "w-5 h-5",
                  glassActive ? "text-charcoal" : "text-white"
                )}
              />
            ) : (
              <Menu
                className={cn(
                  "w-5 h-5",
                  glassActive ? "text-charcoal" : "text-white"
                )}
              />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden nav-glass-menu animate-fade-in">
          <div className="px-4 sm:px-6 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                scroll={item.href === HOME_URL}
                className={cn(
                  "block px-4 py-3 text-base rounded-xl transition-all cursor-interactive font-nav font-medium",
                  isNavActive(pathname, item.href)
                    ? "text-primary-600 bg-white/70 shadow-sm"
                    : "text-soft-charcoal hover:text-charcoal hover:bg-white/50"
                )}
              >
                {item.name}
              </Link>
            ))}

            <a
              href={BOOKING_URL}
              onClick={() => setIsOpen(false)}
              className="block text-center px-6 py-4 text-white font-nav font-bold rounded-2xl cursor-interactive shadow-md mt-4"
              style={{
                background: "linear-gradient(135deg, #1E3A5F 0%, #2A9D8F 100%)",
              }}
            >
              Réserver
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
