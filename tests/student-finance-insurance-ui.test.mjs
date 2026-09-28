import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
const copy = readFileSync("src/content/student-finance-copy.ts", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");

test("student finance and insurance catalogue is backed by the verified factual table", () => {
  assert.match(page, /from\("finance_insurance_catalog"\)/);
  assert.match(page, /isPublishableFinanceInsuranceOption\(option, now\)/);
  assert.match(page, /official_source_url/);
  assert.match(page, /verified_at/);
});

test("all three factual catalogue categories stay present in the native copy contract", () => {
  for (const label of ["Compte bloqué", "Assurance santé", "Financement étudiant"]) {
    assert.ok(copy.includes(label));
  }
  assert.match(page, /t\.kinds\[kind\]/);
});

test("student catalogue does not rank providers or claim visa eligibility", () => {
  assert.ok(copy.includes("ne classe pas les fournisseurs"));
  assert.ok(copy.includes("ne déduit ni votre éligibilité ni une exigence de visa"));
  assert.doesNotMatch(page, /meilleur fournisseur|recommandé pour vous|visa garanti|éligible au visa|score fournisseur/i);
});

test("unknown price and conditions stay explicit instead of estimated", () => {
  assert.ok(copy.includes("À confirmer sur la source officielle"));
  assert.ok(copy.includes("À confirmer auprès du fournisseur"));
  assert.match(page, /copy\.unknownOfficial/);
  assert.match(page, /copy\.unknownProvider/);
});

test("real student shell exposes finance and insurance and remains scrollable", () => {
  assert.ok(nativeCopy.includes('"Financement & assurance"'));
  assert.match(shell, /\/student\/finance-insurance/);
  assert.match(shell, /overflow-y-auto/);
});
