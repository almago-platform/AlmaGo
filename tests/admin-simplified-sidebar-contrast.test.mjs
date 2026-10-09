import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin groups never emit an unnamed native details disclosure", () => {
  assert.match(shell, /group\.secondary \? \(/);
  assert.match(shell, /<summary className="mb-1\.5 cursor-pointer[^"]*text-white\/80/);
  assert.match(shell, /\{group\.label\}\s*<\/summary>/);
  assert.match(shell, /focus-visible:outline-2/);
  for (const label of ["Mon bureau", "Personnes et dossiers", "À traiter", "Services et paiements", "Catalogue Allemagne", "Administration avancée"]) {
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
