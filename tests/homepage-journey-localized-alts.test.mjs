import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const journey = read("src/components/public/HomeJourneySection.tsx");
const copy = read("src/content/native-copy.ts");

test("journey images use locale-owned alternative text instead of hard-coded English", () => {
  assert.match(journey, /alt=\{journey\.imageAlts\[index\]\}/);
  assert.doesNotMatch(
    journey,
    /Students reviewing documents outside a university building|Documents and a pen on a desk/,
  );
});

test("journey image descriptions exist in all four supported languages", () => {
  assert.match(copy, /Des étudiants consultent des documents devant un bâtiment universitaire\./);
  assert.match(copy, /طلاب يراجعون مستندات أمام مبنى جامعي\./);
  assert.match(copy, /Students reviewing documents outside a university building\./);
  assert.match(copy, /Studierende prüfen Unterlagen vor einem Hochschulgebäude\./);
});

test("each journey locale owns six image descriptions for the six journey steps", () => {
  const blocks = [...copy.matchAll(/journey:\s*\{[\s\S]*?imageAlts:\s*\[([\s\S]*?)\],[\s\S]*?steps:/g)];
  assert.equal(blocks.length, 4);

  for (const [, imageAlts] of blocks) {
    const descriptions = [...imageAlts.matchAll(/^\s*"[^"]+",?$/gm)];
    assert.equal(descriptions.length, 6);
  }
});
