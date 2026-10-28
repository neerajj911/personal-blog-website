import type { ReactNode } from "react";

const box =
  "rounded-panel border border-ink bg-panel px-3 py-2 font-sans text-ui-sm font-medium whitespace-nowrap text-ink";
const arrow = "text-muted";

/**
 * Hand-built sample diagram for the outbox article.
 *
 * Placeholder for the Mermaid step in the plan (rendered to SVG on the server at publish
 * time). Until that exists, a fence tagged `diagram:<name>` in an article picks one of the
 * components below by name.
 */
function OutboxDiagram() {
  return (
    <div
      role="img"
      aria-label="Flutter UI, then one transaction that writes notes and outbox together, then Sync worker, then Node.js API"
      className="flex flex-wrap items-center justify-center gap-3"
    >
      <span aria-hidden="true" className={box}>
        Flutter UI
      </span>
      <span aria-hidden="true" className={arrow}>
        →
      </span>
      <span
        aria-hidden="true"
        className="flex flex-col gap-1 rounded-panel border border-dashed border-rust px-3 pt-1 pb-3"
      >
        <span className="eyebrow text-[0.6875rem] tracking-[0.08em]">
          One transaction
        </span>
        <span className="flex gap-2">
          <span className={`${box} font-mono text-xs`}>notes</span>
          <span className={`${box} font-mono text-xs`}>outbox</span>
        </span>
      </span>
      <span aria-hidden="true" className={arrow}>
        →
      </span>
      <span aria-hidden="true" className={box}>
        Sync worker
      </span>
      <span aria-hidden="true" className={arrow}>
        →
      </span>
      <span aria-hidden="true" className={box}>
        Node.js API
      </span>
    </div>
  );
}

const diagrams: Record<string, () => ReactNode> = {
  outbox: OutboxDiagram,
};

export function DiagramFigure({ name, caption }: { name: string; caption?: string }) {
  const Diagram = diagrams[name];
  if (!Diagram) return null;

  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-panel border border-rule bg-panel p-6">
        <Diagram />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-ui-sm leading-normal text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
