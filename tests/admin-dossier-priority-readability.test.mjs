import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const brief = readFileSync("src/components/admin/AdminCounselorBrief.tsx", "utf8");
const handoff = readFileSync("src/components/admin/AdminDossierQuickHandoff.tsx", "utf8");
const blockers = readFileSync("src/components/admin/AdminDossierBlockersPanel.tsx", "utf8");

test("dossier overview presents the real priority action before background facts", () => {
  const action = brief.indexOf("Action Campus prioritaire");
  const facts = brief.indexOf("Situation enregistrée");
  assert.ok(action !== -1 && facts !== -1 && action < facts, "Priority appears before facts");
  assert.match(brief, /action\.href/);
  assert.match(brief, /action\.waiting/);
  assert.match(brief, /leadBlocker/);
  assert.match(brief, /nextDeadline \?/);
  assert.match(brief, /lastEvent \?/);
  assert.match(brief, /href="#assignment"/);
});

test("follow-up cards remain linked and readable without creating business actions", () => {
  assert.match(handoff, /md:grid-cols-2/);
  assert.doesNotMatch(handoff, /xl:grid-cols-4/);
  assert.match(handoff, /text-sm font-semibold text-\[var\(--brand-strong\)\] underline/);
  for (const anchor of ["#applications", "#documents", "#messages", "#admission-pdf", "#request-document"]) {
    assert.ok(handoff.includes(anchor), anchor);
  }
  assert.match(handoff, /Informations enregistrées · aucune décision automatique/);
  assert.doesNotMatch(handoff, /fetch\(|supabase|\.insert\(|\.update\(/);
});

test("blocker actions retain responsibility and readable targets", () => {
  assert.match(blockers, /ownerLabel\(blocker\.owner\)/);
  assert.match(blockers, /blocker\.href/);
  assert.match(blockers, /min-h-10 px-3 py-2 text-sm/);
  assert.match(blockers, /Une attente normale n’est pas inventée comme blocage/);
});
