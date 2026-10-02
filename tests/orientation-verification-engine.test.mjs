import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationProgrammeVerification,
  buildOrientationVerificationFallback,
  classifyOrientationVerificationSource,
  createOrientationVerifiedFact,
  ORIENTATION_VERIFICATION_MAX_CANDIDATES,
  selectOrientationCandidatesForVerification,
} = await import("../src/lib/orientation-engine/verification/core.ts");

const openAISource = readFileSync(
  "src/lib/orientation-engine/verification/openai.ts",
  "utf8",
);
const storeSource = readFileSync(
  "src/lib/orientation-engine/verification/store.ts",
  "utf8",
);
const serviceSource = readFileSync(
  "src/lib/orientation-engine/verification/service.ts",
  "utf8",
);
const migrationSource = readFileSync(
  "supabase/migrations/20261002202819_orientation_programme_verification_engine.sql",
  "utf8",
);

function candidate(overrides = {}) {
  return {
    institution: "Example Universität",
    programme: "Automotive Engineering",
    degree: "Bachelor",
    city: "Aachen",
    teachingLanguage: "German",
    officialProgrammeUrl: "https://www.example-university.de/study/automotive",
    officialUniversityUrl: "https://www.example-university.de",
    discoveryReason: "Relevant programme family.",
    sourceUrls: [
      "https://www.example-university.de/study/automotive",
      "https://www.daad.de/example",
    ],
    status: "research_candidate",
    ...overrides,
  };
}

test("B classifies primary university sources separately from registries and discovery-only pages", () => {
  const item = candidate();

  assert.equal(
    classifyOrientationVerificationSource(
      item,
      "https://www.example-university.de/study/automotive",
    ),
    "official_programme",
  );
  assert.equal(
    classifyOrientationVerificationSource(
      item,
      "https://www.example-university.de/admissions/deadlines",
    ),
    "official_university",
  );
  assert.equal(
    classifyOrientationVerificationSource(
      item,
      "https://www.daad.de/en/studying-in-germany/example",
    ),
    "official_registry",
  );
  assert.equal(
    classifyOrientationVerificationSource(
      item,
      "https://some-blog.example/programme",
    ),
    "discovery_only",
  );
});

test("B verifies a fact only when the evidence URL was actually seen and is on the official university domain", () => {
  const item = candidate();
  const verifiedAt = "2026-10-02T20:30:00.000Z";

  const verified = createOrientationVerifiedFact({
    candidate: item,
    field: "teaching_language",
    evidence: {
      value: "German",
      sourceUrl: "https://www.example-university.de/study/automotive",
    },
    webSourceUrls: [
      "https://www.example-university.de/study/automotive",
    ],
    verifiedAt,
  });

  assert.equal(verified.status, "verified");
  assert.equal(verified.value, "German");
  assert.equal(verified.sourceKind, "official_programme");
  assert.equal(verified.verifiedAt, verifiedAt);

  const ungrounded = createOrientationVerifiedFact({
    candidate: item,
    field: "winter_deadline",
    evidence: {
      value: "15 July",
      sourceUrl: "https://www.example-university.de/invented-page",
    },
    webSourceUrls: [
      "https://www.example-university.de/study/automotive",
    ],
    verifiedAt,
  });

  assert.equal(ungrounded.status, "unknown");
  assert.equal(ungrounded.value, null);
  assert.equal(ungrounded.sourceUrl, null);
});

test("B keeps official registries as needs_review instead of upgrading them to primary verification", () => {
  const item = candidate();
  const fact = createOrientationVerifiedFact({
    candidate: item,
    field: "application_route",
    evidence: {
      value: "uni_assist",
      sourceUrl: "https://www.uni-assist.de/tools/check-university/example",
    },
    webSourceUrls: [
      "https://www.uni-assist.de/tools/check-university/example",
    ],
    verifiedAt: "2026-10-02T20:30:00.000Z",
  });

  assert.equal(fact.status, "needs_review");
  assert.equal(fact.sourceKind, "official_registry");
  assert.equal(fact.verifiedAt, null);
});

test("B programme status can verify the programme core without pretending every admissions fact is known", () => {
  const item = candidate();
  const official = "https://www.example-university.de/study/automotive";
  const verification = buildOrientationProgrammeVerification({
    candidate: item,
    evidence: {
      programmeExists: { value: true, sourceUrl: official },
      degreeLevel: { value: "Bachelor", sourceUrl: official },
      city: { value: "Aachen", sourceUrl: official },
      teachingLanguage: { value: "German", sourceUrl: official },
      germanLanguageRequirement: { value: null, sourceUrl: null },
      englishLanguageRequirement: { value: null, sourceUrl: null },
      acceptedLanguageCertificates: { value: [], sourceUrl: null },
      intakeTerms: { value: ["Winter semester"], sourceUrl: official },
      winterDeadline: { value: null, sourceUrl: null },
      summerDeadline: { value: null, sourceUrl: null },
      applicationRoute: { value: null, sourceUrl: null },
      applicationUrl: { value: null, sourceUrl: null },
      studienkollegRequirement: { value: null, sourceUrl: null },
      tuitionOrSemesterFees: { value: null, sourceUrl: null },
    },
    webSourceUrls: [official],
    verifiedAt: "2026-10-02T20:30:00.000Z",
  });

  assert.equal(verification.overallStatus, "verified");
  assert.equal(
    verification.facts.find((fact) => fact.field === "winter_deadline")?.status,
    "unknown",
  );
  assert.equal(
    verification.facts.find((fact) => fact.field === "intake_terms")?.status,
    "verified",
  );
});

test("B deterministic fallback never marks discovery facts as verified", () => {
  const fallback = buildOrientationVerificationFallback(candidate());

  assert.equal(fallback.overallStatus, "needs_review");
  assert.equal(
    fallback.facts.some((fact) => fact.status === "verified"),
    false,
  );
  assert.equal(
    fallback.facts.find((fact) => fact.field === "programme_exists")?.status,
    "unknown",
  );
});

test("B bounds verification cost and prioritizes candidates with official programme sources", () => {
  assert.equal(ORIENTATION_VERIFICATION_MAX_CANDIDATES, 8);

  const weak = Array.from({ length: 8 }, (_, index) =>
    candidate({
      institution: `Weak ${index}`,
      programme: `Programme ${index}`,
      officialProgrammeUrl: null,
      officialUniversityUrl: null,
      sourceUrls: [],
    })
  );
  const strong = candidate({
    institution: "Strong University",
    programme: "Strong Programme",
  });

  const selected = selectOrientationCandidatesForVerification(
    [...weak, strong],
  );

  assert.equal(selected.length, 8);
  assert.equal(selected[0].institution, "Strong University");
});

test("B OpenAI verifier is server-only, bounded, structured, and does not decide admission eligibility", () => {
  assert.match(openAISource, /import "server-only"/);
  assert.match(openAISource, /ALMAGO_ORIENTATION_VERIFICATION_PROVIDER/);
  assert.match(openAISource, /OPENAI_API_KEY/);
  assert.match(openAISource, /type: "web_search"/);
  assert.match(openAISource, /max_tool_calls: 1/);
  assert.match(openAISource, /type: "json_schema"/);
  assert.match(openAISource, /strict: true/);
  assert.match(openAISource, /Never decide student admission eligibility or diploma recognition/);
  assert.match(openAISource, /Do not claim that the whole programme is verified/);
  assert.doesNotMatch(
    openAISource,
    /student_name|student_email|email_address|phone_number|passport_number/i,
  );
});

test("B persists verification separately and never auto-promotes into orientation_program_catalog", () => {
  assert.match(storeSource, /import "server-only"/);
  assert.match(storeSource, /createPrivilegedSupabaseClient/);
  assert.match(storeSource, /orientation_verification_runs/);
  assert.match(storeSource, /orientation_programme_verifications/);
  assert.match(storeSource, /verification_status/);
  assert.doesNotMatch(storeSource, /orientation_program_catalog/);
  assert.doesNotMatch(serviceSource, /orientation_program_catalog/);
});

test("B database verification history is service-role-only", () => {
  assert.match(
    migrationSource,
    /alter table public\.orientation_verification_runs enable row level security/,
  );
  assert.match(
    migrationSource,
    /alter table public\.orientation_programme_verifications enable row level security/,
  );
  assert.match(
    migrationSource,
    /revoke all on table public\.orientation_verification_runs\s+from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /revoke all on table public\.orientation_programme_verifications\s+from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /on table public\.orientation_verification_runs to service_role/,
  );
  assert.match(
    migrationSource,
    /on table public\.orientation_programme_verifications to service_role/,
  );
});

test("B stores field-level JSON facts but does not expose student identity fields", () => {
  assert.match(migrationSource, /facts jsonb not null/);
  assert.match(migrationSource, /jsonb_typeof\(facts\) = 'array'/);
  assert.doesNotMatch(
    migrationSource,
    /student_name|student_email|phone|passport|profile_id/i,
  );
});
