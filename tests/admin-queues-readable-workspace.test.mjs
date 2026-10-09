import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const queue = readFileSync("src/app/admin/traitement/page.tsx", "utf8");
const section = readFileSync("src/components/admin/AdminWorkflowSection.tsx", "utf8");
const summary = readFileSync("src/components/admin/AdminWorkspaceSummary.tsx", "utf8");
const inbox = readFileSync("src/components/admin/AdminInboxPanel.tsx", "utf8");

test("the processing center distinguishes totals from actual tasks and query errors", () => {
  assert.match(queue, /countCaption: "non lues"/);
  assert.match(queue, /countCaption: "à vérifier"/);
  assert.match(queue, /countCaption: "au total"/);
  assert.match(queue, /Indisponible/);
  assert.match(queue, /item\.kind === "deadlines" \? "À voir"/);
  assert.match(queue, /count: inbox\.error \? null : inbox\.count/);
  assert.match(queue, /count: documents\.error \? null : documents\.count/);
  assert.match(queue, /count: applications\.error \? null : applications\.count/);
  assert.match(queue, /count: "exact", head: true/);
});

test("queues guide to existing modules instead of mutating on overview", () => {
  assert.match(queue, /title="Tâches à traiter"/);
  for (const label of ["Lire les notifications","Vérifier les documents","Examiner les candidatures","Voir les dates vérifiées"]) {
    assert.ok(queue.includes(label), label);
  }
  assert.match(queue, /href=\{active\.href\}/);
  assert.doesNotMatch(queue, /fetch\(|\.update\(|\.insert\(|service_role/);
});

test("shared admin summary and workflow labels have a readable contrast floor", () => {
  assert.match(section, /max-w-4xl text-sm leading-6 text-slate-700/);
  assert.match(summary, /text-xs font-bold uppercase tracking-\[0\.06em\] text-slate-700/);
  assert.match(inbox, /Marquer comme lue/);
  assert.match(inbox, /notification_id: notificationId/);
});
