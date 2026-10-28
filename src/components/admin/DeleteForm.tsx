"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

interface DeleteFormProps {
  slug: string;
  /** "article", "topic" or "series": used in the warning text. */
  what: string;
  action: (
    previous: AdminFormState | undefined,
    formData: FormData,
  ) => Promise<AdminFormState>;
  consequence: string;
}

/** Delete behind a disclosure, so it takes two deliberate clicks. */
export function DeleteForm({ slug, what, action, consequence }: DeleteFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <details
      className="rounded-panel border border-rule bg-panel"
      open={Boolean(state?.errors)}
    >
      <summary className="inline-flex min-h-11 w-full cursor-pointer items-center px-4 text-ui font-semibold text-rust">
        Delete this {what}
      </summary>
      <form action={formAction} className="flex flex-col gap-3 border-t border-rule p-4">
        <input type="hidden" name="slug" value={slug} />
        <p className="text-ui text-ink">{consequence}</p>
        {state?.errors?.slug ? (
          <p role="alert" className="text-ui font-medium text-rust">
            {state.errors.slug.join(" ")}
          </p>
        ) : null}
        <div>
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            className="text-rust"
          >
            {pending ? "Deleting…" : `Delete ${what} permanently`}
          </Button>
        </div>
      </form>
    </details>
  );
}
