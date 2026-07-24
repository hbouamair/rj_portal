import Link from "next/link";
import { addDays, format, startOfWeek } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
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
import BookingFilters from "@/components/admin/BookingFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import WeekCalendar from "@/components/admin/WeekCalendar";
import ManualBookingButton from "@/components/admin/ManualBookingButton";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import TodayPulse, { type PulseBooking } from "@/components/admin/TodayPulse";
import AdminDbError from "@/components/admin/AdminDbError";
import {
  formatMad,
  nowInStudioTime,
  openingForDate,
} from "@/lib/booking/pricing";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  studio?: string;
  from?: string;
  to?: string;
  q?: string;
  view?: string;
  week?: string;
  page?: string;
}

const PER_PAGE = 20;

/** /admin URL with the current filters, patched (undefined removes a key). */
function buildHref(
  params: SearchParams,
  patch: Partial<Record<keyof SearchParams, string | undefined>>
): string {
  const merged: Record<string, string | undefined> = { ...params, ...patch };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  try {
    const supabase = getSupabaseAdmin();

    await expireStalePendingBookings(supabase);

    const [studios, settings] = await Promise.all([
      fetchAllStudios(supabase),
      fetchSettings(supabase),
    ]);
    const { date: today, minutes: nowMinutes } = nowInStudioTime();

    const isWeekView = params.view === "week";
    const weekStart = startOfWeek(
      params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
        ? new Date(`${params.week}T00:00:00`)
        : new Date(),
      { weekStartsOn: 1 }
    );
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(addDays(weekStart, 6), "yyyy-MM-dd");

    let query = supabase
      .from("bookings")
      .select("*, studios(id, name)")
      .order("date", { ascending: !isWeekView ? false : true })
      .order("start_minutes", { ascending: !isWeekView ? false : true })
      .limit(300);

    if (params.status) query = query.eq("status", params.status);
    const q = (params.q ?? "").replace(/[,()%]/g, "").trim();
    if (q) {
      query = query.or(
        `customer_name.ilike.%${q}%,reference.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`
      );
    }
    if (isWeekView) {
      query = query.gte("date", weekStartStr).lte("date", weekEndStr);
    } else {
      if (params.from) query = query.gte("date", params.from);
      if (params.to) query = query.lte("date", params.to);
    }

    const { data: bookingsData } = await query;
    const allBookings = (bookingsData ?? []) as BookingWithStudio[];

    // Studio tab filter (client-side so tab counts stay accurate)
    const bookings = params.studio
      ? allBookings.filter((b) => b.studio_id === Number(params.studio))
      : allBookings;

    // List-view pagination (the week view always shows its full week)
    const totalPages = Math.max(1, Math.ceil(bookings.length / PER_PAGE));
    const page = Math.min(Math.max(Number(params.page) || 1, 1), totalPages);
    const pagedBookings = isWeekView
      ? bookings
      : bookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const [{ count: pendingCount }, { data: todayData }, { data: upcomingData }] =
      await Promise.all([
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

    const todayBookings = (todayData ?? []) as PulseBooking[];
    const todayCount = todayBookings.length;
    const upcomingRevenue = (upcomingData ?? []).reduce(
      (sum, b) => sum + Number(b.total_price_mad),
      0
    );

    // Today's occupancy: booked minutes vs. open minutes across active studios
    const activeStudios = studios.filter((s) => s.active);
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

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="admin-eyebrow">Opérations</p>
            <h1 className="admin-page-title">Réservations</h1>
            <p className="admin-page-subtitle">
              Confirmez les paiements, suivez l&apos;agenda et gérez les créneaux.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <ExportCsvButton bookings={bookings} />
            <ManualBookingButton studios={activeStudios} />
          </div>
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
            value={String(todayCount)}
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

        <div className="admin-card p-3 sm:p-4 space-y-3">
          <BookingFilters studios={studios} />
          {!isWeekView && (
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrer par studio"
            >
              <StudioTab
                href={buildHref(params, { studio: undefined, page: undefined })}
                active={!params.studio}
                label="Tous les studios"
                count={allBookings.length}
              />
              {studios.map((s) => {
                const count = allBookings.filter(
                  (b) => b.studio_id === s.id
                ).length;
                return (
                  <StudioTab
                    key={s.id}
                    href={buildHref(params, {
                      studio: String(s.id),
                      page: undefined,
                    })}
                    active={params.studio === String(s.id)}
                    label={s.name}
                    count={count}
                  />
                );
              })}
            </div>
          )}
        </div>

        {isWeekView ? (
          <WeekCalendar bookings={bookings} weekStart={weekStartStr} />
        ) : (
          <>
            <BookingsTable bookings={pagedBookings} />
            {bookings.length > PER_PAGE && (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                total={bookings.length}
                hrefForPage={(p) => buildHref(params, { page: String(p) })}
              />
            )}
          </>
        )}
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

function StudioTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
        active
          ? "bg-teal-400/15 text-teal-300 border-teal-400/35"
          : "bg-white/[0.03] text-white/45 border-white/[0.08] hover:text-white hover:border-white/15"
      }`}
    >
      {label}
      <span
        className={`tabular-nums px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          active ? "bg-teal-400/20" : "bg-white/[0.06]"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  hrefForPage: (page: number) => string;
}) {
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 admin-card px-4 py-3">
      <p className="text-xs text-white/40">
        {from}–{to} sur {total} réservation{total > 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className="admin-btn-ghost min-h-9 px-3 text-xs"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
            Préc.
          </Link>
        ) : (
          <span className="admin-btn-ghost min-h-9 px-3 text-xs opacity-30 pointer-events-none">
            <ChevronLeft className="w-4 h-4" />
            Préc.
          </span>
        )}
        <span className="text-xs font-semibold text-white/60 tabular-nums px-2">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            className="admin-btn-ghost min-h-9 px-3 text-xs"
            aria-label="Page suivante"
          >
            Suiv.
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="admin-btn-ghost min-h-9 px-3 text-xs opacity-30 pointer-events-none">
            Suiv.
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
