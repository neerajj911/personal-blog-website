"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavLinkProps {
  href: string;
  children: string;
}

/** Header link. Marks the current section with aria-current and a rust underline. */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
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
        {children}
      </span>
    </Link>
  );
}
