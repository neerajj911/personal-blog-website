"use client";

import { useEffect, useRef } from "react";
import { markPartRead } from "@/lib/reading-progress";

interface MarkAsReadProps {
  seriesSlug: string;
  part: number;
}

/**
 * Invisible marker placed at the end of an article. When the reader scrolls it into view,
 * the part counts as read in this browser's progress for the series.
 */
export function MarkAsRead({ seriesSlug, part }: MarkAsReadProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        markPartRead(seriesSlug, part);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [seriesSlug, part]);

  return <div ref={ref} aria-hidden="true" />;
}
