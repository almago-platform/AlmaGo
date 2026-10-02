import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const types = readFileSync("src/lib/orientation-engine/types.ts", "utf8");
const rules = readFileSync("src/lib/orientation-engine/rules.ts", "utf8");
const catalog = readFileSync("src/lib/orientation-engine/catalog.ts", "utf8");
const refinement = readFileSync("src/lib/orientation-engine/refinement.ts", "utf8");
const publicAnswers = readFileSync("src/lib/orientation/public.ts", "utf8");
const validation = readFileSync("src/lib/orientation/validate.ts", "utf8");
const questionCard = readFileSync("src/components/orientation/OrientationRefinementQuestionCard.tsx", "utf8");
const resultCard = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
const migration = readFileSync(
  "supabase/migrations/20261002155400_orientation_master_prerequisites.sql",
  "utf8",
);

test("V4 public catalogue exposes only the bounded Master prerequisite object", () => {
  assert.match(migration, /p\.requirements -> 'academic_prerequisites'/);
  assert.match(migration, /master_academic_prerequisites/);
  assert.doesNotMatch(migration, /p\.requirements\s+as\s+requirements/i);
  assert.doesNotMatch(migration, /almago_notes|prospects|profiles|documents|applications/i);
  assert.match(catalog, /master_academic_prerequisites/);
  assert.match(catalog, /parseMasterAcademicPrerequisites/);
});

test("Master subject credits remain structured profile facts and server validated", () => {
  assert.match(publicAnswers, /masterSubjectCredits/);
  assert.match(validation, /masterCreditEntries/);
  assert.match(validation, /credits > 300/);
  assert.match(validation, /targetDegree !== "Master"/);
});

test("V4 reuses the deterministic Master requirement matcher", () => {
  assert.match(rules, /matchMasterRequirements/);
  assert.match(rules, /master_subject_credits_satisfied/);
  assert.match(rules, /master_subject_credits_missing/);
  assert.match(rules, /master_subject_credits_insufficient/);
  assert.match(rules, /master_curriculum_unknown/);
  assert.doesNotMatch(rules, /OPENAI_API_KEY|GEMINI_API_KEY|GROQ_API_KEY/);
});

test("Master refinement asks one subject at a time and never invents curriculum data", () => {
  assert.match(types, /master_subject_credits/);
  assert.match(types, /subjectKey\?: string/);
  assert.match(types, /requiredEcts\?: number/);
  assert.match(refinement, /masterPrerequisiteGroups/);
  assert.match(refinement, /master_subject_credits_needed/);
  assert.match(questionCard, /masterSubjectCredits/);
  assert.match(questionCard, /type="number"/);
  assert.match(resultCard, /master_curriculum_unknown/);
});
