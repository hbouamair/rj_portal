import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const BOOKINGS_PER_PAGE = 10;

interface Props {
  page: number;
  totalPages: number;
  total: number;
  perPage?: number;
  hrefForPage: (page: number) => string;
}

/** Pagination bar for the admin bookings list. */
export default function BookingsPagination({
  page,
  totalPages,
  total,
  perPage = BOOKINGS_PER_PAGE,
  hrefForPage,
}: Props) {
  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 admin-card px-4 py-3">
      <p className="text-xs text-white/40 tabular-nums">
        {from}–{to} sur {total} ligne{total > 1 ? "s" : ""}
        <span className="text-white/25"> (1 forfait = 1 ligne)</span>
        {totalPages > 1 && (
          <span className="text-white/25"> · {perPage} par page</span>
        )}
      </p>

      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center gap-1"
          aria-label="Pagination des réservations"
        >
          <PageLink
            href={page > 1 ? hrefForPage(page - 1) : undefined}
            label="Page précédente"
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Préc.</span>
          </PageLink>

          {pageNumbers.map((n, i) =>
            n === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="min-w-9 h-9 flex items-center justify-center text-xs text-white/30"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Link
                key={n}
                href={hrefForPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={`min-w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold tabular-nums transition-colors ${
                  n === page
                    ? "bg-teal-400/20 text-teal-300 border border-teal-400/40"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white border border-transparent"
                }`}
              >
                {n}
              </Link>
            )
          )}

          <PageLink
            href={page < totalPages ? hrefForPage(page + 1) : undefined}
            label="Page suivante"
            disabled={page >= totalPages}
          >
            <span className="hidden sm:inline">Suiv.</span>
            <ChevronRight className="w-4 h-4" />
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  href,
  label,
  disabled,
  children,
}: {
  href?: string;
  label: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className =
    "admin-btn-ghost min-h-9 min-w-9 px-2.5 text-xs gap-1 disabled:opacity-30";

  if (disabled || !href) {
    return (
      <span className={`${className} pointer-events-none`} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
