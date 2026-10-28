import type { Metadata } from "next";
import { site } from "@/config/site";
import { absoluteUrl, alternatesFor } from "@/lib/seo";
import { JsonLd } from "@/components/content/JsonLd";
import {
  getLatestArticles,
  getNotes,
  getProjects,
  getSeriesList,
  getTopics,
} from "@/lib/content";
import { ArticleRow } from "@/components/content/ArticleRow";
import { FeaturedSeriesPanel } from "@/components/content/FeaturedSeriesPanel";
import { NotesFeed } from "@/components/content/NotesFeed";
import { ProjectCard } from "@/components/content/ProjectCard";
import { TopicsPanel } from "@/components/content/TopicsPanel";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const LATEST_COUNT = 5;

export const metadata: Metadata = { alternates: alternatesFor("/") };

export default async function HomePage() {
  const [latest, seriesList, topics, notes, projects] = await Promise.all([
    getLatestArticles(LATEST_COUNT),
    getSeriesList(),
    getTopics(),
    getNotes(),
    getProjects(),
  ]);
  const featuredSeries = seriesList[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.domain,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />
      <section className="page-container pt-18 pb-12">
        <p className="eyebrow">A technical journal</p>
        <h1 className="mt-4 max-w-[52rem] font-serif text-display font-bold text-ink">
          Engineering notes on how systems actually work, and where they break.
        </h1>
        <p className="mt-5 max-w-[40rem] font-serif text-body leading-[1.6] text-muted">
          Architecture, implementation, debugging, trade-offs and lessons learned from
          building mobile and backend systems. Written by {site.author} as a learning
          record and a public reference.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/articles">Read the latest articles</Button>
          <Button href="/series" variant="secondary">
            Browse series
          </Button>
        </div>
      </section>

      <div className="page-container">
        <hr className="border-t border-dotted border-rule" />
      </div>

      <div className="page-container grid grid-cols-[minmax(0,1fr)] gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <section>
          <SectionHeading action={{ href: "/articles", label: "All articles" }}>
            Latest articles
          </SectionHeading>
          <ol>
            {latest.map(({ article, topic, series }, i) => (
              <li key={article.slug}>
                <ArticleRow
                  index={i + 1}
                  article={article}
                  topic={topic}
                  series={series}
                />
              </li>
            ))}
          </ol>
        </section>

        <aside
          aria-label="Featured series, topics and notes"
          className="flex flex-col gap-8"
        >
          {featuredSeries ? <FeaturedSeriesPanel series={featuredSeries} /> : null}
          <TopicsPanel topics={topics} />
          <NotesFeed notes={notes} />
        </aside>
      </div>

      <section className="page-container pt-12 pb-18">
        <SectionHeading action={{ href: "/projects", label: "All projects" }}>
          Selected projects
        </SectionHeading>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </>
  );
}
