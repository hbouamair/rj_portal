"use client";

import { Download } from "lucide-react";
import type { BookingWithStudio } from "@/lib/booking/types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/booking/types";
import { minutesToTimeString } from "@/lib/booking/pricing";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Downloads the currently filtered bookings as a CSV (Excel-friendly). */
export default function ExportCsvButton({
  bookings,
}: {
  bookings: BookingWithStudio[];
}) {
  function exportCsv() {
    const header = [
      "Référence",
      "Studio",
      "Date",
      "Début",
      "Fin",
      "Durée (min)",
      "Client",
      "Email",
      "Téléphone",
      "Prix (MAD)",
      "Paiement",
      "Statut",
      "Créée le",
    ];
    const lines = bookings.map((b) =>
      [
        b.reference,
        b.studios?.name ?? `Studio ${b.studio_id}`,
        b.date,
        minutesToTimeString(b.start_minutes),
        minutesToTimeString(b.start_minutes + b.duration_minutes),
        b.duration_minutes,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        Number(b.total_price_mad),
        PAYMENT_METHOD_LABELS[b.payment_method] ?? b.payment_method,
        BOOKING_STATUS_LABELS[b.status] ?? b.status,
        new Date(b.created_at).toLocaleString("fr-FR", {
          timeZone: "Africa/Casablanca",
        }),
      ]
        .map(csvCell)
        .join(";")
    );
    // BOM so Excel opens accented characters correctly
    const csv = "\uFEFF" + [header.join(";"), ...lines].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={bookings.length === 0}
      className="admin-btn-ghost min-h-11"
      title={
        bookings.length === 0
          ? "Aucune réservation à exporter"
          : `Exporter ${bookings.length} réservation${bookings.length > 1 ? "s" : ""}`
      }
    >
      <Download className="w-4 h-4" aria-hidden />
      Exporter CSV
    </button>
  );
}
