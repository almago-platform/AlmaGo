import "server-only";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { buildOrientationResearchProgrammeDedupeKey } from "@/lib/orientation-engine/discovery/knowledge-core";
import { emptyOrientationDiscoveryUsage } from "@/lib/orientation-engine/discovery/research";
import type { OrientationDiscoveryResearchCandidate } from "@/lib/orientation-engine/discovery/types";
import { runOpenAIOrientationVerification } from "@/lib/orientation-engine/verification/openai";
import {
  loadReusableOrientationVerifications,
  persistOrientationVerification,
  recordOrientationVerificationCacheHit,
} from "@/lib/orientation-engine/verification/store";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationServiceResult,
} from "@/lib/orientation-engine/verification/types";

export const ORIENTATION_VERIFICATION_REUSE_TARGET = 4;

function candidateKey(candidate: OrientationDiscoveryResearchCandidate) {
  return buildOrientationResearchProgrammeDedupeKey(candidate);
}

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function targetSpecializationPhrases(answers: PublicOrientationAnswers) {
  if (!normalize(answers.targetDegree).includes("master")) return [];

  const target = normalize(answers.targetSpecialization);
  if (!target) return [];

  return [
    target,
    ...target
      .split(/\s+(?:and|und|et)\s+|[\/,&;+]+/)
      .map((value) => value.trim())
      .filter((value) => value.length >= 6),
  ];
}

function matchesTargetSpecialization(
  answers: PublicOrientationAnswers,
  candidate: OrientationDiscoveryResearchCandidate,
) {
  const programme = normalize(candidate.programme);
  if (!programme) return false;
  return targetSpecializationPhrases(answers).some((phrase) =>
    programme.includes(phrase)
  );
}

function verificationMatchesTargetSpecialization(
  answers: PublicOrientationAnswers,
  programme: OrientationProgrammeVerification,
) {
  return matchesTargetSpecialization(answers, programme.candidate);
}

function teachingLanguageMatches(
  answers: PublicOrientationAnswers,
  candidate: OrientationDiscoveryResearchCandidate,
) {
  const preference = normalize(answers.studyLanguage);
  const teaching = normalize(candidate.teachingLanguage);
  if (!preference || !teaching || preference.includes("definir")) return false;

  const wantsEnglish =
    preference.includes("anglais") || preference.includes("english");
  const wantsGerman =
    preference.includes("allemand") || preference.includes("german");
  const isEnglish =
    teaching.includes("english") || teaching.includes("anglais");
  const isGerman =
    teaching.includes("german")
    || teaching.includes("deutsch")
    || teaching.includes("allemand");

  return (wantsEnglish && isEnglish) || (wantsGerman && isGerman);
}

function prioritizeCandidates(
  answers: PublicOrientationAnswers,
  candidates: readonly OrientationDiscoveryResearchCandidate[],
) {
  if (targetSpecializationPhrases(answers).length === 0) {
    return [...candidates];
  }

  return candidates
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => {
      const aMatches = matchesTargetSpecialization(answers, a.candidate);
      const bMatches = matchesTargetSpecialization(answers, b.candidate);
      const specializationDiff = Number(bMatches) - Number(aMatches);
      if (specializationDiff !== 0) return specializationDiff;

      if (aMatches && bMatches) {
        const languageDiff =
          Number(teachingLanguageMatches(answers, b.candidate))
          - Number(teachingLanguageMatches(answers, a.candidate));
        if (languageDiff !== 0) return languageDiff;
      }

      return a.index - b.index;
    })
    .map(({ candidate }) => candidate);
}

function logVerification(result: {
  provider: string;
  status: string;
  reason: string | null;
  requests: number;
  webSearchCalls: number;
  candidatesConsidered: number;
  candidatesVerified: number;
  cachedProgrammes: number;
}) {
  console.info("orientation_v4_provider", JSON.stringify({
    stage: "verification",
    provider: result.provider,
    status: result.status,
    reason: result.reason,
    requests: result.requests,
    webSearchCalls: result.webSearchCalls,
    candidatesConsidered: result.candidatesConsidered,
    candidatesVerified: result.candidatesVerified,
    cachedProgrammes: result.cachedProgrammes,
  }));
}

function takeReusable(
  answers: PublicOrientationAnswers,
  programmes: readonly OrientationProgrammeVerification[],
) {
  return programmes
    .filter((programme) => programme.overallStatus !== "unknown")
    .map((programme, index) => ({ programme, index }))
    .sort((a, b) => {
      const specializationDiff =
        Number(verificationMatchesTargetSpecialization(answers, b.programme))
        - Number(verificationMatchesTargetSpecialization(answers, a.programme));
      if (specializationDiff !== 0) return specializationDiff;

      const statusDiff =
        Number(b.programme.overallStatus === "verified")
        - Number(a.programme.overallStatus === "verified");
      if (statusDiff !== 0) return statusDiff;

      return a.index - b.index;
    })
    .slice(0, ORIENTATION_VERIFICATION_REUSE_TARGET)
    .map(({ programme }) => programme);
}

function targetSpecializationCovered(
  answers: PublicOrientationAnswers,
  programmes: readonly OrientationProgrammeVerification[],
) {
  const phrases = targetSpecializationPhrases(answers);
  if (phrases.length === 0) return true;
  return programmes.some((programme) =>
    verificationMatchesTargetSpecialization(answers, programme)
  );
}

export async function runOrientationVerification(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
  answers: PublicOrientationAnswers,
): Promise<OrientationVerificationServiceResult> {
  const knowledge = await loadReusableOrientationVerifications(candidates);
  const cachedProgrammes = takeReusable(answers, knowledge.programmes);

  if (
    cachedProgrammes.length >= ORIENTATION_VERIFICATION_REUSE_TARGET
    && targetSpecializationCovered(answers, cachedProgrammes)
  ) {
    const persistence = await recordOrientationVerificationCacheHit(
      cachedProgrammes,
    );
    const candidatesVerified = cachedProgrammes.filter(
      (programme) => programme.overallStatus === "verified",
    ).length;

    logVerification({
      provider: "deterministic",
      status: "ready",
      reason: null,
      requests: 0,
      webSearchCalls: 0,
      candidatesConsidered: cachedProgrammes.length,
      candidatesVerified,
      cachedProgrammes: cachedProgrammes.length,
    });

    return {
      provider: "deterministic",
      model: null,
      status: "ready",
      reason: null,
      programmes: cachedProgrammes,
      usage: emptyOrientationDiscoveryUsage(),
      candidatesConsidered: cachedProgrammes.length,
      candidatesVerified,
      persistence,
    };
  }

  const cachedKeys = new Set(
    cachedProgrammes.map((programme) => candidateKey(programme.candidate)),
  );
  const uncachedCandidates = prioritizeCandidates(
    answers,
    candidates.filter(
      (candidate) => !cachedKeys.has(candidateKey(candidate)),
    ),
  );
  const missing = Math.max(
    1,
    ORIENTATION_VERIFICATION_REUSE_TARGET - cachedProgrammes.length,
  );

  const fresh = await runOpenAIOrientationVerification(
    uncachedCandidates,
    missing,
  );
  const persistence = await persistOrientationVerification(fresh);

  const programmes = takeReusable(
    answers,
    [
      ...fresh.programmes,
      ...cachedProgrammes,
    ],
  );

  const candidatesVerified = programmes.filter(
    (programme) => programme.overallStatus === "verified",
  ).length;
  const status = programmes.length > 0 ? "ready" : fresh.status;
  const reason = programmes.length > 0 ? null : fresh.reason;
  const provider =
    cachedProgrammes.length > 0 && fresh.usage.requests === 0
      ? "deterministic"
      : fresh.provider;

  logVerification({
    provider,
    status,
    reason,
    requests: fresh.usage.requests,
    webSearchCalls: fresh.usage.webSearchCalls,
    candidatesConsidered: programmes.length,
    candidatesVerified,
    cachedProgrammes: cachedProgrammes.length,
  });

  return {
    provider,
    model: fresh.model,
    status,
    reason,
    programmes,
    usage: fresh.usage,
    candidatesConsidered: programmes.length,
    candidatesVerified,
    persistence,
  };
}
