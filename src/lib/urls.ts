import type { ArticleSort } from "@/lib/content";

export interface ArticleListParams {
  topic?: string;
  tag?: string;
  q?: string;
  sort?: ArticleSort;
  page?: number;
}

/** Builds /articles?... leaving out values that are the default, so URLs stay short. */
export function articlesHref(params: ArticleListParams = {}): string {
  const search = new URLSearchParams();
  if (params.topic) search.set("topic", params.topic);
  if (params.tag) search.set("tag", params.tag);
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "newest") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/articles?${query}` : "/articles";
}
