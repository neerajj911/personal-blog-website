import Link from "next/link";
import type { Project, ProjectStatus } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { TagChip } from "@/components/ui/TagChip";

const statusLabels: Record<ProjectStatus, string> = {
  "in-progress": "In progress",
  "in-design": "In design",
};

const label =
  "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-rust";

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className={label}>{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Full description of one project: problem, decisions, lessons, stack, architecture and links. */
export function ProjectPanel({ project }: { project: Project }) {
  return (
    <Panel
      title={project.title}
      meta={statusLabels[project.status]}
      bodyClassName="grid gap-x-16 gap-y-6 p-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    >
      <div>
        <Field title="Problem">
          <p className="font-serif text-body leading-[1.65] text-ink">
            {project.problem}
          </p>
        </Field>
        <Field title="Key engineering decisions">
          <ul className="list-disc space-y-1 pl-5 font-serif text-lg leading-[1.55] marker:text-ink">
            {project.decisions.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ul>
        </Field>
        <Field title="Lessons learned">
          <p className="font-serif text-lg leading-[1.55] text-muted italic">
            {project.lessons}
          </p>
        </Field>
      </div>

      <div>
        <Field title="Stack">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <li key={item}>
                <TagChip>{item}</TagChip>
              </li>
            ))}
          </ul>
        </Field>
        <Field title="Architecture">
          <ol className="flex flex-col gap-2 rounded-panel border border-rule bg-paper p-2">
            {project.architecture.map((layer) => (
              <li
                key={layer}
                className="rounded-panel border border-ink bg-panel px-3 py-2 text-center font-mono text-xs text-ink"
              >
                {layer}
              </li>
            ))}
          </ol>
        </Field>
        <Field title="Links">
          <ul className="space-y-1 text-ui-lg">
            {project.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <Link href={link.href} className="text-link hover:underline">
                    {link.label}
                  </Link>
                ) : (
                  <span className="text-muted">{link.label}</span>
                )}
              </li>
            ))}
          </ul>
        </Field>
      </div>
    </Panel>
  );
}
