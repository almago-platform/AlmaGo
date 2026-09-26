import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  languageCourseLevels,
  languageCoursePurposes,
} from "../src/lib/language-courses.ts";

const migration = readFileSync(
  "supabase/migrations/0017_germany_language_courses.sql",
  "utf8",
);

function valuesFromConstraint(column, nullable = false) {
  const nullablePrefix = nullable ? `${column} is null or ` : "";
  const pattern = new RegExp(
    `${nullablePrefix}${column} in \\(([^)]*)\\)`,
  );
  const match = migration.match(pattern);
  assert.ok(match, `expected enum constraint for ${column}`);
  return match[1]
    .split(",")
    .map((value) => value.trim().replace(/^'|'$/g, ""))
    .filter(Boolean);
}

test("TS and SQL purpose/level enums stay aligned", () => {
  assert.deepEqual(valuesFromConstraint("purpose"), [...languageCoursePurposes]);
  assert.deepEqual(valuesFromConstraint("level_from", true), [...languageCourseLevels]);
  assert.deepEqual(valuesFromConstraint("level_to", true), [...languageCourseLevels]);
});

test("migration stores the complete LOT 5 foundation without inventing optional facts", () => {
  for (const field of [
    "provider_name",
    "city",
    "language",
    "purpose",
    "level_from",
    "level_to",
    "hours_per_week",
    "starts_on",
    "ends_on",
    "price_cents",
    "currency",
    "source_url",
    "application_url",
    "verified_at",
    "is_active",
    "created_at",
    "updated_at",
  ]) {
    assert.match(migration, new RegExp(`\\b${field}\\b`), field);
  }

  assert.match(migration, /level_from text check \(level_from is null/i);
  assert.match(migration, /level_to text check \(level_to is null/i);
  assert.match(migration, /hours_per_week integer check \(hours_per_week is null/i);
  assert.match(migration, /price_cents integer check \(price_cents is null/i);
});

test("students receive only publishable reads and never a write policy", () => {
  assert.match(migration, /alter table public\.language_courses enable row level security/i);
  assert.match(
    migration,
    /language courses publishable read[\s\S]*?for select[\s\S]*?is_active[\s\S]*?verified_at is not null[\s\S]*?verified_at <= now\(\)/i,
  );

  const studentWrite = /create policy[^;]+language_courses[^;]+for (insert|update|delete)[^;]+auth\.uid\(\)/i;
  assert.doesNotMatch(migration, studentWrite);
});

test("Admin is the only write policy authority", () => {
  for (const operation of ["insert", "update", "delete"]) {
    assert.match(
      migration,
      new RegExp(`language courses admin ${operation}[\\s\\S]*?public\\.is_admin\\(\\)`, "i"),
      operation,
    );
  }
});

test("publication remains fail-closed at the SQL boundary", () => {
  assert.match(
    migration,
    /language_courses_active_requires_verification[\s\S]*?not is_active or \(source_url is not null and verified_at is not null\)/i,
  );
  assert.match(migration, /source_url[\s\S]*?\^https\?\:\/\//i);
  assert.match(migration, /application_url[\s\S]*?\^https\?\:\/\//i);
});

test("LOT 5 persistence does not overlap academic-evidence or document semantics", () => {
  assert.doesNotMatch(migration, /academic_evidence|document_id|student_documents/i);
});
