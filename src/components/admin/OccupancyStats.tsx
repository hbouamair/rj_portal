import type { Studio } from "@/lib/booking/types";

interface StudioOccupancy {
  studioId: number;
  studioName: string;
  weeklyRate: number;
  monthlyRate: number;
  weeklyBooked: number;
  monthlyBooked: number;
}

export default function OccupancyStats({
  weeklyOverall,
  monthlyOverall,
  byStudio,
}: {
  studios: Studio[];
  weeklyOverall: number;
  monthlyOverall: number;
  byStudio: StudioOccupancy[];
}) {
  return (
    <section className="admin-card p-5 sm:p-6 space-y-5">
      <div>
        <p className="admin-eyebrow">Statistiques</p>
        <h2 className="text-lg font-display font-bold text-white tracking-tight">
          Taux de réservation des studios
        </h2>
        <p className="text-sm text-white/40 mt-1">
          Part des créneaux ouverts réservés (en attente, confirmées ou terminées).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Semaine en cours
          </p>
          <p className="text-3xl font-display font-bold text-teal-300 mt-1">
            {weeklyOverall}%
          </p>
          <p className="text-xs text-white/35 mt-1">Tous studios confondus</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Mois en cours
          </p>
          <p className="text-3xl font-display font-bold text-accent-400 mt-1">
            {monthlyOverall}%
          </p>
          <p className="text-xs text-white/35 mt-1">Tous studios confondus</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
              <th className="pb-3 pr-4 font-semibold">Studio</th>
              <th className="pb-3 pr-4 font-semibold text-right">Semaine</th>
              <th className="pb-3 font-semibold text-right">Mois</th>
            </tr>
          </thead>
          <tbody>
            {byStudio.map((row) => (
              <tr
                key={row.studioId}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="py-3 pr-4 font-medium text-white/85">
                  {row.studioName}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  <span className="font-bold text-teal-300">{row.weeklyRate}%</span>
                  <span className="block text-[10px] text-white/30">
                    {Math.round(row.weeklyBooked / 60)}h réservées
                  </span>
                </td>
                <td className="py-3 text-right tabular-nums">
                  <span className="font-bold text-accent-400">{row.monthlyRate}%</span>
                  <span className="block text-[10px] text-white/30">
                    {Math.round(row.monthlyBooked / 60)}h réservées
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export type { StudioOccupancy };
