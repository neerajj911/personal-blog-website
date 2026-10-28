import "server-only";
import { articles, series, topics } from "@/data/sample-content";
import type { ArticleRecord } from "@/lib/types";
import type { StoredSeries } from "./types";

export interface StoreData {
  version: 1;
  articles: ArticleRecord[];
  topics: typeof topics;
  series: StoredSeries[];
}

/** The mockup's sample content, as the first contents of an empty store. */
export function seedData(): StoreData {
  return {
    version: 1,
    articles: articles.map((article): ArticleRecord => ({
      ...article,
      status: "published",
    })),
    topics: structuredClone(topics),
    series: series.map((s): StoredSeries => ({
      ...structuredClone(s),
      parts: s.parts.map(({ number, title, summary }) => ({ number, title, summary })),
    })),
  };
}
