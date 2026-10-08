import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261007130000_harden_candidate_student_boundary.sql",
  "utf8",
);

test("student client entitlement is fail-closed and excludes prospect states", () => {
  assert.match(migration, /create or replace function private\.has_student_client_access\(\)/i);
  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /role\.role = 'student'::public\.app_role/i);
  assert.match(migration, /'client_active'::public\.customer_lifecycle_status/i);
  assert.match(migration, /'client_completed'::public\.customer_lifecycle_status/i);

  const helper = migration.match(
    /create or replace function private\.has_student_client_access\(\)[\s\S]*?\$\$;/i,
  )?.[0] ?? "";

  for (const forbidden of [
    "prospect_account",
    "qualified_prospect",
    "payment_pending",
    "paid_pending_validation",
  ]) {
    assert.doesNotMatch(helper, new RegExp(forbidden, "i"));
  }
});

test("candidate accounts cannot directly use client-only student tables", () => {
  for (const table of [
    "academic_evidence",
    "applications",
    "program_recommendations",
    "student_checklist_items",
    "student_document_requirements",
    "student_dossier_messages",
    "student_history",
    "student_language_course_selections",
    "student_procedures",
  ]) {
    assert.match(
      migration,
      new RegExp(
        "on public\\." + table + "[\\s\\S]*?private\\.has_student_client_access\\(\\)",
        "i",
      ),
      table,
    );
  }
});

test("admin access stays independent from student client entitlement", () => {
  for (const policy of [
    "academic evidence own or admin read",
    "applications student or admin read",
    "recommendations student active or admin read",
    "checklist student or admin",
    "student procedures own or admin read",
  ]) {
    assert.match(
      migration,
      new RegExp(
        'create policy "' + policy + '"[\\s\\S]*?public\\.is_admin\\(\\)',
        "i",
      ),
      policy,
    );
  }
});

test("client entitlement helper is not exposed to anonymous users", () => {
  assert.match(
    migration,
    /revoke all on function private\.has_student_client_access\(\) from public, anon/i,
  );
  assert.match(
    migration,
    /grant execute on function private\.has_student_client_access\(\) to authenticated, service_role/i,
  );
});

test("prospect profile ownership remains intentionally available", () => {
  assert.doesNotMatch(migration, /drop policy if exists "profiles own/i);
  assert.doesNotMatch(migration, /drop policy if exists "prospects /i);
  assert.doesNotMatch(migration, /drop policy if exists "customer access /i);
});

test("prospect pre-dossier resources keep their owner-scoped boundary", () => {
  for (const policy of [
    "documents student or admin read",
    "student intake own or admin read",
    "student projects own or admin read",
    "document objects own folder",
    "document objects own upload",
    "document objects own allowed delete",
  ]) {
    assert.doesNotMatch(
      migration,
      new RegExp('drop policy if exists "' + policy + '"', "i"),
      policy,
    );
  }
});
