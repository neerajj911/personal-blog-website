import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";

interface AdminPageHeaderProps {
  breadcrumbs: Crumb[];
  title: string;
  /** Buttons at the right of the title. */
  actions?: ReactNode;
}

export function AdminPageHeader({ breadcrumbs, title, actions }: AdminPageHeaderProps) {
  return (
    <header className="pt-8 pb-6">
      <Breadcrumb items={breadcrumbs} />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-h2 font-bold text-ink">{title}</h1>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
