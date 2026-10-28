import type { MetadataRoute } from "next";
import { getAllArticles, getSeriesList, getTopics } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

/** Published articles, series, topics that have articles, and the static pages. Never drafts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, series, topics] = await Promise.all([
    getAllArticles(),
    getSeriesList(),
    getTopics(),
  ]);

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/articles") },
    { url: absoluteUrl("/topics") },
    { url: absoluteUrl("/series") },
    { url: absoluteUrl("/projects") },
    { url: absoluteUrl("/about") },
    ...items.map(({ article }) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt ?? article.publishedAt,
    })),
    ...series.map((s) => ({ url: absoluteUrl(`/series/${s.slug}`) })),
    ...topics
      .filter((t) => t.articleCount > 0)
      .map((t) => ({ url: absoluteUrl(`/topics/${t.slug}`) })),
  ];
}
