import { jsonLd } from "@/lib/seo";

/** Structured data for search engines. Rendered on the server; the data is escaped by jsonLd(). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
