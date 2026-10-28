import type { Metadata } from "next";
import Link from "next/link";
import { getTopics } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { TopicMarker } from "@/components/ui/TopicMarker";

export const metadata: Metadata = { title: "Topics" };

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Topics" }]}
        title="Topics"
        intro="Everything published, grouped by subject."
      />
      <div className="page-container pb-18">
        <ul className="border-t-2 border-ink">
          {topics.map((topic) => (
            <li
              key={topic.slug}
              className="flex items-center justify-between gap-4 border-b border-dotted border-rule px-4"
            >
              <Link
                href={`/topics/${topic.slug}`}
                className="inline-flex min-h-14 items-center font-serif text-item-title font-semibold text-link hover:underline"
              >
                <TopicMarker color={topic.color} label={topic.name} />
              </Link>
              <span className="font-mono text-xs text-muted">
                {topic.articleCount} {topic.articleCount === 1 ? "article" : "articles"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
