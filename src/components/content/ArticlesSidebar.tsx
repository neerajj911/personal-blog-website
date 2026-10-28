import Link from "next/link";
import { countPublishedParts } from "@/lib/content";
import { articlesHref } from "@/lib/urls";
import type { Series } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { TagChip } from "@/components/ui/TagChip";

interface ArticlesSidebarProps {
  series: Series[];
  tags: { tag: string; count: number }[];
}

/** "Series" and "Popular tags" boxes beside the article list. */
export function ArticlesSidebar({ series, tags }: ArticlesSidebarProps) {
  return (
    <aside aria-label="Series and tags" className="flex flex-col gap-6">
      <Panel title="Series">
        <ul>
          {series.map((s) => (
            <li key={s.slug} className="border-b border-dotted border-rule pb-3">
              <Link
                href={`/series/${s.slug}`}
                className="text-ui-lg text-link hover:underline"
              >
                {s.shortTitle}
              </Link>
              <p className="text-xs text-muted">
                {countPublishedParts(s)} of {s.parts.length} parts published
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-ui-sm leading-normal text-muted">
          More series will appear here as they begin.
        </p>
      </Panel>

      <Panel title="Popular tags">
        <ul className="flex flex-wrap gap-2">
          {tags.map(({ tag }) => (
            <li key={tag}>
              <TagChip href={articlesHref({ tag })}>{tag}</TagChip>
            </li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
}
