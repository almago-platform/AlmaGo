import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const types = readFileSync("src/lib/orientation-engine/types.ts", "utf8");
const rules = readFileSync("src/lib/orientation-engine/rules.ts", "utf8");
const service = readFileSync("src/lib/orientation-engine/service.ts", "utf8");
const catalog = readFileSync("src/lib/orientation-engine/catalog.ts", "utf8");
const provider = readFileSync("src/lib/orientation-engine/advisor/provider.ts", "utf8");
const deterministic = readFileSync("src/lib/orientation-engine/advisor/deterministic.ts", "utf8");
const api = readFileSync("src/app/api/orientation/engine/route.ts", "utf8");
const ui = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
const letterUi = readFileSync("src/components/orientation/OrientationLetterCard.tsx", "utf8");
const intelligence = readFileSync("src/lib/orientation-engine/intelligence.ts", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const validation = readFileSync("src/lib/orientation/validate.ts", "utf8");
const prospectApi = readFileSync("src/app/api/orientation/prospect/route.ts", "utf8");
const accountApi = readFileSync("src/app/api/prospect/orientation/route.ts", "utf8");
const docs = readFileSync("docs/orientation-engine-v4.md", "utf8");

test("Orientation V4 defines explicit non-binary eligibility states", () => {
  for (const status of [
    "eligible",
    "likely_eligible",
    "conditional",
    "missing_information",
    "not_eligible",
    "unknown",
  ]) {
    assert.match(types, new RegExp(`"${status}"`));
  }
  assert.match(docs, /Unknown is never converted to eligible/);
});

test("Orientation V4 keeps admission rules deterministic and source-aware", () => {
  assert.match(rules, /getAcademicAccessConclusion/);
  assert.match(rules, /academic_access_supported/);
  assert.match(rules, /academic_access_review/);
  assert.match(rules, /source_verified/);
  assert.match(types, /verifiedAt: string \| null/);
  assert.match(types, /OrientationInformationConfidence/);
  assert.doesNotMatch(rules, /GEMINI_API_KEY|GROQ_API_KEY|OPENAI_API_KEY/);
});

test("Orientation V4 uses transparent ranking without presenting an admission probability", () => {
  assert.match(rules, /score \+= 40/);
  assert.match(rules, /score \+= 30/);
  assert.match(rules, /score \+= 15/);
  assert.match(rules, /score \+= 10/);
  assert.match(rules, /score \+= 5/);
  assert.match(docs, /not displayed as an admission chance/);
  assert.doesNotMatch(ui, /relevanceScore/);
});

test("Orientation V4 excludes deterministic non-matches before selecting up to three options", () => {
  assert.match(rules, /evaluation\.status !== "not_eligible"/);
  assert.match(service, /evaluations\.slice\(0, 3\)/);
  assert.match(service, /generatedFrom: "verified_catalogue"/);
});

test("Orientation V4 reads the bounded public catalogue projection server-side", () => {
  assert.match(catalog, /import "server-only"/);
  assert.match(catalog, /createPublicCatalogSupabaseClient/);
  assert.match(catalog, /from\("orientation_program_catalog"\)/);
  assert.doesNotMatch(catalog, /createPrivilegedSupabaseClient|SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(catalog, /from\("programs"\)|from\("universities"\)/);
});

test("Orientation V4 API accepts only validated orientation answers and no identity payload", () => {
  assert.match(api, /validatePublicOrientationAnswers/);
  assert.match(api, /MAX_BODY_BYTES = 24_000/);
  assert.match(api, /Cache-Control/);
  assert.doesNotMatch(api, /email|phone|passport|full_name|first_name|last_name/);
});

test("Orientation answer validation is shared instead of duplicated across public and account APIs", () => {
  assert.match(validation, /export function validatePublicOrientationAnswers/);
  assert.match(prospectApi, /validatePublicOrientationAnswers/);
  assert.match(accountApi, /validatePublicOrientationAnswers/);
  assert.doesNotMatch(prospectApi, /const allowed = \{/);
  assert.doesNotMatch(accountApi, /const allowed = \{/);
});

test("Orientation V4 advisor is provider-abstracted and defaults to zero-cost deterministic mode", () => {
  assert.match(provider, /interface OrientationAdvisorProvider/);
  assert.match(deterministic, /DeterministicOrientationAdvisor/);
  assert.match(deterministic, /mode: "deterministic"/);
  assert.match(deterministic, /createOrientationAdvisor/);
  assert.doesNotMatch(deterministic, /fetch\(|GEMINI_API_KEY|GROQ_API_KEY|OPENAI_API_KEY/);
  assert.match(docs, /costs zero LLM tokens/);
});

test("Orientation V4 makes the simple letter primary and keeps technical evidence available", () => {
  assert.match(ui, /OrientationLetterCard/);
  assert.match(ui, /Votre orientation personnalisée/);
  assert.match(ui, /Voir les détails vérifiés/);
  assert.match(ui, /Pourquoi cette option apparaît/);
  assert.match(ui, /À vérifier ou compléter/);
  assert.match(ui, /Sources/);
  assert.match(ui, /Qualité des informations/);
  assert.doesNotMatch(ui, /Notre catalogue vérifié ne contient pas encore trois options/);
  assert.match(letterUi, /Lettre d’orientation/);
  assert.match(letterUi, /Premières pistes à examiner ensemble/);
});

test("Orientation V4 makes Bachelor first contact letter-first while retaining legacy paths elsewhere", () => {
  assert.match(form, /PersonalizedOrientationEngineCard/);
  assert.match(form, /isBachelorFirstContact = answers\.targetDegree === "Bachelor"/);
  assert.match(form, /Voir les réponses utilisées/);
  assert.match(form, /OrientationRouteCard/);
  assert.match(form, /OrientationOnePagePrintReport/);
  assert.match(ui, /isBachelorFirstContact/);
  assert.match(ui, /!isBachelorFirstContact && onRefineAnswers/);
  assert.match(letterUi, /recommendations: OrientationProgrammeEvaluation\[\]/);
  assert.match(letterUi, /Premières pistes à examiner ensemble/);
});

test("Orientation V4 audit documents privacy, cost and incremental conversation architecture", () => {
  assert.match(docs, /Privacy \/ GDPR strategy/);
  assert.match(docs, /Cost strategy/);
  assert.match(docs, /Increment C — conversation/);
  assert.match(docs, /LLM runtime legal\/privacy review remains a launch gate/);
});


test("Orientation V4 AI scout is optional, Bachelor-only and grounded", () => {
  assert.match(intelligence, /ALMAGO_ORIENTATION_AI_SCOUT !== "gemini"/);
  assert.match(intelligence, /profile\.targetDegree !== "Bachelor"/);
  assert.match(intelligence, /GEMINI_API_KEY/);
  assert.match(intelligence, /tools: \[\{ type: "google_search" \}\]/);
  assert.match(intelligence, /verificationStatus: "research_candidate"/);
  assert.match(intelligence, /sameCitationHost/);
  assert.match(intelligence, /Do not promise that admission exists/);
  assert.doesNotMatch(rules, /GEMINI_API_KEY|google_search|generativelanguage/);
});

test("Orientation V4 minimises the profile before any AI provider call", () => {
  assert.match(intelligence, /const profileFacts = \{/);
  assert.doesNotMatch(intelligence, /email|phone|passport|full_name|first_name|last_name/);
  assert.match(intelligence, /bac_track/);
  assert.match(intelligence, /generalAverage|average_out_of_20/);
  assert.match(intelligence, /german_level/);
  assert.match(intelligence, /preferred_cities/);
});

test("Orientation V4 never reports an outside-city warning when the student chose no city", () => {
  assert.match(rules, /if \(profile\.preferredCities\.length > 0\)/);
  assert.doesNotMatch(rules, /preferredCities\.length === 0[\s\S]*other_city/);
});

test("Orientation V4 never exposes raw engineering specialty keys in the deterministic letter", () => {
  assert.match(intelligence, /specialtyLabels/);
  assert.match(intelligence, /computer_engineering: "Informatique \/ Computer Engineering"/);
  assert.match(intelligence, /academicOpening/);
  assert.doesNotMatch(intelligence, /\$\{profile\.engineeringSpecialty\}/);
});