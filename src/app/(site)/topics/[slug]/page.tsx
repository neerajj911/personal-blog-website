import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getTopic, getTopics } from "@/lib/content";
import { ArticleRow } from "@/components/content/ArticleRow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";

export async function generateMetadata({
  params,
}: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopic(slug);
  return topic ? { title: topic.name } : {};
}

export async function generateStaticParams() {
  return (await getTopics()).map((t) => ({ slug: t.slug }));
}

export default async function TopicPage({
  params,
  searchParams,
}: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const requested = Number.parseInt(typeof rawPage === "string" ? rawPage : "1", 10);
  const result = await getArticles({
    topic: slug,
    page: Number.isNaN(requested) ? 1 : requested,
  });

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Topics", href: "/topics" },
          { label: topic.shortName },
        ]}
        title={topic.name}
        intro={`${topic.articleCount} ${topic.articleCount === 1 ? "article" : "articles"} in this topic, newest first.`}
      />
      <div className="page-container pb-18">
        <div className="border-t-2 border-ink" />
        {result.items.length > 0 ? (
          <ol>
            {result.items.map(({ article, topic: articleTopic, series }, i) => (
              <li key={article.slug}>
                <ArticleRow
                  index={result.from + i}
                  article={article}
                  topic={articleTopic}
                  series={series}
                />
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-4 py-10 font-serif text-body text-muted">
            Nothing has been published in this topic yet.{" "}
            <Link href="/articles" className="text-link underline underline-offset-2">
              Browse all articles
            </Link>
            .
          </p>
        )}
        {result.pageCount > 1 ? (
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            hrefFor={(page) =>
              page > 1 ? `/topics/${slug}?page=${page}` : `/topics/${slug}`
            }
          />
        ) : null}
      </div>
    </>
  );
}
