import type { StoredSeries } from "@/lib/store/types";
import type { ArticleRecord, Topic } from "@/lib/types";

/**
 * Stored records as the plain strings a form shows. The inverse of the parsing in
 * lib/schemas.ts: lists become lines or comma-separated text.
 */
export type FormValues = Record<string, string>;

export function articleToValues(article?: ArticleRecord): FormValues {
  return {
    slug: article?.slug ?? "",
    title: article?.title ?? "",
    subtitle: article?.subtitle ?? "",
    excerpt: article?.excerpt ?? "",
    topicSlug: article?.topicSlug ?? "",
    tags: article?.tags.join(", ") ?? "",
    status: article?.status ?? "draft",
    publishedAt: article?.publishedAt ?? new Date().toISOString().slice(0, 10),
    seriesSlug: article?.series?.slug ?? "",
    seriesPart: article?.series ? String(article.series.part) : "",
    body: article?.body ?? "",
    references:
      article?.references
        ?.map((r) => (r.href ? `${r.title} | ${r.href}` : r.title))
        .join("\n") ?? "",
    relatedSlugs: article?.relatedSlugs?.join(", ") ?? "",
  };
}

export function topicToValues(topic?: Topic): FormValues {
  return {
    slug: topic?.slug ?? "",
    name: topic?.name ?? "",
    shortName: topic?.shortName ?? "",
    color: topic?.color ?? "tools",
  };
}

export function seriesToValues(series?: StoredSeries): FormValues {
  return {
    slug: series?.slug ?? "",
    title: series?.title ?? "",
    shortTitle: series?.shortTitle ?? "",
    summary: series?.summary ?? "",
    description: series?.description ?? "",
    learn: series?.learn.join("\n") ?? "",
    prerequisites: series?.prerequisites.join("\n") ?? "",
    sourceLabel: series?.source.label ?? "",
    sourceNote: series?.source.note ?? "",
    parts:
      series?.parts
        .map((p) => (p.summary ? `${p.title} | ${p.summary}` : p.title))
        .join("\n") ?? "",
  };
}
