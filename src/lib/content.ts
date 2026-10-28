/**
 * The only module public pages use to read content. It reads the content store and
 * returns PUBLISHED articles only: drafts never leave this file, so no page can leak one.
 * Notes, projects and the About text still come from the sample data until the admin
 * panel can edit them.
 */
import "server-only";
import { cache } from "react";
import { about, notes, projects } from "@/data/sample-content";
import { store, type StoredSeries } from "@/lib/store";
import type {
  AboutContent,
  Article,
  Note,
  Project,
  Series,
  SeriesPart,
  Topic,
  TopicWithCount,
} from "@/lib/types";

export const ARTICLES_PER_PAGE = 8;

export type ArticleSort = "newest" | "oldest";

export interface ArticleQuery {
  topic?: string;
  tag?: string;
  /** Free-text search over title, excerpt, tags and topic name. */
  q?: string;
  sort?: ArticleSort;
  /** 1-based. Out-of-range values are clamped. */
  page?: number;
}

/** An article with the records a list row needs. */
export interface ArticleListItem {
  article: Article;
  topic: Topic;
  series?: Series;
}

export interface ArticlePage {
  items: ArticleListItem[];
  total: number;
  page: number;
  pageCount: number;
  /** 1-based position of the first and last item shown, 0 when empty. */
  from: number;
  to: number;
}

interface PublicContent {
  articles: Article[];
  topics: Topic[];
  series: Series[];
}

/** A part is published exactly when a published article is filed under it. */
function toSeries(stored: StoredSeries, articles: Article[]): Series {
  return {
    ...stored,
    parts: stored.parts.map((part): SeriesPart => ({
      ...part,
      status: articles.some(
        (a) => a.series?.slug === stored.slug && a.series.part === part.number,
      )
        ? "published"
        : "coming-soon",
    })),
  };
}

/** One read of the store per request, with drafts removed. */
const load = cache(async (): Promise<PublicContent> => {
  const [records, topics, storedSeries] = await Promise.all([
    store.articles.list(),
    store.topics.list(),
    store.series.list(),
  ]);
  const articles = records
    .filter((record) => record.status === "published")
    .map(({ status: _status, ...article }): Article => article);
  return { articles, topics, series: storedSeries.map((s) => toSeries(s, articles)) };
});

function topicOf(article: Article, topics: Topic[]): Topic {
  const topic = topics.find((t) => t.slug === article.topicSlug);
  if (!topic)
    throw new Error(`Article ${article.slug} has unknown topic ${article.topicSlug}`);
  return topic;
}

function seriesOf(article: Article, series: Series[]): Series | undefined {
  if (!article.series) return undefined;
  return series.find((s) => s.slug === article.series?.slug);
}

function toListItem(article: Article, content: PublicContent): ArticleListItem {
  return {
    article,
    topic: topicOf(article, content.topics),
    series: seriesOf(article, content.series),
  };
}

function byDate(sort: ArticleSort) {
  return (a: Article, b: Article) =>
    sort === "newest"
      ? b.publishedAt.localeCompare(a.publishedAt)
      : a.publishedAt.localeCompare(b.publishedAt);
}

function matchesSearch(article: Article, q: string, topics: Topic[]): boolean {
  const haystack = [
    article.title,
    article.excerpt,
    topicOf(article, topics).name,
    ...article.tags,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export async function getArticles(query: ArticleQuery = {}): Promise<ArticlePage> {
  const { topic, tag, q, sort = "newest", page = 1 } = query;
  const content = await load();

  const matching = content.articles
    .filter((a) => !topic || a.topicSlug === topic)
    .filter((a) => !tag || a.tags.includes(tag))
    .filter((a) => !q || matchesSearch(a, q, content.topics))
    .sort(byDate(sort));

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * ARTICLES_PER_PAGE;
  const slice = matching.slice(start, start + ARTICLES_PER_PAGE);

  return {
    items: slice.map((a) => toListItem(a, content)),
    total,
    page: current,
    pageCount,
    from: slice.length ? start + 1 : 0,
    to: start + slice.length,
  };
}

export async function getLatestArticles(limit: number): Promise<ArticleListItem[]> {
  const content = await load();
  return [...content.articles]
    .sort(byDate("newest"))
    .slice(0, limit)
    .map((a) => toListItem(a, content));
}

export async function getArticle(slug: string): Promise<ArticleListItem | undefined> {
  const content = await load();
  const article = content.articles.find((a) => a.slug === slug);
  return article ? toListItem(article, content) : undefined;
}

export async function getArticleSlugs(): Promise<string[]> {
  return (await load()).articles.map((a) => a.slug);
}

export async function getTopics(): Promise<TopicWithCount[]> {
  const { articles, topics } = await load();
  return topics.map((topic) => ({
    ...topic,
    articleCount: articles.filter((a) => a.topicSlug === topic.slug).length,
  }));
}

export async function getTopic(slug: string): Promise<TopicWithCount | undefined> {
  return (await getTopics()).find((t) => t.slug === slug);
}

/** Tags ordered by how many articles use them, then alphabetically. */
export async function getPopularTags(
  limit: number,
): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const article of (await load()).articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

export async function getSeriesList(): Promise<Series[]> {
  return (await load()).series;
}

export async function getSeries(slug: string): Promise<Series | undefined> {
  return (await load()).series.find((s) => s.slug === slug);
}

export function countPublishedParts(s: Series): number {
  return s.parts.filter((p) => p.status === "published").length;
}

export interface SeriesPartEntry {
  part: SeriesPart;
  /** The article for this part; absent while the part is coming soon. */
  article?: Article;
}

export async function getSeriesParts(s: Series): Promise<SeriesPartEntry[]> {
  const { articles } = await load();
  return s.parts.map((part) => ({
    part,
    article: articles.find(
      (a) => a.series?.slug === s.slug && a.series.part === part.number,
    ),
  }));
}

export interface ArticleSeriesContext {
  series: Series;
  part: number;
  entries: SeriesPartEntry[];
  previous?: SeriesPartEntry;
  next?: SeriesPartEntry;
}

export async function getArticleSeriesContext(
  article: Article,
): Promise<ArticleSeriesContext | undefined> {
  const s = seriesOf(article, (await load()).series);
  if (!s || !article.series) return undefined;
  const entries = await getSeriesParts(s);
  const index = entries.findIndex((e) => e.part.number === article.series?.part);
  return {
    series: s,
    part: article.series.part,
    entries,
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index >= 0 ? entries[index + 1] : undefined,
  };
}

/**
 * Hand-picked related articles first, then articles that share tags or the
 * topic, newest first. Never the article itself or others in its series.
 */
export async function getRelatedArticles(
  article: Article,
  limit: number,
): Promise<ArticleListItem[]> {
  const content = await load();
  const { articles } = content;
  const chosen = (article.relatedSlugs ?? [])
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is Article => a !== undefined);

  const score = (a: Article) =>
    a.tags.filter((t) => article.tags.includes(t)).length * 2 +
    (a.topicSlug === article.topicSlug ? 1 : 0);

  const computed = articles
    .filter((a) => a.slug !== article.slug)
    .filter((a) => !(article.series && a.series?.slug === article.series.slug))
    .filter((a) => !chosen.includes(a))
    .filter((a) => score(a) > 0)
    .sort((a, b) => score(b) - score(a) || b.publishedAt.localeCompare(a.publishedAt));

  return [...chosen, ...computed].slice(0, limit).map((a) => toListItem(a, content));
}

export async function getNotes(): Promise<Note[]> {
  return notes;
}

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getAbout(): Promise<AboutContent> {
  return about;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((p) => p.slug === slug);
}
