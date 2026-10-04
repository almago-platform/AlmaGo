import type {
  OrientationEngineResult,
  OrientationUniversityMedia,
} from "@/lib/orientation-engine/types";
import type {
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";

export type OrientationCanonicalShortlistSource =
  | "personalized_verified"
  | "deterministic_fallback"
  | "none";

export type OrientationCanonicalShortlistItem = {
  position: number;
  institution: string;
  programme: string;
  city: string | null;
  universityMedia?: OrientationUniversityMedia | null;
};

export type OrientationCanonicalShortlist = {
  source: OrientationCanonicalShortlistSource;
  items: OrientationCanonicalShortlistItem[];
};

export function buildOrientationCanonicalShortlist(
  engine: OrientationEngineResult,
  personalized: OrientationPublicPersonalizedResult | null,
): OrientationCanonicalShortlist {
  if (engine.profile.bacStatus === "no_bac") {
    return {
      source: "none",
      items: [],
    };
  }

  if (personalized && personalized.selected.length > 0) {
    return {
      source: "personalized_verified",
      items: personalized.selected.map((item) => ({
        position: item.position,
        institution: item.institution,
        programme: item.programme,
        city: item.city,
        ...(item.universityMedia
          ? { universityMedia: item.universityMedia }
          : {}),
      })),
    };
  }

  if (engine.recommendations.length > 0) {
    return {
      source: "deterministic_fallback",
      items: engine.recommendations.map((recommendation, index) => ({
        position: index + 1,
        institution: recommendation.programme.university.name,
        programme: recommendation.programme.name,
        city: recommendation.programme.university.city,
        ...(recommendation.programme.university.media
          ? { universityMedia: recommendation.programme.university.media }
          : {}),
      })),
    };
  }

  return {
    source: "none",
    items: [],
  };
}
