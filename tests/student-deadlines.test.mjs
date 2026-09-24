import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/echeances/page.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/student/applications/page.tsx", "utf8");
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
  assert.match(page, /Fiche programme vérifiée dans AlmaGo le/);
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
