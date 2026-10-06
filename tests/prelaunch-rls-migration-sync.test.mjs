import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "supabase/migrations/20261005062506_prelaunch_consolidate_permissive_policies.sql";
const migration = readFileSync(migrationPath, "utf8");

test("repository contains the exact production RLS consolidation migration version", () => {
  assert.ok(migration.length > 0);
  for (const statement of [
    'drop policy "academic evidence admin manage" on public.academic_evidence;',
    'drop policy "application events admin write" on public.application_events;',
    'drop policy "checklist templates admin write" on public.checklist_templates;',
    'drop policy "documents admin delete" on public.documents;',
    'drop policy "recommendations admin write" on public.program_recommendations;',
    'drop policy "regulatory sources admin write" on public.regulatory_sources;',
    'drop policy "checklist admin write" on public.student_checklist_items;',
    'drop policy "student procedures admin write" on public.student_procedures;',
    'drop policy "student projects admin write" on public.student_projects;',
    'drop policy "student projects own insert" on public.student_projects;',
    'drop policy "student projects own update" on public.student_projects;',
  ]) {
    assert.ok(migration.includes(statement), statement);
  }
});

test("synced migration preserves authenticated ownership and admin boundaries", () => {
  assert.match(
    migration,
    /create policy "academic evidence admin insert"[\s\S]*to authenticated[\s\S]*select is_admin/,
  );
  assert.match(
    migration,
    /create policy "recommendations admin insert"[\s\S]*admin_id=\(select auth\.uid\(\)\)/,
  );
  assert.match(
    migration,
    /create policy "student projects combined insert"[\s\S]*student_id=\(select auth\.uid\(\)\)/,
  );
  assert.match(
    migration,
    /alter policy "documents student allowed delete"[\s\S]*status = any/,
  );
});

test("historical sync does not broaden Data API access or disable RLS", () => {
  assert.doesNotMatch(migration, /grant\s+/i);
  assert.doesNotMatch(migration, /disable\s+row\s+level\s+security/i);
  assert.doesNotMatch(migration, /to\s+anon\b/i);
  assert.doesNotMatch(migration, /to\s+public\b/i);
});
