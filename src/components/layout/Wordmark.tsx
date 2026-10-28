import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";

/** The bracketed monospace site name, "[ yourname.dev ]", linking home. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.domain}, home`}
      className={cn("font-mono font-semibold text-ink", className)}
    >
      [ {site.domain} ]
    </Link>
  );
}
