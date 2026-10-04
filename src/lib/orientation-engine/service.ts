import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { getAcademicAccessConclusion } from "@/lib/orientation/verified-academic-options";
import {
  orientationScopeContainsCity,
  type OrientationGeographicScope,
} from "@/lib/orientation-engine/geography";
import { evaluateProgramme, rankProgrammeEvaluations } from "@/lib/orientation-engine/rules";
import { buildOrientationRefinementState } from "@/lib/orientation-engine/refinement";
import {
  ORIENTATION_ENGINE_VERSION,
  type OrientationActionItem,
  type OrientationEngineResult,
  type OrientationProgrammeRecord,
  type OrientationRuleCode,
  type OrientationRuleStatus,
  type OrientationSource,
} from "@/lib/orientation-engine/types";

const levelRank: Record<string, number> = {
  none: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

function academicAccess(profile: PublicOrientationAnswers): {
  status: OrientationRuleStatus;
  source: OrientationSource | null;
} {
  const access = getAcademicAccessConclusion(profile);
  const source: OrientationSource = {
    kind: "daad_zab",
    label: "DAAD/ZAB",
    url: access.sourceUrl,
    verifiedAt: access.verifiedAt,
  };

  if (access.status === "direct_subject_restricted") {
    return { status: "likely_eligible", source };
  }
  if (access.status === "verified_subject_mismatch") {
    return { status: "conditional", source };
  }
  return { status: "missing_information", source };
}

function needsLevel(current: string, target: string) {
  return (levelRank[current] ?? -1) < (levelRank[target] ?? Number.POSITIVE_INFINITY);
}

function actionPlan(
  profile: PublicOrientationAnswers,
  recommendations: OrientationEngineResult["recommendations"],
  academicStatus: OrientationRuleStatus,
): OrientationActionItem[] {
  const actions: OrientationActionItem[] = [];

  if (academicStatus !== "likely_eligible" && academicStatus !== "eligible") {
    actions.push({ code: "confirm_academic_access", phase: "now" });
  }

  if (
    (profile.studyLanguage === "Allemand" || profile.studyLanguage === "Allemand et anglais")
    && needsLevel(profile.germanLevel, "B2")
  ) {
    actions.push({ code: "improve_german", phase: "now" });
  }

  if (
    (profile.studyLanguage === "Anglais" || profile.studyLanguage === "Allemand et anglais")
    && needsLevel(profile.englishLevel, "B2")
  ) {
    actions.push({ code: "improve_english", phase: "now" });
  }

  actions.push({ code: "prepare_academic_documents", phase: "now" });

  if (recommendations.length > 0) {
    actions.push({ code: "verify_programme_requirements", phase: "next" });
  }

  if (
    recommendations.some((recommendation) =>
      recommendation.rules.some((rule) => rule.code === "language_missing")
    )
  ) {
    actions.push({ code: "verify_language_certificate", phase: "next" });
  }

  if (recommendations.some((recommendation) => recommendation.programme.uniAssistRequired)) {
    actions.push({ code: "prepare_uni_assist", phase: "next" });
  }

  if (
    recommendations.some((recommendation) =>
      Boolean(recommendation.programme.winterDeadline || recommendation.programme.summerDeadline)
    )
  ) {
    actions.push({ code: "watch_deadline", phase: "next" });
  }

  actions.push({ code: "prepare_financing", phase: "next" });
  actions.push({ code: "prepare_visa_after_admission", phase: "after_admission" });

  return actions;
}

function uniqueCodes(codes: OrientationRuleCode[]) {
  return [...new Set(codes)];
}

export function hasPreferredCityCatalogueMatch(
  result: OrientationEngineResult,
) {
  if (
    result.profile.targetDegree !== "Bachelor"
    || result.profile.preferredCities.length === 0
  ) return false;

  return result.recommendations.some((recommendation) => {
    const hasEligibleRule = (code: OrientationRuleCode) =>
      recommendation.rules.some(
        (rule) => rule.code === code && rule.status === "eligible",
      );

    return (
      hasEligibleRule("degree_match")
      && hasEligibleRule("field_match")
      && hasEligibleRule("preferred_city")
      && hasEligibleRule("teaching_language_match")
    );
  });
}

function normalizedMatchValue(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function masterSpecializationMatches(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
) {
  if (profile.targetDegree !== "Master") return true;
  const target = normalizedMatchValue(profile.targetSpecialization);
  if (!target) return true;

  const haystack = normalizedMatchValue(`${programme.field || ""} ${programme.name}`);
  if (haystack.includes(target)) return true;

  return target
    .split(/\s+(?:and|und|et)\s+|[\/,&;+]+/)
    .map((value) => value.trim())
    .filter((value) => value.length >= 6)
    .some((value) => haystack.includes(value));
}

export function hasStrongCatalogueMatch(
  result: OrientationEngineResult,
) {
  return result.recommendations.some((recommendation) => {
    const hasEligibleRule = (code: OrientationRuleCode) =>
      recommendation.rules.some(
        (rule) => rule.code === code && rule.status === "eligible",
      );

    return (
      recommendation.status !== "not_eligible"
      && hasEligibleRule("degree_match")
      && hasEligibleRule("field_match")
      && hasEligibleRule("teaching_language_match")
      && hasEligibleRule("source_verified")
      && masterSpecializationMatches(result.profile, recommendation.programme)
    );
  });
}

export function catalogueForGeographicScope(
  catalogue: readonly OrientationProgrammeRecord[],
  scope: OrientationGeographicScope,
) {
  if (scope.tier === "germany") return [...catalogue];
  return catalogue.filter((programme) =>
    orientationScopeContainsCity(scope, programme.university.city)
  );
}

export function buildOrientationEngineResultForGeographicScope(
  profile: PublicOrientationAnswers,
  catalogue: readonly OrientationProgrammeRecord[],
  scope: OrientationGeographicScope,
  now: Date = new Date(),
) {
  return buildOrientationEngineResult(
    profile,
    catalogueForGeographicScope(catalogue, scope),
    now,
  );
}

export function buildOrientationEngineResult(
  profile: PublicOrientationAnswers,
  catalogue: OrientationProgrammeRecord[],
  now: Date = new Date(),
): OrientationEngineResult {
  const academic = academicAccess(profile);
  const allEvaluations = catalogue.map((programme) => evaluateProgramme(profile, programme, now));
  const evaluations = rankProgrammeEvaluations(allEvaluations);

  const recommendations = evaluations.slice(0, 3);
  const refinement = buildOrientationRefinementState(profile, allEvaluations);
  const missingInformation = uniqueCodes(
    recommendations.flatMap((recommendation) => recommendation.missingInformation),
  );
  const warnings = uniqueCodes(
    recommendations.flatMap((recommendation) => recommendation.warnings),
  );

  if (academic.status === "missing_information") {
    missingInformation.unshift("academic_access_review");
  } else if (academic.status === "conditional") {
    warnings.unshift("academic_access_review");
  }

  return {
    engineVersion: ORIENTATION_ENGINE_VERSION,
    profile,
    academicAccessStatus: academic.status,
    academicAccessSource: academic.source,
    recommendations,
    missingInformation: uniqueCodes(missingInformation),
    refinement,
    actionPlan: actionPlan(profile, recommendations, academic.status),
    warnings: uniqueCodes(warnings),
    generatedFrom: "verified_catalogue",
  };
}
