import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  name: string;
  label: string;
  hint?: ReactNode;
  errors?: string[];
  className?: string;
}

const control =
  "w-full rounded-panel border bg-panel px-3 font-sans text-ui text-ink placeholder:text-muted hover:border-muted disabled:bg-tint disabled:text-muted";

function border(errors?: string[]) {
  return errors?.length ? "border-rust" : "border-rule";
}

function Shell({
  name,
  label,
  hint,
  errors,
  className,
  children,
}: FieldShellProps & { children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-ui-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${name}-hint`} className="text-ui-sm text-muted">
          {hint}
        </p>
      ) : null}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-ui-sm font-medium text-rust">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, hint?: ReactNode, errors?: string[]) {
  return (
    [hint ? `${name}-hint` : null, errors?.length ? `${name}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

type InputProps = Omit<ComponentProps<"input">, "id" | "name" | "className">;

export function TextField({
  name,
  label,
  hint,
  errors,
  className,
  ...props
}: FieldShellProps & InputProps) {
  return (
    <Shell name={name} label={label} hint={hint} errors={errors} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={cn(control, "min-h-11", border(errors))}
        {...props}
      />
    </Shell>
  );
}

type TextAreaProps = Omit<ComponentProps<"textarea">, "id" | "name" | "className">;

export function TextAreaField({
  name,
  label,
  hint,
  errors,
  className,
  mono,
  ...props
}: FieldShellProps & TextAreaProps & { mono?: boolean }) {
  return (
    <Shell name={name} label={label} hint={hint} errors={errors} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={cn(
          control,
          "py-2.5 leading-normal",
          mono && "font-mono text-mono",
          border(errors),
        )}
        {...props}
      />
    </Shell>
  );
}

type SelectProps = Omit<ComponentProps<"select">, "id" | "name" | "className">;

export function SelectField({
  name,
  label,
  hint,
  errors,
  className,
  children,
  ...props
}: FieldShellProps & SelectProps) {
  return (
    <Shell name={name} label={label} hint={hint} errors={errors} className={className}>
      <select
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={cn(control, "min-h-11", border(errors))}
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}

/** The summary line above a form after a failed save. */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-panel border border-rust bg-panel px-4 py-3 text-ui font-medium text-rust"
    >
      {message}
    </p>
  );
}
