import Form from "next/form";
import { site } from "@/config/site";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

/**
 * Wordmark, main navigation and search. On narrow screens the three stack
 * (wordmark, links, search); the PDF defines the desktop layout only.
 */
export function Header() {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="page-container flex flex-wrap items-center gap-x-6 gap-y-1 py-3.5">
        <Wordmark className="text-lg" />

        <nav
          aria-label="Main"
          className="order-1 flex w-full gap-x-6 md:order-none md:w-auto"
        >
          {site.nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Form
          action="/articles"
          role="search"
          className="relative order-2 mt-1 w-full lg:order-none lg:mt-0 lg:ml-auto lg:w-60"
        >
          <label htmlFor="site-search" className="sr-only">
            Search articles
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="4.75" />
            <path d="m10.5 10.5 3.5 3.5" />
          </svg>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search articles"
            autoComplete="off"
            className="h-11 w-full rounded-panel border border-rule bg-panel pr-3 pl-9 font-sans text-ui text-ink placeholder:text-muted hover:border-muted"
          />
        </Form>

        {/* Mobile: beside the wordmark (order 0 puts it before nav and search). Desktop: after search. */}
        <ThemeToggle className="ml-auto lg:ml-0" />
      </div>
    </header>
  );
}
