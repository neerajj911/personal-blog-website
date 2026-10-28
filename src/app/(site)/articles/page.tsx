import type { Metadata } from "next";
import Link from "next/link";
import {
  getArticles,
  getPopularTags,
  getSeriesList,
  getTopics,
  type ArticleSort,
} from "@/lib/content";
import { articlesHref } from "@/lib/urls";
import { ArticleRow } from "@/components/content/ArticleRow";
import { ArticlesSidebar } from "@/components/content/ArticlesSidebar";
import { SortSelect } from "@/components/content/SortSelect";
import { FilterPill } from "@/components/ui/FilterPill";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = { title: "Articles" };

type SearchParams = Record<string, string | string[] | undefined>;

/** A query value is only trusted if it arrived as a single string. */
function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function ArticlesPage({ searchParams }: PageProps<"/articles">) {
  const raw: SearchParams = await searchParams;
  const topic = single(raw.topic);
  const tag = single(raw.tag);
  const q = single(raw.q)?.slice(0, 100);
  const sort: ArticleSort = single(raw.sort) === "oldest" ? "oldest" : "newest";
  const requestedPage = Number.parseInt(single(raw.page) ?? "1", 10);

  const [result, topics, series, tags] = await Promise.all([
    getArticles({
      topic,
      tag,
      q,
      sort,
      page: Number.isNaN(requestedPage) ? 1 : requestedPage,
    }),
    getTopics(),
    getSeriesList(),
    getPopularTags(8),
  ]);

  const filters = { topic, tag, q };
  const filtered = Boolean(tag || q);
  const describe = [q ? `matching “${q}”` : null, tag ? `tagged ${tag}` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Articles" }]}
        title="Articles"
        intro="Every published article, newest first. Filter by topic, or search for a specific concept."
      />

      <div className="page-container">
        <nav aria-label="Filter by topic" className="pb-6">
          <ul className="flex flex-wrap gap-2">
            <li>
              <FilterPill href={articlesHref({ q, tag, sort })} selected={!topic}>
                All
              </FilterPill>
            </li>
            {topics.map((t) => (
              <li key={t.slug}>
                <FilterPill
                  href={articlesHref({ q, tag, sort, topic: t.slug })}
                  selected={topic === t.slug}
                >
                  {t.shortName}
                </FilterPill>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t-2 border-ink" />
      </div>

      <div className="page-container grid grid-cols-[minmax(0,1fr)] gap-10 pt-2 pb-18 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section aria-label="Article list">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-dotted border-rule py-3">
            <p className="text-ui-sm text-muted" aria-live="polite">
              {result.total === 0
                ? "No articles"
                : `Showing ${result.from} to ${result.to} of ${result.total} ${
                    result.total === 1 ? "article" : "articles"
                  }`}
              {describe ? ` ${describe}` : ""}
              {filtered ? (
                <>
                  {" "}
                  <Link
                    href={articlesHref({ topic, sort })}
                    className="text-link hover:underline"
                  >
                    Clear
                  </Link>
                </>
              ) : null}
            </p>
            <SortSelect value={sort} params={filters} />
          </div>

          {result.items.length > 0 ? (
            <ol>
              {result.items.map(({ article, topic: articleTopic, series: s }, i) => (
                <li key={article.slug}>
                  <ArticleRow
                    index={result.from + i}
                    article={article}
                    topic={articleTopic}
                    series={s}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-4 py-10 font-serif text-body text-muted">
              Nothing matches these filters.{" "}
              <Link href="/articles" className="text-link underline underline-offset-2">
                Show all articles
              </Link>
              .
            </p>
          )}

          {result.pageCount > 1 ? (
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => articlesHref({ ...filters, sort, page })}
              previousLabel={sort === "newest" ? "Newer" : "Older"}
              nextLabel={sort === "newest" ? "Older articles" : "Newer articles"}
            />
          ) : null}
        </section>

        <ArticlesSidebar series={series} tags={tags} />
      </div>
    </>
  );
}
