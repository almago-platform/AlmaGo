import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationDiscoveryProfileFingerprint,
  buildOrientationDiscoverySearchContext,
  buildOrientationResearchProgrammeDedupeKey,
  buildOrientationResearchUniversityDedupeKey,
  getOrientationDiscoveryRefreshWindow,
  mergeOrientationKnowledgeCandidates,
  orientationDegreeCompatible,
  orientationKnowledgeCoverageSufficient,
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
const migrationSource = readFileSync(
  "supabase/migrations/20261002194920_orientation_discovery_knowledge_cache.sql",
  "utf8",
);
const semesterMigrationSource = readFileSync(
  "supabase/migrations/20261002200738_orientation_discovery_semester_refresh_calendar.sql",
  "utf8",
);
const cataloguePromotionMigrationSource = readFileSync(
  "supabase/migrations/20261005104037_orientation_auto_publish_discovery_catalogue.sql",
  "utf8",
);

function plan(overrides = {}) {
  const { profile: profileOverrides = {}, ...restOverrides } = overrides;
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
      ...profileOverrides,
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
    ...restOverrides,
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


test("A3 semester refresh calendar rolls exactly on 15 April and 15 October", () => {
  assert.deepEqual(
    getOrientationDiscoveryRefreshWindow(new Date("2026-04-14T23:59:59.999Z")),
    {
      cycle: "winter_2025",
      lastMajorRefreshAt: "2025-10-15T00:00:00.000Z",
      nextMajorRefreshAt: "2026-04-15T00:00:00.000Z",
    },
  );

  assert.deepEqual(
    getOrientationDiscoveryRefreshWindow(new Date("2026-04-15T00:00:00.000Z")),
    {
      cycle: "summer_2026",
      lastMajorRefreshAt: "2026-04-15T00:00:00.000Z",
      nextMajorRefreshAt: "2026-10-15T00:00:00.000Z",
    },
  );

  assert.deepEqual(
    getOrientationDiscoveryRefreshWindow(new Date("2026-10-14T23:59:59.999Z")),
    {
      cycle: "summer_2026",
      lastMajorRefreshAt: "2026-04-15T00:00:00.000Z",
      nextMajorRefreshAt: "2026-10-15T00:00:00.000Z",
    },
  );

  assert.deepEqual(
    getOrientationDiscoveryRefreshWindow(new Date("2026-10-15T00:00:00.000Z")),
    {
      cycle: "winter_2026",
      lastMajorRefreshAt: "2026-10-15T00:00:00.000Z",
      nextMajorRefreshAt: "2027-04-15T00:00:00.000Z",
    },
  );
});

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

test("A3 university identity falls back to the official programme host and collapses institution aliases", () => {
  const shortName = candidate({
    institution: "FH Aachen",
    programme: "Electrical Engineering",
    degree: "Bachelor of Engineering (B.Eng.)",
    city: "Aachen",
    officialUniversityUrl: null,
    officialProgrammeUrl:
      "https://www.fh-aachen.de/en/studies/degree-programmes/electrical-engineering-beng",
  });
  const longName = candidate({
    institution: "FH Aachen – University of Applied Sciences",
    programme: "Electrical Engineering",
    degree: "Bachelor of Engineering (B.Eng.)",
    city: "Aachen",
    officialUniversityUrl: null,
    officialProgrammeUrl:
      "https://www.fh-aachen.de/en/studies/degree-programmes/electrical-engineering-beng",
  });

  assert.equal(
    buildOrientationResearchUniversityDedupeKey(shortName),
    "host:fh-aachen.de",
  );
  assert.equal(
    buildOrientationResearchUniversityDedupeKey(shortName),
    buildOrientationResearchUniversityDedupeKey(longName),
  );
  assert.equal(
    buildOrientationResearchProgrammeDedupeKey(shortName),
    buildOrientationResearchProgrammeDedupeKey(longName),
  );
});

test("A3 German faculty subdomains collapse to the canonical university host", () => {
  const programmePage = candidate({
    institution: "RWTH Aachen University",
    city: "Aachen",
    officialUniversityUrl: null,
    officialProgrammeUrl:
      "https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/",
  });

  assert.equal(
    buildOrientationResearchUniversityDedupeKey(programmePage),
    "host:rwth-aachen.de",
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


test("A3 Master specialization cache must cover the requested specialization before reuse", () => {
  const masterPlan = plan({
    profile: {
      targetDegree: "Master",
      targetField: "Informatique",
      engineeringSpecialty: null,
      targetSpecialization: "Data Science and Artificial Intelligence",
      preferredCities: [],
    },
  });
  const generic = Array.from({ length: 4 }, (_, index) =>
    candidate({
      institution: `Generic University ${index}`,
      programme: index % 2 === 0 ? "Computer Science" : "Informatics",
      degree: "Master",
      city: "Berlin",
    })
  );
  const withSpecialization = [
    ...generic.slice(0, 3),
    candidate({
      institution: "Data University",
      programme: "Data Science",
      degree: "Master",
      city: "Berlin",
    }),
  ];

  assert.equal(
    orientationKnowledgeCoverageSufficient(masterPlan, generic, 4),
    false,
  );
  assert.equal(
    orientationKnowledgeCoverageSufficient(masterPlan, withSpecialization, 4),
    true,
  );
});

test("A3 only treats the cache as sufficient when explicit city preferences are covered", () => {
  const preferredPlan = plan({
    profile: {
      preferredCities: ["Munich"],
    },
  });
  const enoughButWrongCity = Array.from({ length: 8 }, (_, index) =>
    candidate({
      institution: `University ${index}`,
      programme: `Automotive ${index}`,
      city: "Aachen",
    })
  );
  const withMunich = [
    ...enoughButWrongCity.slice(0, 7),
    candidate({
      institution: "Munich University",
      programme: "Vehicle Engineering",
      city: "Munich",
    }),
  ];

  assert.equal(
    orientationKnowledgeCoverageSufficient(preferredPlan, enoughButWrongCity, 8),
    false,
  );
  assert.equal(
    orientationKnowledgeCoverageSufficient(preferredPlan, withMunich, 8),
    true,
  );
});

test("A3 is cache-first and avoids OpenAI when the reusable pool is sufficient", () => {
  assert.match(knowledgeSource, /ORIENTATION_KNOWLEDGE_MIN_CANDIDATES = 4/);
  assert.match(knowledgeSource, /ORIENTATION_MAJOR_REFRESH_DATES = \["04-15", "10-15"\]/);
  assert.doesNotMatch(knowledgeSource, /ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS|freshnessCutoff/);

  const loadIndex = serviceSource.indexOf("loadOrientationDiscoveryKnowledge");
  const hitIndex = serviceSource.indexOf("orientationKnowledgeCoverageSufficient");
  const openAIIndex = serviceSource.indexOf("runOpenAIOrientationDiscovery");

  assert.ok(loadIndex >= 0);
  assert.ok(hitIndex > loadIndex);
  assert.ok(openAIIndex > hitIndex);
  assert.match(serviceSource, /provider: "knowledge_cache"/);
  assert.match(serviceSource, /provider: cachedCandidates.length > 0 \? "mixed" : "openai"/);
  assert.match(serviceSource, /ORIENTATION_DISCOVERY_MAX_FRESH_QUERIES = 3/);
  assert.match(serviceSource, /ORIENTATION_DISCOVERY_MAX_PARTIAL_QUERIES = 2/);
  assert.match(serviceSource, /discoveryQueryBudget\(cachedCandidates\.length\)/);
});

test("A3 persists every researched candidate into a reusable global knowledge pool", () => {
  assert.match(knowledgeSource, /orientation_research_programs/);
  assert.match(knowledgeSource, /\.upsert\(rows, \{ onConflict: "dedupe_key" \}\)/);
  assert.match(knowledgeSource, /orientation_discovery_runs/);
  assert.match(knowledgeSource, /orientation_discovery_run_candidates/);
  assert.match(knowledgeSource, /\.overlaps\("family_ids", families\)/);
  assert.match(knowledgeSource, /\.gt\("next_major_refresh_at", new Date\(\)\.toISOString\(\)\)/);
  assert.match(knowledgeSource, /refresh_cycle: refreshWindow\.cycle/);
  assert.match(knowledgeSource, /next_major_refresh_at: refreshWindow\.nextMajorRefreshAt/);
});

test("A3 publishes newly discovered candidates into the reusable public catalogue", () => {
  const runIndex = knowledgeSource.indexOf("insertDiscoveryRun({");
  const publishIndex = knowledgeSource.indexOf(
    "publishOrientationDiscoveryCatalogue(supabase)",
    runIndex,
  );

  assert.ok(runIndex >= 0);
  assert.ok(publishIndex > runIndex);
  assert.match(
    knowledgeSource,
    /rpc\(\s*"publish_orientation_research_catalogue"/,
  );

  assert.match(
    cataloguePromotionMigrationSource,
    /'discovered_catalogue'/,
  );
  assert.match(
    cataloguePromotionMigrationSource,
    /'catalogue_provenance', 'openai_discovery'/,
  );
  assert.match(
    cataloguePromotionMigrationSource,
    /research_status = 'promoted'/,
  );
  assert.match(
    cataloguePromotionMigrationSource,
    /grant execute on function public\.publish_orientation_research_catalogue\(\)[\s\S]*to service_role/,
  );
  assert.doesNotMatch(
    cataloguePromotionMigrationSource,
    /grant execute on function public\.publish_orientation_research_catalogue\(\)[\s\S]*to anon/,
  );
  assert.match(
    cataloguePromotionMigrationSource,
    /u\.registry_status in \('verified_catalogue', 'discovered_catalogue'\)/,
  );
});

test("A3 keeps knowledge storage server-only", () => {
  assert.match(knowledgeSource, /import "server-only"/);
  assert.match(knowledgeSource, /createPrivilegedSupabaseClient/);
  assert.match(knowledgeSource, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(knowledgeSource, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);

  assert.match(typesSource, /"knowledge_cache"/);
  assert.match(typesSource, /"mixed"/);
});


test("A3 database cache is private by default and service-role only", () => {
  assert.match(migrationSource, /enable row level security/g);
  assert.match(
    migrationSource,
    /revoke all on table public\.orientation_research_programs from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /revoke all on table public\.orientation_discovery_runs from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /revoke all on table public\.orientation_discovery_run_candidates from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /grant select, insert, update, delete on table public\.orientation_research_programs to service_role/,
  );
  assert.doesNotMatch(migrationSource, /grant .* to anon/);
  assert.doesNotMatch(migrationSource, /grant .* to authenticated/);
});


test("A3 semester migration replaces rolling freshness with fixed refresh gates", () => {
  assert.match(
    semesterMigrationSource,
    /rename column fresh_until to next_major_refresh_at/,
  );
  assert.match(
    semesterMigrationSource,
    /make_timestamptz\(b\.y, 4, 15, 0, 0, 0, 'UTC'\)/,
  );
  assert.match(
    semesterMigrationSource,
    /make_timestamptz\(b\.y, 10, 15, 0, 0, 0, 'UTC'\)/,
  );
  assert.match(
    semesterMigrationSource,
    /refresh_cycle ~ '\^\(summer\|winter\)_\[0-9\]\{4\}\$'/,
  );
  assert.match(
    semesterMigrationSource,
    /orientation_research_programs_next_major_refresh_idx/,
  );
  assert.match(
    semesterMigrationSource,
    /orientation_discovery_runs_next_major_refresh_idx/,
  );
});

test("A3 no longer exposes rolling day freshness metadata", () => {
  assert.doesNotMatch(serviceSource, /freshnessDays|FRESHNESS_DAYS/);
  assert.match(serviceSource, /refreshCadence: "semester"/);
  assert.match(serviceSource, /majorRefreshDates: ORIENTATION_MAJOR_REFRESH_DATES/);
  assert.match(serviceSource, /nextMajorRefreshAt: refreshWindow\.nextMajorRefreshAt/);
  assert.match(typesSource, /majorRefreshDates: readonly \["04-15", "10-15"\]/);
});
