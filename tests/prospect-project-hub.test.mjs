import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const shell = read("src/components/layout/ProspectShell.tsx");
const dashboard = read("src/app/prospect/page.tsx");
const orientation = read("src/app/prospect/orientation/page.tsx");
const proposal = read("src/app/prospect/proposal/page.tsx");
const roadmap = read("src/app/prospect/roadmap/page.tsx");
const catalogue = read("src/app/prospect/catalogue/page.tsx");
const solutions = read("src/app/prospect/solutions/page.tsx");
const documents = read("src/components/prospect/StarterDocumentsPanel.tsx");
const hub = read("src/lib/prospect/hub.ts");

test("prospect project hub has dedicated destinations instead of anchor-only navigation", () => {
  assert.doesNotMatch(shell, /\/prospect#/);
  for (const route of [
    "/prospect/orientation",
    "/prospect/catalogue",
    "/prospect/proposal",
    "/prospect/roadmap",
    "/prospect/documents",
    "/prospect/solutions",
  ]) {
    assert.match(shell, new RegExp(route.replaceAll("/", "\\/")));
  }
});

test("first dashboard centres progress, next action and Campus responsibility", () => {
  assert.match(dashboard, /ProspectJourneyProgress/);
  assert.match(dashboard, /nextAction/);
  assert.match(dashboard, /campusWork/);
  assert.match(dashboard, /proposalStatus/);
  assert.match(dashboard, /documentsSummary/);
  assert.match(dashboard, /browseCatalogue/);
  assert.match(dashboard, /browseSolutions/);
});

test("orientation and proposal remain separate product concepts", () => {
  assert.match(orientation, /Orientation actuelle|orientation/i);
  assert.match(orientation, /IntakeFlowCard/);
  assert.match(proposal, /IntakeFlowCard/);
  assert.match(proposal, /\/prospect\/catalogue/);
  assert.match(proposal, /\/prospect\/solutions/);
});

test("roadmap models the full project lifecycle without guaranteeing outcomes", () => {
  for (const token of [
    "Orientation",
    "Documents",
    "Analyse Campus",
    "Proposition",
    "Procédure",
    "Candidatures",
    "Admission",
    "Visa & départ",
  ]) {
    assert.match(roadmap, new RegExp(token));
  }
  assert.match(roadmap, /ne peut jamais être garantie/);
});

test("prospect can browse the verified academic catalogue before the proposal", () => {
  assert.match(catalogue, /loadVerifiedProgrammeCatalogue/);
  assert.match(catalogue, /degree/);
  assert.match(catalogue, /field/);
  assert.match(catalogue, /city/);
  assert.match(catalogue, /programmeSourceUrl/);
  assert.match(catalogue, /applicationUrl/);
  assert.match(catalogue, /matchesProject/);
  assert.doesNotMatch(catalogue, /admission probability|guaranteed admission/i);
});

test("prospect solutions expose factual language and finance catalogues before proposal", () => {
  assert.match(solutions, /from\("language_courses"\)/);
  assert.match(solutions, /from\("finance_insurance_catalog"\)/);
  assert.match(solutions, /isPublishableFinanceInsuranceOption/);
  assert.match(solutions, /official_source_url/);
  assert.match(solutions, /source_url/);
});

test("qualification upload replaces the raw browser file-control copy with a guided picker", () => {
  assert.match(documents, /id="prospect-document-file"/);
  assert.match(documents, /className="sr-only"/);
  assert.match(documents, /Choisir un fichier/);
  assert.match(documents, /10 MiB maximum/);
  assert.match(documents, /requiredProgress/);
  assert.match(documents, /Pas encore envoyé/);
  assert.match(documents, /En cours de vérification/);
  assert.match(documents, /Validé par Campus Allemagne/);
});

test("shared hub loader keeps orientation recovery, qualification and intake in one server boundary", () => {
  assert.match(hub, /findRecoverableOrientationForAccount/);
  assert.match(hub, /prospect_qualifications/);
  assert.match(hub, /loadProspectIntakeState/);
  assert.match(hub, /buildProspectRoadmap/);
});
