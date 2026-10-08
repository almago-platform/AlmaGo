import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/admin/prospects/page.tsx");
const layout = read("src/app/admin/layout.tsx");

test("SO-4 computes priority from the latest orientation rather than a stored opaque score", () => {
  assert.match(page, /latestOrientationByProspect/);
  assert.match(page, /restorePublicOrientationAnswers/);
  assert.match(page, /evaluateSmartOrientationPriority\(answers\)/);
  assert.doesNotMatch(page, /lead_score|ai_score|admission_probability|visa_probability/i);
});

test("SO-4 sorts high priority, prepare-now, standard, then follow-up", () => {
  const ready = page.indexOf('priority_ready: 0');
  const prepare = page.indexOf('priority_prepare_now: 1');
  const standard = page.indexOf('priority_standard: 2');
  const followUp = page.indexOf('priority_follow_up: 3');
  assert.ok(ready >= 0);
  assert.ok(prepare > ready);
  assert.ok(standard > prepare);
  assert.ok(followUp > standard);
  assert.match(page, /priorityRank\[a\.smartPriority\.state\] - priorityRank\[b\.smartPriority\.state\]/);
});

test("SO-4 keeps every prospect and filters only the displayed queue", () => {
  assert.match(page, /const queue: QueueItem\[\] = prospects/);
  assert.match(page, /const filteredQueue = queue\.filter/);
  assert.match(page, /prospects (?:conservés|sauvegardés)/);
  assert.match(page, /Aucun candidat n’est supprimé par Smart Orientation/);
});

test("SO-4 displays email, Bac, average provenance, target degree and field", () => {
  assert.match(page, /prospect\.email/);
  assert.match(page, /answers\.bacStatus/);
  assert.match(page, /answers\.bacYear/);
  assert.match(page, /answers\.generalAverage/);
  assert.match(page, /answers\.averageType/);
  assert.match(page, /answers\.targetDegree/);
  assert.match(page, /answers\.targetField/);
});

test("SO-4 exposes explicit contact permission without enabling outreach", () => {
  assert.match(page, /contact_consent/);
  assert.match(page, /Autorisé explicitement/);
  assert.match(page, /Non autorisé — ne pas contacter à des fins commerciales/);
  assert.doesNotMatch(page, /sendTransactionalEmail|sendMarketing|sendCampaign|fetch\(/i);
});

test("SO-4 explains priority reasons and sensitive-field human review", () => {
  assert.match(page, /Raisons de priorité/);
  assert.match(page, /Moyenne > 12\/20/);
  assert.match(page, /Langue à poursuivre/);
  assert.match(page, /Revue humaine renforcée/);
  assert.match(page, /conditions académiques officielles/);
});

test("SO-4 provides server-side filters for priority, Bac, contact and field", () => {
  for (const name of ["priority", "bac", "contact", "field"]) {
    assert.match(page, new RegExp(`name="${name}"`));
  }
  assert.match(page, /method="get"/);
  assert.match(page, /priorityFilter/);
  assert.match(page, /bacFilter/);
  assert.match(page, /contactFilter/);
  assert.match(page, /fieldFilter/);
});

test("admin priority queue remains protected by the existing server-side admin layout", () => {
  assert.match(layout, /getAdminUser\(\)/);
  assert.match(layout, /if \(!hasAdminRole\)/);
  assert.match(layout, /if \(!isAdmin\) redirect\("\/mfa"\)/);
  assert.match(layout, /redirect\("\/unauthorized"\)/);
});

test("SO-4 never auto-promotes a prospect to qualified_prospect", () => {
  assert.doesNotMatch(page, /update\([\s\S]*qualified_prospect|rpc\([\s\S]*qualified_prospect/i);
  assert.match(page, /ProspectQualificationReviewForm/);
});
