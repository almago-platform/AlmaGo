import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");

test("application cards keep status, deadline and next action visible before secondary details", () => {
  const status = panel.indexOf("localizedApplicationStatus");
  const deadline = panel.indexOf("deadlineWord");
  const nextAction = panel.indexOf("aria-label={t.nextAction}");
  const details = panel.indexOf("<details className=");
  assert.ok(status >= 0);
  assert.ok(deadline >= 0);
  assert.ok(nextAction >= 0);
  assert.ok(details > nextAction);
});

test("secondary application content is grouped in a native accessible disclosure", () => {
  assert.match(panel, /<details className="group mt-4/);
  assert.match(panel, /<summary className=/);
  assert.match(panel, /Voir les détails de la candidature/);
  assert.match(panel, /عرض تفاصيل الطلب/);
  assert.match(panel, /Bewerbungsdetails anzeigen/);
  assert.match(panel, /View application details/);
  assert.match(panel, /group-open:rotate-45/);
});

test("application details keep documents, result, notes and history available", () => {
  assert.match(panel, /requiredDocuments/);
  assert.match(panel, /t\.result/);
  assert.match(panel, /student_notes/);
  assert.match(panel, /historyTitle/);
});
