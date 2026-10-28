import Link from "next/link";
import type { TopicWithCount } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { TopicMarker } from "@/components/ui/TopicMarker";

/** "Topics" box: each topic with its marker and article count. */
export function TopicsPanel({ topics }: { topics: TopicWithCount[] }) {
  return (
    <Panel title="Topics" bodyClassName="px-4 py-2">
      <ul>
        {topics.map((topic) => (
          <li
            key={topic.slug}
            className="flex items-center justify-between gap-4 border-b border-dotted border-rule last:border-b-0"
          >
            <Link
              href={`/topics/${topic.slug}`}
              className="inline-flex items-center py-1.5 text-ui text-link hover:underline"
            >
              <TopicMarker color={topic.color} label={topic.name} />
            </Link>
            <span
              className="font-mono text-xs text-muted"
              aria-label={`${topic.articleCount} articles`}
            >
              {topic.articleCount}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
