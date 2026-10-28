import { formatDate } from "@/lib/format";
import type { Note } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Dated short updates, newest first. */
export function NotesFeed({ notes }: { notes: Note[] }) {
  return (
    <section>
      <SectionHeading>Notes</SectionHeading>
      <ol>
        {notes.map((note) => (
          <li key={note.id} className="border-b border-dotted border-rule py-3">
            <time dateTime={note.date} className="text-ui-sm font-semibold text-rust">
              {formatDate(note.date)}
            </time>
            <p className="mt-1 text-ui-sm leading-normal text-muted">{note.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
