import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are never indexed. Production hides the private and non-content paths.
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/design-system"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
