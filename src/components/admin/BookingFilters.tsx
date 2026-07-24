"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, List, Search } from "lucide-react";
import type { Studio } from "@/lib/booking/types";
import { BOOKING_STATUS_LABELS } from "@/lib/booking/types";

export default function BookingFilters({ studios }: { studios: Studio[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Debounced search so we don't reload on every keystroke
  useEffect(() => {
    if (search === (searchParams.get("q") ?? "")) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", search.trim()), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchParams, setParam]);

  const view = searchParams.get("view") ?? "list";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[13rem] flex-1 sm:flex-none">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input pl-9"
          placeholder="Client, référence, téléphone…"
          aria-label="Rechercher une réservation"
        />
      </div>

      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="admin-input w-auto min-w-[10rem] cursor-pointer"
        aria-label="Filtrer par statut"
      >
        <option value="">Tous les statuts</option>
        {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("studio") ?? ""}
        onChange={(e) => setParam("studio", e.target.value)}
        className="admin-input w-auto min-w-[9rem] cursor-pointer"
        aria-label="Filtrer par studio"
      >
        <option value="">Tous les studios</option>
        {studios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {view !== "week" && (
        <>
          <input
            type="date"
            value={searchParams.get("from") ?? ""}
            onChange={(e) => setParam("from", e.target.value)}
            className="admin-input w-auto cursor-pointer"
            aria-label="À partir du"
          />
          <span className="text-xs text-white/30" aria-hidden>
            →
          </span>
          <input
            type="date"
            value={searchParams.get("to") ?? ""}
            onChange={(e) => setParam("to", e.target.value)}
            className="admin-input w-auto cursor-pointer"
            aria-label="Jusqu'au"
          />
        </>
      )}

      <div
        className="ml-auto flex rounded-xl p-1 bg-white/[0.04] border border-white/[0.08]"
        role="group"
        aria-label="Mode d'affichage"
      >
        <button
          type="button"
          onClick={() => setParam("view", "")}
          className={`admin-btn min-h-9 px-3.5 rounded-lg ${
            view !== "week"
              ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              : "text-white/40 hover:text-white"
          }`}
        >
          <List className="w-4 h-4" aria-hidden />
          Liste
        </button>
        <button
          type="button"
          onClick={() => setParam("view", "week")}
          className={`admin-btn min-h-9 px-3.5 rounded-lg ${
            view === "week"
              ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              : "text-white/40 hover:text-white"
          }`}
        >
          <CalendarRange className="w-4 h-4" aria-hidden />
          Semaine
        </button>
      </div>
    </div>
  );
}
