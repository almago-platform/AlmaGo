import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const access = readFileSync("src/lib/auth/access.ts", "utf8");
const studentRoutes = [
  "src/app/api/student/applications/route.ts",
  "src/app/api/student/documents/[id]/route.ts",
  "src/app/api/student/documents/upload/route.ts",
  "src/app/api/student/language-course-selection/route.ts",
  "src/app/api/student/language-courses/route.ts",
  "src/app/api/student/onboarding/route.ts",
  "src/app/api/student/profile/route.ts",
  "src/app/api/student/project/route.ts",
];

test("shared auth access exposes an explicit student-role helper", () => {
  assert.match(access, /export async function getStudentUser/);
  assert.match(access, /from\("user_roles"\)/);
  assert.match(access, /role\?\.role === "student"/);
});

test("student API routes require the shared student-role boundary", () => {
  for (const path of studentRoutes) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /getStudentUser/);
    assert.match(source, /Accès étudiant requis/);
  }
});

test("student document view keeps its intentional authenticated owner-or-admin boundary", () => {
  const source = readFileSync("src/app/api/documents/[id]/view/route.ts", "utf8");
  assert.match(source, /getAuthenticatedUser/);
  assert.doesNotMatch(source, /getStudentUser/);
});
