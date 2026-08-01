import Link from "next/link";
import { addDays, format, startOfWeek } from "date-fns";
import { CalendarRange, Hourglass } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  expireStalePendingBookings,
  fetchAllStudios,
} from "@/lib/booking/db";
import type { BookingWithStudio } from "@/lib/booking/types";
import BookingFilters from "@/components/admin/BookingFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingsPagination, {
  BOOKINGS_PER_PAGE,
} from "@/components/admin/BookingsPagination";
import WeekCalendar from "@/components/admin/WeekCalendar";
import ManualBookingButton from "@/components/admin/ManualBookingButton";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import { buildExportFilterLabel } from "@/lib/booking/export-filters";
import { nowInStudioTime } from "@/lib/booking/pricing";
import AdminDbError from "@/components/admin/AdminDbError";
import { monthRange, weekRange } from "@/lib/booking/occupancy";
import {
  isListPrimaryBooking,
  parsePackageRefsFromNote,
} from "@/lib/booking/package-groups";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  studio?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
  week?: string;
}

const PER_PAGE = BOOKINGS_PER_PAGE;

interface ListFilters {
  status?: string;
  studio?: string;
  from?: string;
  to?: string;
  q?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyListFilters(query: any, filters: ListFilters) {
  let q = query;
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.studio) q = q.eq("studio_id", Number(filters.studio));
  if (filters.from) q = q.gte("date", filters.from);
  if (filters.to) q = q.lte("date", filters.to);
  const search = (filters.q ?? "").replace(/[,()%]/g, "").trim();
  if (search) {
    q = q.or(
      `customer_name.ilike.%${search}%,reference.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_email.ilike.%${search}%`
    );
  }
  return q;
}

interface PrimaryListMeta {
  id: string;
  created_at: string;
  studio_id: number;
}

/** Primary list rows only: 1 single = 1 entry, 1 forfait (N séances) = 1 entry. */
async function fetchPrimaryListMeta(
  supabase: SupabaseClient,
  filters: ListFilters
): Promise<PrimaryListMeta[]> {
  let query = supabase
    .from("bookings")
    .select(
      "id, created_at, studio_id, note, package_index, package_group_id, regular_course_count"
    )
    .order("created_at", { ascending: false });

  query = applyListFilters(query, filters);
  const { data } = await query.limit(5000);
  return ((data ?? []) as Array<{
    id: string;
    created_at: string;
    studio_id: number;
    note: string | null;
    package_index: number | null;
    package_group_id: string | null;
    regular_course_count: number | null;
  }>)
    .filter(isListPrimaryBooking)
    .map((b) => ({
      id: b.id,
      created_at: b.created_at,
      studio_id: b.studio_id,
    }));
}

async function fetchBookingsByIds(
  supabase: SupabaseClient,
  pageIds: string[]
): Promise<BookingWithStudio[]> {
  if (pageIds.length === 0) return [];

  const { data } = await supabase
    .from("bookings")
    .select("*, studios(id, name)")
    .in("id", pageIds);

  const byId = new Map(
    ((data ?? []) as BookingWithStudio[]).map((b) => [b.id, b])
  );
  // Keep pagination order (newest primary first)
  return pageIds
    .map((id) => byId.get(id))
    .filter((b): b is BookingWithStudio => Boolean(b));
}

/** Pull every session of packages that appear on the current page. */
async function hydratePackageSiblings(
  supabase: SupabaseClient,
  bookings: BookingWithStudio[]
): Promise<BookingWithStudio[]> {
  if (bookings.length === 0) return bookings;

  const byId = new Map(bookings.map((b) => [b.id, b]));

  const groupIds = [
    ...new Set(
      bookings
        .map((b) => b.package_group_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("bookings")
      .select("*, studios(id, name)")
      .in("package_group_id", groupIds);
    for (const row of (data ?? []) as BookingWithStudio[]) {
      byId.set(row.id, row);
    }
  }

  const refs = new Set<string>();
  for (const b of byId.values()) {
    for (const ref of parsePackageRefsFromNote(b.note)) refs.add(ref);
  }
  const knownRefs = new Set([...byId.values()].map((b) => b.reference));
  const missingRefs = [...refs].filter((r) => !knownRefs.has(r));

  if (missingRefs.length > 0) {
    const { data } = await supabase
      .from("bookings")
      .select("*, studios(id, name)")
      .in("reference", missingRefs);
    for (const row of (data ?? []) as BookingWithStudio[]) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

/** Fetch rows matching list filters for CSV export (no forced week/month clamp). */
async function fetchAllForExport(
  supabase: SupabaseClient,
  filters: ListFilters
): Promise<BookingWithStudio[]> {
  let query = supabase
    .from("bookings")
    .select("*, studios(id, name)")
    .order("date", { ascending: true })
    .limit(2000);

  query = applyListFilters(query, filters);
  const { data } = await query;
  return (data ?? []) as BookingWithStudio[];
}

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

    const studios = await fetchAllStudios(supabase);
    const activeStudios = studios.filter((s) => s.active);

    const weekStart = startOfWeek(
      params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
        ? new Date(`${params.week}T00:00:00`)
        : new Date(),
      { weekStartsOn: 1 }
    );
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(addDays(weekStart, 6), "yyyy-MM-dd");

    const week = weekRange(weekStart);
    const month = monthRange();

    const listFilters: ListFilters = {
      status: params.status,
      studio: params.studio,
      from: params.from,
      to: params.to,
      q: params.q,
    };

    const page = Math.max(1, Number(params.page) || 1);

    // One fetch for tabs + pagination: count forfaits as 1 row, not N séances
    const primaryMetaAll = await fetchPrimaryListMeta(supabase, {
      ...listFilters,
      studio: undefined,
    });
    const totalTabCount = primaryMetaAll.length;
    const studioTabCounts = studios.map(
      (s) => primaryMetaAll.filter((b) => b.studio_id === s.id).length
    );

    const primaryMeta = listFilters.studio
      ? primaryMetaAll.filter(
          (b) => b.studio_id === Number(listFilters.studio)
        )
      : primaryMetaAll;

    const totalCount = primaryMeta.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const from = (safePage - 1) * PER_PAGE;
    const pageIds = primaryMeta.slice(from, from + PER_PAGE).map((b) => b.id);

    const pageBookings = await fetchBookingsByIds(supabase, pageIds);
    const bookings = await hydratePackageSiblings(supabase, pageBookings);

    const [
      { data: weekBookingsData },
      exportBookings,
      { count: pendingCount },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, studios(id, name)")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr)
        .order("date", { ascending: true })
        .order("start_minutes", { ascending: true }),
      fetchAllForExport(supabase, listFilters),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    let weekBookings = (weekBookingsData ?? []) as BookingWithStudio[];

    if (params.studio) {
      weekBookings = weekBookings.filter(
        (b) => b.studio_id === Number(params.studio)
      );
    }

    const displayPage = safePage;

    return (
      <div className="space-y-6">
        {/* 1 — En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="admin-eyebrow">Opérations</p>
            <h1 className="admin-page-title">Réservations</h1>
            <p className="admin-page-subtitle">
              Calendrier hebdomadaire et gestion des créneaux.{" "}
              <Link
                href="/admin/statistiques"
                className="text-teal-300 hover:text-teal-200 font-medium transition-colors"
              >
                Statistiques →
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <ExportCsvButton
              context="reservations"
              bookings={exportBookings}
              activeFilterLabel={buildExportFilterLabel({
                status: params.status,
                studioName: params.studio
                  ? studios.find((s) => String(s.id) === params.studio)?.name
                  : undefined,
                from: params.from,
                to: params.to,
                q: params.q,
              })}
              weekFrom={week.from}
              weekTo={week.to}
              monthFrom={month.from}
              monthTo={month.to}
              defaultDay={nowInStudioTime().date}
              dayFilters={{
                status: params.status,
                studioId: params.studio ? Number(params.studio) : undefined,
              }}
            />
            <ManualBookingButton studios={activeStudios} />
          </div>
        </div>

        {/* 2 — Alertes */}
        {(pendingCount ?? 0) > 0 && (
          <Link
            href={buildHref(params, { status: "pending", page: undefined })}
            className="admin-card flex items-center gap-3 px-4 py-3 border-l-4 border-amber-400 hover:bg-white/[0.02] transition-colors"
          >
            <Hourglass className="w-5 h-5 text-amber-300 shrink-0" aria-hidden />
            <p className="text-sm text-white/80">
              <span className="font-bold text-amber-300">{pendingCount}</span>{" "}
              réservation{(pendingCount ?? 0) > 1 ? "s" : ""} en attente de
              paiement — cliquer pour filtrer
            </p>
          </Link>
        )}

        {/* 3 — Calendrier de la semaine */}
        <section className="space-y-3">
          <SectionHeading
            icon={<CalendarRange className="w-4 h-4" />}
            title="Calendrier de la semaine"
            subtitle={`${weekBookings.length} réservation${weekBookings.length !== 1 ? "s" : ""}${params.studio ? ` · ${studios.find((s) => String(s.id) === params.studio)?.name ?? "Studio"}` : ""}`}
          />
          <WeekCalendar bookings={weekBookings} weekStart={weekStartStr} />
        </section>

        {/* 4 — Liste détaillée */}
        <section className="space-y-3">
          <SectionHeading
            title="Liste des réservations"
            subtitle={
              totalCount > 0
                ? `${totalCount} résultat${totalCount > 1 ? "s" : ""} · ${PER_PAGE} par page`
                : "Recherche, filtres et confirmation des paiements"
            }
          />

          <div className="admin-card p-3 sm:p-4 space-y-3">
            <BookingFilters studios={studios} />
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrer par studio"
            >
              <StudioTab
                href={buildHref(params, { studio: undefined, page: undefined })}
                active={!params.studio}
                label="Tous les studios"
                count={totalTabCount}
              />
              {studios.map((s, i) => (
                  <StudioTab
                    key={s.id}
                    href={buildHref(params, {
                      studio: String(s.id),
                      page: undefined,
                    })}
                    active={params.studio === String(s.id)}
                    label={s.name}
                    count={studioTabCounts[i] ?? 0}
                  />
              ))}
            </div>
          </div>

          <BookingsPagination
            page={displayPage}
            totalPages={totalPages}
            total={totalCount}
            hrefForPage={(p) => buildHref(params, { page: String(p) })}
          />

          <BookingsTable bookings={bookings} />

          <BookingsPagination
            page={displayPage}
            totalPages={totalPages}
            total={totalCount}
            hrefForPage={(p) => buildHref(params, { page: String(p) })}
          />
        </section>
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

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon && (
        <span className="w-9 h-9 rounded-xl bg-teal-400/10 text-teal-300 flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
      <div>
        <h2 className="text-lg font-display font-bold text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
        )}
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
