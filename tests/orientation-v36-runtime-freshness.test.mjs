import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/orientation/page.tsx", "utf8");
const config = readFileSync("next.config.ts", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const copy = readFileSync("src/content/orientation-copy.ts", "utf8");

test("V3.6 orientation route is explicitly dynamic and uncached", () => {
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /export const revalidate = 0/);
  assert.match(page, /noStore\(\)/);
  assert.match(config, /source: "\/orientation"/);
  assert.match(config, /source: "\/orientation\/:path\*"/);
  assert.match(config, /Cache-Control/);
  assert.match(config, /no-store, no-cache, must-revalidate/);
  assert.match(config, /Surrogate-Control/);
});

test("V3.6 production source contains the three academic starting points", () => {
  assert.match(form, /\["obtained", "preparing", "no_bac"\]/);
  assert.match(copy, /J’ai un Bac ou diplôme secondaire équivalent/);
  assert.match(copy, /Je prépare encore mon Bac/);
  assert.match(copy, /Je n’ai pas de Bac ni de diplôme secondaire équivalent/);
  assert.match(copy, /L’orientation fonctionne aussi si vous n’avez pas de Bac/);
});
