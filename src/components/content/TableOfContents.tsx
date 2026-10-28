"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface TocItem {
  id: string;
  label: string;
}

/** Links to the article's headings. The heading nearest the top of the screen is highlighted. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const update = () => {
      // The active heading is the last one that has scrolled past a line 30% down the screen.
      const line = window.innerHeight * 0.3;
      let current = elements[0]?.id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <ol>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "block py-1 text-ui hover:text-ink hover:underline",
                active ? "font-semibold text-ink" : "text-muted",
              )}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
