import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/prospect/page.tsx");
const orientation = read("src/app/prospect/orientation/page.tsx");
const proposal = read("src/app/prospect/proposal/page.tsx");
const catalogue = read("src/app/prospect/catalogue/page.tsx");
const recommendation = read("src/components/prospect/ProspectProgrammeRecommendationCard.tsx");
const catalogueCard = read("src/components/prospect/ProspectProgrammeCatalogueCard.tsx");
const cover = read("src/components/prospect/ProspectUniversityCover.tsx");
const documents = read("src/components/prospect/StarterDocumentsPanel.tsx");
const roadmap = read("src/app/prospect/roadmap/page.tsx");
const solutions = read("src/app/prospect/solutions/page.tsx");
const shell = read("src/components/layout/ProspectShell.tsx");
const designSystem = read("src/app/design-system.css");

test("V3.2.1 keeps the dashboard focused and moves detailed qualification to orientation", () => {
  assert.match(dashboard, /JourneyRail/);
  assert.match(dashboard, /NextActionPanel/);
  assert.match(dashboard, /ResponsibilityStrip/);
  assert.match(dashboard, /ProspectProgrammeRecommendationCard/);
  assert.doesNotMatch(dashboard, /ProspectQualificationSummary/);
  assert.doesNotMatch(dashboard, /orientationVersionSummary/);
  assert.match(orientation, /ProspectQualificationSummary/);
});

test("V3.2.1 orientation uses compact programme discovery instead of duplicated cards", () => {
  assert.match(orientation, /recommendations\.length/);
  assert.match(orientation, /href="\/prospect\/catalogue"/);
  assert.doesNotMatch(orientation, /ProspectProgrammeRecommendationCard/);
});

test("V3.2.1 proposal does not render a second waiting panel for starter documents", () => {
  assert.match(proposal, /starterDocuments \? \(/);
  assert.match(proposal, /!starterDocuments/);
  assert.match(proposal, /dashboardCopy\.documents/);
  assert.match(proposal, /t\.reviewTitle/);
  assert.match(proposal, /t\.readyTitle/);
});

test("V3.2.1 catalogue removes ranking-like fallback numbers and localizes UI languages", () => {
  assert.doesNotMatch(cover, /editorialIndex|padStart\(2/);
  assert.doesNotMatch(catalogue, /visualIndex/);
  assert.match(recommendation, /localizedTeachingLanguage/);
  assert.match(catalogueCard, /localizedTeachingLanguage/);
  assert.match(recommendation, /Allemand \/ anglais/);
  assert.match(catalogueCard, /Deutsch \/ Englisch/);
  assert.match(recommendation, /<details/);
  assert.match(catalogueCard, /<details/);
});

test("V3.2.1 document picker exposes selected file metadata and reversible actions", () => {
  assert.match(documents, /selectedFileType/);
  assert.match(documents, /selectedFileSize/);
  assert.match(documents, /formattedFileSize/);
  assert.match(documents, /Prêt à être envoyé/);
  assert.match(documents, /Remplacer/);
  assert.match(documents, /Retirer/);
});

test("V3.2.1 roadmap and solutions adapt to real state density", () => {
  assert.match(roadmap, /positionLabel/);
  assert.match(roadmap, /lg:grid-cols-\[minmax\(14rem,0\.65fr\)_minmax\(0,1\.35fr\)\]/);
  assert.match(solutions, /solutionGridClass/);
  assert.match(solutions, /count === 4/);
});

test("V3.2.1 keeps service navigation intentional and static premium surfaces still", () => {
  assert.match(shell, /ring-\[var\(--accent\)\]\/25/);
  assert.match(shell, /bg-\[var\(--brand\)\]/);
  assert.match(designSystem, /\.pc-premium-card\.pc-card-interactive:hover/);
  assert.doesNotMatch(designSystem, /\n\.pc-premium-card:hover \{/);
});
