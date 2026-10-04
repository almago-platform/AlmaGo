import "server-only";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { buildOrientationEngineResult } from "@/lib/orientation-engine/service";
import type {
  OrientationProgrammeEvaluation,
  OrientationProgrammeRecord,
  OrientationRuleCode,
} from "@/lib/orientation-engine/types";

function hasEligibleRule(
  recommendation: OrientationProgrammeEvaluation,
  code: OrientationRuleCode,
) {
  return recommendation.rules.some(
    (rule) => rule.code === code && rule.status === "eligible",
  );
}

export function prospectCatalogueRecommendations(
  answers: PublicOrientationAnswers | null,
  catalogue: OrientationProgrammeRecord[],
) {
  if (!answers) return [];

  const engine = buildOrientationEngineResult(answers, catalogue);

  return engine.recommendations
    .filter((recommendation) =>
      recommendation.status !== "not_eligible"
      && hasEligibleRule(recommendation, "degree_match")
      && hasEligibleRule(recommendation, "field_match"),
    )
    .slice(0, 3);
}

export function recommendationMatchesPreferredCity(
  recommendation: OrientationProgrammeEvaluation,
) {
  return hasEligibleRule(recommendation, "preferred_city");
}


function normalizedCatalogueValue(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

export function prospectCatalogueProfileDefaults(
  answers: PublicOrientationAnswers | null,
  catalogue: OrientationProgrammeRecord[],
) {
  if (!answers) {
    return { degree: "", field: "", city: "" };
  }

  const degrees = new Set(catalogue.map((item) => normalizedCatalogueValue(item.degreeLevel)));
  const cities = new Map(
    catalogue
      .map((item) => item.university.city)
      .filter((value): value is string => Boolean(value))
      .map((value) => [normalizedCatalogueValue(value), value] as const),
  );

  const recommendations = prospectCatalogueRecommendations(answers, catalogue);
  const preferredCity = answers.preferredCities
    .map((value) => cities.get(normalizedCatalogueValue(value)))
    .find((value): value is string => Boolean(value));

  const preferredField = recommendations
    .map((recommendation) => recommendation.programme.field)
    .find((value): value is string => Boolean(value));

  return {
    degree: degrees.has(normalizedCatalogueValue(answers.targetDegree))
      ? answers.targetDegree
      : "",
    field: preferredField || "",
    city: preferredCity || "",
  };
}
