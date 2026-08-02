import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookingTrackingView from "@/components/booking/BookingTrackingView";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { expireStalePendingBookings, fetchSettings } from "@/lib/booking/db";
import type { BookingWithStudio } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suivi de réservation | RJ Studio",
  robots: { index: false, follow: false },
};

export default async function BookingTrackingPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const supabase = getSupabaseAdmin();

  await expireStalePendingBookings(supabase);

  const { data } = await supabase
    .from("bookings")
    .select("*, studios(id, name)")
    .eq("reference", decodeURIComponent(reference).toUpperCase())
    .maybeSingle();

  if (!data) notFound();
  const booking = data as BookingWithStudio;
  const settings = await fetchSettings(supabase);

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
          <BookingTrackingView booking={booking} settings={settings} />
        </div>
      </main>
      <Footer />
    </>
  );
}
