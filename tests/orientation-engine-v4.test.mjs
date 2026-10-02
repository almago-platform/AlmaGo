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

test("Orientation V4 reads only verified active programme catalogue data server-side", () => {
  assert.match(catalog, /import "server-only"/);
  assert.match(catalog, /createPrivilegedSupabaseClient/);
  assert.match(catalog, /from\("programs"\)/);
  assert.match(catalog, /universities!inner/);
  assert.match(catalog, /\.eq\("is_active", true\)/);
  assert.match(catalog, /\.eq\("universities\.is_active", true\)/);
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

test("Orientation V4 UI explains why, missing conditions, sources and information quality", () => {
  assert.match(ui, /Pourquoi cette option apparaît/);
  assert.match(ui, /À vérifier ou compléter/);
  assert.match(ui, /Sources/);
  assert.match(ui, /Qualité des informations/);
  assert.match(ui, /catalogueGap/);
  assert.match(ui, /Nous n’inventons pas de programme/);
});

test("Orientation V4 is integrated into the existing result rather than replacing V3.6", () => {
  assert.match(form, /PersonalizedOrientationEngineCard/);
  assert.match(form, /OrientationRouteCard/);
  assert.match(form, /OrientationOnePagePrintReport/);
});

test("Orientation V4 audit documents privacy, cost and incremental conversation architecture", () => {
  assert.match(docs, /Privacy \/ GDPR strategy/);
  assert.match(docs, /Cost strategy/);
  assert.match(docs, /Increment C — conversation/);
  assert.match(docs, /LLM runtime legal\/privacy review remains a launch gate/);
});
