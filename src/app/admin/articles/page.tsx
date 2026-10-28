import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import { StatusText } from "@/components/ui/StatusText";
import { listArticleRows } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/admin/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Articles" };

const filters = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
] as const;

export default async function AdminArticlesPage({
  searchParams,
}: PageProps<"/admin/articles">) {
  await requireAdmin();
  const { status, deleted } = await searchParams;
  const filter = filters.find((f) => f.value === status)?.value ?? "all";

  const rows = (await listArticleRows()).filter(
    (row) => filter === "all" || row.status === filter,
  );

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Articles" }]}
        title="Articles"
        actions={<Button href="/admin/articles/new">New article</Button>}
      />
      {deleted ? <Notice>Article deleted.</Notice> : null}

      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <FilterPill
            key={f.value}
            href={
              f.value === "all" ? "/admin/articles" : `/admin/articles?status=${f.value}`
            }
            selected={f.value === filter}
          >
            {f.label}
          </FilterPill>
        ))}
      </nav>

      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Articles">
        <table className="w-full min-w-[40rem] border-collapse text-ui-lg">
          <thead>
            <tr>
              <th className="border-b-2 border-ink px-3 py-2 text-left font-semibold">
                Title
              </th>
              <th className="border-b-2 border-ink px-3 py-2 text-left font-semibold">
                Status
              </th>
              <th className="border-b-2 border-ink px-3 py-2 text-left font-semibold">
                Topic
              </th>
              <th className="border-b-2 border-ink px-3 py-2 text-left font-semibold">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <td className="border-b border-dotted border-rule px-3 py-3 align-top">
                  <Link
                    href={`/admin/articles/${row.slug}`}
                    className="font-semibold text-link hover:underline"
                  >
                    {row.title}
                  </Link>
                  {row.seriesLabel ? (
                    <div className="text-ui-sm text-muted">{row.seriesLabel}</div>
                  ) : null}
                </td>
                <td className="border-b border-dotted border-rule px-3 py-3 align-top">
                  {row.status === "published" ? (
                    <StatusText status="published" />
                  ) : (
                    <span className="font-medium text-rust">Draft</span>
                  )}
                </td>
                <td className="border-b border-dotted border-rule px-3 py-3 align-top">
                  {row.topicName}
                </td>
                <td className="border-b border-dotted border-rule px-3 py-3 align-top whitespace-nowrap">
                  {formatDate(row.publishedAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-muted">
                  No articles here yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
