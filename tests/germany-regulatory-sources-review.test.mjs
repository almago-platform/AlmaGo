import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0020_germany_regulatory_sources_review_2026_09_26.sql", "utf8");

test("regulatory source review is dated, official and freshness-bounded", () => {
  assert.match(migration, /checked_on = date '2026-09-26'/);
  assert.match(migration, /verification_status = 'verified'/);
  assert.match(migration, /review_due_at = timestamptz '2026-10-26T18:30:00Z'/);
  assert.match(migration, /auswaertiges-amt\.de/);
  assert.match(migration, /tunis\.diplo\.de/);
  assert.match(migration, /uni-assist\.de/);
});

test("Tunisia preparation and standalone language facts remain separated", () => {
  assert.match(migration, /study_preparation_tunisia/);
  assert.match(migration, /standalone_language_tunisia/);
  assert.match(migration, /11904/);
  assert.match(migration, /1027/);
  assert.match(migration, /20 hours per week/);
  assert.match(migration, /18 hours per week/);
});

test("migration stores factual route support without guaranteeing a visa", () => {
  assert.doesNotMatch(migration, /visa (?:is )?guaranteed|eligible for a visa|automatic visa (?:approval|grant)|approval (?:is )?guaranteed/i);
  assert.match(migration, /not as an automatic visa entitlement/);
});
