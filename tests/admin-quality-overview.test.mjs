import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminPage = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin overview computes catalogue quality from real source and verification fields", () => {
  assert.match(adminPage, /source_url,website_url,verified_at/);
  assert.match(adminPage, /source_url,application_url,verified_at/);
  assert.match(adminPage, /universityQualityIssues/);
  assert.match(adminPage, /programQualityIssues/);
  assert.match(adminPage, /catalogueQualityIssues/);
});

test("catalogue quality becomes an operational priority only after student queues", () => {
  assert.match(adminPage, /Catalogue à vérifier/);
  assert.match(adminPage, /Vérifier le catalogue/);
  assert.match(adminPage, /documents > 0/);
  assert.match(adminPage, /applications > 0/);
});

test("admin overview never converts catalogue quality into a ranking score", () => {
  assert.equal(/score/i.test(adminPage), false);
  assert.equal(/classement/i.test(adminPage), false);
});
