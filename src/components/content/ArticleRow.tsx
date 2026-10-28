import Link from "next/link";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { Article, Series, Topic } from "@/lib/types";
import { TopicMarker } from "@/components/ui/TopicMarker";

interface ArticleRowProps {
  /** 1-based position, shown as "01". */
  index: number;
  article: Article;
  topic: Topic;
  /** The series this article belongs to, if any. */
  series?: Series;
}

/** One line in an article list: number, title, excerpt, topic, date, reading time, series label. */
export function ArticleRow({ index, article, topic, series }: ArticleRowProps) {
  return (
    <article className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 border-b border-dotted border-rule px-4 py-5">
      <span
        aria-hidden="true"
        className="pt-1 font-mono text-xs leading-normal text-muted"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-serif text-item-title font-semibold">
          <Link href={`/articles/${article.slug}`} className="text-link hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mt-1 text-ui-lg leading-normal text-muted">{article.excerpt}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ui-sm text-muted">
          <TopicMarker color={topic.color} label={topic.shortName} className="text-ink" />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span>{formatReadingTime(article.readingMinutes)}</span>
          {series && article.series ? (
            <span className="font-semibold text-rust">
              Part {article.series.part} · {series.shortTitle}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
