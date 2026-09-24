import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminHome = readFileSync("src/app/admin/page.tsx", "utf8");
const programsPage = readFileSync("src/app/admin/programs/page.tsx", "utf8");
const universitiesPage = readFileSync("src/app/admin/universities/page.tsx", "utf8");
const programsPanel = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");
const universitiesPanel = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");

test("admin catalogue priority links to the exact quality queue", () => {
  assert.match(adminHome, /cataloguePriorityHref/);
  assert.match(adminHome, /\/admin\/universities\?quality=/);
  assert.match(adminHome, /\/admin\/programs\?quality=/);
  assert.match(adminHome, /missing_verification/);
  assert.match(adminHome, /missing_source/);
});

test("catalogue pages accept quality filters from Next search params", () => {
  assert.match(programsPage, /searchParams: Promise<\{ quality\?: string \}>/);
  assert.match(universitiesPage, /searchParams: Promise<\{ quality\?: string \}>/);
  assert.match(programsPage, /initialQuality=\{quality\}/);
  assert.match(universitiesPage, /initialQuality=\{quality\}/);
});

test("catalogue panels reject unknown quality filters", () => {
  assert.match(programsPanel, /\["all", "missing_source", "missing_verification", "missing_deadline"\]\.includes\(initialQuality\)/);
  assert.match(universitiesPanel, /\["all", "missing_source", "missing_verification"\]\.includes\(initialQuality\)/);
});
