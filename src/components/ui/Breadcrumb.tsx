import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  /** Omit on the current page. */
  href?: string;
}

/** "Home / Articles": links are blue, the current page is muted text. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-ui-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 ? (
              <li aria-hidden="true" className="text-muted">
                /
              </li>
            ) : null}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-8 items-center text-link hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-muted">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
