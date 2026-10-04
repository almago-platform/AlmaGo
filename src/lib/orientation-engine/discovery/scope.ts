import { orientationScopeContainsCity } from "@/lib/orientation-engine/geography";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
} from "@/lib/orientation-engine/discovery/types";

export function candidatesForGeographicScope(
  plan: OrientationDiscoveryPlan,
  candidates: readonly OrientationDiscoveryResearchCandidate[],
) {
  const scope = plan.geographicScope;
  if (!scope) return [...candidates];

  return candidates.filter((candidate) =>
    orientationScopeContainsCity(scope, candidate.city)
  );
}

export function planForGeographicCoverage(
  plan: OrientationDiscoveryPlan,
): OrientationDiscoveryPlan {
  const scope = plan.geographicScope;
  if (!scope) return plan;

  return {
    ...plan,
    profile: {
      ...plan.profile,
      preferredCities:
        scope.tier === "germany"
          ? []
          : [...scope.cities],
    },
  };
}
