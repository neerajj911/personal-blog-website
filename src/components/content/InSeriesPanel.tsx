import Link from "next/link";
import type { ArticleSeriesContext } from "@/lib/content";
import { Panel } from "@/components/ui/Panel";
import { StatusText, type Status } from "@/components/ui/StatusText";

const WINDOW = 5;

/** "In this series": a window of parts around the current one, each with its status. */
export function InSeriesPanel({ context }: { context: ArticleSeriesContext }) {
  const { part, entries } = context;
  const total = entries.length;
  const start = Math.max(0, Math.min(part - 1 - Math.floor(WINDOW / 2), total - WINDOW));
  const visible = entries.slice(start, start + WINDOW);

  return (
    <Panel title="In this series">
      <ol className="space-y-3">
        {visible.map(({ part: p, article }) => {
          const current = p.number === part;
          const published = p.status === "published";
          const status: Status = current
            ? "current"
            : published
              ? "published"
              : "coming-soon";
          const text = current
            ? "font-semibold text-rust"
            : published
              ? "text-ink"
              : "text-muted";
          return (
            <li key={p.number} className="flex items-baseline justify-between gap-3">
              <span className={`flex gap-2 text-ui-sm leading-[1.2] ${text}`}>
                <span>{p.number}</span>
                {article && !current ? (
                  <Link
                    href={`/articles/${article.slug}`}
                    className="hover:text-link hover:underline"
                  >
                    {p.title}
                  </Link>
                ) : (
                  <span aria-current={current ? "page" : undefined}>{p.title}</span>
                )}
              </span>
              <StatusText status={status} short className="shrink-0 text-[0.6875rem]" />
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
