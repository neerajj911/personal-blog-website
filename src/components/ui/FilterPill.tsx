import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BaseProps {
  selected?: boolean;
  className?: string;
  children: ReactNode;
}

type PillAsLink = BaseProps & { href: string };
type PillAsButton = BaseProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

const base =
  "touch-target inline-flex h-9 items-center rounded-full border px-4 font-sans text-ui font-medium transition-colors";

const states = {
  selected: "border-ink bg-ink text-paper",
  default: "border-rule bg-panel text-ink hover:border-ink",
};

/**
 * A filter choice. As a link (filters that change the URL) it marks the
 * current choice with aria-current; as a button it uses aria-pressed.
 */
export function FilterPill(props: PillAsLink | PillAsButton) {
  const { selected = false, className, children, ...rest } = props;
  const classes = cn(base, selected ? states.selected : states.default, className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link
        href={rest.href}
        className={classes}
        aria-current={selected ? "true" : undefined}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ComponentProps<"button">, "className" | "children">;
  return (
    <button type="button" className={classes} aria-pressed={selected} {...buttonProps}>
      {children}
    </button>
  );
}
