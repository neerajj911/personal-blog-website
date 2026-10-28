"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import { FormMessage, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormVersion } from "@/components/admin/useFormVersion";
import type { FormValues } from "@/lib/admin/form-values";

interface SeriesFormProps {
  mode: "create" | "update";
  action: (
    previous: AdminFormState | undefined,
    formData: FormData,
  ) => Promise<AdminFormState>;
  initial: FormValues;
}

export function SeriesForm({ mode, action, initial }: SeriesFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const version = useFormVersion(state);
  const value = (name: string) => state?.values?.[name] ?? initial[name] ?? "";
  const errors = (name: string) => state?.errors?.[name];

  return (
    <form key={version} action={formAction} className="flex max-w-3xl flex-col gap-6">
      <FormMessage message={state?.message} />

      <TextField
        name="title"
        label="Title"
        required
        maxLength={100}
        defaultValue={value("title")}
        errors={errors("title")}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          name="shortTitle"
          label="Short title"
          required
          maxLength={60}
          defaultValue={value("shortTitle")}
          errors={errors("shortTitle")}
          hint="Used in labels such as “Part 3 · Offline-First Flutter”."
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
              : "Becomes /series/your-slug."
          }
        />
      </div>

      <TextAreaField
        name="summary"
        label="Summary"
        required
        rows={2}
        maxLength={300}
        defaultValue={value("summary")}
        errors={errors("summary")}
        hint="One or two sentences, shown on cards."
      />
      <TextAreaField
        name="description"
        label="Introduction"
        required
        rows={5}
        maxLength={1500}
        defaultValue={value("description")}
        errors={errors("description")}
        hint="Shown at the top of the series page."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <TextAreaField
          name="learn"
          label="What you will learn"
          rows={5}
          defaultValue={value("learn")}
          errors={errors("learn")}
          hint="One point per line."
        />
        <TextAreaField
          name="prerequisites"
          label="Prerequisites"
          rows={5}
          defaultValue={value("prerequisites")}
          errors={errors("prerequisites")}
          hint="One per line."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          name="sourceLabel"
          label="Source code label"
          required
          maxLength={100}
          defaultValue={value("sourceLabel")}
          errors={errors("sourceLabel")}
        />
        <TextField
          name="sourceNote"
          label="Source code note"
          required
          maxLength={300}
          defaultValue={value("sourceNote")}
          errors={errors("sourceNote")}
        />
      </div>

      <TextAreaField
        name="parts"
        label="Parts"
        rows={12}
        mono
        defaultValue={value("parts")}
        errors={errors("parts")}
        hint="One part per line: Title | optional summary. Part numbers follow the line order, and an article points at a part by its number. A part shows as Published once a published article is filed under it."
      />

      <div>
        <SubmitButton>
          {mode === "create" ? "Create series" : "Save changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
