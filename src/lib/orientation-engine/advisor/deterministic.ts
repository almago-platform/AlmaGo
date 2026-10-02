import type { OrientationAdvisorProvider } from "@/lib/orientation-engine/advisor/provider";
import type {
  OrientationAdvisorInput,
  OrientationAdvisorOutput,
} from "@/lib/orientation-engine/types";

export class DeterministicOrientationAdvisor implements OrientationAdvisorProvider {
  readonly id = "deterministic-v1";

  async advise(input: OrientationAdvisorInput): Promise<OrientationAdvisorOutput> {
    const { engineResult } = input;

    let summaryCode: OrientationAdvisorOutput["summaryCode"] = "ready_to_compare";

    if (engineResult.academicAccessStatus === "missing_information") {
      summaryCode = "academic_review_needed";
    } else if (engineResult.recommendations.length === 0) {
      summaryCode = "catalogue_gap";
    } else if (
      engineResult.refinement.nextQuestion
      || engineResult.recommendations.some((recommendation) =>
        recommendation.category === "conditions_to_complete"
        || ["conditional", "missing_information", "unknown"].includes(recommendation.status)
      )
    ) {
      summaryCode = "conditions_to_complete";
    }

    return {
      provider: this.id,
      mode: "deterministic",
      summaryCode,
      priorityActionCodes: engineResult.actionPlan
        .filter((action) => action.phase === "now")
        .map((action) => action.code)
        .slice(0, 3),
    };
  }
}

export function createOrientationAdvisor(): OrientationAdvisorProvider {
  // Runtime LLM providers will plug into this factory behind an explicit feature flag.
  // The default stays deterministic so the core orientation has zero LLM cost.
  return new DeterministicOrientationAdvisor();
}
