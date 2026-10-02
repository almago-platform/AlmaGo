import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const provider = readFileSync(
  "src/lib/orientation-engine/discovery/openai.ts",
  "utf8",
);
const research = readFileSync(
  "src/lib/orientation-engine/discovery/research.ts",
  "utf8",
);
const types = readFileSync(
  "src/lib/orientation-engine/discovery/types.ts",
  "utf8",
);
const envExample = readFileSync(".env.example", "utf8");

test("A2 uses the current OpenAI Responses API with web search and strict structured output", () => {
  assert.match(provider, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(provider, /type: "web_search"/);
  assert.match(provider, /tool_choice: "required"/);
  assert.match(provider, /web_search_call\.action\.sources/);
  assert.match(provider, /type: "json_schema"/);
  assert.match(provider, /strict: true/);
  assert.match(provider, /DEFAULT_MODEL = "gpt-6-luna"/);
});

test("A2 is server-only, feature-gated and keeps the API key on the server", () => {
  assert.match(provider, /import "server-only"/);
  assert.match(provider, /ALMAGO_ORIENTATION_DISCOVERY_PROVIDER/);
  assert.match(provider, /OPENAI_API_KEY/);
  assert.match(provider, /ALMAGO_ORIENTATION_DISCOVERY_MODEL/);
  assert.doesNotMatch(provider, /NEXT_PUBLIC_OPENAI/);
  assert.match(envExample, /ALMAGO_ORIENTATION_DISCOVERY_PROVIDER/);
  assert.match(envExample, /OPENAI_API_KEY/);
});

test("A2 sends only the A1 discovery profile and programme families to OpenAI", () => {
  assert.match(provider, /student_profile: plan\.profile/);
  assert.match(provider, /programme_families: plan\.programmeFamilies/);

  for (const forbidden of [
    "email",
    "phone",
    "passport",
    "full_name",
    "first_name",
    "last_name",
    "postal_address",
  ]) {
    assert.doesNotMatch(provider, new RegExp(forbidden, "i"));
  }
});

test("A2 grounds candidate URLs in URLs actually returned by web search", () => {
  assert.match(provider, /sourceUrlsFromResponse/);
  assert.match(provider, /createGroundedOrientationResearchCandidate/);
  assert.match(research, /allowed\.has\(candidate\)/);
  assert.match(research, /allowed\.has\(url\)/);
  assert.match(research, /parsed\.protocol !== "https:"/);
});

test("A2 never promotes discovered programmes beyond research_candidate", () => {
  assert.match(types, /OrientationDiscoveryResearchCandidate/);
  assert.match(types, /status: "research_candidate"/);
  assert.doesNotMatch(provider, /status: "verified"/);
  assert.match(provider, /Do not decide admission eligibility/);
  assert.match(provider, /A candidate is only a research lead/);
});

test("A2 is bounded, deduplicated, timed and instrumented for cost", () => {
  assert.match(provider, /DISCOVERY_MAX_SEARCH_QUERIES/);
  assert.match(provider, /MAX_PROVIDER_REQUESTS = DISCOVERY_MAX_SEARCH_QUERIES \+ 1/);
  assert.match(provider, /QUERY_TIMEOUT_MS = 12_000/);
  assert.match(provider, /dedupeOrientationResearchCandidates/);
  assert.match(types, /webSearchCalls: number/);
  assert.match(types, /inputTokens: number/);
  assert.match(types, /outputTokens: number/);
  assert.match(types, /totalTokens: number/);
  assert.match(types, /durationMs: number/);
});

test("A2 is not public or wired directly into the student UI before verification", () => {
  assert.doesNotMatch(provider, /NextResponse|export async function POST/);
  assert.doesNotMatch(provider, /OrientationLetterCard|PersonalizedOrientationEngineCard/);
});

test("A2 safely handles disabled, inapplicable and missing-credential states", () => {
  assert.match(types, /"disabled"/);
  assert.match(types, /"not_applicable"/);
  assert.match(types, /"unavailable"/);
  assert.match(types, /"missing_credentials"/);
  assert.match(provider, /plan\.status !== "ready"/);
  assert.match(provider, /reason: "feature_disabled"/);
  assert.match(provider, /reason: "missing_credentials"/);
});
