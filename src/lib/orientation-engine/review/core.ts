import { createHash } from "node:crypto";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import {
  buildOrientationResearchProgrammeDedupeKey,
} from "@/lib/orientation-engine/discovery/knowledge-core";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResult,
} from "@/lib/orientation-engine/discovery/types";
import type {
  OrientationVerificationFact,
  OrientationVerificationServiceResult,
} from "@/lib/orientation-engine/verification/types";
import type {
  OrientationSelectionResult,
} from "@/lib/orientation-engine/selection/types";
import type { OrientationWriterResult } from "@/lib/orientation-engine/writer/types";
import type {
  OrientationHumanReviewBundle,
  OrientationHumanReviewPipelineStatus,
} from "@/lib/orientation-engine/review/types";
import type {
  OrientationPublicPersonalizedFact,
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";

function stableJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableJson(item)]),
  );
}

export function buildOrientationHumanReviewProfileFingerprint(
  profile: PublicOrientationAnswers,
) {
  return createHash("sha256")
    .update(JSON.stringify(stableJson({
      bacStatus: profile.bacStatus,
      bacYear: profile.bacYear,
      bacTrack: profile.bacTrack,
      generalAverage: profile.generalAverage,
      averageType: profile.averageType,
      lastDiploma: profile.lastDiploma,
      higherEducationStatus: profile.higherEducationStatus,
      currentStudyField: profile.currentStudyField,
      universitySemesters: profile.universitySemesters,
      studyIntent: profile.studyIntent,
      targetSpecialization: profile.targetSpecialization,
      targetDegree: profile.targetDegree,
      targetField: profile.targetField,
      engineeringSpecialty: profile.engineeringSpecialty,
      scienceSpecialty: profile.scienceSpecialty,
      germanLevel: profile.germanLevel,
      englishLevel: profile.englishLevel,
      studyLanguage: profile.studyLanguage,
      targetIntakeSeason: profile.targetIntakeSeason,
      targetIntakeYear: profile.targetIntakeYear,
      budgetRange: profile.budgetRange,
      preferredCities: [...profile.preferredCities].sort(),
      masterSubjectCredits: profile.masterSubjectCredits || {},
    })))
    .digest("hex");
}

function publicReviewFact(
  fact: OrientationVerificationFact,
): OrientationPublicPersonalizedFact | null {
  if (fact.status === "unknown" || fact.value === null) return null;

  return {
    field: fact.field,
    status: fact.status,
    value: fact.value,
    sourceUrl: fact.sourceUrl,
    sourceKind: fact.sourceKind,
    verifiedAt: fact.verifiedAt,
  };
}

function validReviewBundleShape(value: unknown): value is OrientationHumanReviewBundle {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.version !== "orientation_v4_human_review_v1") return false;

  const writer = record.writer && typeof record.writer === "object"
    ? record.writer as Record<string, unknown>
    : null;
  const content = writer?.content && typeof writer.content === "object"
    ? writer.content as Record<string, unknown>
    : null;
  const verification = record.verification && typeof record.verification === "object"
    ? record.verification as Record<string, unknown>
    : null;
  const selection = record.selection && typeof record.selection === "object"
    ? record.selection as Record<string, unknown>
    : null;

  return Boolean(
    content
    && typeof content.opening === "string"
    && typeof content.projectStatus === "string"
    && Array.isArray(content.studyOptions)
    && verification
    && Array.isArray(verification.programmes)
    && selection
    && typeof selection.status === "string"
    && Array.isArray(selection.selected),
  );
}

export function projectOrientationHumanReviewBundleToPublicResult(
  value: unknown,
  reviewId: string | null = null,
): OrientationPublicPersonalizedResult | null {
  if (!validReviewBundleShape(value)) return null;

  const bundle = value;
  const verificationByKey = new Map(
    bundle.verification.programmes.map((item) => [item.candidateKey, item.verification]),
  );

  const selected = [...bundle.selection.selected]
    .sort((a, b) => a.position - b.position)
    .flatMap((item) => {
      const verification = verificationByKey.get(item.candidateKey);
      if (!verification) return [];

      return [{
        optionId: `option_${item.position}`,
        position: item.position,
        institution: verification.candidate.institution,
        programme: verification.candidate.programme,
        city: verification.candidate.city,
        universityMedia: verification.candidate.universityMedia || null,
        overallStatus: verification.overallStatus,
        facts: verification.facts
          .map(publicReviewFact)
          .filter((fact): fact is OrientationPublicPersonalizedFact => Boolean(fact)),
      }];
    });

  return {
    status: bundle.selection.status,
    reviewId,
    content: bundle.writer.content,
    selected,
    humanReview: {
      mode: "post_result_audit",
      blocksResult: false,
    },
  };
}

function pipelineStatus(
  plan: OrientationDiscoveryPlan,
  discovery: OrientationDiscoveryResult | null,
  selection: OrientationSelectionResult,
): OrientationHumanReviewPipelineStatus {
  if (plan.status === "route_requires_review") return "route_requires_review";
  if (plan.status === "profile_incomplete") return "profile_incomplete";
  if (!discovery || discovery.status !== "ready") return "provider_unavailable";
  return selection.status;
}

export function buildOrientationHumanReviewBundle(input: {
  profile: PublicOrientationAnswers;
  plan: OrientationDiscoveryPlan;
  discovery: OrientationDiscoveryResult | null;
  verification: OrientationVerificationServiceResult | null;
  selection: OrientationSelectionResult;
  writer: OrientationWriterResult;
}): {
  bundle: OrientationHumanReviewBundle;
  pipelineStatus: OrientationHumanReviewPipelineStatus;
} {
  const discoveryCandidates = input.discovery?.candidates || [];
  const verificationProgrammes = input.verification?.programmes || [];

  const bundle: OrientationHumanReviewBundle = {
    version: "orientation_v4_human_review_v1",
    profile: input.profile,
    discovery: {
      planStatus: input.plan.status,
      planReason: input.plan.reason,
      provider: input.discovery?.provider || null,
      status: input.discovery?.status || "not_run",
      reason: input.discovery?.reason || (input.discovery ? null : "not_run"),
      candidates: discoveryCandidates.map((candidate) => ({
        candidateKey: buildOrientationResearchProgrammeDedupeKey(candidate),
        candidate,
      })),
    },
    verification: {
      provider: input.verification?.provider || null,
      status: input.verification?.status || "not_run",
      reason: input.verification?.reason || (input.verification ? null : "not_run"),
      programmes: verificationProgrammes.map((verification) => ({
        candidateKey: buildOrientationResearchProgrammeDedupeKey(
          verification.candidate,
        ),
        verification,
      })),
    },
    selection: {
      status: input.selection.status,
      considered: input.selection.considered,
      selected: input.selection.selected.map((item) => ({
        candidateKey: buildOrientationResearchProgrammeDedupeKey(
          item.verification.candidate,
        ),
        position: item.position,
        reasons: [...item.reasons],
        warnings: [...item.warnings],
        missingFacts: [...item.missingFacts],
        baseScore: item.baseScore,
        finalScore: item.finalScore,
      })),
    },
    writer: input.writer,
  };

  return {
    bundle,
    pipelineStatus: pipelineStatus(input.plan, input.discovery, input.selection),
  };
}
