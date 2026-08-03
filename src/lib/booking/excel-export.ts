import type { BookingWithStudio } from "./types";
import {
  BOOKING_STATUS_LABELS,
  COURSE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "./types";
import { minutesToTimeString } from "./pricing";
import { getPackageGroupKey } from "./package-groups";
import { CONTACT_ADDRESS } from "@/lib/constants";

function isPackageBooking(b: BookingWithStudio): boolean {
  return (
    getPackageGroupKey(b) != null ||
    b.package_index != null ||
    (b.regular_course_count ?? 0) > 1
  );
}

function reservationKindLabel(b: BookingWithStudio): "Forfait" | "Cours normal" {
  return isPackageBooking(b) ? "Forfait" : "Cours normal";
}

/** Brand palette aligned with the admin / site look. */
const COLORS = {
  titleBg: "FF1E3A5F",
  titleFg: "FFFFFFFF",
  headerBg: "FF2A9D8F",
  headerFg: "FFFFFFFF",
  zebra: "FFF0F7F6",
  border: "FFD0D7E2",
  text: "FF1A2332",
  muted: "FF5C6B7A",
  accent: "FF2A9D8F",
};

export interface DailyStatRow {
  date: string;
  sessions: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  expired: number;
  bookedMinutes: number;
  revenueMad: number;
  openMinutes: number;
  occupancyPct: number;
}

type CellValue = string | number | null;

function thinBorder() {
  const edge = { style: "thin" as const, color: { argb: COLORS.border } };
  return { top: edge, left: edge, bottom: edge, right: edge };
}

function autoWidth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sheet: any,
  columnCount: number,
  min = 10,
  max = 32
) {
  for (let col = 1; col <= columnCount; col++) {
    let longest = min;
    sheet.eachRow((row: { getCell: (c: number) => { value: unknown } }) => {
      const raw = row.getCell(col).value;
      const len = raw == null ? 0 : String(raw).length;
      if (len > longest) longest = len;
    });
    sheet.getColumn(col).width = Math.min(max, Math.max(min, longest + 3));
  }
}

async function writeAndDownload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workbook: any,
  filename: string
) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

function applyPageSetup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sheet: any
) {
  sheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: {
      left: 0.75,
      right: 0.75,
      top: 0.85,
      bottom: 0.85,
      header: 0.4,
      footer: 0.4,
    },
  };
  sheet.headerFooter = {
    oddHeader: "&L&B RJ Studio&R&D",
    oddFooter: `&L${CONTACT_ADDRESS}&C&P / &N&RExport Excel`,
  };
  sheet.properties.defaultRowHeight = 20;
  sheet.properties.tabColor = { argb: COLORS.accent };
  // Visual breathing room when opened in Excel (not only print)
  sheet.views = [
    {
      state: "frozen",
      ySplit: 3,
      showGridLines: false,
      zoomScale: 100,
    },
  ];
}

function styleTitleRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sheet: any,
  lastCol: number,
  title: string
) {
  sheet.mergeCells(1, 1, 1, lastCol);
  const cell = sheet.getCell(1, 1);
  cell.value = title;
  cell.font = {
    name: "Calibri",
    bold: true,
    size: 16,
    color: { argb: COLORS.titleFg },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.titleBg },
  };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 2 };
  sheet.getRow(1).height = 36;
}

function styleSubtitleRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sheet: any,
  lastCol: number,
  subtitle: string
) {
  sheet.mergeCells(2, 1, 2, lastCol);
  const cell = sheet.getCell(2, 1);
  cell.value = subtitle;
  cell.font = {
    name: "Calibri",
    size: 10,
    italic: true,
    color: { argb: COLORS.muted },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F7FA" },
  };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 2 };
  sheet.getRow(2).height = 22;
}

function styleHeaderRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sheet: any,
  rowIndex: number,
  headers: string[]
) {
  const row = sheet.getRow(rowIndex);
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1);
    cell.value = h;
    cell.font = {
      name: "Calibri",
      bold: true,
      size: 11,
      color: { argb: COLORS.headerFg },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.headerBg },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
      indent: 0,
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.headerBg } },
      left: { style: "thin", color: { argb: COLORS.headerBg } },
      bottom: { style: "medium", color: { argb: COLORS.titleBg } },
      right: { style: "thin", color: { argb: COLORS.headerBg } },
    };
  });
  row.height = 28;
}

function styleDataCell(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell: any,
  value: CellValue,
  zebra: boolean,
  align: "left" | "center" | "right" = "left"
) {
  cell.value = value;
  cell.font = { name: "Calibri", size: 10, color: { argb: COLORS.text } };
  cell.alignment = {
    vertical: "middle",
    horizontal: align,
    indent: align === "left" ? 1 : 0,
  };
  cell.border = thinBorder();
  if (zebra) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.zebra },
    };
  }
}

function bookingsHeader(): string[] {
  return [
    "Référence",
    "Type de cours",
    "Type réservation",
    "Studio",
    "Date",
    "Début",
    "Fin",
    "Durée (h)",
    "Client",
    "Email",
    "Téléphone",
    "Prix (MAD)",
    "Cours réguliers",
    "Forfait (séance)",
    "Paiement",
    "Statut",
    "Créée le",
  ];
}

function bookingRowValues(b: BookingWithStudio): CellValue[] {
  return [
    b.reference,
    COURSE_TYPE_LABELS[b.course_type ?? "group"] ?? b.course_type ?? "",
    reservationKindLabel(b),
    b.studios?.name ?? `Studio ${b.studio_id}`,
    b.date,
    minutesToTimeString(b.start_minutes),
    minutesToTimeString(b.start_minutes + b.duration_minutes),
    Math.round((b.duration_minutes / 60) * 100) / 100,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    Number(b.total_price_mad),
    b.regular_course_count ?? "",
    b.package_index && b.regular_course_count
      ? `${b.package_index}/${b.regular_course_count}`
      : "",
    PAYMENT_METHOD_LABELS[b.payment_method] ?? b.payment_method,
    BOOKING_STATUS_LABELS[b.status] ?? b.status,
    new Date(b.created_at).toLocaleString("fr-FR", {
      timeZone: "Africa/Casablanca",
    }),
  ];
}

function dailyStatsHeader(): string[] {
  return [
    "Date",
    "Séances (total)",
    "En attente",
    "Confirmées",
    "Terminées",
    "Annulées",
    "Expirées",
    "Minutes réservées",
    "Minutes ouvertes",
    "Occupation %",
    "Revenus confirmés (MAD)",
  ];
}

function dailyStatRowValues(r: DailyStatRow): CellValue[] {
  return [
    r.date,
    r.sessions,
    r.pending,
    r.confirmed,
    r.completed,
    r.cancelled,
    r.expired,
    r.bookedMinutes,
    r.openMinutes,
    r.occupancyPct,
    r.revenueMad,
  ];
}

function fillBookingsSheet(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workbook: any,
  sheetName: string,
  bookings: BookingWithStudio[],
  title: string,
  subtitle: string
) {
  const sheet = workbook.addWorksheet(sheetName);
  applyPageSetup(sheet);

  const headers = bookingsHeader();
  const lastCol = headers.length;

  styleTitleRow(sheet, lastCol, title);
  styleSubtitleRow(sheet, lastCol, subtitle);
  styleHeaderRow(sheet, 3, headers);

  // durée(h), prix, cours réguliers
  const numericCols = new Set([8, 12, 13]);
  // type réservation, date, début, fin, forfait, statut
  const centerCols = new Set([3, 5, 6, 7, 14, 16]);

  bookings.forEach((booking, index) => {
    const rowIndex = 4 + index;
    const zebra = index % 2 === 1;
    const values = bookingRowValues(booking);
    const row = sheet.getRow(rowIndex);
    values.forEach((value, i) => {
      const col = i + 1;
      const cell = row.getCell(col);
      const align = numericCols.has(col)
        ? "right"
        : centerCols.has(col)
          ? "center"
          : "left";
      styleDataCell(cell, value, zebra, align);
      if (col === 8 && typeof value === "number") {
        cell.numFmt = "0.##";
      }
      if (col === 12 && typeof value === "number") {
        cell.numFmt = "#,##0.00";
      }
      // Highlight forfait vs cours normal
      if (col === 3 && typeof value === "string") {
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: {
            argb: value === "Forfait" ? "FF2A9D8F" : COLORS.text,
          },
        };
      }
    });
    row.height = 20;
  });

  const footerRow = 4 + bookings.length;
  sheet.mergeCells(footerRow, 1, footerRow, lastCol);
  const footer = sheet.getCell(footerRow, 1);
  footer.value = `RJ Studio · ${CONTACT_ADDRESS}`;
  footer.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: COLORS.accent },
  };
  footer.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F7FA" },
  };
  footer.alignment = { vertical: "middle", horizontal: "right", indent: 2 };
  sheet.getRow(footerRow).height = 22;

  autoWidth(sheet, lastCol, 11, 34);
  sheet.getColumn(1).width = 14;
  sheet.getColumn(3).width = 16;
  sheet.getColumn(9).width = 22;
  sheet.getColumn(10).width = 28;
}

/** Styled bookings workbook (.xlsx) with title, margins, zebra rows. */
export async function downloadBookingsExcel(options: {
  bookings: BookingWithStudio[];
  filename: string;
  title?: string;
  subtitle?: string;
}) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RJ Studio";
  workbook.created = new Date();

  const all = options.bookings;
  const packages = all.filter(isPackageBooking);
  const normals = all.filter((b) => !isPackageBooking(b));
  const exportedAt = new Date().toLocaleString("fr-FR", {
    timeZone: "Africa/Casablanca",
  });
  const baseSubtitle =
    options.subtitle ?? `Export du ${exportedAt} · ${all.length} ligne(s)`;
  const baseTitle = options.title ?? "RJ Studio — Réservations";

  fillBookingsSheet(
    workbook,
    "Toutes",
    all,
    baseTitle,
    `${baseSubtitle} · Toutes les réservations`
  );
  fillBookingsSheet(
    workbook,
    "Cours normaux",
    normals,
    `${baseTitle} — Cours normaux`,
    `${baseSubtitle} · ${normals.length} ligne(s)`
  );
  fillBookingsSheet(
    workbook,
    "Forfaits",
    packages,
    `${baseTitle} — Forfaits`,
    `${baseSubtitle} · ${packages.length} ligne(s)`
  );

  await writeAndDownload(workbook, options.filename);
}

/** Styled daily stats workbook (.xlsx). */
export async function downloadDailyStatsExcel(options: {
  rows: DailyStatRow[];
  filename: string;
  title?: string;
  subtitle?: string;
}) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RJ Studio";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Stats jour");
  applyPageSetup(sheet);

  const headers = dailyStatsHeader();
  const lastCol = headers.length;

  styleTitleRow(
    sheet,
    lastCol,
    options.title ?? "RJ Studio — Statistiques par journée"
  );
  styleSubtitleRow(
    sheet,
    lastCol,
    options.subtitle ??
      `Export du ${new Date().toLocaleString("fr-FR", {
        timeZone: "Africa/Casablanca",
      })} · ${options.rows.length} jour(s)`
  );
  styleHeaderRow(sheet, 3, headers);

  options.rows.forEach((stat, index) => {
    const rowIndex = 4 + index;
    const zebra = index % 2 === 1;
    const values = dailyStatRowValues(stat);
    const row = sheet.getRow(rowIndex);
    values.forEach((value, i) => {
      const col = i + 1;
      const cell = row.getCell(col);
      const align = col === 1 ? "left" : "center";
      styleDataCell(cell, value, zebra, align);
      if (col === 11 && typeof value === "number") {
        cell.numFmt = "#,##0.00";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
    });
    row.height = 20;
  });

  const footerRow = 4 + options.rows.length;
  sheet.mergeCells(footerRow, 1, footerRow, lastCol);
  const footer = sheet.getCell(footerRow, 1);
  footer.value = "RJ Studio · Statistiques";
  footer.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: COLORS.accent },
  };
  footer.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F7FA" },
  };
  footer.alignment = { vertical: "middle", horizontal: "right", indent: 2 };
  sheet.getRow(footerRow).height = 22;

  autoWidth(sheet, lastCol, 12, 24);
  await writeAndDownload(workbook, options.filename);
}
