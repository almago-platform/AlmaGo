import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0028_catalog_rls_and_application_boundary.sql", "utf8");

test("students only read publishable programs with an active parent university", () => {
  for (const pattern of [
    /programs\.is_active/,
    /programs\.verified_at is not null/,
    /programs\.verified_at <= now\(\)/,
    /programs\.source_url ~\*/,
    /programs\.application_url ~\*/,
    /university\.is_active/,
  ]) assert.match(migration, pattern);
  assert.match(migration, /public\.is_admin\(\)[\s\S]*or/);
});

test("university catalogue read is active-only for students while admin remains full-access", () => {
  assert.match(migration, /create policy "catalog active or admin read"/);
  assert.match(migration, /public\.is_admin\(\) or universities\.is_active/);
});

test("admin catalogue writes no longer use ALL policies that duplicate SELECT", () => {
  assert.doesNotMatch(migration, /create policy .*admin write[\s\S]*for all/i);
  for (const operation of ["insert", "update", "delete"]) {
    assert.match(migration, new RegExp(`programs admin ${operation}`));
    assert.match(migration, new RegExp(`catalog admin ${operation}`));
  }
});

test("student application insert explicitly requires active program and university", () => {
  assert.match(migration, /join public\.universities university/);
  assert.match(migration, /and program\.is_active/);
  assert.match(migration, /and university\.is_active/);
  assert.match(migration, /recommendation\.student_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /recommendation\.status in \('recommended', 'possible', 'ambitious', 'missing_requirements'\)/);
});

test("admin insert update and delete capabilities are preserved", () => {
  assert.match(migration, /create policy "applications controlled insert"[\s\S]*public\.is_admin\(\)[\s\S]*or/);
  assert.match(migration, /create policy "applications admin update"/);
  assert.match(migration, /create policy "applications admin delete"/);
});
