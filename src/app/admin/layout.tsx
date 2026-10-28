import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { getAdmin } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | Admin | ${site.domain}` },
  robots: { index: false, follow: false },
};

/**
 * Chrome only: whether to show the nav is a display choice. Access is enforced by
 * requireAdmin() in every page and action, because a layout does not re-run on navigation.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdmin();

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-panel bg-bar px-4 py-3 text-ui font-semibold text-on-bar focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
      >
        Skip to content
      </a>
      <header className="border-b border-rule bg-paper">
        <div className="page-container flex flex-wrap items-center gap-x-6 gap-y-1 py-3.5">
          <Link href="/admin" className="font-mono text-lg font-semibold text-ink">
            [ {site.domain} · admin ]
          </Link>
          {admin ? <AdminNav /> : null}
          {admin ? (
            <div className="flex items-center gap-4 sm:ml-auto">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center text-ui text-link hover:underline"
              >
                View site
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <main id="main" className="page-container flex-1 pb-18">
        {children}
      </main>
    </>
  );
}
