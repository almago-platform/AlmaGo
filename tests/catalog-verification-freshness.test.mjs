import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0023_catalog_verification_freshness.sql", "utf8");
const freshness = readFileSync("src/lib/catalog-freshness.ts", "utf8");

test("catalogue verification expires after the same 30-day window in code and RLS", () => {
  assert.match(freshness, /CATALOG_VERIFICATION_MAX_AGE_DAYS = 30/);
  assert.match(migration, /verified_at > now\(\) - interval '30 days'/g);
});

test("stale records remain stored but are blocked from student publication", () => {
  assert.match(migration, /public\.is_admin\(\)[\s\S]+verified_at > now\(\) - interval '30 days'/);
  assert.doesNotMatch(migration, /delete from public\.(language_courses|finance_insurance_catalog)/i);
});
