import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const nav = read("src/components/layout/AppShell.tsx");
const dashboard = read("src/app/admin/page.tsx");
const people = read("src/app/admin/people/page.tsx");
const prospects = read("src/app/admin/prospects/page.tsx");
const intake = read("src/components/admin/AdminIntakePanel.tsx");
const journey = read("src/app/admin/accompagnement/page.tsx");
const treatment = read("src/app/admin/traitement/page.tsx");

test("the daily nav exposes the essential workspaces and keeps all expert tools", () => {
  for (const href of ["/admin/people", "/admin/traitement", "/admin/accompagnement", "/admin/prospects", "/admin/team", "/admin/documents", "/admin/payments", "/admin/applications", "/admin/universities"]) {
    assert.ok(nav.includes('href: "' + href + '"'), "Missing navigation " + href);
  }
  assert.match(nav, /group\.label\} · \{group\.items\.length\}/);
  assert.match(nav, /label: "Personnes et dossiers"/);
  assert.match(nav, /label: "À traiter"/);
  assert.match(nav, /label: "Services et paiements"/);
  assert.match(nav, /label: "Catalogue Allemagne"/);
  assert.match(nav, /label: "Administration avancée"/);
  assert.match(nav, /Espace administration/);
});

test("dashboard prioritizes actual operational signals rather than simulated work", () => {
  assert.match(dashboard, /À traiter maintenant/);
  assert.match(dashboard, /Mes prochaines actions/);
  assert.match(dashboard, /number: myCases/);
  assert.match(dashboard, /number: intakeAttention/);
  assert.match(dashboard, /number: missingNextActionCases/);
  assert.match(dashboard, /number: documents/);
  assert.match(dashboard, /indicateurs détaillés/);
  assert.match(dashboard, /applicationOfficialDeadlineUrgency/);
  assert.match(dashboard, /\/admin\/intake/);
});

test("person and prospect lists disclose the full workflow on selection", () => {
  for (const file of [people, prospects]) {
    assert.match(file, /<summary/);
    assert.match(file, /<details/);
    assert.match(file, /<\/details>/);
  }
  for (const anchor of ["#messages","#orientation","#actions","#history"]) {
    assert.ok(people.includes(anchor));
  }
  for (const step of ["Projet étudiant", "Demande et contact", "Orientation et qualification", "Décision de qualification"]) {
    assert.ok(prospects.includes(step));
  }
  assert.match(prospects, /prospect\.contact_consent/);
  assert.match(prospects, /ProspectQualificationReviewForm/);
});

test("offer validation keeps server-side permissions and financial checks", () => {
  assert.match(intake, /api\/admin\/intake/);
  assert.match(intake, /method: "POST"/);
  assert.match(intake, /commercialLocked/);
  assert.match(intake, /academicReady/);
  assert.match(intake, /preBacRouteAllowed/);
  assert.match(intake, /canPropose/);
  assert.match(intake, /<summary/);
  assert.match(intake, /<\/details>/);
  assert.match(intake, /Aucun.*Bac|Aucun Bac/);
});

test("the A to Z journey counts only persisted operational cues, not invented visas", () => {
  assert.match(journey, /phaseCounts = new Map/);
  assert.match(journey, /firstKnownMilestone\(item\.evidence, item\.visaStatus\)/);
  assert.match(journey, /Repère de dossier, non preuve/);
  assert.match(journey, /checklists officielles/);
  assert.match(journey, /visaResult\.error/);
  assert.match(journey, /Suivi visa/);
});

test("the treatment center uses real RLS-scoped query counts and links to existing business modules", () => {
  assert.match(treatment, /getAdminUser/);
  assert.match(treatment, /if \(!user \|\| !isAdmin\)/);
  assert.match(treatment, /count: "exact", head: true/);
  assert.match(treatment, /user_id", user\.id/);
  for (const route of ["/admin/inbox","/admin/documents","/admin/applications","/admin/people?work=official_7","/admin/intake"]) {
    assert.ok(treatment.includes(route), route);
  }
  assert.match(treatment, /query failure|requête|compteur n’est pas disponible/i);
  assert.doesNotMatch(treatment, /createAdminClient|service_role|fakeCount/);
});
