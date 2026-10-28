import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = { title: "Page not found" };

/** Unmatched URLs land here, outside the (site) layout, so it brings its own chrome. */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
