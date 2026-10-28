import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { listSeriesRows } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Series" };

export default async function AdminSeriesPage({
  searchParams,
}: PageProps<"/admin/series">) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;
  const rows = await listSeriesRows();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Series" }]}
        title="Series"
        actions={<Button href="/admin/series/new">New series</Button>}
      />
      {saved ? <Notice>Saved.</Notice> : null}
      {deleted ? <Notice>Series deleted.</Notice> : null}

      <ul className="border-t border-rule">
        {rows.map((row) => (
          <li
            key={row.slug}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-dotted border-rule py-3"
          >
            <Link
              href={`/admin/series/${row.slug}`}
              className="inline-flex min-h-11 items-center text-ui-lg font-semibold text-link hover:underline"
            >
              {row.title}
            </Link>
            <span className="text-ui-sm text-muted">
              {row.publishedParts} of {row.partCount} parts published
            </span>
          </li>
        ))}
        {rows.length === 0 ? <li className="py-6 text-muted">No series yet.</li> : null}
      </ul>
    </>
  );
}
