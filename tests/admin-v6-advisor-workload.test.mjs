import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/20261007063000_admin_case_assignment.sql");
const people = read("src/app/admin/people/page.tsx");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const ownerPanel = read("src/components/admin/AdminCaseOwnerPanel.tsx");
const assignmentRoute = read("src/app/api/admin/dossiers/[studentId]/assignment/route.ts");

test("Admin V6 adds one explicit advisor assignment without creating a parallel CRM person table", () => {
  assert.match(migration, /create table if not exists public\.student_case_assignments/);
  assert.match(migration, /student_id uuid primary key references auth\.users/);
  assert.match(migration, /assigned_admin_id uuid references auth\.users/);
  assert.doesNotMatch(migration, /create table[^;]*(crm|people|contacts)/i);
});

test("Admin V6 advisor assignment stays admin-only and validates the target role", () => {
  assert.match(migration, /alter table public\.student_case_assignments enable row level security/);
  assert.match(migration, /student case assignments admin only/);
  assert.match(migration, /public\.is_admin\(\)/);
  assert.match(migration, /assigned_user_must_be_admin/);
  assert.match(migration, /roles\.role = 'admin'/);
  assert.match(migration, /technical_logs/);
});

test("Admin V6 assignment API verifies both actor and target advisor", () => {
  assert.match(assignmentRoute, /getAdminUser/);
  assert.match(assignmentRoute, /if \(!isAdmin\)/);
  assert.match(assignmentRoute, /from\("user_roles"\)/);
  assert.match(assignmentRoute, /eq\("role", "admin"\)/);
  assert.match(assignmentRoute, /from\("student_case_assignments"\)/);
  assert.match(assignmentRoute, /assigned_admin_id/);
});

test("Admin V6 dossier 360 exposes the current advisor assignment", () => {
  assert.match(dossier, /AdminCaseOwnerPanel/);
  assert.match(dossier, /from\("student_case_assignments"\)/);
  assert.match(dossier, /from\("user_roles"\)/);
  assert.match(ownerPanel, /Conseiller du dossier/);
  assert.match(ownerPanel, /Non attribué/);
  assert.match(ownerPanel, /assigned_admin_id/);
});

test("Admin V6 people center supports daily advisor workload filters", () => {
  for (const token of [
    '"overdue"',
    '"today"',
    '"week"',
    '"unassigned"',
    '"mine"',
    "Mes dossiers",
    "7 prochains jours",
    "Non attribués",
  ]) {
    assert.ok(people.includes(token), token);
  }
  assert.match(people, /student_case_assignments/);
  assert.match(people, /assignedAdminName/);
  assert.match(people, /advisorOptions/);
});

test("Admin V6 never treats an unverified official date as an overdue countdown", () => {
  assert.match(people, /applicationDeadlineIsVerified/);
  assert.match(people, /deadline_source_url/);
  assert.match(people, /deadline_verified_at/);
  assert.match(people, /deadline_cycle/);
  assert.match(people, /hasUnverifiedDeadline/);
  assert.match(people, /Source\/date non vérifiée/);
  assert.match(people, /Officielle vérifiée/);
  assert.match(people, /Cible interne/);
});
