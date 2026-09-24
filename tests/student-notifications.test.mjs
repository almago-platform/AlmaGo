import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/notifications/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentNotificationsPanel.tsx", "utf8");
const oneRoute = readFileSync("src/app/api/student/notifications/[id]/route.ts", "utf8");
const allRoute = readFileSync("src/app/api/student/notifications/read-all/route.ts", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("student notifications reuse the existing notification table", () => {
  assert.match(page, /from\("notifications"\)/);
  assert.match(page, /read_at/);
  assert.match(page, /created_at/);
  assert.match(panel, /Aucune notification pour le moment/);
});

test("notification read updates stay scoped to the authenticated user", () => {
  for (const route of [oneRoute, allRoute]) {
    assert.match(route, /getAuthenticatedUser/);
    assert.match(route, /eq\("user_id", user\.id\)/);
    assert.match(route, /update\(\{ read_at: readAt \}\)/);
    assert.doesNotMatch(route, /service_role|SUPABASE_SECRET|secret key/i);
  }
});

test("student navigation exposes the notification inbox without a fake counter", () => {
  assert.match(shell, /Mes notifications/);
  assert.match(shell, /\/student\/notifications/);
  assert.doesNotMatch(shell, /notificationCount|unreadCount/);
});

test("notification links stay inside the existing student dossier surfaces", () => {
  assert.match(panel, /\/student\/documents/);
  assert.match(panel, /\/student\/applications/);
  assert.match(panel, /\/student\/orientation/);
  assert.match(panel, /return "\/student"/);
});
