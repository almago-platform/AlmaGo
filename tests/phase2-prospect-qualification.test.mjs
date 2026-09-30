import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const qualification = readFileSync("src/lib/phase2/qualification.ts", "utf8");

test("P2.7A qualification engine is versioned and exposes the closed state model", () => {
  assert.match(qualification, /PROSPECT_QUALIFICATION_ENGINE_VERSION = "prospect-qualification-v1"/);
  for (const state of [
    "not_evaluated",
    "too_early",
    "needs_information",
    "needs_verification",
    "ready_for_review",
    "qualified_prospect",
  ]) {
    assert.match(qualification, new RegExp(`"${state}"`));
  }
});

test("automatic evaluator cannot emit qualified_prospect", () => {
  assert.match(qualification, /AutomatedProspectQualificationState = Exclude<[\s\S]*"qualified_prospect"/);
  const evaluator = qualification.match(
    /export function evaluateProspectQualification\([\s\S]*$/,
  )?.[0] ?? "";
  assert.doesNotMatch(evaluator, /state:\s*"qualified_prospect"/);
  assert.match(evaluator, /state:\s*"ready_for_review"/);
});

test("qualification uses explicit missing information and deterministic precedence", () => {
  assert.match(qualification, /if \(!diagnostic\)[\s\S]*state: "not_evaluated"/);
  assert.match(qualification, /if \(missingFields\.length > 0\)[\s\S]*state: "needs_information"/);
  assert.match(qualification, /answers\.bacStatus === "preparing"[\s\S]*state: "too_early"/);
  assert.match(qualification, /answers\.targetDegree === "Master"[\s\S]*first_degree_incomplete/);
  assert.match(qualification, /state: "needs_verification"/);
  assert.match(qualification, /state: "ready_for_review"/);
});

test("qualification keeps semantic reasons and verification requirements explainable", () => {
  assert.match(qualification, /prospectQualificationReasonCodes/);
  assert.match(qualification, /prospectQualificationMissingFields/);
  assert.match(qualification, /verificationRequirements: PublicDiagnosticCode\[\]/);
  assert.match(qualification, /verificationCodes\(diagnostic/);
  assert.match(qualification, /nextAction: ProspectQualificationNextAction/);
});

test("qualification considers project maturity but not budget, acquisition, behavior, payment, or identity desirability", () => {
  const evaluator = qualification.match(
    /export function evaluateProspectQualification\([\s\S]*$/,
  )?.[0] ?? "";

  assert.match(evaluator, /answers\.bacStatus/);
  assert.match(evaluator, /answers\.targetDegree/);
  assert.match(evaluator, /answers\.targetField/);
  assert.match(evaluator, /answers\.studyLanguage/);
  assert.match(evaluator, /answers\.germanLevel/);
  assert.match(evaluator, /answers\.englishLevel/);

  assert.doesNotMatch(
    evaluator,
    /budgetRange|preferredCities|nationality|country|page.?view|email.?open|acquisition|referral|campaign|device|browser|payment|wealth|lead.?score/i,
  );
});

test("qualification is a pure domain module without database, network, auth metadata, or generative AI", () => {
  assert.doesNotMatch(
    qualification,
    /supabase|fetch\(|axios|openai|gemini|anthropic|user_metadata|raw_user_meta_data|localStorage|sessionStorage|process\.env/i,
  );
  assert.doesNotMatch(qualification, /Math\.random|Date\.now|new Date/);
});
