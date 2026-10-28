"use client";

import { useRouter } from "next/navigation";
import type { ArticleSort } from "@/lib/content";
import { articlesHref, type ArticleListParams } from "@/lib/urls";

interface SortSelectProps {
  value: ArticleSort;
  /** The other active filters, kept when the order changes. */
  params: Omit<ArticleListParams, "sort" | "page">;
}

/** "Sort: Newest". Changing it reloads the list with the new order, back on page 1. */
export function SortSelect({ value, params }: SortSelectProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 text-ui-sm text-muted">
      <label htmlFor="article-sort">Sort</label>
      <select
        id="article-sort"
        value={value}
        onChange={(event) =>
          router.push(
            articlesHref({ ...params, sort: event.target.value as ArticleSort }),
          )
        }
        className="h-9 rounded-panel border border-rule bg-panel pr-2 pl-2 font-sans text-ui text-ink hover:border-muted"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>
  );
}
