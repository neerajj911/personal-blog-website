"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/topics", label: "Topics" },
  { href: "/admin/series", label: "Series" },
] as const;

/** Admin section links. Same underline treatment as the public header's NavLink. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-x-5">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (!("exact" in item) && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group inline-flex min-h-11 items-center text-ui transition-colors",
              active ? "font-semibold text-ink" : "text-muted hover:text-ink",
            )}
          >
            <span
              className={cn(
                "border-b-2 py-0.5",
                active ? "border-rust" : "border-transparent group-hover:border-rule",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
