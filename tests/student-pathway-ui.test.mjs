import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/pathway/page.tsx", "utf8");
const projectPage = readFileSync("src/app/student/project/page.tsx", "utf8");
const projectForm = readFileSync("src/components/student/StudentProjectForm.tsx", "utf8");
const projectCopy = readFileSync("src/content/student-project-copy.ts", "utf8");
const copy = readFileSync("src/content/student-pathway-copy.ts", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const dashboardCopy = readFileSync("src/content/student-dashboard-copy.ts", "utf8");

test("student pathway wires real project, evidence and language-course facts into the regulatory engine", () => {
  assert.match(page, /from\("student_projects"\)/);
  assert.match(page, /from\("academic_evidence"\)/);
  assert.match(page, /from\("language_courses"\)/);
  assert.match(page, /from\("finance_insurance_catalog"\)/);
  assert.match(page, /from\("student_checklist_items"\)/);
  assert.match(page, /from\("regulatory_sources"\)/);
  assert.match(page, /isRegulatoryRuleCurrent\(source, now\)/);
  assert.match(page, /filing_country/);
  assert.match(page, /regulatorySourceMatchesFilingCountry/);
  assert.match(page, /summarizeAcademicEvidence\(evidence, now\)/);
  assert.match(page, /isPublishableLanguageCourse\(selectedLanguageCourse, now\)/);
  assert.match(page, /catalogVerificationCutoff\(now\)/);
  assert.match(page, /\.gt\("verified_at", catalogueCutoff\)/);
  assert.match(page, /determineRegulatoryPath\(facts\)/);
});

test("student pathway exposes all canonical regulatory routes without claiming an official decision", () => {
  for (const route of ["STUDIUM", "STUDIENVORBEREITUNG", "STUDIENPLATZSUCHE", "SPRACHKURS"]) {
    assert.ok(copy.includes(route));
  }
  assert.ok(copy.includes("ne constitue ni une décision d’admission ni une décision de visa ou de titre de séjour"));
  assert.ok(copy.includes("toute décision relative à un visa ou à un titre de séjour restent du ressort"));
  assert.doesNotMatch(page, /visa garanti|éligible au visa|probabilit[ée] d['’]admission|chance d['’]admission/i);
  assert.match(page, /decision\.reason_code/);
});

test("pathway fails closed when a required data source cannot be loaded", () => {
  assert.match(page, /projectResult\.error/);
  assert.match(page, /documentsResult\.error/);
  assert.match(page, /evidenceResult\.error/);
  assert.match(page, /coursesResult\.error/);
  assert.match(page, /financeResult\.error/);
  assert.match(page, /checklistResult\.error/);
  assert.match(page, /regulatorySourcesResult\.error/);
  assert.ok(copy.includes("AlmaGo ne propose aucun parcours par défaut"));
  assert.match(page, /PathwayUnavailable copy=\{t\}/);
});

test("next actions remain bounded to existing student surfaces", () => {
  for (const href of [
    "/student/project",
    "/student/documents",
    "/student/language-courses",
    "/student/orientation",
    "/student/checklist",
    "/student/finance-insurance",
  ]) {
    assert.ok(copy.includes(href) || page.includes(href));
  }
});

test("the real student shell and dashboard expose the pathway page", () => {
  assert.ok(nativeCopy.includes('"Parcours Allemagne"'));
  assert.ok(shell.includes("/student/pathway"));
  assert.ok(nativeCopy.includes('"Financement & assurance"'));
  assert.ok(shell.includes("/student/finance-insurance"));
  assert.ok(dashboardCopy.includes('pathwayCta: "Voir mes étapes"'));
  assert.ok(dashboard.includes("/student/pathway"));
});

test("pathway exposes only current official regulatory sources and fails closed on stale data", () => {
  assert.ok(copy.includes('officialEyebrow: "Sources officielles"'));
  assert.ok(copy.includes('officialTitle: "Règles à vérifier pour votre situation"'));
  assert.ok(copy.includes('revalidation: "Revalidation requise"'));
  assert.ok(copy.includes("AlmaGo n’affiche donc pas de règle par défaut"));
  assert.match(page, /copy\.sources\.official/);
  assert.doesNotMatch(page, /source\.verification_status === "verified" && source\.verified_at/);
});

test("country-specific regulatory sources are never inferred from nationality", () => {
  assert.ok(copy.includes('filingCountry: "Pays de résidence \/ dépôt"'));
  assert.ok(copy.includes("AlmaGo ne déduit pas ce pays de votre nationalité"));
  assert.match(page, /originCountry\.toUpperCase\(\) === filingCountry\.toUpperCase\(\)/);
  assert.doesNotMatch(page, /nationality|nationalité.*===|Tunisienne/i);
});

test("student project and pathway render localized copy through the canonical brand layer", () => {
  assert.match(projectPage, /const t = rebrandCopy\(studentProjectCopy\[locale\]\)/);
  assert.match(projectForm, /const t = rebrandCopy\(studentProjectCopy\[locale\]\)/);
  assert.match(page, /const t = rebrandCopy\(studentPathwayCopy\[locale\]\)/);
  assert.match(page, /const projectCopy = rebrandCopy\(studentProjectCopy\[locale\]\)/);
  assert.match(projectCopy, /AlmaGo/);
  assert.match(copy, /AlmaGo/);
});
