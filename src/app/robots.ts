import type { MetadataRoute } from "next";
import { getPublicOrigin } from "@/lib/public-origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
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
        "/api/",
      ],
    },
    sitemap: new URL("/sitemap.xml", publicOrigin).toString(),
  };
}
