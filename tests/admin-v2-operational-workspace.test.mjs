import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");
const documentsPage = readFileSync("src/app/admin/documents/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/admin/applications/page.tsx", "utf8");
const universitiesPanel = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");
const programsPanel = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");
const languagePanel = readFileSync("src/components/admin/AdminLanguageCoursesPanel.tsx", "utf8");
const financePanel = readFileSync("src/components/admin/AdminFinanceInsurancePanel.tsx", "utf8");

test("admin shell groups operational work separately from Germany catalogue maintenance", () => {
  assert.match(shell, /const adminGroups/);
  assert.match(shell, /label: "Personnes"/);
  assert.match(shell, /label: "Files de travail"/);
  assert.match(shell, /label: "Catalogue Allemagne"/);
  assert.match(shell, /lg:w-\[15\.5rem\]/);
  assert.match(shell, /lg:pl-\[15\.5rem\]/);
});

test("admin command center uses the compact workspace header", () => {
  assert.match(dashboard, /AdminPageHeader/);
  assert.match(dashboard, /section="Pilotage"/);
  assert.match(dashboard, /max-w-\[92rem\]/);
});

test("admin finance catalogue filter has an accessible name", () => {
  assert.match(
    financePanel,
    /<select aria-label="Filtrer le catalogue finance et assurance par catégorie" className="field max-w-xs"/,
  );
});

test("admin overview keeps small text on subtle surfaces above the A43 contrast floor", () => {
  assert.match(shell, /text-\[var\(--foreground-soft\)\]">\s*Espace équipe/);
  assert.match(dashboard, /<summary className="[^"]*text-slate-900[^"]*">\s*Ordre de traitement/);
  assert.match(
    programsPanel,
    /<dt className="text-xs font-semibold text-slate-700">\{label\}<\/dt>/,
  );
  assert.doesNotMatch(
    programsPanel,
    /<dt className="text-xs font-semibold text-slate-500">\{label\}<\/dt>/,
  );
});

test("documents and applications load profiles explicitly instead of invalid embedded joins", () => {
  assert.doesNotMatch(documentsPage, /profiles\(first_name,last_name\)/);
  assert.doesNotMatch(applicationsPage, /profiles\(first_name,last_name\)/);
  assert.match(documentsPage, /from\("profiles"\)\.select\("id,first_name,last_name"\)/);
  assert.match(applicationsPage, /from\("profiles"\)\.select\("id,first_name,last_name"\)/);
  assert.match(documentsPage, /profileById/);
  assert.match(applicationsPage, /profileById/);
});

test("operational load failures offer an explicit retry path", () => {
  assert.match(documentsPage, /AdminLoadError/);
  assert.match(documentsPage, /retryHref="\/admin\/documents"/);
  assert.match(applicationsPage, /AdminLoadError/);
  assert.match(applicationsPage, /retryHref="\/admin\/applications"/);
});

test("catalogue editors are list-first and open creation forms on demand", () => {
  for (const source of [universitiesPanel, programsPanel, languagePanel, financePanel]) {
    assert.match(source, /formOpen/);
    assert.match(source, /setFormOpen\(true\)/);
  }
  assert.match(universitiesPanel, /\+ Ajouter une université/);
  assert.match(programsPanel, /\+ Ajouter un programme/);
  assert.match(languagePanel, /\+ Ajouter un cours/);
  assert.match(financePanel, /\+ Ajouter une option/);
});
