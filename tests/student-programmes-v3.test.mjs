import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
const page = readFileSync("src/app/student/orientation/page.tsx", "utf8");

test("programme filters use the four-locale copy contract instead of a FR/AR binary", () => {
  assert.ok(panel.includes("ui.searchLabel"));
  assert.ok(panel.includes("ui.searchPlaceholder"));
  assert.ok(panel.includes("ui.degreeFilter"));
  assert.ok(panel.includes("ui.languageFilter"));
  assert.ok(panel.includes("ui.reset"));
  assert.ok(panel.includes("ui.results(visibleItems.length)"));
  assert.ok(panel.includes('searchLabel: "Search programmes"'));
  assert.ok(panel.includes('searchLabel: "Studiengang suchen"'));
  assert.doesNotMatch(panel, /locale === "fr" \? "Rechercher un programme"/);
});

test("compare selection produces a real side-by-side comparison surface", () => {
  assert.ok(panel.includes("const compareItems = compareIds"));
  assert.ok(panel.includes("compareItems.length >= 2"));
  assert.ok(panel.includes('aria-labelledby="program-comparison-title"'));
  assert.ok(panel.includes("data-program-comparison"));
  assert.ok(panel.includes("compareItems.map"));
  assert.ok(panel.includes("ui.removeComparison"));
  assert.ok(panel.includes("toggleCompare(recommendation.id)"));
});

test("comparison shows the decision-critical programme facts", () => {
  assert.ok(panel.includes("ui.degree"));
  assert.ok(panel.includes("ui.language"));
  assert.ok(panel.includes("ui.semester"));
  assert.ok(panel.includes("ui.fees"));
  assert.ok(panel.includes("ui.deadline"));
  assert.ok(panel.includes("compatibilityPresentation(recommendation.requirement_match, locale)"));
});

test("programme cards surface stored fee notes when available", () => {
  assert.ok(page.includes("application_fee_notes"));
  assert.ok(page.includes("tuition_notes"));
  assert.ok(panel.includes("program.application_fee_notes"));
  assert.ok(panel.includes("university?.tuition_notes"));
  assert.ok(panel.includes("const fees = programmeFees(program, university, ui.verify)"));
  assert.ok(panel.includes("{fees}</dd>"));
});

test("programme V3 keeps qualitative compatibility and avoids arbitrary match percentages", () => {
  assert.ok(panel.includes('"Bonne compatibilité"'));
  assert.ok(panel.includes('"Compatibilité à vérifier"'));
  assert.ok(panel.includes('"Compatibilité limitée"'));
  assert.doesNotMatch(panel, /\d+%\s*(match|compatib)/i);
});
