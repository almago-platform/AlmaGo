import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAcademicMatch } from "../src/lib/academic-match.ts";

const now = new Date("2026-09-25T12:00:00Z");

const baseProject = {
  target_degree: "Master",
  target_field: "Computer Science",
  target_intake: "Hiver 2027",
  preferred_study_language: "English",
  preferred_cities: ["Berlin"],
  current_diploma: "Bachelor Computer Engineering",
  current_german_level: "B2",
};

const baseProgram = {
  degree_level: "Master",
  field: "Computer Science",
  teaching_language: "English",
  intake_terms: ["Wintersemester"],
  winter_deadline: "2027-07-15",
  summer_deadline: null,
  application_url: "https://example.edu/apply",
  source_url: "https://example.edu/program",
  verified_at: "2026-09-24T10:00:00Z",
  is_active: true,
  uni_assist_required: false,
  diploma_required: null,
  german_level_required: null,
  english_level_required: null,
  university_city: "Berlin",
};

test("verified exact matches are eligible for review without claiming admission", () => {
  const result = evaluateAcademicMatch(baseProject, baseProgram, now);
  assert.equal(result.status, "eligible_for_review");
  assert.deepEqual(result.reasons, []);
  assert.deepEqual(result.manual_checks, []);
  assert.equal(result.application_route, "unknown");
});

test("publication safety excludes inactive, unverified or unsafe programs", () => {
  assert.equal(evaluateAcademicMatch(baseProject, { ...baseProgram, is_active: false }, now).status, "excluded");
  assert.equal(evaluateAcademicMatch(baseProject, { ...baseProgram, verified_at: null }, now).status, "excluded");
  assert.equal(evaluateAcademicMatch(baseProject, { ...baseProgram, source_url: "javascript:alert(1)" }, now).status, "excluded");
  assert.equal(evaluateAcademicMatch(baseProject, { ...baseProgram, application_url: "a" }, now).status, "excluded");
});

test("degree and intake mismatches are hard exclusions when structured data is explicit", () => {
  assert.equal(
    evaluateAcademicMatch(baseProject, { ...baseProgram, degree_level: "Bachelor" }, now).status,
    "excluded",
  );
  assert.equal(
    evaluateAcademicMatch(baseProject, { ...baseProgram, intake_terms: ["Sommersemester"] }, now).status,
    "excluded",
  );
});

test("past deadlines exclude the targeted intake while missing deadlines stay unknown", () => {
  assert.equal(
    evaluateAcademicMatch(baseProject, { ...baseProgram, winter_deadline: "2026-07-15" }, now).status,
    "excluded",
  );
  const missing = evaluateAcademicMatch(baseProject, { ...baseProgram, winter_deadline: null }, now);
  assert.equal(missing.status, "needs_manual_review");
  assert.match(missing.manual_checks.join(" "), /aucune date ne doit être inventée/i);
});

test("free-text diploma compatibility stays manual instead of becoming a false match", () => {
  const result = evaluateAcademicMatch(
    baseProject,
    { ...baseProgram, diploma_required: "Bachelor with 180 ECTS in a related field" },
    now,
  );
  assert.equal(result.status, "needs_manual_review");
  assert.match(result.manual_checks.join(" "), /compatibilité du diplôme/i);
});

test("language gaps become manual checks and never admission predictions", () => {
  const result = evaluateAcademicMatch(
    { ...baseProject, current_german_level: "A2" },
    { ...baseProgram, german_level_required: "B2" },
    now,
  );
  assert.equal(result.status, "needs_manual_review");
  assert.match(result.manual_checks.join(" "), /inférieur/i);
});

test("uni-assist is identified only when the stored flag explicitly says so", () => {
  assert.equal(
    evaluateAcademicMatch(baseProject, { ...baseProgram, uni_assist_required: true }, now).application_route,
    "uni_assist",
  );
  assert.equal(
    evaluateAcademicMatch(baseProject, { ...baseProgram, uni_assist_required: false }, now).application_route,
    "unknown",
  );
});

test("city preferences remain preferences and do not hard-exclude a valid program", () => {
  const result = evaluateAcademicMatch(
    baseProject,
    { ...baseProgram, university_city: "Munich" },
    now,
  );
  assert.equal(result.status, "eligible_for_review");
  assert.match(result.preference_notes.join(" "), /hors préférences/i);
});
