import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const page = read("src/app/admin/applications/page.tsx");
const panel = read("src/components/admin/AdminApplicationsPanel.tsx");
const deadlineRoute = read("src/app/api/admin/applications/[id]/deadline/route.ts");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");

test("Admin V11 carries dossier context into the application queue", () => {
  assert.match(page, /searchParams/);
  assert.match(page, /requestedStudentId/);
  assert.match(page, /initialStudentId=\{requestedStudentId\}/);
  assert.match(panel, /initialStudentId/);
  assert.match(panel, /studentIdFilter/);
  assert.match(dossier, /\/admin\/applications\?student=\$\{studentId\}/);
});

test("Admin V11 never counts an unverified application date as overdue", () => {
  assert.match(page, /deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method/);
  assert.match(panel, /applicationDeadlineIsTrusted/);
  assert.match(panel, /deadline_source_url/);
  assert.match(panel, /deadline_verified_at/);
  assert.match(panel, /deadline_cycle/);
  assert.match(panel, /applicationDeadlineIsTrusted\(application\)[\s\S]*isPastDeadline/);
  assert.match(panel, /Dates à vérifier/);
  assert.match(panel, /Date à vérifier/);
});

test("Admin V11 surfaces active applications without a next action", () => {
  assert.match(panel, /missingActionCount/);
  assert.match(panel, /Sans action/);
  assert.match(panel, /Sans prochaine action/);
  assert.match(panel, /!application\.next_action\?\.trim\(\)/);
});

test("Admin V11 reuses the verified deadline engine instead of writing deadline truth directly", () => {
  assert.match(deadlineRoute, /getAdminUser/);
  assert.match(deadlineRoute, /admin_set_application_deadline/);
  assert.match(deadlineRoute, /admin_mark_application_deadline_to_verify/);
  assert.match(deadlineRoute, /p_deadline_source_url: sourceUrl/);
  assert.match(deadlineRoute, /p_deadline_verified_at: new Date\(\)\.toISOString\(\)/);
  assert.match(deadlineRoute, /p_deadline_cycle: cycle/);
  assert.doesNotMatch(deadlineRoute, /from\("applications"\)\.update/);
});

test("Admin V11 deadline editor requires source and cycle before official verification", () => {
  assert.match(panel, /Vérifier ou corriger la deadline/);
  assert.match(panel, /Source officielle/);
  assert.match(panel, /Cycle \/ rentrée concernée/);
  assert.match(panel, /Méthode de candidature/);
  assert.match(panel, /Enregistrer à vérifier/);
  assert.match(panel, /Vérifier comme échéance officielle/);
  assert.match(panel, /!deadlineEdit\.cycle\.trim\(\)/);
  assert.match(panel, /!deadlineEdit\.sourceUrl\.trim\(\)/);
});
