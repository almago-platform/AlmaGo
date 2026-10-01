import type { MetadataRoute } from "next";
import { isLegalPublicationReady } from "@/content/legal-content";
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
  const disallow = [
    "/admin/",
    "/student/",
    "/prospect",
    "/orientation/report/",
    "/login",
    "/signup",
    "/reset-password",
    "/unauthorized",
    "/auth/",
    "/api/",
  ];

  if (!isLegalPublicationReady()) {
    disallow.push("/legal/");
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow,
    },
    sitemap: new URL("/sitemap.xml", publicOrigin).toString(),
  };
}
