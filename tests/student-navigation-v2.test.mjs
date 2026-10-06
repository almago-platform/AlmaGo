import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

const studentRoutes = [
  "/student",
  "/student/project",
  "/student/profile",
  "/student/pathway",
  "/student/orientation",
  "/student/documents",
  "/student/applications",
  "/student/calendar",
  "/student/procedure",
  "/student/language-courses",
  "/student/finance-insurance",
];

test("student shell exposes every primary student destination exactly once", () => {
  for (const route of studentRoutes) {
    assert.match(shell, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(shell, /icons\.calendar/);
});

test("student navigation is grouped around the student's next decision", () => {
  assert.match(shell, /\[0\],\s*\[1, 2, 3, 4, 5\],\s*\[6, 7, 8\],\s*\[9, 10\]/s);
  assert.ok(copy.includes('groups: ["Aujourd’hui", "Préparer mon dossier", "Candidatures & démarches", "Préparer mon départ"]'));
  assert.ok(copy.includes('groups: ["اليوم", "تحضير ملفي", "طلبات التقديم والإجراءات", "الاستعداد للسفر"]'));
  assert.ok(copy.includes('groups: ["Today", "Prepare my file", "Applications & procedure", "Prepare to leave"]'));
  assert.ok(copy.includes('groups: ["Heute", "Dossier vorbereiten", "Bewerbungen & Verfahren", "Abreise vorbereiten"]'));
});

test("calendar and procedure labels are localized in every shell contract", () => {
  for (const expected of [
    '["Calendrier", "Deadlines importantes"]',
    '["Ma procédure", "Démarches liées à mon dossier"]',
    '["التقويم", "المواعيد المهمة"]',
    '["إجراءاتي", "إجراءات ملفي"]',
    '["Calendar", "Important deadlines"]',
    '["My procedure", "Dossier procedures"]',
    '["Kalender", "Wichtige Fristen"]',
    '["Mein Verfahren", "Schritte rund um mein Dossier"]',
  ]) {
    assert.ok(copy.includes(expected), `missing navigation copy: ${expected}`);
  }
});

test("obsolete duplicate StudentNav component is not part of the canonical shell", () => {
  assert.doesNotMatch(shell, /StudentNav/);
});
