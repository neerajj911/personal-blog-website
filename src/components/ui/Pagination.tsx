import Link from "next/link";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** URL for a page number. */
  hrefFor: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
}

const linkClass =
  "inline-flex min-h-11 items-center text-ui font-semibold text-link hover:underline";
const idleClass = "inline-flex min-h-11 items-center text-ui text-muted";

/** Previous / "Page 1 of 3" / next. An unavailable direction is plain muted text, not a dead link. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  previousLabel = "Newer",
  nextLabel = "Older articles",
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t-2 border-ink"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          {previousLabel}
        </Link>
      ) : (
        <span className={idleClass}>{previousLabel}</span>
      )}
      <p className="font-mono text-xs text-muted">
        Page <span className="text-ink">{page}</span> of {pageCount}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          {nextLabel}
        </Link>
      ) : (
        <span className={idleClass}>{nextLabel}</span>
      )}
    </nav>
  );
}
