"use client";

import { useActionState, useState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import {
  FormMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { SeriesOption } from "@/lib/admin/content";
import { useFormVersion } from "@/components/admin/useFormVersion";
import type { FormValues } from "@/lib/admin/form-values";

interface ArticleFormProps {
  mode: "create" | "update";
  action: (
    previous: AdminFormState | undefined,
    formData: FormData,
  ) => Promise<AdminFormState>;
  initial: FormValues;
  topics: { slug: string; name: string }[];
  series: SeriesOption[];
}

export function ArticleForm({ mode, action, initial, topics, series }: ArticleFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const version = useFormVersion(state);

  // What the admin last submitted wins over the stored values, so a failed save keeps their text.
  const value = (name: string) => state?.values?.[name] ?? initial[name] ?? "";
  const errors = (name: string) => state?.errors?.[name];

  const [seriesSlug, setSeriesSlug] = useState(value("seriesSlug"));
  const chosenSeries = series.find((s) => s.slug === seriesSlug);

  return (
    <form key={version} action={formAction} className="flex flex-col gap-6">
      <FormMessage message={state?.message} />

      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          name="title"
          label="Title"
          required
          maxLength={140}
          defaultValue={value("title")}
          errors={errors("title")}
        />
        <TextField
          name="slug"
          label="Slug"
          required
          maxLength={100}
          readOnly={mode === "update"}
          defaultValue={value("slug")}
          errors={errors("slug")}
          hint={
            mode === "update"
              ? "The slug is the URL, so it cannot change after creation."
              : "Lowercase letters, numbers and hyphens. It becomes /articles/your-slug."
          }
        />
      </div>

      <TextField
        name="subtitle"
        label="Standfirst (optional)"
        maxLength={200}
        defaultValue={value("subtitle")}
        errors={errors("subtitle")}
        hint="One line under the title. The summary is used when this is empty."
      />

      <TextAreaField
        name="excerpt"
        label="Summary"
        required
        rows={3}
        maxLength={300}
        defaultValue={value("excerpt")}
        errors={errors("excerpt")}
        hint="Shown in lists and search results. 300 characters at most."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <SelectField
          name="topicSlug"
          label="Topic"
          required
          defaultValue={value("topicSlug")}
          errors={errors("topicSlug")}
        >
          <option value="">Choose a topic…</option>
          {topics.map((topic) => (
            <option key={topic.slug} value={topic.slug}>
              {topic.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          name="status"
          label="Status"
          defaultValue={value("status")}
          errors={errors("status")}
          hint="Drafts are never shown on the public site."
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </SelectField>
        <TextField
          name="publishedAt"
          label="Publication date"
          required
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          defaultValue={value("publishedAt")}
          errors={errors("publishedAt")}
        />
      </div>

      <TextField
        name="tags"
        label="Tags"
        defaultValue={value("tags")}
        errors={errors("tags")}
        hint="Comma-separated, up to 10. For example: sqlite, transactions."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          name="seriesSlug"
          label="Series (optional)"
          // Uncontrolled like every other field: React resets the form after each submit, and a
          // controlled value would then disagree with what the select shows.
          defaultValue={value("seriesSlug")}
          onChange={(event) => setSeriesSlug(event.target.value)}
          errors={errors("seriesSlug")}
        >
          <option value="">Not part of a series</option>
          {series.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.shortTitle}
            </option>
          ))}
        </SelectField>
        <SelectField
          key={seriesSlug}
          name="seriesPart"
          label="Part"
          disabled={!chosenSeries}
          defaultValue={seriesSlug === value("seriesSlug") ? value("seriesPart") : ""}
          errors={errors("seriesPart")}
        >
          <option value="">
            {chosenSeries ? "Choose a part…" : "Choose a series first"}
          </option>
          {chosenSeries?.parts.map((part) => (
            <option key={part.number} value={part.number}>
              {part.number}. {part.title}
            </option>
          ))}
        </SelectField>
      </div>

      <MarkdownEditor defaultValue={value("body")} errors={errors("body")} />

      <div className="grid gap-6 md:grid-cols-2">
        <TextAreaField
          name="references"
          label="References"
          rows={5}
          mono
          defaultValue={value("references")}
          errors={errors("references")}
          hint="One per line: Title | https://address (the address is optional)."
        />
        <TextAreaField
          name="relatedSlugs"
          label="Related articles (optional)"
          rows={5}
          mono
          defaultValue={value("relatedSlugs")}
          errors={errors("relatedSlugs")}
          hint="Comma-separated slugs of other articles. Related articles are suggested automatically when this is empty."
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-dotted border-rule pt-6">
        <SubmitButton>
          {mode === "create" ? "Create article" : "Save changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
