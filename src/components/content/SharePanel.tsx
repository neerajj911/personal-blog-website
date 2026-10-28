"use client";

import { CopyButton } from "@/components/ui/CopyButton";

/** "Share": copies the address of the page the reader is on. A client component because it passes a function. */
export function SharePanel() {
  return (
    <section
      aria-labelledby="share-heading"
      className="rounded-panel border border-rule bg-panel p-4"
    >
      <h2
        id="share-heading"
        className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-ink"
      >
        Share
      </h2>
      <CopyButton
        value={() => window.location.href}
        label="Copy link"
        size="md"
        successMessage="Link copied to clipboard"
      />
    </section>
  );
}
