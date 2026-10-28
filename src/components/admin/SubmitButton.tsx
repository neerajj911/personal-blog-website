"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

interface SubmitButtonProps {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
}

/** Submit button that disables itself while the form's action is running. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
