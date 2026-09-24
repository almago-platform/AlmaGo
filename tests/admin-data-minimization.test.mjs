import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const programsPage = readFileSync("src/app/admin/programs/page.tsx", "utf8");
const universitiesPage = readFileSync("src/app/admin/universities/page.tsx", "utf8");

test("admin catalogue pages do not request every database column", () => {
  for (const source of [programsPage, universitiesPage]) {
    assert.doesNotMatch(source, /select\("\*"/);
    assert.doesNotMatch(source, /select\("\*,/);
  }
});

test("admin programme catalogue selects only the fields required by its panel", () => {
  assert.match(programsPage, /id,university_id,name,degree_level,field,teaching_language/);
  assert.match(programsPage, /application_url,source_url,verified_at,almago_notes,is_active/);
  assert.match(programsPage, /universities\(name,city,is_active\)/);
});

test("admin university catalogue selects only the fields required by its panel", () => {
  assert.match(universitiesPage, /id,name,city,bundesland,university_type/);
  assert.match(universitiesPage, /website_url,source_url,verified_at,logo_url,description,is_public,tuition_notes,is_active/);
});
