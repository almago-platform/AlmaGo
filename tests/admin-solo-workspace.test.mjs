import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const helper = readFileSync("src/lib/admin/solo-workspace.ts", "utf8");
const overview = readFileSync("src/app/admin/page.tsx", "utf8");
const people = readFileSync("src/app/admin/people/page.tsx", "utf8");
const quick = readFileSync("src/components/admin/AdminQuickActionCompleteButton.tsx", "utf8");

test("solo mode requires exactly one administrator and the active admin identity", () => {
  assert.match(helper, /adminIds\.length === 1 && adminIds\[0\] === currentAdminId/);
  assert.match(overview, /isSoloAdmin\(adminRolesResult\.data\?\.map/);
  assert.match(people, /isSoloAdmin\(adminIds, currentAdmin\?\.id/);
});

test("dashboard and people share the same non-mutating portfolio rule", () => {
  assert.match(helper, /assignedAdminId === currentAdminId \|\| \(soloAdmin && !assignedAdminId\)/);
  assert.match(overview, /belongsToAdminPortfolio\(assignmentByStudent\.get\(id\), currentAdmin\.id, soloAdmin\)/);
  assert.match(overview, /belongsToAdminPortfolio\(assignmentByStudent\.get\(item\.student_id\), currentAdmin\.id, soloAdmin\)/);
  assert.match(people, /belongsToAdminPortfolio\(item\.assignedAdminId, currentAdmin\?\.id, soloAdmin\)/);
  assert.doesNotMatch(helper, /\.update\(|\.insert\(|\.delete\(/);
});

test("solo dashboard leads with actionable priority and tasks before statistics", () => {
  const priority = overview.indexOf('<section aria-label="Priorité opérationnelle"');
  const actions = overview.indexOf('<section className="mb-6" aria-labelledby="my-actions-title"');
  const metrics = overview.indexOf('<section aria-labelledby="daily-cockpit-title"');
  assert.ok(priority > 0 && actions > priority && metrics > actions);
  assert.match(overview, /soloAdmin \? "Mon bureau" : "Vue d’ensemble"/);
});

test("solo people workspace retains open unassigned cases and hides team-only filter", () => {
  assert.match(people, /work === "mine" && \(!item\.userId \|\| item\.segment === "archived"/);
  assert.match(people, /soloAdmin \? "Mes dossiers" : "Dossiers de l’équipe"/);
  assert.match(people, /\{!soloAdmin \? <label/);
});

test("the consolidated queue makes pending orientation reviews visible without publishing them", () => {
  assert.match(overview, /from\("orientation_human_reviews"\).*\.eq\("review_status", "pending"\)/);
  assert.match(overview, /title="Audits d’orientation en attente"/);
  assert.match(overview, /aucune recommandation étudiant n’est publiée par cette revue/);
});

test("solo dashboard never mixes completed client dossiers into the active queue", () => {
  assert.match(overview, /const completedIds = new Set\(/);
  assert.match(overview, /if \(!completedIds\.has\(item\.student_id\)\) operationalIds\.add/);
  assert.match(overview, /operationalIds\.has\(item\.student_id\) && belongsToAdminPortfolio/);
});

test("solo quick completion uses the existing audited admin action route", () => {
  assert.match(overview, /<AdminQuickActionCompleteButton studentId=\{item\.student_id\} actionId=\{item\.id\}/);
  assert.match(quick, /fetch\(`\/api\/admin\/dossiers\/\$\{studentId\}\/actions`/);
  assert.match(quick, /method: "PATCH"/);
  assert.match(quick, /operation: "complete"/);
  assert.match(quick, /window\.confirm\(/);
  assert.match(quick, /router\.refresh\(\)/);
  assert.doesNotMatch(quick, /createPrivilegedSupabaseClient|service_role|\.from\(/);
});

test("every linked student row exposes orientation, messaging, actions and recorded activity", () => {
  assert.match(people, /aria-label=\{`Accès rapides au dossier de \$\{person\.name\}`\}/);
  for (const anchor of ["#messages", "#orientation", "#actions", "#history"]) {
    assert.ok(people.includes(`/admin/dossiers/\${person.userId}${anchor}`), `missing ${anchor} shortcut`);
  }
  assert.match(people, /person\.unreadMessages/);
});
