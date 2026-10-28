import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getProjects } from "@/lib/content";
import { ProjectPanel } from "@/components/content/ProjectPanel";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Projects",
  alternates: alternatesFor("/projects"),
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        title="Projects"
        intro="Things I am building to understand systems properly. Each project lists the problem, the decisions made, and the articles that explain them."
      />
      <div className="page-container flex flex-col gap-6 pt-2 pb-18">
        {projects.map((project) => (
          <ProjectPanel key={project.slug} project={project} />
        ))}
      </div>
    </>
  );
}
