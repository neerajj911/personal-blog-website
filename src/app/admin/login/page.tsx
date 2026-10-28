import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { getAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");

  const { error } = await searchParams;
  const configured = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );

  return (
    <div className="mx-auto max-w-md pt-16">
      <Panel title="Admin sign in">
        <p className="font-serif text-body text-ink">
          This area is private. Sign in with the GitHub account that owns the site.
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-ui font-medium text-rust">
            {error === "AccessDenied"
              ? "That GitHub account is not allowed to sign in here."
              : "Sign in failed. Try again."}
          </p>
        ) : null}

        {configured ? (
          <form action={signInAction} className="mt-6">
            <Button type="submit">Sign in with GitHub</Button>
          </form>
        ) : (
          <p className="mt-6 text-ui text-muted">
            GitHub sign-in is not configured yet. Set <code>AUTH_GITHUB_ID</code> and{" "}
            <code>AUTH_GITHUB_SECRET</code> (see the README).
          </p>
        )}
      </Panel>
    </div>
  );
}
