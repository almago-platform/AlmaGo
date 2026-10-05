import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const orientation = read("src/components/orientation/PublicOrientationForm.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const copy = read("src/content/orientation-prospect-copy.ts");

test("orientation V2 presents a result-first hierarchy", () => {
  assert.match(orientation, /CandidateOrientationResultHeader/);
  assert.match(orientation, /const resultFacts = [/);
  assert.doesNotMatch(
    orientation,
    /isBachelorFirstContact ? (s*<details className="orientation-print-hide mt-5/,
  );
});

test("account creation is described as Prospect access, not Student access", () => {
  assert.match(copy, /Créer mon espace Prospect gratuit/);
  assert.match(copy, /Student access is not active yet/);
  assert.match(copy, /Kostenlosen Prospect-Bereich erstellen/);
  assert.match(copy, /مساحة Prospect/);
  assert.doesNotMatch(copy, /Créez votre espace étudiant gratuit/);
  assert.doesNotMatch(copy, /Create your free student space/);
  assert.doesNotMatch(copy, /kostenlosen Studierendenbereich/);
});

test("Prospect continuation explains the Student activation boundary", () => {
  assert.match(copy, /proposition, au paiement et à la validation Campus/);
  assert.match(capture, /copy.continueBoundary/);
  assert.match(capture, /warning-border/);
});
