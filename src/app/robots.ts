import type { MetadataRoute } from "next";
import { isPublicIndexingEnabled } from "@/lib/public-indexing";
import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isPublicIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: ["/"],
      },
    };
  }

  const publicOrigin = await getPublicOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/admin/",
        "/student/",
        "/login",
        "/signup",
        "/reset-password",
        "/unauthorized",
        "/auth/",
        "/legal/",
        "/api/",
      ],
    },
    sitemap: new URL("/sitemap.xml", publicOrigin).toString(),
  };
}
