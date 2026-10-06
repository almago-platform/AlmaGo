import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const progress = readFileSync("src/components/prospect/ProspectJourneyProgress.tsx", "utf8");

test("V3.2.2 roadmap uses a connected premium timeline instead of the old boxed grid", () => {
  assert.doesNotMatch(progress, /sm:grid-cols-2 xl:grid-cols-5/);
  assert.match(progress, /overflow-x-auto/);
  assert.match(progress, /min-w-\[58rem\]/);
  assert.match(progress, /xl:min-w-0/);
  assert.match(progress, /leftLineClass/);
  assert.match(progress, /rightLineClass/);
});

test("journey timeline keeps semantic status colors restrained", () => {
  assert.match(progress, /bg-\[var\(--success\)\] text-white/);
  assert.match(progress, /bg-\[var\(--brand\)\] text-white/);
  assert.match(progress, /ring-\[var\(--warning-border\)\]/);
  assert.match(progress, /bg-\[var\(--warning-soft\)\]/);
  assert.doesNotMatch(progress, /#fff0f2|#fff8f8/);
});

test("journey timeline stays keyboard-accessible and responsive", () => {
  assert.match(progress, /role="region"/);
  assert.match(progress, /tabIndex=\{0\}/);
  assert.match(progress, /aria-current=\{state === "current" \? "step" : undefined\}/);
  assert.match(progress, /focus-visible:outline/);
  assert.match(progress, /min-w-\[6\.4rem\]/);
});

test("journey timeline preserves the full roadmap vocabulary", () => {
  for (const label of [
    "Orientation",
    "Documents",
    "Analyse Campus",
    "Proposition",
    "Paiement",
    "Procédure",
    "Candidatures",
    "Admission",
    "Visa & départ",
  ]) {
    assert.match(progress, new RegExp(label.replace("&", "\\&")));
  }
});
