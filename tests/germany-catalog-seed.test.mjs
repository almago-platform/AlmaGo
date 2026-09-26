import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0021_verified_germany_catalog_seed_2026_09_26.sql", "utf8");

test("catalog seed uses dated provider-owned official sources and stays idempotent", () => {
  assert.match(migration, /2026-09-26T19:10:00Z/);
  assert.match(migration, /where not exists/gi);
  for (const domain of ["spraachen.org", "did.de", "goethe.de", "fintiba.com", "expatrio.com", "tk.de", "aok.de", "kfw.de"]) {
    assert.match(migration, new RegExp(domain.replace(".", "\\."), "i"), domain);
  }
});

test("study-preparation courses are explicitly sourced while unknown quantitative fields stay null", () => {
  assert.match(migration, /Sprachenakademie Aachen[\s\S]*study_preparation/);
  assert.match(migration, /did deutsch-institut[\s\S]*study_preparation/);
  assert.match(migration, /hours_per_week, starts_on, ends_on, price_cents/);
  assert.match(migration, /'study_preparation'::public\.language_course_purpose/);
});

test("finance catalogue covers blocked accounts, health insurance, and student financing without ranking", () => {
  for (const kind of ["blocked_account_provider", "health_insurance_provider", "student_financing_option"]) {
    assert.match(migration, new RegExp(kind));
  }
  assert.doesNotMatch(migration, /best provider|recommended provider|guaranteed visa|eligible for a visa/i);
  assert.match(migration, /not automatically eligible/i);
});
