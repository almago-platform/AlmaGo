import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin groups never emit an unnamed native details disclosure", () => {
  assert.match(shell, /group\.secondary \? \(/);
  assert.match(shell, /<summary className="mb-1\.5 cursor-pointer[^"]*text-white\/80/);
  assert.match(shell, /\{group\.label\}\s*<\/summary>/);
  assert.doesNotMatch(shell, /<p className="mb-1\.5 px-3 text-\[9px\][^"]*">\{group\.label\}<\/p>/);
  assert.match(shell, /focus-visible:outline-2/);
  for (const label of ["Votre quotidien", "Personnes", "Files de travail", "Commercial", "Catalogue Allemagne", "Équipe"]) {
    assert.ok(shell.includes('label: "' + label + '"'), "Missing group " + label);
  }
});

test("dashboard keeps actionable priority and shortens above-fold presentation", () => {
  assert.match(dashboard, /À traiter maintenant/);
  assert.match(dashboard, /Mes prochaines actions/);
  assert.match(dashboard, /aria-label="Accès rapides"/);
  assert.match(dashboard, /<details className="self-start rounded-\[var\(--radius-panel\)\]/);
  assert.match(dashboard, /Ordre de traitement · afficher les 3 priorités/);
  assert.match(dashboard, /<\/details>/);
  assert.match(dashboard, /number: missingNextActionCases/);
  assert.match(dashboard, /number: intakeAttention/);
});
