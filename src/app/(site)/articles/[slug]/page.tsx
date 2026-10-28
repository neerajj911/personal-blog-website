import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import {
  getArticle,
  getArticleSeriesContext,
  getArticleSlugs,
  getRelatedArticles,
} from "@/lib/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { articlesHref } from "@/lib/urls";
import { InSeriesPanel } from "@/components/content/InSeriesPanel";
import { MarkAsRead } from "@/components/content/MarkAsRead";
import { PrevNextCards } from "@/components/content/PrevNextCards";
import { ReferencesList, REFERENCES_ID } from "@/components/content/ReferencesList";
import { RelatedArticles } from "@/components/content/RelatedArticles";
import { SharePanel } from "@/components/content/SharePanel";
import { TableOfContents, type TocItem } from "@/components/content/TableOfContents";
import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";
import { Panel } from "@/components/ui/Panel";
import { TagChip } from "@/components/ui/TagChip";
import { TopicMarker } from "@/components/ui/TopicMarker";

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getArticle(slug);
  return found ? { title: found.article.title } : {};
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) notFound();

  const { article, topic } = found;
  const [seriesContext, related, rendered] = await Promise.all([
    getArticleSeriesContext(article),
    getRelatedArticles(article, 2),
    article.body ? renderMarkdown(article.body) : undefined,
  ]);

  const references = article.references ?? [];
  const tocItems: TocItem[] = [
    ...(rendered?.headings
      .filter((h) => h.depth === 2)
      .map((h) => ({ id: h.id, label: h.text })) ?? []),
    ...(references.length > 0 ? [{ id: REFERENCES_ID, label: "References" }] : []),
  ];

  const breadcrumbs: Crumb[] = seriesContext
    ? [
        { label: "Series", href: "/series" },
        {
          label: seriesContext.series.shortTitle,
          href: `/series/${seriesContext.series.slug}`,
        },
        { label: `Part ${seriesContext.part}` },
      ]
    : [
        { label: "Articles", href: "/articles" },
        { label: topic.shortName, href: articlesHref({ topic: topic.slug }) },
      ];

  return (
    <article>
      <header className="page-container pt-8 pb-10">
        <Breadcrumb items={breadcrumbs} />
        {seriesContext ? (
          <p className="eyebrow mt-3">
            Part {seriesContext.part} of {seriesContext.series.parts.length} ·{" "}
            {seriesContext.series.shortTitle}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-[44rem] font-serif text-title font-bold text-ink">
          {article.title}
        </h1>
        <p className="mt-4 max-w-[44rem] font-serif text-xl leading-snug text-muted">
          {article.subtitle ?? article.excerpt}
        </p>
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-ui-sm text-muted">
          <span className="font-semibold text-ink">{site.author}</span>
          <span>
            Published{" "}
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </span>
          {article.updatedAt ? (
            <span>
              Updated{" "}
              <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
            </span>
          ) : null}
          <span>{formatReadingTime(article.readingMinutes)}</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <TopicMarker
            color={topic.color}
            label={topic.shortName}
            className="text-ui-sm text-ink"
          />
          {article.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <TagChip href={articlesHref({ tag })}>{tag}</TagChip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <div className="page-container grid grid-cols-[minmax(0,1fr)] gap-12 pb-18 lg:grid-cols-[minmax(0,45rem)_16.25rem] lg:justify-between">
        <div>
          {rendered ? (
            rendered.content
          ) : (
            <Panel title="Sample article" headingLevel={2}>
              <p className="font-serif text-body text-muted">
                This article is sample content. Its text is not part of the mockup, so
                only the summary above is shown.
              </p>
            </Panel>
          )}

          <ReferencesList references={references} />

          {seriesContext ? (
            <>
              <MarkAsRead
                seriesSlug={seriesContext.series.slug}
                part={seriesContext.part}
              />
              <PrevNextCards context={seriesContext} />
            </>
          ) : (
            <div className="mt-12" />
          )}

          <RelatedArticles items={related} />
        </div>

        <aside
          aria-label="Table of contents, series and sharing"
          className="flex flex-col gap-6 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain"
        >
          {tocItems.length > 0 ? (
            <Panel
              title="On this page"
              bodyClassName="px-4 py-3"
              className="hidden lg:block"
            >
              <nav aria-label="On this page">
                <TableOfContents items={tocItems} />
              </nav>
            </Panel>
          ) : null}
          {seriesContext ? <InSeriesPanel context={seriesContext} /> : null}
          <SharePanel />
        </aside>
      </div>
    </article>
  );
}
