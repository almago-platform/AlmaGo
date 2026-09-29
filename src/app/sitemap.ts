import type { MetadataRoute } from "next";
import { getPublicOrigin } from "@/lib/public-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicOrigin = await getPublicOrigin();

  return [
    {
      url: new URL("/", publicOrigin).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
