"use client";

import { useSyncExternalStore } from "react";
import { currentTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

/** Light/dark switch for the header. Icon shows the theme you would switch to. */
export function ThemeToggle({ className }: { className?: string }) {
  // The server cannot know the theme, so it renders "light"; the client corrects it on hydration.
  const theme = useSyncExternalStore<Theme>(subscribeTheme, currentTheme, () => "light");
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      suppressHydrationWarning
      className={`inline-flex size-11 items-center justify-center rounded-panel border border-rule bg-panel text-ink transition-colors hover:border-muted ${className ?? ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {theme === "dark" ? (
          // Sun: shown in dark theme, switches to light.
          <>
            <circle cx="8" cy="8" r="2.75" />
            <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
          </>
        ) : (
          // Moon: shown in light theme, switches to dark.
          <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
        )}
      </svg>
    </button>
  );
}
