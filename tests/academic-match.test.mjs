import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAcademicMatch, programPublicationIssues } from "../src/lib/academic-match.ts";

const now = new Date("2026-09-25T12:00:00Z");
const project = {
  target_degree: "Master", target_field: "Computer Science", target_intake: "Hiver 2027",
  preferred_study_language: "English", preferred_cities: ["Berlin"],
  current_diploma: "Bachelor Computer Engineering", current_german_level: "B2",
};
const program = {
  degree_level: "Master", field: "Computer Science", teaching_language: "English",
  intake_terms: ["Wintersemester"], winter_deadline: "2027-07-15", summer_deadline: null,
  application_url: "https://example.edu/apply", source_url: "https://example.edu/program",
  verified_at: "2026-09-24T10:00:00Z", is_active: true, uni_assist_required: false,
  diploma_required: null, german_level_required: null, english_level_required: null,
  university_city: "Berlin",
};

test("verified exact matches are eligible for review without claiming admission", () => {
  const result = evaluateAcademicMatch(project, program, now);
  assert.equal(result.status, "eligible_for_review");
  assert.deepEqual(result.reasons, []);
  assert.deepEqual(result.manual_checks, []);
  assert.equal(result.application_route, "unknown");
});

test("publication safety excludes inactive, unverified or unsafe programs", () => {
  assert.deepEqual(programPublicationIssues(program, now), []);
  for (const candidate of [
    { ...program, is_active: false }, { ...program, verified_at: null },
    { ...program, source_url: "javascript:alert(1)" }, { ...program, application_url: "a" },
  ]) {
    assert.ok(programPublicationIssues(candidate, now).length > 0);
    assert.equal(evaluateAcademicMatch(project, candidate, now).status, "excluded");
  }
});

test("explicit degree, intake and past-deadline mismatches are hard exclusions", () => {
  assert.equal(evaluateAcademicMatch(project, { ...program, degree_level: "Bachelor" }, now).status, "excluded");
  assert.equal(evaluateAcademicMatch(project, { ...program, intake_terms: ["Sommersemester"] }, now).status, "excluded");
  assert.equal(evaluateAcademicMatch(project, { ...program, winter_deadline: "2026-07-15" }, now).status, "excluded");
});

test("unknown academic facts stay manual instead of becoming invented matches", () => {
  const noDeadline = evaluateAcademicMatch(project, { ...program, winter_deadline: null }, now);
  assert.equal(noDeadline.status, "needs_manual_review");
  assert.match(noDeadline.manual_checks.join(" "), /aucune date ne doit être inventée/i);

  const diploma = evaluateAcademicMatch(project, { ...program, diploma_required: "Bachelor with 180 ECTS" }, now);
  assert.equal(diploma.status, "needs_manual_review");
  assert.match(diploma.manual_checks.join(" "), /compatibilité du diplôme/i);
});

test("language gaps are manual checks, not admission predictions", () => {
  const result = evaluateAcademicMatch(
    { ...project, current_german_level: "A2" },
    { ...program, german_level_required: "B2" },
    now,
  );
  assert.equal(result.status, "needs_manual_review");
  assert.match(result.manual_checks.join(" "), /inférieur/i);
});

test("application route is explicit only for uni-assist", () => {
  assert.equal(evaluateAcademicMatch(project, { ...program, uni_assist_required: true }, now).application_route, "uni_assist");
  assert.equal(evaluateAcademicMatch(project, { ...program, uni_assist_required: false }, now).application_route, "unknown");
});

test("city preferences never hard-exclude a valid program", () => {
  const result = evaluateAcademicMatch(project, { ...program, university_city: "Munich" }, now);
  assert.equal(result.status, "eligible_for_review");
  assert.match(result.preference_notes.join(" "), /hors préférences/i);
});
