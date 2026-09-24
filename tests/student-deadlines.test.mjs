import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/echeances/page.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const phase4 = readFileSync("src/lib/phase4.ts", "utf8");

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
  assert.match(page, /Fiche programme vérifiée dans AlmaGo le/);
  assert.match(page, /ne remplace pas les délais publiés/);
  assert.doesNotMatch(page, /chance|probabilit[eé]|score|garanti/i);
});

test("deadline countdown follows the existing Berlin date model", () => {
  assert.match(phase4, /export function daysUntilDeadline/);
  assert.match(phase4, /timeZone: "Europe\/Berlin"/);
  assert.match(phase4, /86_400_000/);
});

test("student navigation and dashboard expose the deadline center", () => {
  assert.match(shell, /Mes échéances/);
  assert.match(shell, /href: "\/student\/echeances"/);
  assert.match(dashboard, /href="\/student\/echeances"/);
  assert.match(dashboard, /Voir toutes mes échéances/);
});
