import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Status = "published" | "coming-soon" | "current";

const labels: Record<Status, string> = {
  published: "Published",
  "coming-soon": "Coming soon",
  current: "You are here",
};

/** Shorter wording for tight spaces such as a narrow sidebar. Still words, never colour alone. */
const shortLabels: Record<Status, string> = {
  published: "Published",
  "coming-soon": "Soon",
  current: "You are here",
};

const colors: Record<Status, string> = {
  published: "text-green",
  "coming-soon": "text-muted",
  current: "text-rust",
};

interface StatusTextProps {
  status: Status;
  /** Use the shorter wording. */
  short?: boolean;
  /** Optional extra text after the status word, e.g. "· Oct 7". */
  children?: ReactNode;
  className?: string;
}

/** Status shown as words, never colour alone. */
export function StatusText({ status, short, children, className }: StatusTextProps) {
  return (
    <span className={cn("font-medium", colors[status], className)}>
      {(short ? shortLabels : labels)[status]}
      {children ? <> {children}</> : null}
    </span>
  );
}
