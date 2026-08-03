"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  Music,
  Settings,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Réservations", icon: CalendarDays, hint: "Calendrier & liste" },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3, hint: "Taux & occupation" },
  { href: "/admin/studios", label: "Studios", icon: Music, hint: "Tarifs & salles" },
  { href: "/admin/promo-codes", label: "Codes promo", icon: Tag, hint: "Réductions clients" },
  { href: "/admin/income", label: "Revenus", icon: TrendingUp, hint: "Chiffre d'affaires" },
  { href: "/admin/content", label: "Contenu site", icon: FileText, hint: "Contact & à propos" },
  { href: "/admin/settings", label: "Paramètres", icon: Settings, hint: "Horaires & paiements" },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // ignore — still leave the page
    }
    window.location.href = "/admin/login";
  }

  const initials = userEmail
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const nav = (
    <nav className="flex flex-col h-full" aria-label="Navigation admin">
      <div className="px-5 pt-6 pb-5">
        <Link href="/admin" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-600 border border-teal-300/30 flex items-center justify-center shadow-lg shadow-secondary-500/20 shrink-0">
            <span className="text-white font-display font-bold text-sm">RJ</span>
          </div>
          <div className="min-w-0">
            <span className="block text-base font-display font-bold text-white leading-tight group-hover:text-teal-300 transition-colors duration-200">
              RJ Studio
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300/60 mt-0.5">
              La régie
            </span>
          </div>
        </Link>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />

      <div className="px-3 mt-4 mb-2">
        <div className="space-y-1">
          {LINKS.map(({ href, label, icon: Icon, hint }) => {
            const active =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`admin-sidebar-link relative ${
                  active
                    ? "bg-white/[0.07] text-white border border-teal-300/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-white/50 border border-transparent hover:bg-white/[0.04] hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.8)]"
                    aria-hidden
                  />
                )}
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? "bg-teal-400/15 text-teal-300" : "bg-white/[0.05]"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block leading-tight">{label}</span>
                  <span
                    className={`block text-xs font-medium mt-0.5 truncate ${
                      active ? "text-white/50" : "text-white/30"
                    }`}
                  >
                    {hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-2.5 py-2.5 mb-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center text-xs font-bold text-white shrink-0"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white/85 truncate">{userEmail}</p>
            <p className="text-[11px] text-white/35">Administrateur</p>
          </div>
          <span
            className="w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)] shrink-0"
            title="Connecté"
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={logout}
          className="admin-sidebar-link w-full text-rose-300/80 hover:bg-rose-400/10 hover:text-rose-200"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-400/10 shrink-0">
            <LogOut className="w-4 h-4" aria-hidden />
          </span>
          Se déconnecter
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 admin-card-soft rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">RJ</span>
          </div>
          <span className="font-display font-bold text-white text-sm">La régie</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white cursor-pointer"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 pt-14"
          style={{ backgroundColor: "#0a0d14" }}
        >
          {nav}
        </div>
      )}

      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-72 z-30 m-3 rounded-3xl admin-card-soft overflow-hidden">
        {nav}
      </aside>
    </>
  );
}
