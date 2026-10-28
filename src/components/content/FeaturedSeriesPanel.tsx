import Link from "next/link";
import type { Series } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusText } from "@/components/ui/StatusText";

interface FeaturedSeriesPanelProps {
  series: Series;
  /** How many parts to list. */
  visibleParts?: number;
}

/** "Featured series" box: title, summary, progress and the first few parts with their status. */
export function FeaturedSeriesPanel({
  series,
  visibleParts = 4,
}: FeaturedSeriesPanelProps) {
  const published = series.parts.filter((part) => part.status === "published").length;
  const progressText = `${published} of ${series.parts.length} parts published`;

  return (
    <Panel title="Featured series">
      <h3 className="font-serif text-panel-title font-semibold">
        <Link href={`/series/${series.slug}`} className="text-link hover:underline">
          {series.title}
        </Link>
      </h3>
      <p className="mt-2 text-ui leading-normal text-muted">{series.summary}</p>

      <div className="mt-4">
        <ProgressBar value={published} max={series.parts.length} label={progressText} />
        <p className="mt-2 text-ui-sm text-muted">{progressText}</p>
      </div>

      <ol className="mt-3">
        {series.parts.slice(0, visibleParts).map((part) => (
          <li
            key={part.number}
            className="flex items-baseline justify-between gap-4 border-b border-dotted border-rule py-2 last:border-b-0"
          >
            <span className="text-ui leading-snug text-ink">
              {part.number}. {part.title}
            </span>
            <StatusText status={part.status} className="shrink-0 text-xs" />
          </li>
        ))}
      </ol>
    </Panel>
  );
}
