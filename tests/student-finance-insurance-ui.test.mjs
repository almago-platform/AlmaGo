import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("student finance and insurance catalogue is backed by the verified factual table", () => {
  assert.match(page, /from\("finance_insurance_catalog"\)/);
  assert.match(page, /isPublishableFinanceInsuranceOption\(option, now\)/);
  assert.match(page, /official_source_url/);
  assert.match(page, /verified_at/);
});

test("all three factual catalogue categories are visible", () => {
  for (const label of ["Compte bloqué", "Assurance santé", "Financement étudiant"]) {
    assert.match(page, new RegExp(label));
  }
});

test("student catalogue does not rank providers or claim visa eligibility", () => {
  assert.match(page, /ne classe pas les fournisseurs/);
  assert.match(page, /ne déduit ni votre éligibilité ni une exigence de visa/);
  assert.doesNotMatch(page, /meilleur fournisseur|recommandé pour vous|visa garanti|éligible au visa|score fournisseur/i);
});

test("unknown price and conditions stay explicit instead of estimated", () => {
  assert.match(page, /À confirmer sur la source officielle/);
  assert.match(page, /À confirmer auprès du fournisseur/);
});

test("real student shell exposes finance and insurance and remains scrollable", () => {
  assert.match(shell, /Financement & assurance/);
  assert.match(shell, /\/student\/finance-insurance/);
  assert.match(shell, /overflow-y-auto/);
});
