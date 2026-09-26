import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin overview tracks stale and due-soon Germany catalogue records", () => {
  assert.match(page, /catalogVerificationCutoff\(now\)/);
  assert.match(page, /23 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(page, /from\("language_courses"\)/);
  assert.match(page, /from\("finance_insurance_catalog"\)/);
  assert.match(page, /Catalogue à revalider/);
  assert.match(page, /Révalidations du catalogue Allemagne/);
  assert.match(page, /expire automatiquement après 30 jours/);
});

test("expired catalogue data is considered after document and application blockers", () => {
  const documentsIndex = page.indexOf("documents > 0");
  const applicationsIndex = page.indexOf("applications > 0");
  const staleIndex = page.indexOf("staleCatalogue > 0");
  assert.ok(documentsIndex >= 0 && applicationsIndex > documentsIndex && staleIndex > applicationsIndex);
});

test("catalogue health links to both maintenance surfaces", () => {
  assert.match(page, /\/admin\/language-courses/);
  assert.match(page, /\/admin\/finance-insurance/);
});
