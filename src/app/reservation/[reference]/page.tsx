import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
  XCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { expireStalePendingBookings, fetchSettings } from "@/lib/booking/db";
import type { BookingWithStudio } from "@/lib/booking/types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/booking/types";
import {
  formatDurationLabel,
  formatMad,
  minutesToTimeString,
} from "@/lib/booking/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suivi de réservation | RJ Studio",
  robots: { index: false, follow: false },
};

function formatDateFr(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDeadlineFr(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  pending: {
    badge: "bg-amber-100 text-amber-800",
    icon: <Hourglass className="w-5 h-5" />,
  },
  confirmed: {
    badge: "bg-emerald-100 text-emerald-800",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  completed: {
    badge: "bg-primary-100 text-primary-700",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  cancelled: {
    badge: "bg-red-100 text-red-700",
    icon: <XCircle className="w-5 h-5" />,
  },
  expired: {
    badge: "bg-red-100 text-red-700",
    icon: <XCircle className="w-5 h-5" />,
  },
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
  const status = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
  const endMinutes = booking.start_minutes + booking.duration_minutes;

  const paymentIcon =
    booking.payment_method === "paypal" ? (
      <CreditCard className="w-4 h-4" />
    ) : booking.payment_method === "virement" ? (
      <Building2 className="w-4 h-4" />
    ) : (
      <Banknote className="w-4 h-4" />
    );

  return (
    <>
      <Navigation />
      <main className="relative min-h-screen bg-cream pt-28 md:pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="skeu-card p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-soft-charcoal mb-1">
                    Réservation
                  </p>
                  <h1 className="text-3xl font-display font-bold text-charcoal tracking-wide">
                    {booking.reference}
                  </h1>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${status.badge}`}
                >
                  {status.icon}
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </div>

              <div className="space-y-4 border-t border-charcoal/10 pt-6">
                <div className="flex items-center gap-3 text-charcoal">
                  <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="capitalize font-semibold">
                    {formatDateFr(booking.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-charcoal">
                  <Clock className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                  <span className="font-semibold">
                    {minutesToTimeString(booking.start_minutes)} –{" "}
                    {minutesToTimeString(endMinutes)} (
                    {formatDurationLabel(booking.duration_minutes)})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-charcoal">
                  {paymentIcon}
                  <span className="font-semibold">
                    {PAYMENT_METHOD_LABELS[booking.payment_method]}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-charcoal/10 pt-4">
                  <span className="text-soft-charcoal">
                    {booking.studios?.name ?? "Studio"} · Total
                  </span>
                  <span className="text-2xl font-display font-bold text-charcoal">
                    {formatMad(Number(booking.total_price_mad))}
                  </span>
                </div>
              </div>
            </div>

            {booking.status === "pending" && (
              <div className="skeu-card p-6 border-l-4 border-accent-500">
                <h2 className="font-display font-bold text-charcoal mb-3">
                  Comment confirmer votre réservation
                </h2>
                <div className="text-sm text-soft-charcoal leading-relaxed space-y-3">
                  {booking.payment_method === "paypal" && (
                    <p>
                      Envoyez le montant total via PayPal à{" "}
                      <strong className="text-charcoal">
                        {settings.paypal_link ?? settings.paypal_email}
                      </strong>{" "}
                      en indiquant la référence{" "}
                      <strong className="text-charcoal">{booking.reference}</strong>.
                    </p>
                  )}
                  {booking.payment_method === "virement" && (
                    <>
                      <p>
                        Effectuez un virement bancaire avec la référence{" "}
                        <strong className="text-charcoal">{booking.reference}</strong>{" "}
                        en motif :
                      </p>
                      <pre className="whitespace-pre-wrap bg-cream rounded-xl p-4 text-charcoal">
                        {settings.bank_details}
                      </pre>
                    </>
                  )}
                  {booking.payment_method === "cash" && (
                    <p>
                      Passez régler votre réservation en espèces au studio (Rue
                      Biranzarane, Casablanca) avant la date limite.
                    </p>
                  )}
                  <p className="font-semibold text-accent-600">
                    Date limite : {formatDeadlineFr(booking.payment_deadline)}.
                    Passé ce délai, la réservation sera automatiquement annulée.
                  </p>
                </div>
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="skeu-card p-6 border-l-4 border-secondary-500">
                <p className="text-sm text-charcoal leading-relaxed">
                  Votre paiement a bien été reçu — votre réservation est
                  confirmée. Nous vous attendons au studio, Rue Biranzarane,
                  Casablanca. À très bientôt !
                </p>
              </div>
            )}

            {(booking.status === "cancelled" || booking.status === "expired") && (
              <div className="skeu-card p-6 border-l-4 border-red-400">
                <p className="text-sm text-charcoal leading-relaxed">
                  {booking.status === "expired"
                    ? "Cette réservation a expiré car le paiement n'a pas été reçu dans les délais. Le créneau a été libéré."
                    : "Cette réservation a été annulée."}{" "}
                  Vous pouvez effectuer une nouvelle réservation à tout moment.
                </p>
                <Link
                  href="/reservation"
                  className="inline-block mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold font-nav shadow-md hover:shadow-lg transition-all"
                >
                  Nouvelle réservation
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
