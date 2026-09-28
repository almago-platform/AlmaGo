import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const supervisor = readFileSync(".github/workflows/almago-instant-supervisor.yml", "utf8");
const codex = readFileSync(".github/workflows/almago-autonomous-codex.yml", "utf8");

test("instant supervisor uses the Gemini Interactions API with structured JSON output", () => {
  assert.match(supervisor, /GEMINI_API_KEY:\s*\$\{\{ secrets\.GEMINI_API_KEY \}\}/);
  assert.match(supervisor, /GEMINI_MODEL:\s*gemini-3\.5-flash/);
  assert.match(supervisor, /generativelanguage\.googleapis\.com\/v1beta\/interactions/);
  assert.match(supervisor, /x-goog-api-key/);
  assert.match(supervisor, /system_instruction:\s*instructions/);
  assert.match(supervisor, /response_format:\s*\{/);
  assert.match(supervisor, /type:\s*"text"/);
  assert.match(supervisor, /mime_type:\s*"application\/json"/);
  assert.match(supervisor, /schema,/);
  assert.match(supervisor, /step\?\.type === "model_output"/);
  assert.doesNotMatch(supervisor, /:generateContent/);
  assert.doesNotMatch(supervisor, /responseMimeType/);
  assert.doesNotMatch(supervisor, /responseSchema/);
  assert.doesNotMatch(supervisor, /additionalProperties:\s*false/);
  assert.doesNotMatch(supervisor, /api\.openai\.com/);
  assert.doesNotMatch(supervisor, /OPENAI_API_KEY/);
});

test("autonomous recovery classifies Gemini supervisor quota and auth blockers", () => {
  assert.match(codex, /GEMINI_API_KEY is not configured/);
});
