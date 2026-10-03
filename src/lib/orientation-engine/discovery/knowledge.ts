import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  buildOrientationDiscoveryProfileFingerprint,
  buildOrientationDiscoverySearchContext,
  buildOrientationResearchProgrammeDedupeKey,
  getOrientationDiscoveryRefreshWindow,
  orientationDegreeCompatible,
} from "@/lib/orientation-engine/discovery/knowledge-core";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryResearchResult,
} from "@/lib/orientation-engine/discovery/types";

export const ORIENTATION_KNOWLEDGE_MIN_CANDIDATES = 4;
export const ORIENTATION_MAJOR_REFRESH_DATES = ["04-15", "10-15"] as const;
const MAX_KNOWLEDGE_SCAN = 60;

type ResearchProgramRow = {
  id: string;
  dedupe_key: string;
  institution: string;
  programme: string;
  degree: string | null;
  city: string | null;
  teaching_language: string | null;
  official_programme_url: string | null;
  official_university_url: string | null;
  source_urls: string[] | null;
  family_ids: string[] | null;
  research_status: string;
  refresh_cycle: string;
  next_major_refresh_at: string;
};

export type OrientationKnowledgeEntry = {
  researchProgramId: string;
  dedupeKey: string;
  candidate: OrientationDiscoveryResearchCandidate;
};

export type OrientationKnowledgeLoadResult = {
  available: boolean;
  entries: OrientationKnowledgeEntry[];
};

function knowledgeClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
    || !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  return createPrivilegedSupabaseClient();
}

function candidateFromRow(
  row: ResearchProgramRow,
): OrientationDiscoveryResearchCandidate {
  return {
    institution: row.institution,
    programme: row.programme,
    degree: row.degree,
    city: row.city,
    teachingLanguage: row.teaching_language,
    officialProgrammeUrl: row.official_programme_url,
    officialUniversityUrl: row.official_university_url,
    discoveryReason: "Programme déjà découvert par AlmaGo et conservé pour réutilisation.",
    sourceUrls: Array.isArray(row.source_urls) ? row.source_urls : [],
    status: "research_candidate",
  };
}

function familyIds(plan: OrientationDiscoveryPlan) {
  return [...new Set(plan.programmeFamilies.map((family) => family.id))].slice(0, 16);
}

export async function loadOrientationDiscoveryKnowledge(
  plan: OrientationDiscoveryPlan,
): Promise<OrientationKnowledgeLoadResult> {
  if (plan.status !== "ready") {
    return { available: true, entries: [] };
  }

  const supabase = knowledgeClient();
  if (!supabase) {
    return { available: false, entries: [] };
  }

  const families = familyIds(plan);
  let query = supabase
    .from("orientation_research_programs")
    .select([
      "id",
      "dedupe_key",
      "institution",
      "programme",
      "degree",
      "city",
      "teaching_language",
      "official_programme_url",
      "official_university_url",
      "source_urls",
      "family_ids",
      "research_status",
      "refresh_cycle",
      "next_major_refresh_at",
    ].join(","))
    .in("research_status", ["research_candidate", "needs_review", "promoted"])
    .gt("next_major_refresh_at", new Date().toISOString())
    .order("next_major_refresh_at", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(MAX_KNOWLEDGE_SCAN);

  if (families.length > 0) {
    query = query.overlaps("family_ids", families);
  }

  const { data, error } = await query;
  if (error) {
    return { available: false, entries: [] };
  }

  const seen = new Set<string>();
  const entries: OrientationKnowledgeEntry[] = [];

  for (const raw of data || []) {
    const row = raw as unknown as ResearchProgramRow;
    if (!orientationDegreeCompatible(plan.profile.targetDegree, row.degree)) {
      continue;
    }
    if (seen.has(row.dedupe_key)) continue;

    seen.add(row.dedupe_key);
    entries.push({
      researchProgramId: row.id,
      dedupeKey: row.dedupe_key,
      candidate: candidateFromRow(row),
    });

    if (entries.length >= plan.policy.maxCandidates) break;
  }

  return { available: true, entries };
}

function mergedStringArray(
  current: string[] | null | undefined,
  incoming: readonly string[],
  limit: number,
) {
  return [...new Set([
    ...(Array.isArray(current) ? current : []),
    ...incoming,
  ])].slice(0, limit);
}

async function insertDiscoveryRun({
  plan,
  provider,
  model,
  status,
  candidates,
  usage,
}: {
  plan: OrientationDiscoveryPlan;
  provider: "openai" | "knowledge_cache" | "mixed";
  model: string | null;
  status: "ready" | "unavailable";
  candidates: readonly OrientationKnowledgeEntry[];
  usage: OrientationDiscoveryResearchResult["usage"];
}) {
  const supabase = knowledgeClient();
  if (!supabase) return false;

  const refreshWindow = getOrientationDiscoveryRefreshWindow();

  const { data: run, error: runError } = await supabase
    .from("orientation_discovery_runs")
    .insert({
      profile_fingerprint: buildOrientationDiscoveryProfileFingerprint(plan),
      search_context: buildOrientationDiscoverySearchContext(plan),
      programme_family_ids: familyIds(plan),
      search_queries: plan.searchQueries.slice(0, 8),
      provider,
      model,
      status,
      candidate_count: Math.min(candidates.length, 20),
      provider_requests: usage.requests,
      web_search_calls: usage.webSearchCalls,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      total_tokens: usage.totalTokens,
      source_urls_seen: usage.sourceUrlsSeen,
      duration_ms: usage.durationMs,
      refresh_cycle: refreshWindow.cycle,
      next_major_refresh_at: refreshWindow.nextMajorRefreshAt,
    })
    .select("id")
    .single();

  if (runError || !run?.id) return false;

  const links = candidates.slice(0, 20).map((entry, ordinal) => ({
    run_id: run.id,
    research_program_id: entry.researchProgramId,
    discovery_reason: entry.candidate.discoveryReason,
    ordinal,
  }));

  if (links.length === 0) return true;

  const { error: linkError } = await supabase
    .from("orientation_discovery_run_candidates")
    .insert(links);

  if (linkError) {
    await supabase
      .from("orientation_discovery_runs")
      .delete()
      .eq("id", run.id);
    return false;
  }

  return true;
}

export async function persistOrientationDiscoveryResearch(
  plan: OrientationDiscoveryPlan,
  result: OrientationDiscoveryResearchResult,
) {
  if (
    plan.status !== "ready"
    || result.status !== "ready"
    || result.candidates.length === 0
  ) {
    return { available: Boolean(knowledgeClient()), persisted: 0 };
  }

  const supabase = knowledgeClient();
  if (!supabase) return { available: false, persisted: 0 };

  const keys = result.candidates.map(buildOrientationResearchProgrammeDedupeKey);
  const { data: existingData, error: existingError } = await supabase
    .from("orientation_research_programs")
    .select([
      "dedupe_key",
      "degree",
      "city",
      "teaching_language",
      "official_programme_url",
      "official_university_url",
      "source_urls",
      "family_ids",
    ].join(","))
    .in("dedupe_key", keys);

  if (existingError) return { available: false, persisted: 0 };

  const existingRows = (existingData || []) as unknown as Array<Record<string, unknown>>;
  const existingByKey = new Map<string, Record<string, unknown>>(
    existingRows.map((row) => [
      String(row.dedupe_key),
      row,
    ]),
  );
  const families = familyIds(plan);
  const now = new Date().toISOString();
  const refreshWindow = getOrientationDiscoveryRefreshWindow(new Date(now));

  const rows = result.candidates.map((candidate) => {
    const dedupeKey = buildOrientationResearchProgrammeDedupeKey(candidate);
    const existing = existingByKey.get(dedupeKey);

    return {
      dedupe_key: dedupeKey,
      institution: candidate.institution,
      programme: candidate.programme,
      degree: candidate.degree || (existing?.degree as string | null | undefined) || null,
      city: candidate.city || (existing?.city as string | null | undefined) || null,
      teaching_language:
        candidate.teachingLanguage
        || (existing?.teaching_language as string | null | undefined)
        || null,
      official_programme_url:
        candidate.officialProgrammeUrl
        || (existing?.official_programme_url as string | null | undefined)
        || null,
      official_university_url:
        candidate.officialUniversityUrl
        || (existing?.official_university_url as string | null | undefined)
        || null,
      source_urls: mergedStringArray(
        existing?.source_urls as string[] | null | undefined,
        candidate.sourceUrls,
        8,
      ),
      family_ids: mergedStringArray(
        existing?.family_ids as string[] | null | undefined,
        families,
        16,
      ),
      last_seen_at: now,
      last_provider: "openai",
      last_model: result.model,
      refresh_cycle: refreshWindow.cycle,
      next_major_refresh_at: refreshWindow.nextMajorRefreshAt,
      updated_at: now,
    };
  });

  const { data: upserted, error: upsertError } = await supabase
    .from("orientation_research_programs")
    .upsert(rows, { onConflict: "dedupe_key" })
    .select("id,dedupe_key");

  if (upsertError || !upserted) {
    return { available: false, persisted: 0 };
  }

  const upsertedRows = upserted as unknown as Array<{
    id: string;
    dedupe_key: string;
  }>;
  const idByKey = new Map<string, string>(
    upsertedRows.map((row) => [String(row.dedupe_key), String(row.id)]),
  );

  const entries = result.candidates
    .map((candidate) => {
      const dedupeKey = buildOrientationResearchProgrammeDedupeKey(candidate);
      const researchProgramId = idByKey.get(dedupeKey);
      if (!researchProgramId) return null;
      return {
        researchProgramId,
        dedupeKey,
        candidate,
      } satisfies OrientationKnowledgeEntry;
    })
    .filter((entry): entry is OrientationKnowledgeEntry => Boolean(entry));

  await insertDiscoveryRun({
    plan,
    provider: "openai",
    model: result.model,
    status: "ready",
    candidates: entries,
    usage: result.usage,
  });

  return {
    available: true,
    persisted: entries.length,
  };
}

export async function recordOrientationKnowledgeCacheHit(
  plan: OrientationDiscoveryPlan,
  entries: readonly OrientationKnowledgeEntry[],
) {
  return insertDiscoveryRun({
    plan,
    provider: "knowledge_cache",
    model: null,
    status: "ready",
    candidates: entries,
    usage: {
      requests: 0,
      webSearchCalls: 0,
      queriesAttempted: 0,
      queriesSucceeded: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      sourceUrlsSeen: 0,
      durationMs: 0,
    },
  });
}
