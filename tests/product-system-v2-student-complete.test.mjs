import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const home = read("src/app/student/page.tsx");
const procedure = read("src/app/student/procedure/page.tsx");
const documents = read("src/app/student/documents/page.tsx");
const applications = read("src/app/student/applications/page.tsx");
const applicationsPanel = read("src/components/student/StudentApplicationsPanel.tsx");
const shell = read("src/components/layout/AppShell.tsx");
const journeyHeader = read("src/components/student/StudentJourneyHeader.tsx");
const foundation = read("supabase/migrations/20261005173500_student_v2_procedure_foundation.sql");
const smartDocuments = read("supabase/migrations/20261005174000_student_v2_smart_documents.sql");
const deadlineEngine = read("supabase/migrations/20261005174500_student_v2_deadline_engine.sql");
const notifications = read("supabase/migrations/20261005175000_student_v2_notifications.sql");
const freshness = read("supabase/migrations/20261005175500_student_v2_source_freshness.sql");

test("Student Home V2 is lifecycle-first and exposes one next action", () => {
  for (const primitive of [
    "DossierHeader",
    "JourneyRail",
    "NextActionPanel",
    "ResponsibilityStrip",
  ]) {
    assert.ok(home.includes(primitive));
  }
  assert.ok(home.includes("v2JourneySteps"));
  assert.ok(home.includes('href="/student/procedure"'));
  assert.ok(home.includes("<AlmagoJourney"));
  assert.ok(home.includes("<details"));
});

test("Student procedure cockpit uses the Product System and server-owned procedure truth", () => {
  for (const primitive of [
    "DossierHeader",
    "JourneyRail",
    "NextActionPanel",
    "ResponsibilityStrip",
    "DocumentRow",
    "ActivityTimeline",
  ]) {
    assert.ok(procedure.includes(primitive));
  }

  for (const table of [
    'from("student_procedures")',
    'from("student_document_requirements")',
    'from("applications")',
    'from("student_history")',
  ]) {
    assert.ok(procedure.includes(table));
  }

  assert.ok(procedure.includes('eq("is_current", true)'));
  assert.ok(procedure.includes("template_snapshot"));
  assert.ok(procedure.includes("evaluateCampusApplicationDeadline"));
  assert.ok(procedure.includes("buildCampusInternalTargets"));
  assert.ok(procedure.includes("routeLabels"));
  assert.ok(procedure.includes("التحضير للدراسة"));
  assert.ok(procedure.includes("Studienvorbereitung"));
});

test("primary Student navigation routes operational steps through the procedure cockpit", () => {
  assert.ok(shell.includes('{ label: "Mes démarches", href: "/student/procedure"'));
  assert.ok(journeyHeader.includes('{ key: "checklist", href: "/student/procedure" }'));
});

test("Student documents V2 reads smart requirements without replacing the existing upload panel", () => {
  assert.ok(documents.includes('from("student_document_requirements")'));
  assert.ok(documents.includes("DossierHeader"));
  assert.ok(documents.includes("NextActionPanel"));
  assert.ok(documents.includes("<DocumentsPanel"));
  assert.ok(documents.includes('href="/student/procedure"'));
});

test("Student applications V2 fails closed on unverified deadline provenance", () => {
  for (const column of [
    "deadline_kind",
    "deadline_source_url",
    "deadline_verified_at",
    "deadline_cycle",
    "application_method",
  ]) {
    assert.ok(applications.includes(column));
  }
  assert.ok(applicationsPanel.includes("evaluateCampusApplicationDeadline"));
  assert.ok(applicationsPanel.includes("t.noConfirmedDate"));
  assert.ok(!applicationsPanel.includes("nextActiveDeadline"));
  assert.ok(!applicationsPanel.includes("isPastDeadline"));
});

test("Student V2 procedure migrations are additive and preserve RLS boundaries", () => {
  assert.ok(foundation.includes("create table if not exists public.student_document_requirements"));
  assert.ok(foundation.includes("alter table public.student_checklist_items"));
  assert.ok(foundation.includes("enable row level security"));
  assert.ok(foundation.includes("(select auth.uid())"));
  assert.ok(foundation.includes("(select public.is_admin())"));
  assert.ok(!foundation.toLowerCase().includes("delete from public."));

  assert.ok(smartDocuments.includes("seed_campus_starter_requirements"));
  assert.ok(smartDocuments.includes("admin_request_student_document"));
  assert.ok(deadlineEngine.includes("admin_set_application_deadline"));
  assert.ok(deadlineEngine.includes("deadline_verified_at"));
  assert.ok(notifications.includes("admin_enqueue_campus_notifications"));
  assert.ok(notifications.includes("dedupe_key"));
  assert.ok(freshness.includes("review_due_at"));
});
