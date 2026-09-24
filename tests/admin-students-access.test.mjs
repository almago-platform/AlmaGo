import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const listPage = readFileSync("src/app/admin/students/page.tsx", "utf8");
const detailPage = readFileSync("src/app/admin/students/[id]/page.tsx", "utf8");
const detailComponent = readFileSync("src/components/admin/AdminStudentCase.tsx", "utf8");

test("admin students list explicitly filters student roles", () => {
  assert.match(listPage, /\.from\("user_roles"\)/);
  assert.match(listPage, /\.eq\("role", "student"\)/);
  assert.match(listPage, /\.in\("id", studentRoleIds\)/);
});

test("admin student route validates UUID and student role before loading the dossier", () => {
  assert.match(detailPage, /isUuid\(id\)/);
  assert.match(detailPage, /\.eq\("user_id", id\)/);
  assert.match(detailPage, /\.eq\("role", "student"\)/);
  assert.match(detailPage, /Dossier étudiant introuvable/);
});

test("admin student dossier never uses service-role or Auth admin APIs", () => {
  for (const source of [listPage, detailPage, detailComponent]) {
    assert.doesNotMatch(source, /service_role/i);
    assert.doesNotMatch(source, /auth\.admin/);
  }
});

test("internal notes stay explicitly separated from student-visible content", () => {
  assert.match(detailComponent, /Notes internes AlmaGo/);
  assert.match(detailComponent, /Interne à AlmaGo/);
  assert.match(detailComponent, /Visible par l’étudiant/);
});
