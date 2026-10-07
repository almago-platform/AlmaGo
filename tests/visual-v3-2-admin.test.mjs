import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const intake = read("src/components/admin/AdminIntakePanel.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const loadError = read("src/components/admin/AdminLoadError.tsx");
const header = read("src/components/admin/AdminPageHeader.tsx");
const logo = read("src/components/brand/BrandLogo.tsx");

test("Admin V3.2 preserves the established dark workspace header", () => {
  assert.match(header, /admin-page-header/);
  assert.match(header, /bg-\[#17191b\]/);
  assert.match(header, /#d80621/);
  assert.match(header, /#f4b400/);
  assert.match(dashboard, /AdminPageHeader/);
  assert.match(dashboard, /section="Pilotage"/);
});

test("Admin V3.2 premiumizes the command center without changing priority truth", () => {
  assert.match(dashboard, /PremiumSectionHeader/);
  assert.match(dashboard, /pc-card/);
  assert.match(dashboard, /File opérationnelle consolidée/);
  assert.match(dashboard, /AdminQueueRow/);
  assert.match(dashboard, /Dossiers Campus/);
  assert.match(dashboard, /Réponse étudiant reçue/);
  assert.match(dashboard, /from\("student_intake_cases"\)/);
  assert.match(dashboard, /eq\("status", "student_question"\)/);
});

test("Admin V3.2 premiumizes dossier 360 while preserving its read-only context contract", () => {
  for (const primitive of [
    "DossierHeader",
    "JourneyRail",
    "NextActionPanel",
    "DocumentRow",
    "DataList",
    "ActivityTimeline",
    "PremiumSectionHeader",
    "PremiumEmptyState",
  ]) {
    assert.match(dossier, new RegExp(primitive));
  }
  assert.match(dossier, /pc-panel/);
  assert.match(dossier, /pc-card/);
  assert.match(dossier, /Dossier étudiant · vue 360°/);
  assert.match(dossier, /Les mutations sensibles restent dans leurs écrans métier dédiés/);
  assert.match(dossier, /eyebrow="Action Campus prioritaire"/);
  for (const table of [
    'from("profiles")',
    'from("prospects")',
    'from("student_intake_cases")',
    'from("customer_access")',
    'from("documents")',
    'from("applications")',
    'from("commercial_purchases")',
  ]) {
    assert.ok(dossier.includes(table));
  }
});

test("Admin V3.2 preserves student-Campus coordination in the intake queue", () => {
  assert.match(intake, /PremiumEmptyState/);
  assert.match(intake, /pc-panel/);
  assert.match(intake, /pc-soft-strip/);
  assert.match(intake, /buttonClassName/);
  assert.match(intake, /fetch\(\`\/api\/admin\/intake\/\$\{item\.studentId\}\`/);
  assert.match(intake, /20_000/);
  assert.match(intake, /Réponse étudiant reçue · action requise/);
  assert.match(intake, /href=\{\`\/admin\/dossiers\/\$\{item\.studentId\}\`\}/);
  assert.match(intake, /Ouvrir le dossier 360°/);
});

test("Admin V3.2 premiumizes document review without changing the review endpoint", () => {
  assert.match(documents, /PremiumEmptyState/);
  assert.match(documents, /pc-card/);
  assert.match(documents, /fetch\(\`\/api\/admin\/documents\/\$\{id\}\/review\`/);
  assert.match(documents, /reviewStatuses/);
  assert.match(documents, /Remplacement demandé/);
});

test("Admin V3.2 premiumizes application review without changing workflow transitions", () => {
  assert.match(applications, /PremiumEmptyState/);
  assert.match(applications, /pc-card/);
  assert.match(applications, /pc-soft-strip/);
  assert.match(applications, /allowedApplicationTransitions/);
  assert.match(applications, /transitionRequirements/);
  assert.match(applications, /fetch\(\`\/api\/admin\/applications\/\$\{id\}\/status\`/);
});

test("Admin V3.2 uses a premium but fail-safe load error surface", () => {
  assert.match(loadError, /pc-card/);
  assert.match(loadError, /role="alert"/);
  assert.match(loadError, /retryHref/);
  assert.match(loadError, /Les données existantes n’ont pas été modifiées/);
});

test("Admin V3.2 keeps approved Campus Allemagne brand assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
