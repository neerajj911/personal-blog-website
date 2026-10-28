import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { TopicMarker } from "@/components/ui/TopicMarker";
import { listTopicRows } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Topics" };

export default async function AdminTopicsPage({
  searchParams,
}: PageProps<"/admin/topics">) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;
  const rows = await listTopicRows();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Topics" }]}
        title="Topics"
        actions={<Button href="/admin/topics/new">New topic</Button>}
      />
      {saved ? <Notice>Saved.</Notice> : null}
      {deleted ? <Notice>Topic deleted.</Notice> : null}

      <ul className="border-t border-rule">
        {rows.map((topic) => (
          <li
            key={topic.slug}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-dotted border-rule py-3"
          >
            <Link
              href={`/admin/topics/${topic.slug}`}
              className="inline-flex min-h-11 items-center text-ui-lg font-semibold text-link hover:underline"
            >
              <TopicMarker color={topic.color} label={topic.name} />
            </Link>
            <span className="text-ui-sm text-muted">
              {topic.articleCount} published, {topic.draftCount} draft
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
