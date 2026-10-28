import { site } from "@/config/site";
import { getLatestArticles } from "@/lib/content";
import { absoluteUrl, escapeXml, rfc822 } from "@/lib/seo";

/** RSS 2.0 feed of the 20 newest published articles. */
export async function GET() {
  const items = await getLatestArticles(20);
  const newest = items[0]?.article.publishedAt;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.domain)}</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />${
      newest ? `\n    <lastBuildDate>${rfc822(newest)}</lastBuildDate>` : ""
    }
${items
  .map(({ article, topic }) => {
    const url = absoluteUrl(`/articles/${article.slug}`);
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(article.publishedAt)}</pubDate>
      <category>${escapeXml(topic.name)}</category>
      <description>${escapeXml(article.excerpt)}</description>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
