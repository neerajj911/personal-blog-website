import Link from "next/link";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { ArticleListItem } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Compact list of related articles: title on one line, topic, date and reading time below. */
export function RelatedArticles({ items }: { items: ArticleListItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <SectionHeading id="related-heading">Related articles</SectionHeading>
      <ul>
        {items.map(({ article, topic }) => (
          <li key={article.slug} className="border-b border-dotted border-rule py-3">
            <h3 className="font-serif text-lg leading-snug font-semibold">
              <Link
                href={`/articles/${article.slug}`}
                className="text-link hover:underline"
              >
                {article.title}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-muted">
              {topic.shortName} · {formatDate(article.publishedAt)} ·{" "}
              {formatReadingTime(article.readingMinutes)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
