import type { BookingStatus } from "./types";
import { BOOKING_STATUS_LABELS } from "./types";

export interface ExportActiveFilters {
  status?: string;
  studioName?: string;
  from?: string;
  to?: string;
  q?: string;
}

export function formatExportDateFr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Safe to call from Server or Client Components. */
export function buildExportFilterLabel(filters: ExportActiveFilters): string {
  const parts: string[] = [];
  if (filters.status) {
    parts.push(
      BOOKING_STATUS_LABELS[filters.status as BookingStatus] ?? filters.status
    );
  }
  if (filters.studioName) parts.push(filters.studioName);
  if (filters.from || filters.to) {
    parts.push(
      `${filters.from ? formatExportDateFr(filters.from) : "…"} → ${
        filters.to ? formatExportDateFr(filters.to) : "…"
      }`
    );
  }
  if (filters.q?.trim()) parts.push(`Recherche « ${filters.q.trim()} »`);
  return parts.length > 0 ? parts.join(" · ") : "Aucun filtre actif";
}
