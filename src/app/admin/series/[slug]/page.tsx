import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteSeriesAction, updateSeriesAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { SeriesForm } from "@/components/admin/SeriesForm";
import { getSeriesRecord } from "@/lib/admin/content";
import { seriesToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";
import { SLUG_PATTERN } from "@/lib/schemas";

export const metadata: Metadata = { title: "Edit series" };

export default async function EditSeriesPage({
  params,
}: PageProps<"/admin/series/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) notFound();
  const series = await getSeriesRecord(slug);
  if (!series) notFound();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Series", href: "/admin/series" },
          { label: series.shortTitle },
        ]}
        title="Edit series"
      />
      <SeriesForm
        mode="update"
        action={updateSeriesAction}
        initial={seriesToValues(series)}
      />
      <div className="mt-10 max-w-xl">
        <DeleteForm
          slug={series.slug}
          what="series"
          action={deleteSeriesAction}
          consequence="A series can only be deleted when no article, draft or published, is filed under it."
        />
      </div>
    </>
  );
}
