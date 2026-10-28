import Link from "next/link";
import type { Project, ProjectStatus } from "@/lib/types";

const statusLabels: Record<ProjectStatus, string> = {
  "in-progress": "In progress",
  "in-design": "In design",
};

/** Summary card for the "Selected projects" section. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-panel border border-rule bg-panel p-5">
      <p className="eyebrow">{statusLabels[project.status]}</p>
      <h3 className="mt-2 font-serif text-item-title font-semibold">
        <Link href="/projects" className="text-link hover:underline">
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 text-ui-lg leading-normal text-muted">{project.summary}</p>
      <p className="mt-3 font-mono text-xs leading-normal text-ink">
        {(project.cardStack ?? project.stack).join(" · ")}
      </p>
    </article>
  );
}
