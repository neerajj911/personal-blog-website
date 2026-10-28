import type { Metadata } from "next";
import { getSeriesList } from "@/lib/content";
import { SeriesCard } from "@/components/content/SeriesCard";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Series" };

export default async function SeriesIndexPage() {
  const series = await getSeriesList();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Series" }]}
        title="Series"
        intro="Multi-part walk-throughs. A part is published only after its implementation or experiment is finished and understood."
      />
      <div className="page-container pb-18">
        <div className="grid gap-6 md:grid-cols-2">
          {series.map((s) => (
            <SeriesCard key={s.slug} series={s} />
          ))}
        </div>
        <p className="mt-8 text-ui-lg text-muted">
          More series will appear here as they begin.
        </p>
      </div>
    </>
  );
}
