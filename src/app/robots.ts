import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/aide", "/comprendre-les-demarches", "/selon-votre-pays"],
      disallow: [
        "/student/",
        "/admin/",
        "/api/",
        "/auth/",
        "/login",
        "/signup",
        "/unauthorized",
      ],
    },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
