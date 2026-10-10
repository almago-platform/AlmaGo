import type {
  OrientationEngineResult,
  OrientationProgrammeEvaluation,
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

/** A programme can appear as a candidate only if the degree and field match
 * the student's request and its official source has a verification date.
 * A top-ranked, unrelated catalogue record is never a recommendation.
 */
export function isSupportedCatalogueRecommendation(
  recommendation: OrientationProgrammeEvaluation,
): boolean {
  const accepted = (code: "degree_match" | "field_match" | "source_verified") =>
    recommendation.rules.some((rule) => rule.code === code && rule.status === "eligible");

  return (
    recommendation.status !== "not_eligible"
    && accepted("degree_match")
    && accepted("field_match")
    && accepted("source_verified")
    && recommendation.sources.some((source) => {
      try {
        return new URL(source.url).protocol === "https:";
      } catch {
        return false;
      }
    })
  );
}

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

  const supported = engine.recommendations.filter(isSupportedCatalogueRecommendation);
  if (supported.length > 0) {
    return {
      source: "deterministic_fallback",
      items: supported.map((recommendation, index) => ({
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
