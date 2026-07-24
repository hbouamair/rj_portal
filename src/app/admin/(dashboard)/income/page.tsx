import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Banknote,
  CalendarRange,
  CircleDollarSign,
  Receipt,
  Users,
} from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchAllStudios } from "@/lib/booking/db";
import { formatMad } from "@/lib/booking/pricing";
import AdminDbError from "@/components/admin/AdminDbError";

export const dynamic = "force-dynamic";

interface RevenueRow {
  date: string;
  total_price_mad: number;
  studio_id: number;
  status: string;
  customer_name: string;
  customer_email: string;
}

export default async function AdminIncomePage() {
  try {
    const supabase = getSupabaseAdmin();
    const studios = await fetchAllStudios(supabase);

    const { data } = await supabase
      .from("bookings")
      .select(
        "date, total_price_mad, studio_id, status, customer_name, customer_email"
      )
      .in("status", ["confirmed", "completed"])
      .limit(10000);
    const rows = (data ?? []) as RevenueRow[];

    const now = new Date();
    const thisMonthKey = format(now, "yyyy-MM");
    const lastMonthKey = format(subMonths(now, 1), "yyyy-MM");

    const allTimeTotal = rows.reduce((s, r) => s + Number(r.total_price_mad), 0);
    const thisMonthTotal = rows
      .filter((r) => r.date.startsWith(thisMonthKey))
      .reduce((s, r) => s + Number(r.total_price_mad), 0);
    const lastMonthTotal = rows
      .filter((r) => r.date.startsWith(lastMonthKey))
      .reduce((s, r) => s + Number(r.total_price_mad), 0);

    const monthStart = startOfMonth(subMonths(now, 11));
    const months = Array.from({ length: 12 }, (_, i) => addMonths(monthStart, i));
    const monthly = months.map((m) => {
      const key = format(m, "yyyy-MM");
      const monthRows = rows.filter((r) => r.date.startsWith(key));
      return {
        key,
        label: format(m, "MMM yy", { locale: fr }),
        total: monthRows.reduce((s, r) => s + Number(r.total_price_mad), 0),
        count: monthRows.length,
      };
    });
    const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);

    const perStudio = studios
      .map((studio) => {
        const studioRows = rows.filter((r) => r.studio_id === studio.id);
        return {
          name: studio.name,
          total: studioRows.reduce((s, r) => s + Number(r.total_price_mad), 0),
          count: studioRows.length,
        };
      })
      .sort((a, b) => b.total - a.total);
    const maxStudio = Math.max(...perStudio.map((s) => s.total), 1);

    // Top clients by total spend (grouped by email)
    const clientMap = new Map<
      string,
      { name: string; email: string; total: number; count: number }
    >();
    for (const r of rows) {
      const key = r.customer_email.toLowerCase();
      const entry = clientMap.get(key) ?? {
        name: r.customer_name,
        email: r.customer_email,
        total: 0,
        count: 0,
      };
      entry.total += Number(r.total_price_mad);
      entry.count += 1;
      clientMap.set(key, entry);
    }
    const topClients = Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return (
      <div className="space-y-5">
        <div>
          <p className="admin-eyebrow">Finance</p>
          <h1 className="admin-page-title">Revenus</h1>
          <p className="admin-page-subtitle">
            Réservations confirmées (payées) et terminées uniquement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Kpi
            label="Ce mois-ci"
            value={formatMad(thisMonthTotal)}
            icon={<CircleDollarSign className="w-4 h-4" />}
          />
          <Kpi
            label="Mois dernier"
            value={formatMad(lastMonthTotal)}
            icon={<CalendarRange className="w-4 h-4" />}
          />
          <Kpi
            label="Total encaissé"
            value={formatMad(allTimeTotal)}
            icon={<Banknote className="w-4 h-4" />}
          />
          <Kpi
            label="Réservations payées"
            value={String(rows.length)}
            icon={<Receipt className="w-4 h-4" />}
          />
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <h2 className="text-base font-display font-bold text-white">
              Revenus mensuels
            </h2>
            <span className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">
              12 mois
            </span>
          </div>
          <div className="flex items-end gap-1.5 sm:gap-2 h-56">
            {monthly.map((m) => {
              const heightPct = Math.max(
                (m.total / maxMonthly) * 100,
                m.total > 0 ? 4 : 0
              );
              return (
                <div
                  key={m.key}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                  title={`${m.label} : ${formatMad(m.total)} (${m.count} réservations)`}
                >
                  <span className="text-[10px] font-semibold text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {m.total > 0 ? formatMad(m.total).replace(" MAD", "") : ""}
                  </span>
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-secondary-700 via-secondary-500 to-teal-300 shadow-[0_0_16px_rgba(45,212,191,0.15)] transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${heightPct}%` }}
                    role="img"
                    aria-label={`${m.label}: ${formatMad(m.total)}`}
                  />
                  <span className="text-[10px] font-semibold text-white/40 capitalize">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="admin-card p-5 sm:p-6">
            <h2 className="text-base font-display font-bold text-white mb-6">
              Répartition par studio
            </h2>
            <div className="space-y-5">
              {perStudio.map((s) => (
                <div key={s.name}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-semibold text-white/85">
                      {s.name}
                      <span className="text-white/35 font-normal">
                        {" "}
                        · {s.count} réservation{s.count > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="text-sm font-display font-bold text-white">
                      {formatMad(s.total)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary-600 to-teal-300 transition-all duration-500"
                      style={{ width: `${(s.total / maxStudio) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {perStudio.every((s) => s.total === 0) && (
                <p className="text-sm text-white/40">
                  Aucun revenu enregistré pour le moment.
                </p>
              )}
            </div>
          </div>

          <div className="admin-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-300 flex items-center justify-center">
                <Users className="w-4 h-4" aria-hidden />
              </span>
              <h2 className="text-base font-display font-bold text-white">
                Meilleurs clients
              </h2>
            </div>
            {topClients.length === 0 ? (
              <p className="text-sm text-white/40">
                Les clients apparaîtront ici dès la première réservation payée.
              </p>
            ) : (
              <ol className="space-y-3">
                {topClients.map((c, i) => (
                  <li
                    key={c.email}
                    className="flex items-center gap-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-3"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0 ${
                        i === 0
                          ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                          : "bg-white/[0.05] text-white/50 border border-white/10"
                      }`}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white/90 truncate">
                        {c.name}
                      </span>
                      <span className="block text-xs text-white/35 truncate">
                        {c.email} · {c.count} réservation{c.count > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="text-sm font-display font-bold text-teal-300 whitespace-nowrap">
                      {formatMad(c.total)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(/^fetchAllStudios: /, "")
        : "Impossible de charger les revenus.";
    return <AdminDbError message={message} />;
  }
}

function Kpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="admin-kpi">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-display font-bold text-white mt-1.5 tracking-tight">
            {value}
          </p>
        </div>
        <span className="w-9 h-9 rounded-xl bg-teal-400/10 text-teal-300 flex items-center justify-center shrink-0">
          {icon}
        </span>
      </div>
    </div>
  );
}
