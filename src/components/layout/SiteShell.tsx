import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Public chrome: skip link, header, main landmark, footer. The admin panel has its own. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-panel bg-bar px-4 py-3 text-ui font-semibold text-on-bar focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
