import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0026_prelaunch_database_baseline.sql", "utf8");

test("trigger helper is not exposed as a callable public RPC", () => {
  assert.match(
    migration,
    /revoke execute on function public\.enforce_publishable_language_course_selection\(\)[\s\S]*from public, anon, authenticated/i,
  );
});

test("client roles lose only unused DDL-oriented table privileges", () => {
  assert.match(migration, /revoke truncate, references, trigger on all tables in schema public[\s\S]*from anon, authenticated/i);
  assert.doesNotMatch(migration, /revoke\s+(select|insert|update|delete)/i);
  assert.match(migration, /alter default privileges for role postgres in schema public/);
});

test("advisor-reported foreign keys gain covering indexes", () => {
  for (const name of [
    "academic_evidence_document_student_idx",
    "academic_evidence_verified_by_idx",
    "admin_notes_admin_id_idx",
    "application_events_actor_id_idx",
    "applications_program_id_idx",
    "documents_reviewed_by_idx",
    "documents_uploaded_by_idx",
    "program_recommendations_admin_id_idx",
    "program_recommendations_program_id_idx",
    "programs_university_id_idx",
    "student_checklist_items_created_by_idx",
    "student_checklist_items_template_id_idx",
    "student_history_actor_id_idx",
    "student_language_course_selections_course_idx",
    "technical_logs_actor_id_idx",
  ]) assert.match(migration, new RegExp(name));
});
