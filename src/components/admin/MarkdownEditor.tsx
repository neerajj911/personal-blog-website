"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { previewMarkdownAction } from "@/app/admin/actions";
import { TextAreaField } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/Button";

interface MarkdownEditorProps {
  defaultValue: string;
  errors?: string[];
}

/** The article body box, with a preview rendered by the same pipeline the public page uses. */
export function MarkdownEditor({ defaultValue, errors }: MarkdownEditorProps) {
  const field = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<ReactNode>(null);
  const [shown, setShown] = useState(false);
  const [pending, startTransition] = useTransition();

  function showPreview() {
    const source = field.current?.querySelector("textarea")?.value ?? "";
    startTransition(async () => {
      setPreview(await previewMarkdownAction(source));
      setShown(true);
    });
  }

  /** Puts Markdown on its own lines at the cursor (or replaces the selection). */
  function insert(markdown: string) {
    const textarea = field.current?.querySelector("textarea");
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    // Blank line before and after, so the image becomes its own paragraph (and so a figure).
    const lead =
      !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const trail = after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    textarea.value = before + lead + markdown + trail + after;
    const cursor = (before + lead + markdown + trail).length;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={field}>
        <TextAreaField
          name="body"
          label="Body (Markdown)"
          mono
          rows={24}
          defaultValue={defaultValue}
          errors={errors}
          spellCheck
          hint='Headings with ## and ###. Code blocks with ```lang. A diagram with ```diagram:name caption="…". A callout: a quote that starts with a bold title line, then a blank > line, then the text. Raw HTML is removed.'
        />
      </div>

      <ImageUploader onInsert={insert} />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={showPreview}
          disabled={pending}
        >
          {pending ? "Rendering…" : shown ? "Refresh preview" : "Preview"}
        </Button>
        {shown ? (
          <Button type="button" variant="secondary" onClick={() => setShown(false)}>
            Hide preview
          </Button>
        ) : null}
      </div>

      {shown ? (
        <section
          aria-label="Preview"
          aria-live="polite"
          className="max-w-reading rounded-panel border border-rule bg-panel p-6"
        >
          {preview ?? <p className="text-ui text-muted">Nothing to preview yet.</p>}
        </section>
      ) : null}
    </div>
  );
}
