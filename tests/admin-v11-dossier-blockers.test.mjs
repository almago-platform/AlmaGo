import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const blockers = read("src/components/admin/AdminDossierBlockersPanel.tsx");

test("Admin V11 Dossier 360 exposes explicit blockers with owner, reason and resolution CTA", () => {
  assert.match(dossier, /AdminDossierBlockersPanel/);
  assert.match(dossier, /id="blockers"/);
  assert.match(dossier, /\["#blockers", "Blocages"\]/);
  assert.match(blockers, /Ce qui empêche ou ralentit la suite/);
  assert.match(blockers, /Responsable/);
  assert.match(blockers, /actionLabel/);
  assert.match(blockers, /Une attente normale n’est pas inventée comme blocage/);
});

test("Admin V11 derives blockers from explicit procedure and document truth", () => {
  assert.match(dossier, /action\.status === "blocked"/);
  assert.match(dossier, /action\.blocked_reason/);
  assert.match(dossier, /studentDocumentRequests/);
  assert.match(dossier, /requirement\.student_request_reason/);
  assert.match(dossier, /documentsAwaitingDecision/);
  assert.match(dossier, /Décision Campus/);
});

test("Admin V11 flags active applications that cannot be safely operated", () => {
  assert.match(dossier, /isActiveApplication\(application\.status\)/);
  assert.match(dossier, /applicationDeadlineIsTrusted/);
  assert.match(dossier, /Deadline à vérifier/);
  assert.match(dossier, /!application\.next_action\?\.trim\(\)/);
  assert.match(dossier, /Suivi incomplet/);
  assert.match(dossier, /\/admin\/applications\?student=\$\{studentId\}/);
});

test("Admin V11 treats missing core project data and missing active procedure as explicit blockers", () => {
  assert.match(dossier, /missingProjectFields/);
  assert.match(dossier, /Projet incomplet/);
  assert.match(dossier, /profile\?\.target_degree/);
  assert.match(dossier, /profile\?\.target_field/);
  assert.match(dossier, /profile\?\.target_intake/);
  assert.match(dossier, /access\?\.status === "client_active" && !currentProcedureId/);
  assert.match(dossier, /Procédure absente/);
});

test("Admin V11 blocker list prioritizes critical issues before warnings", () => {
  assert.match(dossier, /blockerRank = \{ critical: 0, warning: 1, info: 2 \}/);
  assert.match(dossier, /blockers\.sort/);
});
