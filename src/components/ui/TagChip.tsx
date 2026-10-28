import Link from "next/link";
import { cn } from "@/lib/cn";

interface TagChipProps {
  children: string;
  /** When given, the chip is a link (to a tag page). */
  href?: string;
  className?: string;
}

const base =
  "inline-flex items-center rounded-panel bg-tint px-2 py-1 font-mono text-xs leading-normal text-link";

/** A small monospace tag such as "sqlite". */
export function TagChip({ children, href, className }: TagChipProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "touch-target transition-colors hover:bg-tint-hover",
          className,
        )}
      >
        {children}
      </Link>
    );
  }
  return <span className={cn(base, className)}>{children}</span>;
}
