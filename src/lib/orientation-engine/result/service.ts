import "server-only";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { buildOrientationDiscoveryPlan } from "@/lib/orientation-engine/discovery/contract";
import { runOrientationDiscovery } from "@/lib/orientation-engine/discovery/service";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResult,
} from "@/lib/orientation-engine/discovery/types";
import { runOrientationVerification } from "@/lib/orientation-engine/verification/service";
import type {
  OrientationVerificationServiceResult,
} from "@/lib/orientation-engine/verification/types";
import { runOrientationSelection } from "@/lib/orientation-engine/selection/service";
import type { OrientationSelectionResult } from "@/lib/orientation-engine/selection/types";
import {
  buildDeterministicOrientationWriterContent,
} from "@/lib/orientation-engine/writer/core";
import { runOrientationPersonalizedWriter } from "@/lib/orientation-engine/writer/service";
import type {
  OrientationWriterInput,
  OrientationWriterLocale,
  OrientationWriterResult,
} from "@/lib/orientation-engine/writer/types";
import {
  buildOrientationHumanReviewBundle,
} from "@/lib/orientation-engine/review/core";
import { persistOrientationHumanReview } from "@/lib/orientation-engine/review/store";
import type {
  OrientationPublicPersonalizedFact,
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";

function publicFact(
  fact: OrientationSelectionResult["selected"][number]["verification"]["facts"][number],
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

function projectPublicResult(
  selection: OrientationSelectionResult,
  writer: OrientationWriterResult,
  reviewId: string | null,
): OrientationPublicPersonalizedResult {
  return {
    status: selection.status,
    reviewId,
    content: writer.content,
    selected: selection.selected.map((item) => ({
      optionId: `option_${item.position}`,
      position: item.position,
      institution: item.verification.candidate.institution,
      programme: item.verification.candidate.programme,
      city: item.verification.candidate.city,
      overallStatus: item.verification.overallStatus,
      facts: item.verification.facts
        .map(publicFact)
        .filter((fact): fact is OrientationPublicPersonalizedFact => Boolean(fact)),
    })),
    humanReview: {
      mode: "post_result_audit",
      blocksResult: false,
    },
  };
}

async function writeOrientation(
  locale: OrientationWriterLocale,
  profile: PublicOrientationAnswers,
  selection: OrientationSelectionResult,
): Promise<OrientationWriterResult> {
  const input: OrientationWriterInput = {
    locale,
    profile,
    selection,
  };

  try {
    return await runOrientationPersonalizedWriter(input);
  } catch {
    return {
      provider: "deterministic",
      model: null,
      status: "fallback",
      reason: "provider_error",
      content: buildDeterministicOrientationWriterContent(input),
      usage: {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        durationMs: 0,
      },
    };
  }
}

async function resultFromSelection(input: {
  locale: OrientationWriterLocale;
  profile: PublicOrientationAnswers;
  plan: OrientationDiscoveryPlan;
  discovery: OrientationDiscoveryResult | null;
  verification: OrientationVerificationServiceResult | null;
  selection: OrientationSelectionResult;
}) {
  const writer = await writeOrientation(
    input.locale,
    input.profile,
    input.selection,
  );

  const review = buildOrientationHumanReviewBundle({
    profile: input.profile,
    plan: input.plan,
    discovery: input.discovery,
    verification: input.verification,
    selection: input.selection,
    writer,
  });

  const persistence = await persistOrientationHumanReview({
    profile: input.profile,
    bundle: review.bundle,
    pipelineStatus: review.pipelineStatus,
  }).catch(() => ({
    reviewId: null,
    available: false,
  }));

  return projectPublicResult(
    input.selection,
    writer,
    persistence.reviewId,
  );
}

export async function runOrientationResultPipeline(
  locale: OrientationWriterLocale,
  profile: PublicOrientationAnswers,
): Promise<OrientationPublicPersonalizedResult> {
  const emptySelection = () => runOrientationSelection(profile, []);
  const plan = buildOrientationDiscoveryPlan(profile);

  // A1 is authoritative here: a no-Bac or incomplete route must not silently
  // enter normal university discovery. The candidate still receives the
  // immediate deterministic result; this is separate from Phase F post-result audit.
  if (plan.status !== "ready") {
    return resultFromSelection({
      locale,
      profile,
      plan,
      discovery: null,
      verification: null,
      selection: emptySelection(),
    });
  }

  let discovery: OrientationDiscoveryResult | null = null;
  try {
    discovery = await runOrientationDiscovery(plan);
  } catch {
    return resultFromSelection({
      locale,
      profile,
      plan,
      discovery: null,
      verification: null,
      selection: emptySelection(),
    });
  }

  if (discovery.status !== "ready" || discovery.candidates.length === 0) {
    return resultFromSelection({
      locale,
      profile,
      plan,
      discovery,
      verification: null,
      selection: emptySelection(),
    });
  }

  let verification: OrientationVerificationServiceResult | null = null;
  try {
    verification = await runOrientationVerification(discovery.candidates);
  } catch {
    return resultFromSelection({
      locale,
      profile,
      plan,
      discovery,
      verification: null,
      selection: emptySelection(),
    });
  }

  const selection = runOrientationSelection(profile, verification.programmes);

  return resultFromSelection({
    locale,
    profile,
    plan,
    discovery,
    verification,
    selection,
  });
}
