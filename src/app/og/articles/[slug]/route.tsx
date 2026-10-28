import { getArticle } from "@/lib/content";
import { renderOgImage } from "@/lib/og";

/**
 * Social preview image for one article, at a stable address (/og/articles/<slug>) so the same
 * URL can go in the page's Open Graph tags and its JSON-LD. Unknown or draft slugs get a 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const found = await getArticle(slug);
  if (!found) return new Response("Not found", { status: 404 });

  const image = renderOgImage({
    title: found.article.title,
    kicker: found.series
      ? `${found.series.shortTitle} · Part ${found.article.series?.part}`
      : found.topic.name,
  });
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return image;
}
