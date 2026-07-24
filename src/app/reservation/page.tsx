import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import SupabaseLoadError from "@/components/SupabaseLoadError";
import { fetchActiveStudios, fetchSettings } from "@/lib/booking/db";

export const metadata: Metadata = {
  title: "Réserver un studio | RJ Studio",
  description:
    "Réservez votre studio de danse à Casablanca : choisissez votre studio, votre date, votre horaire et payez par PayPal, virement bancaire ou en espèces.",
};

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  let studios: Awaited<ReturnType<typeof fetchActiveStudios>> = [];
  let settings: Awaited<ReturnType<typeof fetchSettings>> | null = null;
  let error: string | null = null;

  try {
    [studios, settings] = await Promise.all([
      fetchActiveStudios(),
      fetchSettings(),
    ]);
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Impossible de charger les studios pour le moment.";
  }

  return (
    <>
      <Navigation />
      <main className="book-shell pt-28 md:pt-32 pb-24 overflow-hidden">
        <div
          className="pointer-events-none absolute top-32 right-0 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-20 left-0 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl"
          aria-hidden
        />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <header className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-charcoal/5 text-[11px] font-bold uppercase tracking-[0.16em] text-soft-charcoal mb-5 shadow-sm">
              Réservation en ligne
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal tracking-tight mb-4">
              Réservez votre{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                studio
              </span>
            </h1>
            <p className="text-base md:text-lg text-soft-charcoal leading-relaxed">
              Choisissez le studio, la date et la durée — le prix se calcule
              automatiquement selon les heures pleines et creuses.
            </p>
          </header>

          {error || !settings ? (
            <SupabaseLoadError
              title="Réservation indisponible"
              message={
                error ??
                "Le système de réservation n'est pas encore prêt. Réessayez dans un instant."
              }
            />
          ) : (
            <BookingWizard studios={studios} settings={settings} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
