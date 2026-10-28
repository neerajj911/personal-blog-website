import type { Reference } from "@/lib/types";

export const REFERENCES_ID = "references";

/** "References and further reading". An entry without an address is a placeholder and is not styled as a link. */
export function ReferencesList({ references }: { references: Reference[] }) {
  if (references.length === 0) return null;

  return (
    <section aria-labelledby={REFERENCES_ID} className="mt-12">
      <h2
        id={REFERENCES_ID}
        className="mb-4 scroll-mt-6 font-serif text-h2 font-bold text-ink"
      >
        References and further reading
      </h2>
      <ul className="list-disc space-y-2 pl-6 text-ui-lg marker:text-ink">
        {references.map((reference) => (
          <li key={reference.title}>
            {reference.href ? (
              <a
                href={reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                {reference.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-muted">{reference.title}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
