import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  title: string;
  /** Small text at the right end of the header bar, e.g. a status. */
  meta?: ReactNode;
  /** Heading level for the header bar. Default 2. */
  headingLevel?: 2 | 3;
  /** Class names for the body area (default padding is 16px). */
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}

/** Bordered box with a coloured header bar: 1px border, 4px radius, no shadow. */
export function Panel({
  title,
  meta,
  headingLevel = 2,
  bodyClassName,
  className,
  children,
}: PanelProps) {
  const headingId = useId();
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-panel border border-rule bg-panel",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 bg-bar px-4 py-2">
        <Heading
          id={headingId}
          className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-on-bar"
        >
          {title}
        </Heading>
        {meta ? (
          <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-on-bar">
            {meta}
          </span>
        ) : null}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
