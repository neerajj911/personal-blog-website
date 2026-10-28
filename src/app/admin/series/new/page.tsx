import type { Metadata } from "next";
import { createSeriesAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SeriesForm } from "@/components/admin/SeriesForm";
import { seriesToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "New series" };

export default async function NewSeriesPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Series", href: "/admin/series" },
          { label: "New" },
        ]}
        title="New series"
      />
      <SeriesForm mode="create" action={createSeriesAction} initial={seriesToValues()} />
    </>
  );
}
