import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";
import type { UniversityMediaLookup } from "@/lib/orientation-engine/discovery/university-media";

/**
 * Small editorial seed list of real buildings/campuses, not student-life stock.
 * Each source was checked on Wikimedia Commons (2026-10-10); the exact place,
 * author and redistribution licence remain attached to the returned image.
 * Other universities still use the normal Wikimedia finder and Supabase cache.
 */
const curated = {
  fau: {
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Schloss_Erlangen_01.jpg/960px-Schloss_Erlangen_01.jpg",
    coverImageSourceUrl: "https://commons.wikimedia.org/wiki/File:Schloss_Erlangen_01.jpg",
    coverImageAttribution: "H. Helmlechner",
    coverImageLicense: "CC BY-SA 4.0",
  },
  bamberg: {
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Markusgelände_Bamberg_2.jpg/960px-Markusgelände_Bamberg_2.jpg",
    coverImageSourceUrl: "https://commons.wikimedia.org/wiki/File:Markusgel%C3%A4nde_Bamberg_2.jpg",
    coverImageAttribution: "MaxEmanuel",
    coverImageLicense: "CC0",
  },
  regensburg: {
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Uni-r_Campus_und_Bibliothek_2.jpg/960px-Uni-r_Campus_und_Bibliothek_2.jpg",
    coverImageSourceUrl: "https://commons.wikimedia.org/wiki/File:Uni-r_Campus_und_Bibliothek_2.jpg",
    coverImageAttribution: "Manuel Strehl",
    coverImageLicense: "CC BY-SA 2.5",
  },
} as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

export function findCuratedUniversityMedia(name: string, city: string | null): (OrientationUniversityMedia & UniversityMediaLookup) | null {
  const location = normalize(city || "");
  const nameKey = normalize(name);
  let key: keyof typeof curated | null = null;
  if (location === "erlangen"
    && /^friedrich-alexander-universitat erlangen-nurnberg(?: \(fau\))?(?:\s+and\s+universidad.+)?$/.test(nameKey)) {
    key = "fau";
  } else if (location === "bamberg"
    && (/^university of bamberg$/.test(nameKey)
      || /^(?:otto-friedrich-)?universitat bamberg$/.test(nameKey))) {
    key = "bamberg";
  } else if (location === "regensburg"
    && (/^university of regensburg$/.test(nameKey)
      || /^universitat regensburg$/.test(nameKey))) {
    key = "regensburg";
  }
  if (!key) return null;
  return {
    universityId: `editorial-${key}`,
    canonicalName: name,
    ...curated[key],
  };
}
