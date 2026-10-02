import "server-only";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { buildOrientationDiscoveryPlan } from "@/lib/orientation-engine/discovery/contract";
import { runOrientationDiscovery } from "@/lib/orientation-engine/discovery/service";
import { runOrientationVerification } from "@/lib/orientation-engine/verification/service";
import { runOrientationSelection } from "@/lib/orientation-engine/selection/service";
import {
  buildDeterministicOrientationWriterContent,
} from "@/lib/orientation-engine/writer/core";
import { runOrientationPersonalizedWriter } from "@/lib/orientation-engine/writer/service";
import type {
  OrientationWriterContent,
  OrientationWriterInput,
  OrientationWriterLocale,
} from "@/lib/orientation-engine/writer/types";
import type { OrientationSelectionResult } from "@/lib/orientation-engine/selection/types";
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
  content: OrientationWriterContent,
): OrientationPublicPersonalizedResult {
  return {
    status: selection.status,
    content,
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
      required: true,
      state: "counselor_validation_required",
    },
  };
}

async function writeOrientation(
  locale: OrientationWriterLocale,
  profile: PublicOrientationAnswers,
  selection: OrientationSelectionResult,
) {
  const input: OrientationWriterInput = {
    locale,
    profile,
    selection,
  };

  try {
    return (await runOrientationPersonalizedWriter(input)).content;
  } catch {
    return buildDeterministicOrientationWriterContent(input);
  }
}

async function resultFromSelection(
  locale: OrientationWriterLocale,
  profile: PublicOrientationAnswers,
  selection: OrientationSelectionResult,
) {
  const content = await writeOrientation(locale, profile, selection);
  return projectPublicResult(selection, content);
}

export async function runOrientationResultPipeline(
  locale: OrientationWriterLocale,
  profile: PublicOrientationAnswers,
): Promise<OrientationPublicPersonalizedResult> {
  const emptySelection = () => runOrientationSelection(profile, []);
  const plan = buildOrientationDiscoveryPlan(profile);

  // A1 is authoritative here: a no-Bac or incomplete route must be reviewed
  // before normal university discovery. Do not let cache/provider fallbacks
  // silently bypass that product rule.
  if (plan.status !== "ready") {
    return resultFromSelection(locale, profile, emptySelection());
  }

  try {
    const discovery = await runOrientationDiscovery(plan);
    if (discovery.status !== "ready" || discovery.candidates.length === 0) {
      return resultFromSelection(locale, profile, emptySelection());
    }

    const verification = await runOrientationVerification(discovery.candidates);
    const selection = runOrientationSelection(profile, verification.programmes);

    return resultFromSelection(locale, profile, selection);
  } catch {
    return resultFromSelection(locale, profile, emptySelection());
  }
}
