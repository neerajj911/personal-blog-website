"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import { FormMessage, SelectField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useFormVersion } from "@/components/admin/useFormVersion";
import type { FormValues } from "@/lib/admin/form-values";
import { topicColors } from "@/lib/schemas";

interface TopicFormProps {
  mode: "create" | "update";
  action: (
    previous: AdminFormState | undefined,
    formData: FormData,
  ) => Promise<AdminFormState>;
  initial: FormValues;
}

export function TopicForm({ mode, action, initial }: TopicFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const version = useFormVersion(state);
  const value = (name: string) => state?.values?.[name] ?? initial[name] ?? "";
  const errors = (name: string) => state?.errors?.[name];

  return (
    <form key={version} action={formAction} className="flex max-w-xl flex-col gap-6">
      <FormMessage message={state?.message} />
      <TextField
        name="name"
        label="Name"
        required
        maxLength={60}
        defaultValue={value("name")}
        errors={errors("name")}
        hint="The full name on the Topics page, for example “Offline-First Architecture”."
      />
      <TextField
        name="shortName"
        label="Short name"
        required
        maxLength={30}
        defaultValue={value("shortName")}
        errors={errors("shortName")}
        hint="Used in filter pills and beside article titles."
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
            : "Becomes /topics/your-slug."
        }
      />
      <SelectField
        name="color"
        label="Marker colour"
        defaultValue={value("color")}
        errors={errors("color")}
        hint="One of the colours defined for topic markers in the design system."
      >
        {topicColors.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </SelectField>
      <div>
        <SubmitButton>{mode === "create" ? "Create topic" : "Save changes"}</SubmitButton>
      </div>
    </form>
  );
}
