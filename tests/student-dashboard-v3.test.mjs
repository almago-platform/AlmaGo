import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/page.tsx", "utf8");
const copy = readFileSync("src/content/student-dashboard-cockpit-copy.ts", "utf8");

test("dashboard counts all document attention items before limiting the visible preview", () => {
  assert.ok(page.includes("const allMissingRequiredDocuments"));
  assert.ok(page.includes("const allDocumentsToFix"));
  assert.ok(page.includes("const missingRequiredDocuments = allMissingRequiredDocuments.slice(0, 4)"));
  assert.ok(page.includes("const documentsToFix = allDocumentsToFix.slice(0, 4)"));
  assert.ok(page.includes("allMissingRequiredDocuments.length + allDocumentsToFix.length"));
});

test("dashboard deadline ordering prioritizes overdue and near-term items", () => {
  assert.ok(page.includes("function daysUntilDeadline"));
  assert.ok(page.includes("function compareDeadlineUrgency"));
  assert.ok(page.includes("daysUntilDeadline(application.deadline) <= 14"));
  assert.ok(page.includes("daysUntilDeadline(item.due_date) <= 14"));
  assert.ok(page.includes("compareDeadlineUrgency(a.date, b.date)"));
});

test("dashboard exposes a compact blocker strip only when attention is required", () => {
  assert.ok(page.includes("const attentionItems = ["));
  assert.ok(page.includes("data-dashboard-attention"));
  assert.ok(page.includes("cockpit.overdueDeadlines"));
  assert.ok(page.includes("cockpit.dueSoonDeadlines"));
  assert.ok(page.includes("cockpit.documentsAttention"));
  assert.ok(page.includes("cockpit.blockedApplications"));
  assert.ok(page.includes("{attentionItems.length ? ("));
});

test("deadline rows distinguish overdue, due soon and upcoming states", () => {
  assert.ok(page.includes("cockpit.overdue"));
  assert.ok(page.includes("cockpit.dueSoon"));
  assert.ok(page.includes("cockpit.upcoming"));
  assert.ok(page.includes('dueSoon ? "warning" : "neutral"'));
});

test("dashboard urgency and attention copy exists in all four locales", () => {
  for (const expected of [
    'urgentDeadlineReason: "Une échéance est dépassée ou arrive dans les 14 prochains jours."',
    'urgentDeadlineReason: "A deadline is overdue or falls within the next 14 days."',
    'urgentDeadlineReason: "Eine Frist ist abgelaufen oder liegt innerhalb der nächsten 14 Tage."',
    'urgentDeadlineReason: "هناك موعد منتهٍ أو موعد خلال الأيام الأربعة عشر القادمة."',
  ]) {
    assert.ok(copy.includes(expected), `missing copy: ${expected}`);
  }
});

test("dashboard unavailable state uses the canonical student page system", () => {
  assert.ok(page.includes("StudentPageState"));
  assert.ok(page.includes('statusVariant="warning"'));
  assert.doesNotMatch(page, /<PageHeader badge=\{copy\.unavailableBadge\}/);
});
