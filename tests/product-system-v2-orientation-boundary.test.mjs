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
const writer = read("src/components/orientation/OrientationPersonalizedWriterCard.tsx");

test("orientation V2 presents a result-first hierarchy", () => {
  assert.ok(orientation.includes("CandidateOrientationResultHeader"));
  assert.ok(orientation.includes("const resultFacts = ["));
  assert.ok(!orientation.includes('isBachelorFirstContact ? (\n                  <details className="orientation-print-hide mt-5'));
});

test("account creation is described as Prospect access, not Student access", () => {
  assert.ok(copy.includes("Créer mon espace Prospect gratuit"));
  assert.ok(copy.includes("Student access is not active yet"));
  assert.ok(copy.includes("Kostenlosen Prospect-Bereich erstellen"));
  assert.ok(copy.includes("مساحة Prospect"));
  assert.ok(!copy.includes("Créez votre espace étudiant gratuit"));
  assert.ok(!copy.includes("Create your free student space"));
  assert.ok(!copy.includes("kostenlosen Studierendenbereich"));
});

test("Prospect continuation explains the Student activation boundary", () => {
  assert.ok(copy.includes("proposition, au paiement et à la validation Campus"));
  assert.ok(capture.includes("copy.continueBoundary"));
  assert.ok(capture.includes("warning-border"));
});


test("orientation avoids admission-probability language", () => {
  assert.ok(!writer.includes("Fortes chances d’admission"));
  assert.ok(!writer.includes("Strong admission chances"));
  assert.ok(!writer.includes("Gute bis sehr gute Zulassungschancen"));
  assert.ok(writer.includes("Profil compatible avec les critères actuellement vérifiés"));
  assert.ok(writer.includes("Only the university can make an admission decision"));
});
