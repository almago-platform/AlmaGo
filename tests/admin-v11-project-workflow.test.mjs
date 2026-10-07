import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const projectPanel = read("src/components/admin/AdminStudentProjectPanel.tsx");
const projectRoute = read("src/app/api/admin/dossiers/[studentId]/project/route.ts");
const orientationPage = read("src/app/admin/orientation/page.tsx");
const orientationPanel = read("src/components/admin/AdminOrientationPanel.tsx");

test("Admin V11 adds an editable project workspace to Dossier 360", () => {
  assert.match(dossier, /AdminStudentProjectPanel/);
  assert.match(dossier, /id="project"/);
  assert.match(dossier, /target_degree/);
  assert.match(dossier, /target_field/);
  assert.match(dossier, /study_language/);
  assert.match(dossier, /general_average/);
  assert.match(dossier, /preferred_cities/);
});

test("Admin V11 project editor stays separate from recommendation publication", () => {
  assert.match(projectPanel, /Fiche de travail du projet/);
  assert.match(projectPanel, /ne publie aucune recommandation/);
  assert.match(projectPanel, /ne crée aucune candidature/);
  assert.match(projectPanel, /Enregistrer le projet/);
  assert.match(projectPanel, /Préparer l’orientation/);
});

test("Admin V11 project updates are bounded and auditable", () => {
  assert.match(projectRoute, /getAdminUser/);
  assert.match(projectRoute, /parsed < 0 \|\| parsed > 20/);
  assert.match(projectRoute, /slice\(0, 12\)/);
  assert.match(projectRoute, /from\("profiles"\)/);
  assert.match(projectRoute, /event_type: "admin_project_updated"/);
  assert.match(projectRoute, /changed_fields/);
  assert.match(projectRoute, /rollback/);
});

test("Admin V11 orientation can open with the dossier student already selected", () => {
  assert.match(orientationPage, /searchParams/);
  assert.match(orientationPage, /requestedStudentId/);
  assert.match(orientationPage, /initialStudentId=\{requestedStudentId\}/);
  assert.match(orientationPanel, /initialStudentId/);
  assert.match(orientationPanel, /student\.id === initialStudentId && student\.onboarding_completed/);
});

test("Admin V11 dossier separates the project from Campus programme recommendations", () => {
  assert.match(dossier, /from\("program_recommendations"\)/);
  assert.match(dossier, /Orientation Campus/);
  assert.match(dossier, /Le projet étudiant décrit le besoin/);
  assert.match(dossier, /Gérer l’orientation/);
  assert.match(dossier, /Historique des projets \/ orientations saisis/);
  assert.match(dossier, /recommendationStatusLabels/);
});
