import Link from "next/link";
import {
  Clock3,
  Gauge,
  Hourglass,
  Wallet,
} from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  expireStalePendingBookings,
  fetchAllStudios,
  fetchSettings,
} from "@/lib/booking/db";
import type { BookingWithStudio } from "@/lib/booking/types";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import OccupancyStats from "@/components/admin/OccupancyStats";
import TodayPulse, { type PulseBooking } from "@/components/admin/TodayPulse";
import AdminDbError from "@/components/admin/AdminDbError";
import {
  formatMad,
  nowInStudioTime,
  openingForDate,
} from "@/lib/booking/pricing";
import {
  computeOccupancyByStudio,
  monthRange,
  overallOccupancyRate,
  weekRange,
} from "@/lib/booking/occupancy";

export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage() {
  try {
    const supabase = getSupabaseAdmin();
    await expireStalePendingBookings(supabase);

    const [studios, settings] = await Promise.all([
      fetchAllStudios(supabase),
      fetchSettings(supabase),
    ]);
    const { date: today, minutes: nowMinutes } = nowInStudioTime();
    const activeStudios = studios.filter((s) => s.active);
    const activeStudioIds = activeStudios.map((s) => s.id);

    const week = weekRange();
    const month = monthRange();
    const exportFrom = week.from < month.from ? week.from : month.from;
    const exportTo = week.to > month.to ? week.to : month.to;

    const [
      { data: statsBookingsData },
      { data: exportBookingsData },
      { count: pendingCount },
      { data: todayData },
      { data: upcomingData },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("studio_id, date, duration_minutes, status")
        .gte("date", month.from)
        .lte("date", month.to),
      supabase
        .from("bookings")
        .select("*, studios(id, name)")
        .gte("date", exportFrom)
        .lte("date", exportTo)
        .order("date", { ascending: true })
        .limit(2000),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("bookings")
        .select(
          "studio_id, start_minutes, duration_minutes, status, customer_name"
        )
        .eq("date", today)
        .in("status", ["pending", "confirmed", "completed"]),
      supabase
        .from("bookings")
        .select("total_price_mad")
        .gte("date", today)
        .eq("status", "confirmed"),
    ]);

    const statsBookings = statsBookingsData ?? [];
    const exportBookings = (exportBookingsData ?? []) as BookingWithStudio[];

    const weeklyByStudio = computeOccupancyByStudio({
      settings,
      bookings: statsBookings,
      activeStudioIds,
      from: week.from,
      to: week.to,
    });
    const monthlyByStudio = computeOccupancyByStudio({
      settings,
      bookings: statsBookings,
      activeStudioIds,
      from: month.from,
      to: month.to,
    });

    const occupancyRows = activeStudios.map((s) => ({
      studioId: s.id,
      studioName: s.name,
      weeklyRate: weeklyByStudio.get(s.id)?.rate ?? 0,
      monthlyRate: monthlyByStudio.get(s.id)?.rate ?? 0,
      weeklyBooked: weeklyByStudio.get(s.id)?.bookedMinutes ?? 0,
      monthlyBooked: monthlyByStudio.get(s.id)?.bookedMinutes ?? 0,
    }));

    const todayBookings = (todayData ?? []) as PulseBooking[];
    const opening = openingForDate(settings.opening_hours, today);
    const openSpan = opening
      ? (opening.close - opening.open) * Math.max(activeStudios.length, 1)
      : 0;
    const bookedMinutes = todayBookings.reduce(
      (sum, b) => sum + b.duration_minutes,
      0
    );
    const occupancyPct =
      openSpan > 0
        ? Math.min(100, Math.round((bookedMinutes / openSpan) * 100))
        : 0;
    const upcomingRevenue = (upcomingData ?? []).reduce(
      (sum, b) => sum + Number(b.total_price_mad),
      0
    );

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="admin-eyebrow">Analytique</p>
            <h1 className="admin-page-title">Statistiques</h1>
            <p className="admin-page-subtitle">
              Indicateurs, occupation et vue du jour.{" "}
              <Link
                href="/admin"
                className="text-teal-300 hover:text-teal-200 font-medium transition-colors"
              >
                Calendrier & réservations →
              </Link>
            </p>
          </div>
          <ExportCsvButton
            context="statistiques"
            bookings={exportBookings}
            activeFilterLabel="Export stats · journée exacte / semaine / mois"
            weekFrom={week.from}
            weekTo={week.to}
            monthFrom={month.from}
            monthTo={month.to}
            defaultDay={today}
            openingHours={settings.opening_hours}
            activeStudioCount={activeStudios.length}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="En attente de paiement"
            value={String(pendingCount ?? 0)}
            icon={<Hourglass className="w-4 h-4" />}
            tone="amber"
          />
          <StatCard
            label="Séances aujourd'hui"
            value={String(todayBookings.length)}
            icon={<Clock3 className="w-4 h-4" />}
            tone="teal"
          />
          <StatCard
            label="Occupation du jour"
            value={`${occupancyPct}%`}
            icon={<Gauge className="w-4 h-4" />}
            tone="coral"
          />
          <StatCard
            label="Revenus confirmés à venir"
            value={formatMad(upcomingRevenue)}
            icon={<Wallet className="w-4 h-4" />}
            tone="teal"
          />
        </div>

        <TodayPulse
          studios={activeStudios}
          opening={opening}
          bookings={todayBookings}
          nowMinutes={nowMinutes}
        />

        <OccupancyStats
          studios={activeStudios}
          weeklyOverall={overallOccupancyRate(weeklyByStudio)}
          monthlyOverall={overallOccupancyRate(monthlyByStudio)}
          byStudio={occupancyRows}
        />
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(
            /^(fetchAllStudios|fetchSettings|fetchBusySlots): /,
            ""
          )
        : "Impossible de charger les données.";
    return <AdminDbError message={message} />;
  }
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "amber" | "teal" | "coral";
}) {
  const tones = {
    amber: {
      icon: "bg-amber-400/10 text-amber-300",
      glow: "from-amber-400/15",
    },
    teal: {
      icon: "bg-teal-400/10 text-teal-300",
      glow: "from-teal-400/15",
    },
    coral: {
      icon: "bg-accent-500/10 text-accent-400",
      glow: "from-accent-500/15",
    },
  };
  const t = tones[tone];

  return (
    <div className="admin-kpi">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${t.glow} to-transparent`}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-white mt-1.5 tracking-tight">
            {value}
          </p>
        </div>
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
