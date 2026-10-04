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
