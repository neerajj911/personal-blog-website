"use client";

import { useSyncExternalStore } from "react";
import { parseParts, readRaw, subscribe } from "@/lib/reading-progress";

interface SeriesReadingProgressProps {
  seriesSlug: string;
  /** Numbers of the parts that are published, so unpublished ones are never counted. */
  publishedParts: number[];
}

/** "1 of 3 published parts read." Reads this browser's stored progress; nothing leaves the device. */
export function SeriesReadingProgress({
  seriesSlug,
  publishedParts,
}: SeriesReadingProgressProps) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(seriesSlug),
    () => "",
  );
  const read = parseParts(raw).filter((part) => publishedParts.includes(part)).length;

  return (
    <div className="mt-3 border-t border-dotted border-rule pt-3">
      <p className="text-ui-sm font-semibold text-ink">Your reading progress</p>
      <p className="mt-1 text-ui-sm leading-normal text-muted">
        {read} of {publishedParts.length} published parts read. Saved in this browser
        only.
      </p>
    </div>
  );
}
