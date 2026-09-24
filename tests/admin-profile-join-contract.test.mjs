import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const documentsPage = readFileSync("src/app/admin/documents/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/admin/applications/page.tsx", "utf8");

test("admin documents join student profiles explicitly instead of relying on a missing FK", () => {
  assert.match(documentsPage, /select\("id,student_id,category,original_filename,status,admin_comment,created_at"\)/);
  assert.doesNotMatch(documentsPage, /profiles\(first_name,last_name\)/);
  assert.match(documentsPage, /new Set\(\(documents \|\| \[\]\)\.map\(\(document\) => document\.student_id\)\)/);
  assert.match(documentsPage, /from\("profiles"\)/);
  assert.match(documentsPage, /\.in\("id", studentIds\)/);
  assert.match(documentsPage, /profile\.id === document\.student_id/);
});

test("admin applications join student profiles explicitly instead of relying on a missing FK", () => {
  assert.match(applicationsPage, /select\("id,student_id,program_id,status,intake,deadline,next_action,student_notes,result,created_at,programs\(name,universities\(name,city\)\)"\)/);
  assert.doesNotMatch(applicationsPage, /profiles\(first_name,last_name\)/);
  assert.match(applicationsPage, /new Set\(\(applications \|\| \[\]\)\.map\(\(application\) => application\.student_id\)\)/);
  assert.match(applicationsPage, /from\("profiles"\)/);
  assert.match(applicationsPage, /\.in\("id", studentIds\)/);
  assert.match(applicationsPage, /profile\.id === application\.student_id/);
});
