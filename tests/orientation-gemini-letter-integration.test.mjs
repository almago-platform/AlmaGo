import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const letter = read("src/lib/orientation-engine/letter/gemini.ts");
const intelligence = read("src/lib/orientation-engine/intelligence.ts");
const route = read("src/app/api/orientation/engine/route.ts");
const render = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");

test("Gemini letter writer is independent from the older university scout", () => {
  assert.match(intelligence, /import \{ writeOrientationLetterWithGemini \}/);
  assert.match(intelligence, /async function buildLegacyOrientationIntelligence/);
  assert.match(intelligence, /export async function buildOrientationIntelligence/);
  assert.match(intelligence, /await buildLegacyOrientationIntelligence/);
  assert.match(intelligence, /await writeOrientationLetterWithGemini\(locale, result\.letter\)/);
  assert.match(intelligence, /result\.letter\.mode !== "deterministic"/);
  assert.match(intelligence, /options\.generateLetter === false/);
  assert.match(intelligence, /return \{ \.\.\.result, letter \}/);
  assert.match(intelligence, /function deterministicLetter/);
});

test("route writes the fallback letter only when the verified personalized content is not displayed", () => {
  assert.match(route, /buildOrientationCanonicalShortlist/);
  assert.match(route, /generateLetter: shortlist\.source !== "personalized_verified"/);
  assert.match(route, /letter: intelligence\.letter/);
  assert.match(render, /<OrientationLetterCard/);
  assert.match(render, /letter=\{result\.letter\}/);
  assert.match(render, /<OrientationPersonalizedWriterCard/);
});

test("Gemini letter uses the configured writer model, structured content, and source facts only", () => {
  assert.match(letter, /ALMAGO_ORIENTATION_WRITER_PROVIDER !== "gemini"/);
  assert.match(letter, /ALMAGO_ORIENTATION_WRITER_MODEL/);
  assert.match(letter, /GEMINI_API_KEY/);
  assert.match(letter, /gemini-3\.8-flash/);
  assert.match(letter, /v1beta\/models\/\$\{encodeURIComponent\(model\)\}:generateContent/);
  assert.match(letter, /responseMimeType: "application\/json"/);
  assert.match(letter, /responseJsonSchema/);
  assert.match(letter, /reference_paragraphs: baseline\.paragraphs/);
  assert.match(letter, /reference_closing: baseline\.closing/);
  assert.doesNotMatch(letter, /\bidentity\.email\b|\bidentity\.firstName\b/);
  assert.match(letter, /Never invent university admission/);
  assert.match(letter, /Keep all cautions, limitations/);
});

test("unsupported Gemini output falls back to the original verified letter", () => {
  assert.match(letter, /mode !== "deterministic"/);
  assert.match(letter, /draft\.paragraphs\.length !== baseline\.paragraphs\.length/);
  assert.match(letter, /referenceNumbers/);
  assert.match(letter, /outputNumbers\.some/);
  assert.match(letter, /provider: "gemini-letter-v1"/);
  assert.match(letter, /return baseline;/);
  assert.match(letter, /AbortSignal\.timeout\(REQUEST_TIMEOUT_MS\)/);
  assert.match(letter, /REQUEST_TIMEOUT_MS = 15_000/);
  assert.match(letter, /MAX_CACHE_ENTRIES = 100/);
  assert.match(letter, /inFlight\.get\(key\)/);
  assert.match(letter, /console\.info\("orientation_gemini_letter"/);
  assert.doesNotMatch(letter, /console\.(log|error)\([^\n]*apiKey/);
});
