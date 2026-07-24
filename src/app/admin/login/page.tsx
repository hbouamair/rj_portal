"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Login via our API (server → Supabase). The browser must not call
      // supabase.co directly — corporate networks often reset that connection.
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });

      let result: { ok?: boolean; error?: string } = {};
      try {
        result = await res.json();
      } catch {
        setError("Réponse serveur invalide. Vérifiez que le serveur tourne.");
        setLoading(false);
        return;
      }

      if (!res.ok || !result.ok) {
        setError(result.error ?? "Connexion impossible.");
        setLoading(false);
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
      setLoading(false);
    }
  }

  return (
    <main className="admin-shell min-h-screen grid lg:grid-cols-2">
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14 text-white bg-gradient-to-br from-primary-700 via-primary-500 to-secondary-600">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 42%), radial-gradient(circle at 80% 70%, rgba(42,157,143,0.45), transparent 45%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full border border-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-24 -left-10 w-56 h-56 rounded-full border border-white/10"
          aria-hidden
        />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group cursor-pointer"
          >
            <span className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-display font-bold text-sm border border-white/20">
              RJ
            </span>
            <span>
              <span className="block font-display font-bold text-lg leading-tight">
                RJ Studio
              </span>
              <span className="block text-xs text-white/70 tracking-wide">
                Casablanca
              </span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-4"
          >
            Console privée
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display font-bold text-4xl xl:text-5xl leading-[1.1] tracking-tight"
          >
            Gérez vos studios en toute fluidité.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 text-base text-white/80 leading-relaxed"
          >
            Réservations, tarifs, horaires et revenus — un seul espace pour
            piloter RJ Studio au quotidien.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-10 space-y-3"
          >
            {[
              "Confirmez les paiements en un clic",
              "Suivez l'agenda semaine par semaine",
              "Ajustez les tarifs heures pleines / creuses",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <p className="relative z-10 text-xs text-white/55">
          Accès réservé à l&apos;équipe RJ Studio
        </p>
      </section>

      <section className="relative flex items-center justify-center px-4 py-12 sm:px-8 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-secondary-500/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-lg shadow-secondary-500/25">
                RJ
              </span>
              <span className="font-display font-bold text-white text-lg">
                RJ Studio
              </span>
            </div>
          </div>

          <div className="admin-card p-7 sm:p-9">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/10 text-teal-300 flex items-center justify-center mb-5 border border-teal-400/25">
                <Lock className="w-5 h-5" aria-hidden />
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Connexion
              </h2>
              <p className="text-sm text-white/45 mt-2 leading-relaxed">
                Entrez vos identifiants administrateur pour ouvrir la console.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="admin-input pl-11 min-h-12 disabled:opacity-60"
                    placeholder="admin@rjstudio.ma"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
                    aria-hidden
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="admin-input pl-11 pr-12 min-h-12 disabled:opacity-60"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-10 min-h-10 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="text-sm font-semibold text-rose-300 bg-rose-400/10 border border-rose-400/25 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="admin-btn-primary w-full min-h-12 text-base group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    Accéder à la console
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.07] flex items-center justify-between gap-4">
              <p className="text-xs text-white/35 leading-relaxed">
                Compte créé dans Supabase Auth avec confirmation auto.
              </p>
              <Link
                href="/"
                className="text-xs font-semibold text-teal-300 hover:text-teal-200 whitespace-nowrap cursor-pointer transition-colors duration-200"
              >
                ← Site public
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
