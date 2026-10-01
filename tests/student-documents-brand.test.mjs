import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/documents/page.tsx", "utf8");
const panel = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const copy = readFileSync("src/content/student-documents-copy.ts", "utf8");

test("student document surfaces render localized copy through the canonical brand layer", () => {
  assert.match(page, /const t = rebrandCopy\(studentDocumentsCopy\[locale\]\)/);
  assert.match(panel, /const t = rebrandCopy\(studentDocumentsCopy\[locale\]\)/);
  assert.match(copy, /AlmaGo/);
});

test("document review behavior remains untouched by branding", () => {
  assert.match(page, /from\("documents"\)/);
  assert.match(page, /from\("student_history"\)/);
  assert.match(panel, /document\.status/);
});
