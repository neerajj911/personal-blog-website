import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { listArticleRows, listSeriesRows, listTopicRows } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/admin/session";
import { formatDate } from "@/lib/format";

export default async function AdminDashboard() {
  await requireAdmin();
  const [articles, topics, series] = await Promise.all([
    listArticleRows(),
    listTopicRows(),
    listSeriesRows(),
  ]);

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft");

  const stats = [
    { label: "Published articles", value: published, href: "/admin/articles" },
    { label: "Drafts", value: drafts.length, href: "/admin/articles" },
    { label: "Topics", value: topics.length, href: "/admin/topics" },
    { label: "Series", value: series.length, href: "/admin/series" },
  ];

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: "Admin" }]}
        title="Dashboard"
        actions={<Button href="/admin/articles/new">New article</Button>}
      />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-panel border border-rule bg-panel p-4">
            <dt className="text-ui-sm text-muted">{stat.label}</dt>
            <dd className="mt-1 font-serif text-h2 font-bold text-ink">
              <Link href={stat.href} className="hover:underline">
                {stat.value}
              </Link>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <Panel title="Drafts" meta={`${drafts.length}`}>
          {drafts.length ? (
            <ul>
              {drafts.map((draft) => (
                <li
                  key={draft.slug}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-dotted border-rule py-3 last:border-b-0"
                >
                  <Link
                    href={`/admin/articles/${draft.slug}`}
                    className="text-ui-lg font-semibold text-link hover:underline"
                  >
                    {draft.title}
                  </Link>
                  <span className="text-ui-sm text-muted">
                    {draft.topicName} · {formatDate(draft.publishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ui text-muted">No drafts.</p>
          )}
        </Panel>
      </div>
    </>
  );
}
