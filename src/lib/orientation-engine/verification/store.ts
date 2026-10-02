import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { buildOrientationResearchProgrammeDedupeKey } from "@/lib/orientation-engine/discovery/knowledge-core";
import type {
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
