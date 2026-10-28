import "server-only";
import { requireAdmin } from "@/lib/admin/session";
import {
  articleInputSchema,
  seriesInputSchema,
  topicInputSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/schemas";
import {
  store,
  StoreConflictError,
  StoreNotFoundError,
  type StoredSeries,
} from "@/lib/store";
import type { ArticleRecord, Topic } from "@/lib/types";

/**
 * Data access for the admin panel. Every export starts with requireAdmin(), so a caller that
 * forgets its own check still cannot read a draft or write anything. Inputs are validated with
 * the Zod schemas here, not trusted from the form.
 */

export type SaveResult = { ok: true } | { ok: false; errors: FieldErrors };

const today = () => new Date().toISOString().slice(0, 10);

const fail = (field: string, message: string): SaveResult => ({
  ok: false,
  errors: { [field]: [message] },
});

/** About 220 words a minute, never less than one. */
export function readingMinutesFor(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/* ------------------------------------------------------------------ articles */

export interface ArticleRow {
  slug: string;
  title: string;
  status: ArticleRecord["status"];
  publishedAt: string;
  topicName: string;
  seriesLabel?: string;
}

export async function listArticleRows(): Promise<ArticleRow[]> {
  await requireAdmin();
  const [articles, topics, series] = await Promise.all([
    store.articles.list(),
    store.topics.list(),
    store.series.list(),
  ]);
  return articles
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      status: a.status,
      publishedAt: a.publishedAt,
      topicName: topics.find((t) => t.slug === a.topicSlug)?.shortName ?? a.topicSlug,
      seriesLabel: a.series
        ? `Part ${a.series.part} · ${
            series.find((s) => s.slug === a.series?.slug)?.shortTitle ?? a.series.slug
          }`
        : undefined,
    }));
}

export async function getArticleRecord(slug: string): Promise<ArticleRecord | undefined> {
  await requireAdmin();
  return store.articles.get(slug);
}

export async function saveArticle(
  mode: "create" | "update",
  raw: Record<string, string>,
): Promise<SaveResult> {
  await requireAdmin();

  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };
  const input = parsed.data;

  const [topics, seriesList, articles, existing] = await Promise.all([
    store.topics.list(),
    store.series.list(),
    store.articles.list(),
    store.articles.get(input.slug),
  ]);

  if (mode === "create" && existing) return fail("slug", "That slug is already used.");
  if (mode === "update" && !existing)
    return fail("slug", "This article no longer exists.");

  if (!topics.some((t) => t.slug === input.topicSlug)) {
    return fail("topicSlug", "Choose one of the existing topics.");
  }

  let series: ArticleRecord["series"];
  if (input.seriesSlug) {
    const target = seriesList.find((s) => s.slug === input.seriesSlug);
    if (!target) return fail("seriesSlug", "Choose one of the existing series.");
    const part = Number(input.seriesPart);
    if (!Number.isInteger(part) || !target.parts.some((p) => p.number === part)) {
      return fail("seriesPart", `Choose a part between 1 and ${target.parts.length}.`);
    }
    const taken = articles.find(
      (a) =>
        a.slug !== input.slug && a.series?.slug === target.slug && a.series.part === part,
    );
    if (taken)
      return fail("seriesPart", `Part ${part} already belongs to “${taken.title}”.`);
    series = { slug: target.slug, part };
  }

  const unknownRelated = input.relatedSlugs.filter(
    (slug) => slug === input.slug || !articles.some((a) => a.slug === slug),
  );
  if (unknownRelated.length) {
    return fail(
      "relatedSlugs",
      `Not an existing other article: ${unknownRelated.join(", ")}.`,
    );
  }

  // A new article needs text before it goes public. Sample articles that were already
  // published without a body keep their status.
  if (input.status === "published" && !input.body) {
    const alreadyPublishedWithoutBody =
      existing?.status === "published" && !existing.body;
    if (!alreadyPublishedWithoutBody) {
      return fail("body", "Write the article before publishing it.");
    }
  }

  const bodyChanged = (existing?.body ?? "") !== input.body;
  const record: ArticleRecord = {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    excerpt: input.excerpt,
    topicSlug: input.topicSlug,
    tags: input.tags,
    status: input.status,
    publishedAt: input.publishedAt,
    updatedAt:
      existing &&
      bodyChanged &&
      input.status === "published" &&
      today() !== input.publishedAt
        ? today()
        : existing?.updatedAt,
    readingMinutes: input.body
      ? readingMinutesFor(input.body)
      : (existing?.readingMinutes ?? 1),
    series,
    body: input.body || undefined,
    references: input.references.length ? input.references : undefined,
    relatedSlugs: input.relatedSlugs.length ? input.relatedSlugs : undefined,
  };

  try {
    await (mode === "create"
      ? store.articles.create(record)
      : store.articles.update(record));
  } catch (error) {
    if (error instanceof StoreConflictError)
      return fail("slug", "That slug is already used.");
    if (error instanceof StoreNotFoundError) {
      return fail("slug", "This article no longer exists.");
    }
    throw error;
  }
  return { ok: true };
}

export async function deleteArticle(slug: string): Promise<void> {
  await requireAdmin();
  await store.articles.remove(slug);
  // Hand-picked "related" links to the deleted article would dangle.
  for (const article of await store.articles.list()) {
    if (article.relatedSlugs?.includes(slug)) {
      const relatedSlugs = article.relatedSlugs.filter((s) => s !== slug);
      await store.articles.update({
        ...article,
        relatedSlugs: relatedSlugs.length ? relatedSlugs : undefined,
      });
    }
  }
}

/* -------------------------------------------------------------------- topics */

export interface TopicRow extends Topic {
  articleCount: number;
  draftCount: number;
}

export async function listTopicRows(): Promise<TopicRow[]> {
  await requireAdmin();
  const [topics, articles] = await Promise.all([
    store.topics.list(),
    store.articles.list(),
  ]);
  return topics.map((topic) => {
    const own = articles.filter((a) => a.topicSlug === topic.slug);
    return {
      ...topic,
      articleCount: own.filter((a) => a.status === "published").length,
      draftCount: own.filter((a) => a.status === "draft").length,
    };
  });
}

export async function listTopics(): Promise<Topic[]> {
  await requireAdmin();
  return store.topics.list();
}

export async function getTopicRecord(slug: string): Promise<Topic | undefined> {
  await requireAdmin();
  return store.topics.get(slug);
}

export async function saveTopic(
  mode: "create" | "update",
  raw: Record<string, string>,
): Promise<SaveResult> {
  await requireAdmin();
  const parsed = topicInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };
  try {
    await (mode === "create"
      ? store.topics.create(parsed.data)
      : store.topics.update(parsed.data));
  } catch (error) {
    if (error instanceof StoreConflictError)
      return fail("slug", "That slug is already used.");
    if (error instanceof StoreNotFoundError) {
      return fail("slug", "This topic no longer exists.");
    }
    throw error;
  }
  return { ok: true };
}

export async function deleteTopic(slug: string): Promise<SaveResult> {
  await requireAdmin();
  const used = (await store.articles.list()).filter((a) => a.topicSlug === slug).length;
  if (used) {
    return fail(
      "slug",
      `${used} article${used === 1 ? "" : "s"} (drafts included) still use this topic. Move them first.`,
    );
  }
  await store.topics.remove(slug);
  return { ok: true };
}

/* -------------------------------------------------------------------- series */

export interface SeriesRow {
  slug: string;
  title: string;
  partCount: number;
  publishedParts: number;
}

export async function listSeriesRows(): Promise<SeriesRow[]> {
  await requireAdmin();
  const [seriesList, articles] = await Promise.all([
    store.series.list(),
    store.articles.list(),
  ]);
  return seriesList.map((s) => ({
    slug: s.slug,
    title: s.title,
    partCount: s.parts.length,
    publishedParts: s.parts.filter((p) =>
      articles.some(
        (a) =>
          a.status === "published" &&
          a.series?.slug === s.slug &&
          a.series.part === p.number,
      ),
    ).length,
  }));
}

export interface SeriesOption {
  slug: string;
  shortTitle: string;
  parts: { number: number; title: string }[];
}

export async function listSeriesOptions(): Promise<SeriesOption[]> {
  await requireAdmin();
  return (await store.series.list()).map((s) => ({
    slug: s.slug,
    shortTitle: s.shortTitle,
    parts: s.parts.map(({ number, title }) => ({ number, title })),
  }));
}

export async function getSeriesRecord(slug: string): Promise<StoredSeries | undefined> {
  await requireAdmin();
  return store.series.get(slug);
}

export async function saveSeries(
  mode: "create" | "update",
  raw: Record<string, string>,
): Promise<SaveResult> {
  await requireAdmin();
  const parsed = seriesInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };
  const input = parsed.data;

  const parts = input.parts.map((part, index) => ({ number: index + 1, ...part }));

  if (mode === "update") {
    // Articles point at a part by number, so a part that still has an article cannot vanish.
    const articles = await store.articles.list();
    const orphaned = articles.find(
      (a) => a.series?.slug === input.slug && a.series.part > parts.length,
    );
    if (orphaned) {
      return fail(
        "parts",
        `“${orphaned.title}” is filed under part ${orphaned.series?.part}. Keep at least that many parts or move the article.`,
      );
    }
  }

  const record: StoredSeries = {
    slug: input.slug,
    title: input.title,
    shortTitle: input.shortTitle,
    summary: input.summary,
    description: input.description,
    learn: input.learn,
    prerequisites: input.prerequisites,
    source: { label: input.sourceLabel, note: input.sourceNote },
    parts,
  };

  try {
    await (mode === "create" ? store.series.create(record) : store.series.update(record));
  } catch (error) {
    if (error instanceof StoreConflictError)
      return fail("slug", "That slug is already used.");
    if (error instanceof StoreNotFoundError) {
      return fail("slug", "This series no longer exists.");
    }
    throw error;
  }
  return { ok: true };
}

export async function deleteSeries(slug: string): Promise<SaveResult> {
  await requireAdmin();
  const used = (await store.articles.list()).filter(
    (a) => a.series?.slug === slug,
  ).length;
  if (used) {
    return fail(
      "slug",
      `${used} article${used === 1 ? "" : "s"} (drafts included) are filed under this series. Move them first.`,
    );
  }
  await store.series.remove(slug);
  return { ok: true };
}
