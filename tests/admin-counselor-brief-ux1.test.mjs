import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dossier = readFileSync("src/app/admin/dossiers/[studentId]/page.tsx", "utf8");
const brief = readFileSync("src/components/admin/AdminCounselorBrief.tsx", "utf8");
const deadlineRisk = readFileSync("src/lib/admin/application-risk.ts", "utf8");

test("the first visible dossier summary answers who, where, who acts, and what happened", () => {
  assert.match(dossier, /import \{ AdminCounselorBrief \} from/);
  const position = dossier.indexOf("      <AdminCounselorBrief\n");
  assert.ok(position > dossier.indexOf("      <DossierHeader\n"));
  assert.ok(position < dossier.indexOf('aria-label="Navigation du dossier"'));
  assert.match(dossier, /segment=\{adminPersonSegmentLabels\[personSegment\]\}/);
  assert.match(dossier, /status=\{adminDossierStatusLabel\(intake\?\.status\)\}/);
  assert.match(dossier, /counselor=\{assignedAdminName\}/);
  assert.match(dossier, /lastContact=\{latestContact \? formatDate\(latestContact\.occurred_at\) : null\}/);
  assert.match(dossier, /action=\{nextAction\}/);
  assert.match(dossier, /blockers=\{blockers\.map/);
  assert.match(dossier, /lastEvent=\{historyRows\[0\]/);
  assert.match(brief, /L’essentiel de ce dossier/);
  for (const label of ["Situation enregistrée","Conseiller responsable","Dernier contact journalisé","Action Campus prioritaire","Dernier événement consigné"]) {
    assert.ok(brief.includes(label), label);
  }
});

test("summary never invents an assignment, last contact, successful admission or consular decision", () => {
  assert.match(brief, /counselor \|\| "Non attribué"/);
  assert.match(brief, /lastContact \|\| "Aucun contact enregistré"/);
  assert.match(brief, /!counselor/);
  assert.match(brief, /ne garantit pas l’admission ni l’obtention du visa/);
  assert.match(brief, /action\.waiting/);
  assert.match(brief, /"En attente"/);
  assert.match(brief, /"Aucun événement enregistré dans l’historique."/);
  assert.match(dossier, /prospect\?\.email/);
  assert.match(dossier, /"Personne sans nom enregistré"/);
});

test("the only featured official deadline is a verified not-submitted application", () => {
  assert.match(dossier, /nextVerifiedApplicationDeadline/);
  assert.match(dossier, /isActiveApplication\(application\.status\)/);
  assert.match(dossier, /!isSubmittedApplicationStatus\(application\.status\)/);
  assert.match(dossier, /application\.deadline_kind === "official_hard_deadline"/);
  assert.match(dossier, /applicationDateIsTrusted\(application\)/);
  assert.match(deadlineRisk, /deadline_source_url/);
  assert.match(deadlineRisk, /deadline_verified_at/);
  assert.match(deadlineRisk, /deadline_cycle/);
  assert.match(brief, /Échéance officielle vérifiée · candidature/);
  assert.match(brief, /nextDeadline \?/);
  assert.match(brief, /Contrôler la source/);
});

test("same dossier and authoritative operational controls remain open and editable", () => {
  for(const component of ["AdminDossierActionsPanel","AdminDossierBlockersPanel","AdminCaseOwnerPanel","AdminCaseJournalPanel","DossierMessageThread","AdminDocumentRequirementsPanel","AdminStudentProjectPanel","ActivityTimeline"]) {
    assert.ok(dossier.includes(component), component);
  }
  for(const anchor of ['id="assignment"','id="overview"','id="history"','id="messages"','id="actions"','id="documents"','id="applications"']) {
    assert.ok(dossier.includes(anchor),anchor);
  }
  assert.match(brief, /href="#assignment"/);
  assert.match(brief, /href="#journal"/);
  assert.match(brief, /href="#history"/);
  assert.match(brief, /href="#blockers"/);
  assert.match(dossier, /Enregistrement retiré des opérations/);
  assert.equal((dossier.match(/<AdminCounselorBrief/g)||[]).length,1);
});
