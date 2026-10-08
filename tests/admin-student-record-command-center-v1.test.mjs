import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");
const people = readFileSync("src/app/admin/people/page.tsx", "utf8");
const dossier = readFileSync("src/app/admin/dossiers/[studentId]/page.tsx", "utf8");
const plan = readFileSync("docs/ADMIN_DOSSIER_CENTRAL_MASTER_PLAN_V1_20261008.md", "utf8");

test("admin home searches the existing secured people directory, no new endpoint", () => {
  assert.match(dashboard, /role="search"/);
  assert.match(dashboard, /method="get" action="\/admin\/people"/);
  assert.match(dashboard, /name="q"/);
  assert.match(dashboard, /id="admin-global-person-search"/);
  assert.match(dashboard, /htmlFor="admin-global-person-search"/);
  assert.match(dashboard, /type="search"/);
  assert.match(people, /q\?: string/);
  assert.match(people, /\(params\.q \|\| ""\)/);
  assert.match(people, /name="q"/);
  assert.match(people, /href=\{\x60\/admin\/dossiers\/\$\{person\.userId\}\x60\}/);
});

test("dossier navigates primarily by person task and keeps all deep links", () => {
  assert.match(dossier, /aria-label="Navigation du dossier"/);
  assert.match(dossier, /Fiche conseiller/);
  for (const [href, label] of [
    ["#overview", "Résumé"],
    ["#history", "Historique"],
    ["#messages", "Messages"],
    ["#actions", "Actions"],
    ["#documents", "Documents"],
    ["#applications", "Candidatures"],
    ["#blockers", "Blocages"],
    ["#journal", "Journal interne"],
    ["#project", "Projet"],
    ["#orientation", "Orientation"],
    ["#commercial", "Offre & paiement"],
  ]) {
    assert.ok(dossier.includes('["' + href + '", "' + label + '"]'), href);
  }
  assert.match(dossier, /Autres étapes et outils/);
  assert.match(dossier, /<details className=/);
  assert.match(dossier, /focus-visible:outline-2/);
  for (const anchor of ["overview", "history", "messages", "actions", "documents", "applications"]) {
    assert.ok(dossier.includes('id="' + anchor + '"'));
  }
});

test("the UX master plan preserves canonical procedure rules and review gates", () => {
  assert.match(plan, /CAMPUS_ALLEMAGNE_READ_FIRST\.md/);
  assert.match(plan, /PROCEDURE_DEADLINE_ENGINE_PLAN\.md/);
  assert.match(plan, /UX-0/);
  assert.match(plan, /UX-8/);
  assert.match(plan, /RLS/);
  assert.match(plan, /pas de nouvelle requête Supabase/i);
  assert.match(plan, /pas de date officielle sans source/i);
  assert.match(plan, /Ne pas tout fusionner d'un coup/);
});

test("phase zero does not replace existing sensitive dossier controls", () => {
  for (const primitive of [
    "AdminDossierActionsPanel",
    "AdminCaseJournalPanel",
    "AdminCaseOwnerPanel",
    "DossierMessageThread",
    "AdminDocumentRequirementsPanel",
    "AdminStudentProjectPanel",
    "NextActionPanel",
    "ActivityTimeline",
  ]) {
    assert.ok(dossier.includes(primitive), primitive);
  }
  assert.match(dossier, /Les mutations sensibles restent dans leurs écrans métier dédiés/);
  assert.match(dossier, /erased-/);
});
