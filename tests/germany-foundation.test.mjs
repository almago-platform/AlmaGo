import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isRegulatoryRuleCurrent } from "../src/lib/regulatory.ts";
import { parseStudentProject, projectPaths } from "../src/lib/student/project.ts";

const foundationMigration = readFileSync("supabase/migrations/0013_germany_regulatory_project_foundation.sql", "utf8");
const hardeningMigration = readFileSync("supabase/migrations/0014_germany_foundation_completeness.sql", "utf8");
const migration = foundationMigration + "\n" + hardeningMigration;

test("the four project paths are stable and accepted", () => {
  assert.deepEqual(projectPaths, ["university_search", "german_preparation_and_studies", "master_and_language", "language_only"]);
  for (const path of projectPaths) assert.equal(parseStudentProject({ path }).data?.path, path);
});

test("project input rejects an unknown path and bounds student-controlled values", () => {
  assert.equal(parseStudentProject({ path: "visa_only" }).error, "Choisissez un objectif valide.");
  const result = parseStudentProject({
    path: "university_search",
    preferred_cities: [" Berlin ", "Berlin", 42, "Munich"],
    notes: "x".repeat(2000),
  });
  assert.deepEqual(result.data?.preferred_cities, ["Berlin", "Munich"]);
  assert.equal(result.data?.notes?.length, 2000);
  assert.match(parseStudentProject({ path: "university_search", notes: "x".repeat(2001) }).error ?? "", /longueur/);
});

test("complete project input is normalized and currency cannot be client-controlled", () => {
  const result = parseStudentProject({
    path: "master_and_language",
    current_diploma: " Licence informatique ",
    diploma_country: " tn ",
    filing_country: " tn ",
    target_degree: "Master",
    target_field: "Computer Science",
    preferred_study_language: "anglais",
    monthly_budget: "1250.50",
    budget_currency: "USD",
    actual_objective: "Trouver un Master adapté puis préparer les démarches nécessaires.",
  });

  assert.equal(result.data?.current_diploma, "Licence informatique");
  assert.equal(result.data?.diploma_country, "TN");
  assert.equal(result.data?.filing_country, "TN");
  assert.equal(result.data?.monthly_budget, 1250.5);
  assert.equal(result.data?.budget_currency, "EUR");
  assert.equal(result.data?.actual_objective, "Trouver un Master adapté puis préparer les démarches nécessaires.");
});

test("invalid diploma countries, filing countries and budgets are rejected", () => {
  assert.match(
    parseStudentProject({ path: "university_search", diploma_country: "Tunisia" }).error ?? "",
    /deux lettres/,
  );
  assert.match(
    parseStudentProject({ path: "university_search", filing_country: "Tunisia" }).error ?? "",
    /pays de dépôt/,
  );
  assert.match(
    parseStudentProject({ path: "university_search", monthly_budget: "-1" }).error ?? "",
    /budget mensuel/,
  );
  assert.match(
    parseStudentProject({ path: "university_search", monthly_budget: "100000.01" }).error ?? "",
    /budget mensuel/,
  );
});

test("regulatory freshness requires explicit verification and a future review deadline", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  const current = {
    verification_status: "verified",
    verified_at: "2026-09-24T10:00:00Z",
    review_due_at: "2026-10-24T10:00:00Z",
  };
  assert.equal(isRegulatoryRuleCurrent(current, now), true);
  assert.equal(isRegulatoryRuleCurrent({ ...current, verification_status: "needs_reverification" }, now), false);
  assert.equal(isRegulatoryRuleCurrent({ ...current, review_due_at: "2026-09-25T11:59:59Z" }, now), false);
  assert.equal(isRegulatoryRuleCurrent({ ...current, verified_at: null }, now), false);
});

test("regulatory truth carries structured verification metadata", () => {
  assert.match(migration, /source_url text not null check \(source_url ~ '\^https:\/\/'\)/);
  assert.match(migration, /category text/);
  assert.match(migration, /origin_country text/);
  assert.match(migration, /destination_country text/);
  assert.match(migration, /amount numeric\(12,2\)/);
  assert.match(migration, /currency text/);
  assert.match(migration, /periodicity text/);
  assert.match(migration, /rule_text text/);
  assert.match(migration, /verification_status text not null default 'needs_reverification'/);
  assert.match(migration, /verified_at timestamptz/);
  assert.match(migration, /review_due_at timestamptz/);
  assert.match(migration, /verification_status = 'needs_reverification'/);
});

test("student project persistence has the complete academic and budget context", () => {
  for (const column of [
    "current_diploma",
    "diploma_country",
    "preferred_study_language",
    "monthly_budget",
    "budget_currency",
    "actual_objective",
  ]) {
    assert.match(hardeningMigration, new RegExp(`add column ${column}`));
  }
  assert.match(hardeningMigration, /check \(budget_currency = 'EUR'\)/);
});

test("regulatory and project tables preserve admin/student isolation with RLS", () => {
  for (const table of ["regulatory_sources", "student_projects"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(migration, /student projects own or admin read/);
  assert.match(migration, /student projects own insert[\s\S]+student_id = auth\.uid\(\)/);
  assert.match(migration, /student projects own update[\s\S]+student_id = auth\.uid\(\)/);
  assert.match(migration, /regulatory sources admin write[\s\S]+public\.is_admin\(\)/);
});
