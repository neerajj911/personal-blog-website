import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

/** notFound() from a public page: the (site) layout already supplies header and footer. */
export default function NotFound() {
  return <NotFoundContent />;
}
