import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  buildOrientationDiscoveryProfileFingerprint,
  buildOrientationDiscoverySearchContext,
  buildOrientationResearchProgrammeDedupeKey,
  buildOrientationResearchUniversityDedupeKey,
  getOrientationDiscoveryRefreshWindow,
  orientationDegreeCompatible,
} from "@/lib/orientation-engine/discovery/knowledge-core";
import {
  findWikimediaUniversityMedia,
} from "@/lib/orientation-engine/discovery/university-media";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryResearchResult,
} from "@/lib/orientation-engine/discovery/types";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";

export const ORIENTATION_KNOWLEDGE_MIN_CANDIDATES = 4;
export const ORIENTATION_MAJOR_REFRESH_DATES = ["04-15", "10-15"] as const;
const MAX_KNOWLEDGE_SCAN = 60;
const MAX_MEDIA_LOOKUPS_PER_RUN = 4;
const MEDIA_RETRY_DAYS = 30;

type ResearchProgramRow = {
  id: string;
  dedupe_key: string;
  university_id: string | null;
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

type UniversityRegistryRow = {
  id: string;
  canonical_key: string | null;
  name: string;
  aliases: string[] | null;
  city: string | null;
  country: string;
  website_url: string | null;
  source_url: string | null;
  registry_status: string;
  is_active: boolean;
  is_public: boolean;
  cover_image_url: string | null;
  cover_image_source_url: string | null;
  cover_image_attribution: string | null;
  cover_image_license: string | null;
  media_verified_at: string | null;
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
  universityMedia: OrientationUniversityMedia | null = null,
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
    universityMedia,
    status: "research_candidate",
  };
}

function familyIds(plan: OrientationDiscoveryPlan) {
  return [...new Set(plan.programmeFamilies.map((family) => family.id))].slice(0, 16);
}

function mergedStringArray(
  current: string[] | null | undefined,
  incoming: readonly string[],
  limit: number,
) {
  return [...new Set([
    ...(Array.isArray(current) ? current : []),
    ...incoming,
  ].map((value) => value.trim()).filter(Boolean))].slice(0, limit);
}

function mediaProfile(row: UniversityRegistryRow): OrientationUniversityMedia {
  return {
    universityId: row.id,
    canonicalName: row.name,
    coverImageUrl: row.cover_image_url,
    coverImageSourceUrl: row.cover_image_source_url,
    coverImageAttribution: row.cover_image_attribution,
    coverImageLicense: row.cover_image_license,
  };
}

function shouldLookupMedia(row: UniversityRegistryRow | undefined) {
  if (row?.cover_image_url) return false;
  if (!row?.media_verified_at) return true;

  const checkedAt = new Date(row.media_verified_at);
  if (Number.isNaN(checkedAt.getTime())) return true;

  return Date.now() - checkedAt.getTime()
    >= MEDIA_RETRY_DAYS * 24 * 60 * 60 * 1_000;
}

function candidateGroups(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
) {
  const groups = new Map<string, OrientationDiscoveryResearchCandidate[]>();

  for (const candidate of candidates) {
    const key = buildOrientationResearchUniversityDedupeKey(candidate);
    const existing = groups.get(key) || [];
    existing.push(candidate);
    groups.set(key, existing);
  }

  return groups;
}

async function ensureUniversityRegistry(
  supabase: NonNullable<ReturnType<typeof knowledgeClient>>,
  candidates: readonly OrientationDiscoveryResearchCandidate[],
) {
  const groups = candidateGroups(candidates);
  const keys = [...groups.keys()];
  const result = new Map<string, OrientationUniversityMedia>();
  if (keys.length === 0) return result;

  const { data: existingData, error: existingError } = await supabase
    .from("universities")
    .select([
      "id",
      "canonical_key",
      "name",
      "aliases",
      "city",
      "country",
      "website_url",
      "source_url",
      "registry_status",
      "is_active",
      "is_public",
      "cover_image_url",
      "cover_image_source_url",
      "cover_image_attribution",
      "cover_image_license",
      "media_verified_at",
    ].join(","))
    .in("canonical_key", keys);

  // A branch preview may temporarily run against a database where the
  // accompanying migration has not been applied yet. Discovery still works.
  if (existingError) return result;

  const existingRows = (existingData || []) as unknown as UniversityRegistryRow[];
  const existingByKey = new Map(
    existingRows
      .filter((row) => row.canonical_key)
      .map((row) => [String(row.canonical_key), row]),
  );

  let mediaLookups = 0;
  const rows: Array<Record<string, unknown>> = [];
  const checkedAt = new Date().toISOString();

  for (const [canonicalKey, group] of groups) {
    const primary = group[0];
    const existing = existingByKey.get(canonicalKey);
    let media = existing?.cover_image_url
      ? {
          coverImageUrl: existing.cover_image_url,
          coverImageSourceUrl: existing.cover_image_source_url,
          coverImageAttribution: existing.cover_image_attribution,
          coverImageLicense: existing.cover_image_license,
        }
      : null;
    let mediaVerifiedAt = existing?.media_verified_at || null;

    if (
      shouldLookupMedia(existing)
      && mediaLookups < MAX_MEDIA_LOOKUPS_PER_RUN
    ) {
      mediaLookups += 1;
      media = await findWikimediaUniversityMedia(
        existing?.name || primary.institution,
        existing?.city || primary.city,
      );
      mediaVerifiedAt = checkedAt;
    }

    const officialUniversityUrl =
      group.find((candidate) => candidate.officialUniversityUrl)
        ?.officialUniversityUrl
      || null;

    rows.push({
      canonical_key: canonicalKey,
      name: existing?.name || primary.institution,
      aliases: mergedStringArray(
        existing?.aliases,
        group.map((candidate) => candidate.institution),
        24,
      ),
      city: existing?.city || primary.city,
      country: existing?.country || "DE",
      website_url: existing?.website_url || officialUniversityUrl,
      source_url: existing?.source_url || officialUniversityUrl,
      registry_status: existing?.registry_status || "research_candidate",
      is_active: existing?.is_active ?? false,
      is_public: existing?.is_public ?? false,
      cover_image_url: existing?.cover_image_url || media?.coverImageUrl || null,
      cover_image_source_url:
        existing?.cover_image_source_url
        || media?.coverImageSourceUrl
        || null,
      cover_image_attribution:
        existing?.cover_image_attribution
        || media?.coverImageAttribution
        || null,
      cover_image_license:
        existing?.cover_image_license
        || media?.coverImageLicense
        || null,
      media_verified_at: mediaVerifiedAt,
      updated_at: checkedAt,
    });
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("universities")
    .upsert(rows, { onConflict: "canonical_key" })
    .select([
      "id",
      "canonical_key",
      "name",
      "aliases",
      "city",
      "country",
      "website_url",
      "source_url",
      "registry_status",
      "is_active",
      "is_public",
      "cover_image_url",
      "cover_image_source_url",
      "cover_image_attribution",
      "cover_image_license",
      "media_verified_at",
    ].join(","));

  if (upsertError || !upserted) return result;

  for (const row of upserted as unknown as UniversityRegistryRow[]) {
    if (!row.canonical_key) continue;
    result.set(row.canonical_key, mediaProfile(row));
  }

  return result;
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
      "university_id",
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
  const currentUniversityIds = new Map<string, string | null>();

  for (const raw of data || []) {
    const row = raw as unknown as ResearchProgramRow;
    if (!orientationDegreeCompatible(plan.profile.targetDegree, row.degree)) {
      continue;
    }

    // Recompute the current canonical identity on read so historical cache
    // rows created under older raw-name keys collapse immediately.
    const candidate = candidateFromRow(row);
    const dedupeKey = buildOrientationResearchProgrammeDedupeKey(candidate);
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    entries.push({
      researchProgramId: row.id,
      dedupeKey,
      candidate,
    });
    currentUniversityIds.set(row.id, row.university_id);

    if (entries.length >= plan.policy.maxCandidates) break;
  }

  if (entries.length === 0) return { available: true, entries };

  const registry = await ensureUniversityRegistry(
    supabase,
    entries.map((entry) => entry.candidate),
  );

  const linkedEntries = entries.map((entry) => {
    const university = registry.get(
      buildOrientationResearchUniversityDedupeKey(entry.candidate),
    ) || null;

    return {
      ...entry,
      candidate: {
        ...entry.candidate,
        universityMedia: university,
      },
    };
  });

  const linksToUpdate = linkedEntries.filter((entry) => {
    const universityId = entry.candidate.universityMedia?.universityId || null;
    return universityId && currentUniversityIds.get(entry.researchProgramId) !== universityId;
  });

  await Promise.all(
    linksToUpdate.map((entry) =>
      supabase
        .from("orientation_research_programs")
        .update({
          university_id: entry.candidate.universityMedia?.universityId,
        })
        .eq("id", entry.researchProgramId)
    ),
  );

  return { available: true, entries: linkedEntries };
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
    return {
      available: Boolean(knowledgeClient()),
      persisted: 0,
      candidates: result.candidates,
    };
  }

  const supabase = knowledgeClient();
  if (!supabase) {
    return {
      available: false,
      persisted: 0,
      candidates: result.candidates,
    };
  }

  const registry = await ensureUniversityRegistry(
    supabase,
    result.candidates,
  );
  const enrichedCandidates = result.candidates.map((candidate) => ({
    ...candidate,
    universityMedia:
      registry.get(buildOrientationResearchUniversityDedupeKey(candidate))
      || candidate.universityMedia
      || null,
  }));

  const keys = enrichedCandidates.map(buildOrientationResearchProgrammeDedupeKey);
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

  if (existingError) {
    return {
      available: false,
      persisted: 0,
      candidates: enrichedCandidates,
    };
  }

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

  const rows = enrichedCandidates.map((candidate) => {
    const dedupeKey = buildOrientationResearchProgrammeDedupeKey(candidate);
    const existing = existingByKey.get(dedupeKey);
    const universityId = candidate.universityMedia?.universityId || null;

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
      ...(universityId ? { university_id: universityId } : {}),
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
    return {
      available: false,
      persisted: 0,
      candidates: enrichedCandidates,
    };
  }

  const upsertedRows = upserted as unknown as Array<{
    id: string;
    dedupe_key: string;
  }>;
  const idByKey = new Map<string, string>(
    upsertedRows.map((row) => [String(row.dedupe_key), String(row.id)]),
  );

  const entries: OrientationKnowledgeEntry[] = [];

  for (const candidate of enrichedCandidates) {
    const dedupeKey = buildOrientationResearchProgrammeDedupeKey(candidate);
    const researchProgramId = idByKey.get(dedupeKey);
    if (!researchProgramId) continue;

    entries.push({
      researchProgramId,
      dedupeKey,
      candidate,
    });
  }

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
    candidates: enrichedCandidates,
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
