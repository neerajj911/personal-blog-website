import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  countPublishedParts,
  getSeries,
  getSeriesList,
  getSeriesParts,
} from "@/lib/content";
import { SeriesPartRow } from "@/components/content/SeriesPartRow";
import { SeriesReadingProgress } from "@/components/content/SeriesReadingProgress";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  return (await getSeriesList()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/series/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  return series ? { title: series.title } : {};
}

export default async function SeriesPage({ params }: PageProps<"/series/[slug]">) {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) notFound();

  const entries = await getSeriesParts(series);
  const published = countPublishedParts(series);
  const progressText = `${published} of ${series.parts.length} parts published`;
  const publishedNumbers = series.parts
    .filter((p) => p.status === "published")
    .map((p) => p.number);
  const firstPart = entries.find((e) => e.part.status === "published" && e.article);

  return (
    <>
      <header className="page-container pt-10 pb-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Series", href: "/series" },
            { label: series.shortTitle },
          ]}
        />
        <p className="eyebrow mt-3">Series · {series.parts.length} parts planned</p>
        <h1 className="mt-3 max-w-[40rem] font-serif text-title font-bold text-ink">
          {series.title}
        </h1>
        <p className="mt-4 max-w-[48rem] font-serif text-body leading-[1.6] text-muted">
          {series.description}
        </p>
        {firstPart?.article ? (
          <div className="mt-6">
            <Button href={`/articles/${firstPart.article.slug}`}>
              Start with Part {firstPart.part.number}
            </Button>
          </div>
        ) : null}
      </header>

      <div className="page-container grid grid-cols-[minmax(0,1fr)] gap-10 pb-18 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div>
          <Panel title="What you will learn">
            <ul className="list-disc space-y-1 pl-5 font-serif text-lg leading-snug marker:text-ink">
              {series.learn.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>

          <section aria-labelledby="parts-heading" className="mt-8">
            <SectionHeading id="parts-heading">Parts</SectionHeading>
            <ol>
              {entries.map((entry) => (
                <SeriesPartRow key={entry.part.number} entry={entry} />
              ))}
            </ol>
          </section>
        </div>

        <aside
          aria-label="Progress, requirements and source code"
          className="flex flex-col gap-6"
        >
          <Panel title="Progress">
            <ProgressBar
              value={published}
              max={series.parts.length}
              label={progressText}
            />
            <p className="mt-2 text-ui-sm text-muted">{progressText}</p>
            <SeriesReadingProgress
              seriesSlug={series.slug}
              publishedParts={publishedNumbers}
            />
          </Panel>

          <Panel title="Before you start">
            <ul className="list-disc space-y-1 pl-5 text-ui leading-snug text-muted marker:text-muted">
              {series.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Source code">
            <p className="font-mono text-xs leading-normal break-words text-ink">
              {series.source.label}
            </p>
            <p className="mt-2 text-ui leading-normal text-muted">{series.source.note}</p>
          </Panel>
        </aside>
      </div>
    </>
  );
}
