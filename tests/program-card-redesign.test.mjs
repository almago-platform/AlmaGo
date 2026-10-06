import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
const page = readFileSync("src/app/student/orientation/page.tsx", "utf8");

test("programme cards prioritize the requested scan hierarchy", () => {
  assert.match(panel, /university\?\.name/);
  assert.match(panel, /program\.name/);
  assert.match(panel, /university\?\.city/);
  assert.match(panel, /program\.degree_level/);
  assert.match(panel, /program\.teaching_language/);
  assert.match(panel, /semesterSummary/);
  assert.match(panel, /Frais \/ tuition/);
  assert.match(panel, /programmeDeadline/);
  assert.match(panel, /applicationStatusPresentation/);
  assert.match(panel, /compatibilityPresentation/);
});

test("programme compatibility is qualitative, explainable and not a fake percentage", () => {
  assert.match(panel, /Bonne compatibilité/);
  assert.match(panel, /Compatibilité à vérifier/);
  assert.match(panel, /Compatibilité limitée/);
  assert.match(panel, /compactCompatibilityCriteria/);
  assert.match(panel, /criterionSignal/);
  assert.doesNotMatch(panel, /match score|% match|compatibilityScore|matchPercentage/i);
});

test("programme cards expose save compare and programme actions", () => {
  assert.match(panel, /Enregistrer/);
  assert.match(panel, /Comparer/);
  assert.match(panel, /Voir le programme/);
  assert.match(panel, /toggleCompare/);
  assert.match(panel, /interested\(recommendation\.id\)/);
  assert.match(panel, /program\.application_url/);
});

test("programme cards use real semester, fee and application status data already in AlmaGo", () => {
  assert.match(page, /intake_terms/);
  assert.match(page, /application_fee_notes/);
  assert.match(page, /tuition_notes/);
  assert.match(page, /select\("program_id,status"\)/);
  assert.match(page, /applicationStatuses=/);
  assert.match(panel, /programmeFees/);
  assert.doesNotMatch(page, /logo|brandLogo/i);
});

test("redesign preserves the existing AlmaGo header and logo surface", () => {
  assert.doesNotMatch(panel, /AlmaGoLogo|logo\.svg|brand-mark|header logo/i);
  assert.doesNotMatch(page, /AlmaGoLogo|logo\.svg|brand-mark|header logo/i);
});
