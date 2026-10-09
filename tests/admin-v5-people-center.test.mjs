import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const peoplePage = read("src/app/admin/people/page.tsx");
const peopleModel = read("src/lib/admin/people.ts");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const navigation = read("src/components/admin/AdminDossierNavigation.tsx");
const actionPanel = read("src/components/admin/AdminDossierActionsPanel.tsx");
const actionRoute = read("src/app/api/admin/dossiers/[studentId]/actions/route.ts");
const shell = read("src/components/layout/AppShell.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const prospects = read("src/app/admin/prospects/page.tsx");
const payments = read("src/app/admin/payments/page.tsx");

test("Admin V5 adds one people center instead of a parallel CRM data model", () => {
  assert.match(peoplePage, /Prospects, candidats et étudiants/);
  for (const table of [
    'from("prospects")',
    'from("customer_access")',
    'from("profiles")',
    'from("student_intake_cases")',
    'from("documents")',
    'from("applications")',
    'from("student_checklist_items")',
    'from("orientations")',
  ]) {
    assert.match(peoplePage, new RegExp(table.replace(/[()]/g, "\\$&")));
  }
  assert.match(peoplePage, /Dossier 360°/);
  assert.match(peoplePage, /Prochaine action/);
  assert.match(peoplePage, /Responsable/);
  assert.match(peoplePage, /Échéance/);
});

test("Admin V5 classifies the same person by commercial lifecycle without duplicating records", () => {
  assert.match(peopleModel, /client_active/);
  assert.match(peopleModel, /client_completed/);
  assert.match(peopleModel, /qualified_prospect/);
  assert.match(peopleModel, /payment_pending/);
  assert.match(peopleModel, /paid_pending_validation/);
  assert.match(peopleModel, /return "candidate"/);
  assert.match(peopleModel, /return "student"/);
});

test("Admin V5 dossier action management reuses checklist ownership and deadline primitives", () => {
  assert.match(actionRoute, /student_checklist_items/);
  assert.match(actionRoute, /student_history/);
  assert.match(actionRoute, /internal_target/);
  assert.match(actionRoute, /requires_student_action/);
  assert.match(actionRoute, /student_action_reason/);
  assert.match(actionRoute, /template_id: null/);
  assert.doesNotMatch(actionRoute, /official_hard_deadline/);
  assert.match(actionPanel, /Cible interne facultative/);
  assert.match(actionPanel, /Les échéances officielles restent gérées par les candidatures et les sources vérifiées/);
});

test("Admin V5 dossier 360 exposes full person context and auditable action history", () => {
  assert.match(dossier, /Orientation Campus/);
  assert.match(dossier, /Historique des projets \/ orientations saisis/);
  assert.match(dossier, /Tous les fichiers enregistrés/);
  assert.match(dossier, /AdminDossierActionsPanel/);
  assert.match(dossier, /from\("student_history"\)/);
  assert.match(dossier, /from\("student_checklist_items"\)/);
  assert.match(navigation, /#orientation/);
  assert.match(navigation, /#documents/);
  assert.match(navigation, /#applications/);
  assert.match(navigation, /#commercial/);
  assert.match(navigation, /#history/);
});

test("Admin V5 makes People a primary navigation group and keeps work queues separate", () => {
  assert.match(shell, /href: "\/admin\/people"/);
  assert.match(shell, /label: "Personnes et dossiers"/);
  assert.match(shell, /label: "À traiter"/);
  assert.match(shell, /pathname\.startsWith\("\/admin\/dossiers\/"\)/);
});

test("Admin V5 operational queues all link back to the same dossier 360", () => {
  assert.match(documents, /\/admin\/dossiers\/\$\{document\.student_id\}/);
  assert.match(applications, /\/admin\/dossiers\/\$\{application\.student_id\}/);
  assert.match(prospects, /\/admin\/dossiers\/\$\{prospect\.user_id\}/);
  assert.match(payments, /\/admin\/dossiers\/\$\{purchase\.user_id\}/);
});
