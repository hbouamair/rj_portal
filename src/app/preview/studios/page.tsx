import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StudiosShowcase from "@/components/studios/StudiosShowcase";
import { fetchActiveStudios, fetchSettings } from "@/lib/booking/db";

export const metadata: Metadata = {
  title: "Nos studios (aperçu) | RJ Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PreviewStudiosPage() {
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
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          {error || !settings ? (
            <div className="book-card max-w-lg mx-auto p-8 text-center">
              <p className="text-sm text-soft-charcoal">{error}</p>
            </div>
          ) : (
            <StudiosShowcase studios={studios} settings={settings} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
