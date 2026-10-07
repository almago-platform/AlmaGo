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
  assert.match(panel, /applicationOfficialDeadlineUrgency/);
  assert.match(panel, /deadlineTrusted: applicationDeadlineIsTrusted\(application\)/);
  assert.doesNotMatch(panel, /isPastDeadline/);
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

const createRoute = read("src/app/api/admin/applications/route.ts");
const recommendationAction = read("src/components/admin/AdminRecommendationApplicationAction.tsx");

test("Admin V11 can create an application from an active Campus recommendation", () => {
  assert.match(createRoute, /getAdminUser/);
  assert.match(createRoute, /from\("program_recommendations"\)/);
  assert.match(createRoute, /programPublicationIssues/);
  assert.match(createRoute, /resolveApplicationIntake/);
  assert.match(createRoute, /from\("student_projects"\)/);
  assert.match(createRoute, /from\("applications"\)[\s\S]*\.insert/);
  assert.match(createRoute, /status: "interested"/);
  assert.match(createRoute, /admin_application_created/);
});

test("Admin V11 refuses unsafe recommendation-to-application transitions", () => {
  assert.match(createRoute, /recommendation\.is_archived/);
  assert.match(createRoute, /recommendation\.status === "not_recommended"/);
  assert.match(createRoute, /!university\?\.is_active/);
  assert.match(createRoute, /needs_manual_review/);
  assert.match(createRoute, /deadline_passed/);
  assert.match(createRoute, /23505/);
});

test("Dossier 360 exposes the recommendation-to-application action without duplicating applications", () => {
  assert.match(dossier, /AdminRecommendationApplicationAction/);
  assert.match(dossier, /applicationProgramIds/);
  assert.match(dossier, /hasApplication=\{applicationProgramIds\.has\(recommendation\.program_id\)\}/);
  assert.match(recommendationAction, /Créer la candidature/);
  assert.match(recommendationAction, /Candidature déjà rattachée/);
});
