import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/applications/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
const copy = readFileSync("src/content/student-applications-copy.ts", "utf8");

test("student application surfaces render localized copy through the canonical brand layer", () => {
  assert.match(page, /const t = rebrandCopy\(studentApplicationsCopy\[locale\]\)/);
  assert.match(panel, /const t = rebrandCopy\(studentApplicationsCopy\[locale\]\)\.panel/);
  assert.match(copy, /AlmaGo/);
});

test("application tracking logic remains unchanged by branding", () => {
  assert.match(page, /from\("applications"\)/);
  assert.match(panel, /application\.status/);
  assert.match(panel, /application\.next_action/);
});
