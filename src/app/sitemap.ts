import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const publicRoutes = [
  "/",
  "/aide",
  "/accessibilite",
  "/a-propos",
  "/confiance",
  "/comprendre-les-demarches",
  "/selon-votre-pays",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return publicRoutes.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
