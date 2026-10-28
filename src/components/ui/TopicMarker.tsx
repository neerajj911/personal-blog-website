import { cn } from "@/lib/cn";
import type { TopicColor } from "@/lib/types";

const dotColor: Record<TopicColor, string> = {
  flutter: "bg-topic-flutter",
  "offline-first": "bg-topic-offline-first",
  backend: "bg-topic-backend",
  databases: "bg-topic-databases",
  "system-design": "bg-topic-system-design",
  ai: "bg-topic-ai",
  tools: "bg-topic-tools",
};

interface TopicMarkerProps {
  color: TopicColor;
  /** The label is required: the dot never carries the meaning on its own. */
  label: string;
  className?: string;
}

/** Coloured dot plus the topic's name. */
export function TopicMarker({ color, label, className }: TopicMarkerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full", dotColor[color])}
      />
      {label}
    </span>
  );
}
