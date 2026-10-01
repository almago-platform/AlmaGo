import type { MetadataRoute } from "next";
import { isLegalPublicationReady, legalDocuments } from "@/content/legal-content";
import { isPublicIndexingEnabled } from "@/lib/public-indexing";
import { getPublicOrigin } from "@/lib/public-origin";
import { isPhase2AccessEnabled } from "@/lib/phase2/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isPublicIndexingEnabled()) return [];

  const publicOrigin = await getPublicOrigin();

  const entries: MetadataRoute.Sitemap = [
    {
      url: new URL("/", publicOrigin).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/contact", publicOrigin).toString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  if (isPhase2AccessEnabled()) {
    entries.push({
      url: new URL("/orientation", publicOrigin).toString(),
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  if (isLegalPublicationReady()) {
    for (const key of Object.keys(legalDocuments)) {
      entries.push({
        url: new URL(`/legal/${key}`, publicOrigin).toString(),
        changeFrequency: "yearly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
