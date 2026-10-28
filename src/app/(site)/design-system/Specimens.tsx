import { getLatestArticles, getSeriesList } from "@/lib/content";
import type { TopicColor } from "@/lib/types";
import { ArticleRow } from "@/components/content/ArticleRow";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusText } from "@/components/ui/StatusText";
import { TagChip } from "@/components/ui/TagChip";
import { TopicMarker } from "@/components/ui/TopicMarker";
import { PillDemo } from "./PillDemo";

const sql = `SELECT * FROM outbox;
-- pending sync operations`;

const topicSpecimens: { color: TopicColor; label: string }[] = [
  { color: "flutter", label: "Flutter" },
  { color: "offline-first", label: "Offline-First" },
  { color: "backend", label: "Backend" },
  { color: "databases", label: "Databases" },
  { color: "system-design", label: "System design" },
  { color: "ai", label: "AI" },
  { color: "tools", label: "Tools" },
];

// Specimens only demonstrate styles, so their links point at the page itself.
const demoHref = "#components";

function Label({ children }: { children: string }) {
  return <p className="mb-2 font-mono text-xs text-muted">{children}</p>;
}

/** Every component once. Rendered inside a light and a dark wrapper so both themes can be compared. */
export async function Specimens() {
  const [latest] = await getLatestArticles(1);
  const [featured] = await getSeriesList();
  if (!latest || !featured) return null;
  const { article, topic, series } = latest;

  const published = featured.parts.filter((part) => part.status === "published").length;
  const progressText = `${published} of ${featured.parts.length} parts published`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <Label>Buttons, 44px minimum height</Label>
          <div className="flex flex-wrap items-center gap-3">
            <Button href={demoHref}>Primary</Button>
            <Button href={demoHref} variant="secondary">
              Secondary
            </Button>
            <a
              href={demoHref}
              className="inline-flex min-h-11 items-center text-ui text-link hover:underline"
            >
              Text link
            </a>
            <Button href={demoHref} className="outline-2 outline-offset-2 outline-rust">
              Focus ring
            </Button>
          </div>
        </div>

        <div>
          <Label>Filter pills, tags</Label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <PillDemo />
            <div className="flex flex-wrap gap-2">
              <TagChip>sqlite</TagChip>
              <TagChip>outbox</TagChip>
            </div>
          </div>
        </div>

        <div>
          <Label>Topic markers (a dot beside the label, never color alone)</Label>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-ui text-ink">
            {topicSpecimens.map((topic) => (
              <li key={topic.color}>
                <TopicMarker color={topic.color} label={topic.label} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>Panel with header bar</Label>
          <Panel title="Featured series">
            <p className="text-ui-lg leading-normal text-muted">
              Panels group series boxes, the table of contents and callouts. 1px border,
              4px radius, no shadow.
            </p>
          </Panel>
        </div>

        <div>
          <Label>Status text, always paired with a word</Label>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-ui">
            <StatusText status="published" />
            <StatusText status="coming-soon" />
            <StatusText status="current" />
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Article row</Label>
          <div className="border-t border-dotted border-rule">
            <ArticleRow index={1} article={article} topic={topic} series={series} />
          </div>
        </div>

        <div>
          <Label>Code block with copy</Label>
          <CodeBlock code={sql} language="sql" />
        </div>

        <div>
          <Label>Section heading, progress bar</Label>
          <SectionHeading action={{ href: "/series", label: "All series" }}>
            Latest articles
          </SectionHeading>
          <div className="mt-4">
            <ProgressBar
              value={published}
              max={featured.parts.length}
              label={progressText}
            />
            <p className="mt-2 text-ui-sm text-muted">{progressText}</p>
          </div>
        </div>
        <div>
          <Label>Breadcrumb</Label>
          <Breadcrumb
            items={[
              { label: "Home", href: demoHref },
              { label: "Articles", href: demoHref },
              { label: "Current page" },
            ]}
          />
        </div>

        <div>
          <Label>Pagination</Label>
          <Pagination page={2} pageCount={3} hrefFor={() => demoHref} />
        </div>
      </div>
    </div>
  );
}
