import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const dossierPage = read("src/app/admin/dossiers/[studentId]/page.tsx");
const dossierModel = read("src/lib/admin/student-dossier.ts");
const intakePanel = read("src/components/admin/AdminIntakePanel.tsx");
const intakePage = read("src/app/admin/intake/page.tsx");

test("admin dossier V2 is a single 360-degree read context", () => {
  for (const primitive of [
    "DossierHeader",
    "JourneyRail",
    "AdminCounselorBrief",
    "DocumentRow",
    "DataList",
    "AdminDossierHistory",
  ]) {
    assert.ok(dossierPage.includes(primitive));
  }

  for (const table of [
    'from("profiles")',
    'from("prospects")',
    'from("student_intake_cases")',
    'from("customer_access")',
    'from("documents")',
    'from("applications")',
    'from("commercial_purchases")',
    'from("student_checklist_items")',
    'from("student_history")',
  ]) {
    assert.ok(dossierPage.includes(table));
  }

  assert.ok(dossierPage.includes("dossier 360°"));
  assert.ok(dossierPage.includes("Les mutations sensibles restent dans leurs écrans métier dédiés"));
});

test("admin dossier lifecycle follows Prospect to Student and applications", () => {
  for (const label of [
    "Orientation",
    "Documents",
    "Analyse Campus",
    "Proposition",
    "Paiement",
    "Étudiant",
    "Candidatures",
  ]) {
    assert.ok(dossierModel.includes(label));
  }

  assert.ok(dossierModel.includes('intakeStatus === "procedure_created"'));
  assert.ok(dossierModel.includes('return 5'));
  assert.ok(dossierModel.includes('hasApplications) return 6'));
  assert.ok(dossierModel.includes('status === "paid_pending_validation"'));
});

test("admin dossier exposes one real next action and waits when Campus has nothing to do", () => {
  assert.ok(dossierModel.includes("Répondre à la demande de discussion"));
  assert.ok(dossierModel.includes("Décider du parcours et de l’offre"));
  assert.ok(dossierModel.includes("Valider le paiement reçu"));
  assert.ok(dossierModel.includes("Attendre la réponse de l’étudiant"));
  assert.ok(dossierModel.includes("Attendre la réception du paiement"));
  assert.ok(dossierModel.includes("waiting: true"));
  assert.ok(dossierPage.includes('action={nextAction}'));
});

test("intake cases open the dossier 360 directly", () => {
  assert.ok(intakePanel.includes('href={`/admin/dossiers/${item.studentId}`}'));
  assert.ok(intakePanel.includes("Ouvrir le dossier 360°"));
});

test("anonymized erased records stay out of operational intake", () => {
  assert.ok(intakePage.includes('email.startsWith("erased-")'));
  assert.ok(intakePage.includes('email.endsWith("@invalid.local")'));
  assert.ok(dossierPage.includes('prospect.email.startsWith("erased-")'));
  assert.ok(dossierPage.includes('prospect.email.endsWith("@invalid.local")'));
  assert.ok(dossierPage.includes("Enregistrement retiré des opérations"));
});

test("dossier uses Student access language instead of internal client jargon", () => {
  assert.ok(dossierModel.includes('if (status === "client_active") return "Étudiant actif"'));
  assert.ok(dossierModel.includes('if (status === "client_completed") return "Étudiant · parcours terminé"'));
  assert.ok(dossierPage.includes('label: "Accès étudiant"'));
});
