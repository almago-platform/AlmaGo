import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dossier = readFileSync("src/app/admin/dossiers/[studentId]/page.tsx", "utf8");
const navigation = readFileSync("src/components/admin/AdminDossierNavigation.tsx", "utf8");
const disclosure = readFileSync("src/components/admin/AdminDossierDisclosure.tsx", "utf8");

test("UX-2 shows six primary tasks, with advanced tasks still discoverable", () => {
  const primary = navigation.slice(navigation.indexOf("const primaryLinks"), navigation.indexOf("const supplementaryLinks"));
  const advanced = navigation.slice(navigation.indexOf("const supplementaryLinks"), navigation.indexOf("type Counts"));
  for (const name of ["Résumé", "Actions", "Messages", "Documents", "Candidatures", "Historique"]) {
    assert.ok(primary.includes('label: "' + name + '"'), name);
  }
  for (const name of ["Blocages", "Journal interne", "Conseiller", "Projet", "Orientation", "Offre et paiement"]) {
    assert.ok(advanced.includes('label: "' + name + '"'), name);
  }
  assert.match(navigation, /aria-label="Rubriques principales"/);
  assert.match(navigation, /aria-current=\{activeHash === href \? "location"/);
  assert.match(navigation, /sticky top-\[4\.25rem\]/);
  assert.match(navigation, /overflow-x-auto/);
  assert.match(navigation, /focus-visible:outline-2/);
});

test("primary navigator counters derive from recorded data and do not invent tasks", () => {
  assert.match(dossier, /actions: dossierActions\.filter\(\(item\) => isHumanAdminAction\(item\)\)\.length/);
  assert.match(dossier, /messages: unreadStudentMessages/);
  assert.match(dossier, /documents: documentsAwaitingDecision\.length/);
  assert.match(dossier, /applications: applications\.length/);
  assert.match(navigation, /amount > 0/);
  assert.doesNotMatch(navigation, /fetch\(|supabase|service_role/);
});

test("long sections are disclosed by task while already existing operational screens remain mounted", () => {
  assert.equal((dossier.match(/<AdminDossierDisclosure/g) || []).length, 4);
  assert.equal((dossier.match(/<\/AdminDossierDisclosure>/g) || []).length, 4);
  assert.match(dossier, /targetIds=\{\["messages", "journal", "send-dossier-message"\]\}/);
  assert.match(dossier, /initiallyOpen=\{unreadStudentMessages > 0\}/);
  assert.match(dossier, /targetIds=\{\["project", "orientation"\]\}/);
  assert.match(dossier, /targetIds=\{\["commercial"\]\}/);
  assert.match(dossier, /targetIds=\{\["assignment", "history"\]\}/);
  for (const component of [
    "AdminDossierActionsPanel",
    "AdminDossierBlockersPanel",
    "DossierMessageThread",
    "AdminCaseJournalPanel",
    "AdminStudentProjectPanel",
    "AdminDocumentRequirementsPanel",
    "AdminCaseOwnerPanel",
    "AdminCounselorBrief",
    "AdminRecommendationApplicationAction",
    "AdminDossierHistory",
  ]) {
    assert.ok(dossier.includes("<" + component), component);
  }
});

test("links from outside the dossier and repeat clicks reveal collapsed panels", () => {
  assert.match(disclosure, /window\.location\.hash\.slice\(1\)/);
  assert.match(disclosure, /decodeURIComponent\(rawHash\)/);
  assert.match(disclosure, /details\.open = true/);
  assert.match(disclosure, /window\.addEventListener\("hashchange", revealFromLocation\)/);
  assert.match(disclosure, /document\.addEventListener\("click", revealOnClick\)/);
  assert.match(disclosure, /scrollIntoView\(\{ block: "start" \}\)/);
  assert.match(disclosure, /window\.removeEventListener\("hashchange", revealFromLocation\)/);
  assert.match(disclosure, /document\.removeEventListener\("click", revealOnClick\)/);
  for (const id of ["overview","blockers","actions","messages","journal","project","orientation","documents","commercial","applications","assignment","history"]) {
    if(id==="journal") assert.ok(readFileSync("src/components/admin/AdminCaseJournalPanel.tsx", "utf8").includes('id="journal"'));
    else assert.ok(dossier.includes('id="' + id + '"'), id);
  }
  assert.match(disclosure, /<details/);
  assert.match(disclosure, /<summary/);
  assert.doesNotMatch(disclosure, /display: ?none|aria-hidden="true"[^>]*>\{children\}/);
});

test("there are no schema changes, duplicated identities or sensitive writes in navigator", () => {
  for(const source of [navigation,disclosure]){
    assert.doesNotMatch(source, /supabase|\.from\(|\.insert\(|\.update\(|service_role|localStorage/);
  }
  assert.match(dossier, /Enregistrement retiré des opérations/);
  assert.match(dossier, /Les mutations sensibles restent dans leurs écrans métier dédiés/);
});
