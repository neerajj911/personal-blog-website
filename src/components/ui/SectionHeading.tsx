import Link from "next/link";

interface SectionHeadingProps {
  children: string;
  /** Id for the heading, so a section can point to it with aria-labelledby. */
  id?: string;
  /** Optional link on the right, e.g. "All articles". */
  action?: { href: string; label: string };
}

/** Small uppercase section title with a 2px ink rule beneath it. */
export function SectionHeading({ children, id, action }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
      <h2
        id={id}
        className="font-sans text-ui-sm font-semibold uppercase tracking-[0.08em]"
      >
        {children}
      </h2>
      {action ? (
        <Link href={action.href} className="text-ui text-link hover:underline">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
