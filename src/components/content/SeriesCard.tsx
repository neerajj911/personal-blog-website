import Link from "next/link";
import { countPublishedParts } from "@/lib/content";
import type { Series } from "@/lib/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

/** Summary card for the series index. */
export function SeriesCard({ series }: { series: Series }) {
  const published = countPublishedParts(series);
  const progressText = `${published} of ${series.parts.length} parts published`;

  return (
    <article className="rounded-panel border border-rule bg-panel p-5">
      <p className="eyebrow">{series.parts.length} parts planned</p>
      <h2 className="mt-2 font-serif text-item-title font-semibold">
        <Link href={`/series/${series.slug}`} className="text-link hover:underline">
          {series.title}
        </Link>
      </h2>
      <p className="mt-2 text-ui-lg leading-normal text-muted">{series.summary}</p>
      <div className="mt-4 max-w-sm">
        <ProgressBar value={published} max={series.parts.length} label={progressText} />
        <p className="mt-2 text-ui-sm text-muted">{progressText}</p>
      </div>
    </article>
  );
}
