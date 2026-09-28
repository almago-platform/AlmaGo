import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const supervisor = readFileSync(".github/workflows/almago-instant-supervisor.yml", "utf8");
const codex = readFileSync(".github/workflows/almago-autonomous-codex.yml", "utf8");

test("instant supervisor uses Gemini structured output and no OpenAI API dependency", () => {
  assert.match(supervisor, /GEMINI_API_KEY:\s*\$\{\{ secrets\.GEMINI_API_KEY \}\}/);
  assert.match(supervisor, /GEMINI_MODEL:\s*gemini-3\.5-flash/);
  assert.match(supervisor, /generativelanguage\.googleapis\.com\/v1beta\/models\//);
  assert.match(supervisor, /x-goog-api-key/);
  assert.match(supervisor, /responseMimeType:\s*"application\/json"/);
  assert.match(supervisor, /responseSchema:\s*schema/);
  assert.doesNotMatch(supervisor, /responseFormat:\s*\{/);
  assert.doesNotMatch(supervisor, /additionalProperties:\s*false/);
  assert.match(supervisor, /application\/json/);
  assert.doesNotMatch(supervisor, /api\.openai\.com/);
  assert.doesNotMatch(supervisor, /OPENAI_API_KEY/);
});

test("autonomous recovery classifies Gemini supervisor quota and auth blockers", () => {
  assert.match(codex, /GEMINI_API_KEY is not configured/);
});
