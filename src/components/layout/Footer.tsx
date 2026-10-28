import Link from "next/link";
import { site } from "@/config/site";
import { Wordmark } from "./Wordmark";

const linkClass = "inline-flex min-h-11 items-center text-ui text-link hover:underline";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="page-container flex flex-col gap-6 py-8 md:flex-row md:justify-between">
        <div>
          <Wordmark className="text-ui" />
          <p className="mt-2 max-w-[21rem] text-ui-sm leading-snug text-muted">
            {site.tagline}
          </p>
          <p className="mt-6 text-xs text-muted">{site.sampleNotice}</p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap content-start items-start gap-x-6"
        >
          {site.footerNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
          {site.social.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {item.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
