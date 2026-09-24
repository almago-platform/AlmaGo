import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/echeances/page.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/student/applications/page.tsx", "utf8");
const applicationsPanel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
const adminApplicationsPanel = readFileSync("src/components/admin/AdminApplicationsPanel.tsx", "utf8");
const documentsPanel = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const helpPage = readFileSync("src/app/aide/page.tsx", "utf8");
const phase4 = readFileSync("src/lib/phase4.ts", "utf8");
const studentQuality = readFileSync("tests/e2e/student-space-quality.spec.mjs", "utf8");

test("deadline center uses only real application deadlines", () => {
  assert.match(page, /from\("applications"\)/);
  assert.match(page, /\.not\("deadline", "is", null\)/);
  assert.match(page, /isActiveApplication\(application\.status\)/);
  assert.match(page, /daysUntilDeadline\(application\.deadline\)/);
  assert.match(page, /Aucune échéance active n’est enregistrée/);
});

test("deadline center keeps official-source boundaries visible", () => {
  assert.match(page, /Source officielle/);
  assert.match(page, /source_url/);
  assert.match(page, /application_url/);
  assert.match(page, /function officialSourceUrl/);
  assert.match(page, /url\.protocol === "https:" \|\| url\.protocol === "http:"/);
  assert.match(page, /const checkedAt = sourceUrl \? verificationDate/);
  assert.match(page, /Dernière date de vérification enregistrée dans AlmaGo/);
  assert.match(page, /Confirmez toujours l’échéance sur la source officielle/);
  assert.match(page, /ne remplace pas les délais publiés/);
  assert.doesNotMatch(page, /chance|probabilit[eé]|score|garanti/i);
});

test("deadline countdown follows the existing Berlin date model", () => {
  assert.match(phase4, /export function daysUntilDeadline/);
  assert.match(phase4, /timeZone: "Europe\/Berlin"/);
  assert.match(phase4, /86_400_000/);
  assert.match(page, /timeZone: "Europe\/Berlin"/);
});

test("student navigation and dashboard expose the deadline center", () => {
  assert.match(shell, /Mes échéances/);
  assert.match(shell, /href: "\/student\/echeances"/);
  assert.match(dashboard, /href="\/student\/echeances"/);
  assert.match(dashboard, /Voir toutes mes échéances/);
  assert.match(applicationsPage, /href="\/student\/echeances"/);
  assert.match(shell, /overflow-y-auto/);
  assert.match(page, /Besoin d’aide pour une échéance/);
  assert.match(helpPage, /Mes échéances/);
  assert.match(studentQuality, /path: "\/student\/echeances", name: "deadlines"/);
});


test("deadline center uses one render instant for every countdown", () => {
  assert.match(page, /const now = new Date\(\)/);
  assert.match(page, /daysUntilDeadline\(application\.deadline, now\)/);
  assert.doesNotMatch(page, /daysUntilDeadline\(application\.deadline\) : null/);
});


test("deadline center describes its chronological ordering accurately", () => {
  assert.match(page, /Les dates sont classées chronologiquement/);
  assert.doesNotMatch(page, /de la plus proche à la plus éloignée/);
});

test("official deadline source link announces its new tab", () => {
  assert.match(page, /aria-label=\{\`Consulter la page officielle de/);
  assert.match(page, /\(nouvel onglet\)/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /rel="noreferrer"/);
});


test("student application surfaces use the human event formatter", () => {
  assert.match(applicationsPanel, /applicationEventDisplayMessage\(event\.event_type, event\.message\)/);
  assert.match(dashboard, /applicationEventDisplayMessage\(event\.event_type, event\.message\)/);
});


test("student document history uses the institutional message formatter", () => {
  assert.match(documentsPanel, /studentHistoryDisplayMessage\(event\.message\)/);
  assert.match(dashboard, /studentHistoryDisplayMessage\(event\.message\)/);
});


test("admin applications preserve legacy states without offering them as new transitions", () => {
  assert.match(adminApplicationsPanel, /databaseApplicationStatuses\.map/);
  assert.match(adminApplicationsPanel, /historique/);
  assert.match(adminApplicationsPanel, /applicationStatuses\.map/);
});


test("original legacy status remains selectable until save", () => {
  assert.match(
    adminApplicationsPanel,
    /applicationStatuses\.includes\(application\.status as/,
  );
  assert.match(adminApplicationsPanel, /option value=\{application\.status\}/);
  assert.doesNotMatch(
    adminApplicationsPanel,
    /applicationStatuses\.includes\(edit\.status as/,
  );
});
