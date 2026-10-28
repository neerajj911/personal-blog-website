import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "./Breadcrumb";

interface PageHeaderProps {
  breadcrumbs: Crumb[];
  title: string;
  /** Short introduction under the title. */
  intro?: ReactNode;
}

/** Breadcrumb, page title and introduction, as at the top of Articles and Projects. */
export function PageHeader({ breadcrumbs, title, intro }: PageHeaderProps) {
  return (
    <header className="page-container pt-10 pb-6">
      <Breadcrumb items={breadcrumbs} />
      <h1 className="mt-3 font-serif text-page-title font-bold text-ink">{title}</h1>
      {intro ? (
        <p className="mt-3 max-w-[40rem] font-serif text-lg leading-[1.6] text-muted">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
