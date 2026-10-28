import { site } from "@/config/site";

/**
 * The site's public origin, used for canonical links, the sitemap, the RSS feed and Open Graph.
 * Set SITE_URL in production (for example https://example.com). On Vercel the production domain
 * is used when SITE_URL is not set; otherwise it is localhost.
 */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Preview and branch deployments must not be indexed; only production (or a non-Vercel host) is. */
export function isIndexable(): boolean {
  const env = process.env.VERCEL_ENV;
  return !env || env === "production";
}

/** The author name, or undefined while it is still the "[Your Name]" placeholder. */
export function authorName(): string | undefined {
  return site.author.includes("[") ? undefined : site.author;
}

/** JSON for a <script type="application/ld+json"> tag. "<" is escaped so text cannot close the tag. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** "2026-10-21" -> RFC 822 date for RSS, at midnight UTC. */
export function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * `alternates` for a page: its canonical path plus the RSS link. A page's own `alternates`
 * replaces the layout's, so every page that sets a canonical must repeat the feed link.
 */
export function alternatesFor(path: string) {
  return { canonical: path, types: { "application/rss+xml": "/feed.xml" } };
}
