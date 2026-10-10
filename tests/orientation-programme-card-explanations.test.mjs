import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { explainDocumentedProgramme } from "../src/lib/orientation-engine/letter/programme-explanations.ts";

function fixture(overrides = {}) {
  const base = {
    programme: {
      id: "test",
      name: "Informatik",
      degreeLevel: "Bachelor",
      field: "Computer Science",
      teachingLanguage: "German",
      germanLevelRequired: "C1",
      englishLevelRequired: null,
      university: { name: "University example", city: "Berlin" },
    },
    status: "missing_information",
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "teaching_language_match", status: "eligible" },
      { code: "academic_access_review", status: "missing_information" },
      { code: "language_insufficient", status: "conditional", value: "DE C1" },
      { code: "deadline_unknown", status: "unknown" },
      { code: "source_verified", status: "eligible" },
    ],
    informationConfidence: "high",
    sources: [],
  };
  return { ...base, ...overrides, programme: { ...base.programme, ...overrides.programme } };
}
const answers = {
  targetDegree: "Bachelor", targetField: "Informatique",
  germanLevel: "B1", englishLevel: "B2",
  studyLanguage: "Allemand", preferredCities: [],
};

test("bac économie B1: academic access, German C1 and deadline stay unconfirmed", () => {
  const evaluation = fixture();
  const before = JSON.stringify(evaluation);
  const result = explainDocumentedProgramme(evaluation, answers, "fr");
  assert.match(result.reason, /niveau et le domaine/);
  assert.match(result.reason, /enseignement en allemand/);
  assert.match(result.checks.join(" "), /votre diplôme/);
  assert.match(result.checks.join(" "), /catalogue indique C1/);
  assert.match(result.checks.join(" "), /certificat accepté/);
  assert.match(result.checks.join(" "), /date limite/);
  assert.doesNotMatch(result.reason, /admis|admission garantie|éligible/i);
  assert.equal(JSON.stringify(evaluation), before, "explanations must not change any admission rule");
});

test("English-taught alternative is explained without implying chosen-language match", () => {
  const evaluation = fixture({
    programme: { teachingLanguage: "English", germanLevelRequired: null, englishLevelRequired: "B2" },
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "teaching_language_other", status: "conditional" },
      { code: "academic_access_review", status: "missing_information" },
      { code: "language_satisfied", status: "eligible", value: "EN B2" },
      { code: "deadline_to_verify", status: "missing_information" },
    ],
  });
  const result = explainDocumentedProgramme(evaluation, answers, "fr");
  assert.match(result.reason, /anglais/);
  assert.match(result.reason, /différent de votre préférence/);
  assert.match(result.checks.join(" "), /certificat/);
  assert.match(result.checks.join(" "), /date limite/);
  assert.doesNotMatch(result.reason, /admis|admission garantie/i);
});

test("unknown teaching preference is not claimed as a language match", () => {
  const result = explainDocumentedProgramme(fixture({
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "teaching_language_match", status: "eligible" },
      { code: "language_satisfied", status: "eligible", value: "DE C1" },
    ],
  }), { ...answers, studyLanguage: "À définir" }, "fr");
  assert.match(result.reason, /Langue d'enseignement indiquée/);
  assert.doesNotMatch(result.reason, /correspond à votre préférence/);
  assert.match(result.checks.join(" "), /certificat/);
});

test("preferred city is only claimed when the engine has a matching rule", () => {
  const evaluation = fixture({
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "preferred_city", status: "eligible" },
      { code: "language_satisfied", status: "eligible", value: "DE C1" },
    ],
  });
  const matched = explainDocumentedProgramme(evaluation, { ...answers, preferredCities: ["Berlin"] }, "fr");
  assert.match(matched.reason, /Berlin, une ville que vous avez choisie/);
  const noRule = explainDocumentedProgramme({ ...evaluation, rules: evaluation.rules.filter(r => r.code !== "preferred_city") }, answers, "fr");
  assert.doesNotMatch(noRule.reason, /Berlin/);
});

test("Studienkolleg, uni-assist and incomplete source are never treated as approvals", () => {
  const result = explainDocumentedProgramme(fixture({
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "studienkolleg_required", status: "conditional" },
      { code: "uni_assist_required", status: "eligible" },
      { code: "source_incomplete", status: "missing_information" },
    ],
  }), answers, "fr");
  assert.match(result.checks.join(" "), /Studienkolleg/);
  assert.match(result.checks.join(" "), /uni-assist/);
  assert.ok(result.checks.length <= 4);
});

test("FR/AR/EN/DE explanations are localized and identify conditions to check", () => {
  const markers = { fr: "votre diplôme", ar: "شهادتك", en: "your diploma", de: "dein Abschluss" };
  for (const [locale, marker] of Object.entries(markers)) {
    const result = explainDocumentedProgramme(fixture(), answers, locale);
    assert.ok(result.reason.length > 20, locale);
    assert.ok(result.checks.length >= 2, locale);
    assert.ok(result.checks.join(" ").includes(marker), locale);
  }
});

test("rendering separates reason, verification checks and research candidates", () => {
  const ui = readFileSync("src/components/orientation/OrientationLetterCard.tsx", "utf8");
  assert.match(ui, /explainDocumentedProgramme\(recommendation, answers, locale\)/);
  assert.match(ui, /piste\.reason/);
  assert.match(ui, /t\.toCheck/);
  assert.match(ui, /piste\.checks\.map/);
  assert.match(ui, /reason: t\.researchReason/);
  assert.match(ui, /checks: \[\.\.\.t\.researchChecks\]/);
  assert.doesNotMatch(ui, /reason: candidate\.reason/);
});
