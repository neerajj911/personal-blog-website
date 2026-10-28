import Link from "next/link";
import type { ArticleSeriesContext, SeriesPartEntry } from "@/lib/content";

const eyebrow = "font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted";
const title = "mt-1 font-serif text-lg leading-snug font-bold";

function Card({ label, entry }: { label: string; entry: SeriesPartEntry }) {
  const published = entry.part.status === "published" && entry.article;
  return published && entry.article ? (
    <Link
      href={`/articles/${entry.article.slug}`}
      className="block rounded-panel border border-rule bg-panel p-4 hover:border-ink"
    >
      <span className={eyebrow}>{label}</span>
      <span className={`${title} block text-link`}>{entry.part.title}</span>
    </Link>
  ) : (
    <div className="rounded-panel border border-dashed border-rule p-4">
      <span className={eyebrow}>{label} · Coming soon</span>
      <span className={`${title} block text-muted`}>{entry.part.title}</span>
    </div>
  );
}

/** Previous and next part of the series. A part that is not published yet is shown but not linked. */
export function PrevNextCards({ context }: { context: ArticleSeriesContext }) {
  const { previous, next } = context;
  if (!previous && !next) return null;

  return (
    <nav aria-label="Series navigation" className="my-12 grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Card label={`Previous · Part ${previous.part.number}`} entry={previous} />
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? <Card label={`Next · Part ${next.part.number}`} entry={next} /> : null}
    </nav>
  );
}
