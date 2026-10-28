import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = BaseProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;

type ButtonAsButton = BaseProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

const base =
  "inline-flex min-h-11 items-center justify-center rounded-panel border px-4 font-sans text-ui font-semibold transition-colors";

const variants: Record<Variant, string> = {
  primary: "border-bar bg-bar text-on-bar hover:border-bar-hover hover:bg-bar-hover",
  secondary: "border-ink bg-panel text-ink hover:bg-tint",
};

/** Primary or secondary action. Renders a link when given an href, a button otherwise. 44px minimum height. */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ComponentProps<"button">, "className" | "children">;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
