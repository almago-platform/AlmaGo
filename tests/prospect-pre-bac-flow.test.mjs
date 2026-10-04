import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const intake = readFileSync("src/lib/campus-intake.ts", "utf8");
const prospectIntake = readFileSync("src/lib/prospect/intake.ts", "utf8");
const documentsPage = readFileSync("src/app/prospect/documents/page.tsx", "utf8");
const documentsPanel = readFileSync(
  "src/components/prospect/StarterDocumentsPanel.tsx",
  "utf8",
);
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const roadmap = readFileSync("src/app/prospect/roadmap/page.tsx", "utf8");
const journey = readFileSync(
  "src/components/prospect/ProspectJourneyProgress.tsx",
  "utf8",
);
const proposal = readFileSync("src/app/prospect/proposal/page.tsx", "utf8");
const admin = readFileSync("src/components/admin/AdminIntakePanel.tsx", "utf8");

test("pre-Bac starter evidence is limited to optional passport and language", () => {
  assert.match(intake, /preBacStarterDocumentCategories/);
  assert.match(
    intake,
    /category === "passport" \|\| item\.category === "language_certificate"/,
  );
  assert.match(intake, /required: false as const/);

  assert.match(intake, /category: "passport"[\s\S]*required: true/);
  assert.match(intake, /category: "baccalaureate"[\s\S]*required: true/);
  assert.match(intake, /category: "transcripts"[\s\S]*required: true/);
});

test("prospect intake summary derives required evidence from Bac status", () => {
  assert.match(
    prospectIntake,
    /loadProspectIntakeState\([\s\S]*bacStatus\?: string \| null/,
  );
  assert.match(
    prospectIntake,
    /requiredStarterDocumentCategoriesForBacStatus\(bacStatus\)/,
  );
});

test("documents page detects preparing Bac and renders optional-document mode", () => {
  assert.match(documentsPage, /restorePublicOrientationAnswers/);
  assert.match(documentsPage, /answers\.bacStatus === "preparing"/);
  assert.match(documentsPage, /preBac=\{preBac\}/);

  assert.match(documentsPanel, /preBac \? "preparing" : "obtained"/);
  assert.match(documentsPanel, /Aucun document obligatoire avant les résultats du Bac/);
  assert.match(documentsPanel, /0 document envoyé/);
  assert.match(documentsPanel, /Facultatif · si disponible/);
  assert.doesNotMatch(documentsPanel, /requiredStarterDocumentCategories\.length/);
});

test("pre-Bac students continue in preparation instead of a mandatory document gate", () => {
  assert.match(dashboard, /state\.answers\?\.bacStatus === "preparing"/);
  assert.match(dashboard, /Continuer ma préparation/);
  assert.match(dashboard, /preBac=\{preBac\}/);

  assert.match(journey, /Préparation avant le Bac/);
  assert.match(journey, /Résultats du Bac/);
  assert.match(journey, /Documents finaux/);
  assert.match(journey, /if \(preBac\) \{/);
  assert.match(journey, /intake\.status === "starter_documents"\) return 1/);
  assert.match(journey, /intake\.status === "route_proposed"[\s\S]*return 5/);
  assert.match(journey, /intake\.status === "payment_pending"[\s\S]*return 6/);

  assert.match(roadmap, /state\.answers\?\.bacStatus === "preparing"/);
  assert.match(roadmap, /preBacSteps\(locale\)/);
});

test("proposal and admin views distinguish preparation from the post-Bac dossier", () => {
  assert.match(proposal, /Projet avant le Bac/);
  assert.match(proposal, /La proposition académique[\s\S]*définitive viendra après vos résultats/);
  assert.match(proposal, /Documents facultatifs/);

  assert.match(admin, /const preBac = item\.orientation\.bacStatus === "preparing"/);
  assert.match(admin, /const preBac = item\.orientation\.bacStatus === "preparing"/);
  assert.match(admin, /Avant le Bac[\s\S]*Préparation aux études[\s\S]*Langue seule/);
  assert.match(admin, /Aucun Bac ni relevé final n’est exigé/);
  assert.match(admin, /\(preBac \|\| academicReady\)/);
  assert.match(admin, /"study_preparation", "standalone_language"/);
});
