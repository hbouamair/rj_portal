import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StudiosShowcase from "@/components/studios/StudiosShowcase";
import SupabaseLoadError from "@/components/SupabaseLoadError";
import { fetchActiveStudios, fetchSettings } from "@/lib/booking/db";

export const metadata: Metadata = {
  title: "Nos studios | RJ Studio",
  description:
    "Découvrez les trois studios de danse RJ Studio à Casablanca : tailles, tarifs heures pleines et creuses, équipements et réservation en ligne.",
};

export const dynamic = "force-dynamic";

export default async function StudiosPage() {
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
          {error || !settings ? (
            <>
              <header className="max-w-2xl mx-auto text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal tracking-tight mb-4">
                  Nos studios
                </h1>
              </header>
              <SupabaseLoadError
                message={
                  error ??
                  "Les informations des studios ne sont pas disponibles pour le moment."
                }
              />
            </>
          ) : (
            <StudiosShowcase studios={studios} settings={settings} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
