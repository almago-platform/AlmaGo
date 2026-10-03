import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  buildOrientationResearchProgrammeDedupeKey,
  getOrientationDiscoveryRefreshWindow,
} from "@/lib/orientation-engine/discovery/knowledge-core";
import type { OrientationDiscoveryResearchCandidate } from "@/lib/orientation-engine/discovery/types";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationFact,
  OrientationVerificationOverallStatus,
  OrientationVerificationPersistence,
  OrientationVerificationResult,
} from "@/lib/orientation-engine/verification/types";

function verificationClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
    || !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  return createPrivilegedSupabaseClient();
}

export type OrientationVerificationKnowledgeLoadResult = {
  available: boolean;
  programmes: OrientationProgrammeVerification[];
};

type ResearchVerificationRow = {
  id: string;
  dedupe_key: string;
};

type StoredVerificationRow = {
  research_program_id: string;
  overall_status: OrientationVerificationOverallStatus;
  facts: OrientationVerificationFact[];
  source_urls: string[] | null;
  verified_at: string;
};

export async function loadReusableOrientationVerifications(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
): Promise<OrientationVerificationKnowledgeLoadResult> {
  const supabase = verificationClient();
  if (!supabase) {
    return { available: false, programmes: [] };
  }

  const candidateByKey = new Map(
    candidates.map((candidate) => [
      buildOrientationResearchProgrammeDedupeKey(candidate),
      candidate,
    ]),
  );
  const keys = [...candidateByKey.keys()];
  if (keys.length === 0) {
    return { available: true, programmes: [] };
  }

  const now = new Date();
  const refreshWindow = getOrientationDiscoveryRefreshWindow(now);
  const { data: researchData, error: researchError } = await supabase
    .from("orientation_research_programs")
    .select("id,dedupe_key")
    .in("dedupe_key", keys)
    .in("verification_status", ["verified", "needs_review"])
    .gt("next_major_refresh_at", now.toISOString());

  if (researchError) {
    return { available: false, programmes: [] };
  }

  const researchRows = (researchData || []) as unknown as ResearchVerificationRow[];
  if (researchRows.length === 0) {
    return { available: true, programmes: [] };
  }

  const researchById = new Map(
    researchRows.map((row) => [String(row.id), String(row.dedupe_key)]),
  );

  const { data: verificationData, error: verificationError } = await supabase
    .from("orientation_programme_verifications")
    .select("research_program_id,overall_status,facts,source_urls,verified_at")
    .in("research_program_id", [...researchById.keys()])
    .gte("verified_at", refreshWindow.lastMajorRefreshAt)
    .order("verified_at", { ascending: false });

  if (verificationError) {
    return { available: false, programmes: [] };
  }

  const latestByKey = new Map<string, OrientationProgrammeVerification>();
  for (const raw of verificationData || []) {
    const row = raw as unknown as StoredVerificationRow;
    const dedupeKey = researchById.get(String(row.research_program_id));
    if (!dedupeKey || latestByKey.has(dedupeKey)) continue;
    if (row.overall_status === "unknown" || !Array.isArray(row.facts)) continue;

    const candidate = candidateByKey.get(dedupeKey);
    if (!candidate) continue;

    latestByKey.set(dedupeKey, {
      candidate,
      overallStatus: row.overall_status,
      facts: row.facts,
      sourceUrls: Array.isArray(row.source_urls) ? row.source_urls : [],
      verifiedAt: row.verified_at,
    });
  }

  return {
    available: true,
    programmes: candidates
      .map((candidate) =>
        latestByKey.get(buildOrientationResearchProgrammeDedupeKey(candidate))
      )
      .filter(
        (programme): programme is OrientationProgrammeVerification =>
          Boolean(programme),
      ),
  };
}

export async function recordOrientationVerificationCacheHit(
  programmes: readonly OrientationProgrammeVerification[],
): Promise<OrientationVerificationPersistence> {
  const supabase = verificationClient();
  if (!supabase) {
    return {
      available: false,
      runPersisted: false,
      programmesPersisted: 0,
    };
  }

  const { error } = await supabase
    .from("orientation_verification_runs")
    .insert({
      provider: "deterministic",
      model: null,
      status: "ready",
      reason: null,
      candidate_count: programmes.length,
      verified_count: programmes.filter(
        (programme) => programme.overallStatus === "verified",
      ).length,
      provider_requests: 0,
      web_search_calls: 0,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      source_urls_seen: 0,
      duration_ms: 0,
    });

  return {
    available: !error,
    runPersisted: !error,
    programmesPersisted: 0,
  };
}

export async function persistOrientationVerification(
  result: OrientationVerificationResult,
): Promise<OrientationVerificationPersistence> {
  const supabase = verificationClient();
  if (!supabase) {
    return {
      available: false,
      runPersisted: false,
      programmesPersisted: 0,
    };
  }

  const keys = result.programmes.map((programme) =>
    buildOrientationResearchProgrammeDedupeKey(programme.candidate)
  );

  const { data: researchRows, error: researchError } = keys.length > 0
    ? await supabase
        .from("orientation_research_programs")
        .select("id,dedupe_key")
        .in("dedupe_key", keys)
    : { data: [], error: null };

  if (researchError) {
    return {
      available: false,
      runPersisted: false,
      programmesPersisted: 0,
    };
  }

  const researchIdByKey = new Map<string, string>(
    ((researchRows || []) as unknown as Array<{
      id: string;
      dedupe_key: string;
    }>).map((row) => [String(row.dedupe_key), String(row.id)]),
  );

  const { data: run, error: runError } = await supabase
    .from("orientation_verification_runs")
    .insert({
      provider: result.provider,
      model: result.model,
      status: result.status,
      reason: result.reason,
      candidate_count: result.candidatesConsidered,
      verified_count: result.candidatesVerified,
      provider_requests: result.usage.requests,
      web_search_calls: result.usage.webSearchCalls,
      input_tokens: result.usage.inputTokens,
      output_tokens: result.usage.outputTokens,
      total_tokens: result.usage.totalTokens,
      source_urls_seen: result.usage.sourceUrlsSeen,
      duration_ms: result.usage.durationMs,
    })
    .select("id")
    .single();

  if (runError || !run?.id) {
    return {
      available: false,
      runPersisted: false,
      programmesPersisted: 0,
    };
  }

  const verificationRows = result.programmes.flatMap((programme) => {
    const key = buildOrientationResearchProgrammeDedupeKey(programme.candidate);
    const researchProgramId = researchIdByKey.get(key);
    if (!researchProgramId) return [];

    return [{
      run_id: run.id,
      research_program_id: researchProgramId,
      overall_status: programme.overallStatus,
      facts: programme.facts,
      source_urls: programme.sourceUrls.slice(0, 24),
      verified_at: programme.verifiedAt,
    }];
  });

  if (verificationRows.length === 0) {
    return {
      available: true,
      runPersisted: true,
      programmesPersisted: 0,
    };
  }

  const { error: verificationError } = await supabase
    .from("orientation_programme_verifications")
    .insert(verificationRows);

  if (verificationError) {
    await supabase
      .from("orientation_verification_runs")
      .delete()
      .eq("id", run.id);

    return {
      available: false,
      runPersisted: false,
      programmesPersisted: 0,
    };
  }

  await Promise.all(
    result.programmes.map(async (programme) => {
      const key = buildOrientationResearchProgrammeDedupeKey(programme.candidate);
      const researchProgramId = researchIdByKey.get(key);
      if (!researchProgramId) return;

      await supabase
        .from("orientation_research_programs")
        .update({
          verification_status: programme.overallStatus,
          last_verification_at: programme.verifiedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", researchProgramId);
    }),
  );

  return {
    available: true,
    runPersisted: true,
    programmesPersisted: verificationRows.length,
  };
}
