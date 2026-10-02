import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationDiscoveryProfileFingerprint,
  buildOrientationDiscoverySearchContext,
  buildOrientationResearchProgrammeDedupeKey,
  mergeOrientationKnowledgeCandidates,
  orientationDegreeCompatible,
} = await import("../src/lib/orientation-engine/discovery/knowledge-core.ts");

const serviceSource = readFileSync(
  "src/lib/orientation-engine/discovery/service.ts",
  "utf8",
);
const knowledgeSource = readFileSync(
  "src/lib/orientation-engine/discovery/knowledge.ts",
  "utf8",
);
const typesSource = readFileSync(
  "src/lib/orientation-engine/discovery/types.ts",
  "utf8",
);

function plan(overrides = {}) {
  return {
    status: "ready",
    reason: null,
    profile: {
      bacStatus: "obtained",
      bacYear: 2024,
      bacTrack: "Sciences techniques",
      averageOutOf20: 15,
      averageType: "official",
      lastDiploma: "Baccalauréat",
      targetDegree: "Bachelor",
      targetField: "Ingénierie",
      engineeringSpecialty: "automotive",
      germanLevel: "A2",
      englishLevel: "B2",
      studyLanguage: "Allemand",
      targetIntakeSeason: "winter",
      targetIntakeYear: 2027,
      budgetRange: "800-1000",
      preferredCities: [],
      ...(overrides.profile || {}),
    },
    programmeFamilies: [
      {
        id: "automotive_engineering",
        label: "Automotive / Vehicle Engineering",
        aliases: ["Automotive Engineering", "Vehicle Engineering"],
      },
      {
        id: "mechanical_automotive",
        label: "Mechanical Engineering with automotive relevance",
        aliases: ["Mechanical Engineering automotive"],
      },
    ],
    searchQueries: ["Automotive Engineering Bachelor Germany official university programme"],
    policy: {
      maxSearchQueries: 8,
      maxCandidates: 20,
      maxSourceUrlsPerCandidate: 8,
      sourcePriority: [
        "official_programme",
        "official_university",
        "official_registry",
        "discovery_only",
      ],
      campusOffersStudienkolleg: false,
      studienkollegHandling: "flag_and_review",
    },
    ...overrides,
  };
}

function candidate(overrides = {}) {
  return {
    institution: "Example University",
    programme: "Automotive Engineering",
    degree: "Bachelor",
    city: "Example City",
    teachingLanguage: "German",
    officialProgrammeUrl: "https://example.edu/automotive",
    officialUniversityUrl: "https://example.edu",
    discoveryReason: "Relevant programme family.",
    sourceUrls: ["https://example.edu/automotive"],
    status: "research_candidate",
    ...overrides,
  };
}

test("A3 profile fingerprints are stable for equivalent discovery preferences", () => {
  const first = plan({
    profile: {
      preferredCities: ["Munich", "Aachen"],
    },
  });
  const second = plan({
    profile: {
      preferredCities: ["Aachen", "Munich"],
    },
  });

  assert.equal(
    buildOrientationDiscoveryProfileFingerprint(first),
    buildOrientationDiscoveryProfileFingerprint(second),
  );
  assert.match(buildOrientationDiscoveryProfileFingerprint(first), /^[0-9a-f]{64}$/);
});

test("A3 persistence context intentionally excludes identity and unnecessary Bac details", () => {
  const context = buildOrientationDiscoverySearchContext(plan());

  assert.equal(context.targetDegree, "Bachelor");
  assert.equal(context.engineeringSpecialty, "automotive");
  assert.equal("bacTrack" in context, false);
  assert.equal("averageOutOf20" in context, false);
  assert.equal("lastDiploma" in context, false);

  const serialized = JSON.stringify(context);
  for (const forbidden of [
    "email",
    "phone",
    "passport",
    "full_name",
    "first_name",
    "last_name",
    "postal_address",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
});

test("A3 programme dedupe keys ignore case and harmless whitespace", () => {
  const first = candidate();
  const second = candidate({
    institution: "  EXAMPLE university ",
    programme: " Automotive   Engineering ",
    degree: " bachelor ",
  });

  assert.equal(
    buildOrientationResearchProgrammeDedupeKey(first),
    buildOrientationResearchProgrammeDedupeKey(second),
  );
});

test("A3 reuses unknown degree but blocks a known degree mismatch", () => {
  assert.equal(orientationDegreeCompatible("Bachelor", null), true);
  assert.equal(orientationDegreeCompatible("Bachelor", "Bachelor of Science"), true);
  assert.equal(orientationDegreeCompatible("Bachelor", "Master"), false);
});

test("A3 merges cached and newly researched programmes without duplicates", () => {
  const cached = candidate({
    teachingLanguage: null,
    sourceUrls: ["https://example.edu/automotive"],
  });
  const researched = candidate({
    teachingLanguage: "German",
    sourceUrls: [
      "https://example.edu/automotive",
      "https://example.edu/admissions",
    ],
  });

  const merged = mergeOrientationKnowledgeCandidates([cached], [researched]);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].teachingLanguage, "German");
  assert.deepEqual(merged[0].sourceUrls, [
    "https://example.edu/automotive",
    "https://example.edu/admissions",
  ]);
});

test("A3 is cache-first and avoids OpenAI when the reusable pool is sufficient", () => {
  assert.match(knowledgeSource, /ORIENTATION_KNOWLEDGE_MIN_CANDIDATES = 8/);
  assert.match(knowledgeSource, /ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS = 30/);

  const loadIndex = serviceSource.indexOf("loadOrientationDiscoveryKnowledge");
  const hitIndex = serviceSource.indexOf("cachedCandidates.length >= ORIENTATION_KNOWLEDGE_MIN_CANDIDATES");
  const openAIIndex = serviceSource.indexOf("runOpenAIOrientationDiscovery");

  assert.ok(loadIndex >= 0);
  assert.ok(hitIndex > loadIndex);
  assert.ok(openAIIndex > hitIndex);
  assert.match(serviceSource, /provider: "knowledge_cache"/);
  assert.match(serviceSource, /provider: cachedCandidates.length > 0 \? "mixed" : "openai"/);
});

test("A3 persists every researched candidate into a reusable global knowledge pool", () => {
  assert.match(knowledgeSource, /orientation_research_programs/);
  assert.match(knowledgeSource, /\.upsert\(rows, \{ onConflict: "dedupe_key" \}\)/);
  assert.match(knowledgeSource, /orientation_discovery_runs/);
  assert.match(knowledgeSource, /orientation_discovery_run_candidates/);
  assert.match(knowledgeSource, /\.overlaps\("family_ids", families\)/);
  assert.match(knowledgeSource, /\.gte\("last_seen_at", freshnessCutoff\(\)\)/);
});

test("A3 keeps knowledge storage server-only", () => {
  assert.match(knowledgeSource, /import "server-only"/);
  assert.match(knowledgeSource, /createPrivilegedSupabaseClient/);
  assert.match(knowledgeSource, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(knowledgeSource, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);

  assert.match(typesSource, /"knowledge_cache"/);
  assert.match(typesSource, /"mixed"/);
});
