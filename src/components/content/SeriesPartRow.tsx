import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { SeriesPartEntry } from "@/lib/content";
import { StatusText } from "@/components/ui/StatusText";

/** One numbered part of a series: title (a link once published), summary and status. */
export function SeriesPartRow({ entry }: { entry: SeriesPartEntry }) {
  const { part, article } = entry;
  const published = part.status === "published" && article;

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-dotted border-rule py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-x-4">
      <span className="font-serif text-lg leading-snug text-muted">{part.number}</span>
      <div>
        <h3 className="font-serif text-lg leading-snug font-semibold">
          {published ? (
            <Link
              href={`/articles/${article.slug}`}
              className="text-link hover:underline"
            >
              {part.title}
            </Link>
          ) : (
            <span className="text-muted">{part.title}</span>
          )}
        </h3>
        {part.summary ? (
          <p className="mt-1 text-ui leading-normal text-muted">{part.summary}</p>
        ) : null}
      </div>
      <p className="col-start-2 mt-2 text-ui-sm sm:col-start-3 sm:row-start-1 sm:mt-0">
        {published ? (
          <StatusText status="published">
            ·{" "}
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt).replace(/, \d{4}$/, "")}
            </time>
          </StatusText>
        ) : (
          <StatusText status="coming-soon" />
        )}
      </p>
    </li>
  );
}
