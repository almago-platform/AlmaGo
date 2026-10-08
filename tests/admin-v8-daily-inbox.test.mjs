import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const inboxPage = read("src/app/admin/inbox/page.tsx");
const inboxPanel = read("src/components/admin/AdminInboxPanel.tsx");
const inboxRoute = read("src/app/api/admin/notifications/read/route.ts");
const people = read("src/app/admin/people/page.tsx");
const shell = read("src/components/layout/AppShell.tsx");

test("Admin V8 adds a personal operational inbox to Pilotage", () => {
  assert.match(shell, /Boîte de réception/);
  assert.match(shell, /href: "\/admin\/inbox"/);
  assert.match(inboxPage, /eq\("user_id", user\.id\)/);
  assert.match(inboxPage, /is\("read_at", null\)|read_at/);
  assert.match(inboxPanel, /Tout marquer comme lu/);
});

test("Admin V8 inbox marks only the current admin's notifications as read", () => {
  assert.match(inboxRoute, /getAdminUser/);
  assert.match(inboxRoute, /if \(!isAdmin\)/);
  assert.match(inboxRoute, /eq\("user_id", user\.id\)/);
  assert.match(inboxRoute, /update\(\{ read_at: readAt \}\)/);
  assert.doesNotMatch(inboxRoute, /delete\(/);
});

test("Admin V8 notification links prefer the shared dossier 360 when student_id exists", () => {
  assert.match(inboxPanel, /metadata\?\.student_id/);
  assert.match(inboxPanel, /\/admin\/dossiers\/\$\{studentId\}/);
  assert.match(inboxPanel, /admin_payment_validation_required/);
  assert.match(inboxPanel, /admin_student_question/);
});

test("Admin V8 people cockpit detects dossiers without an explicit next action", () => {
  assert.match(people, /no_action/);
  assert.match(people, /Sans prochaine action/);
  assert.match(people, /hasExplicitNextAction/);
  assert.match(people, /!item\.hasExplicitNextAction/);
  assert.match(people, /Sans action/);
});

test("Admin V8 dashboard surfaces cross-workflow risks before file-level queues", () => {
  assert.match(dashboard, /Priorité opérationnelle/);
  assert.match(dashboard, /Tous vos repères de suivi/);
  assert.match(dashboard, /Boîte de réception/);
  assert.match(dashboard, /Sans prochaine action/);
  assert.match(dashboard, /Non attribués/);
  assert.match(dashboard, /Sans contact 14 j/);
  assert.match(dashboard, /student_case_assignments/);
  assert.match(dashboard, /student_case_notes/);
});
