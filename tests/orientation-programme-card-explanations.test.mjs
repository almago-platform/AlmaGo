import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { explainDocumentedProgramme } from "../src/lib/orientation-engine/letter/programme-explanations.ts";

function programme(overrides = {}) {
  const base = {
    programme: {
      id: "programme-1",
      name: "Informatik",
      teachingLanguage: "German",
      university: { city: "Berlin", name: "Example University" },
    },
    status: "missing_information",
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "teaching_language_match", status: "eligible" },
      { code: "academic_access_review", status: "missing_information" },
      { code: "language_insufficient", status: "conditional", value: "DE C1" },
      { code: "deadline_unknown", status: "unknown" },
    ],
  };
  return { ...base, ...overrides, programme: { ...base.programme, ...overrides.programme } };
}
const answers = {
  studyLanguage: "Allemand",
  germanLevel: "B1",
  englishLevel: "B2",
  preferredCities: [],
};

test("a first-contact card encourages discovery without displaying application chores", () => {
  const p = programme();
  const before = JSON.stringify(p);
  const result = explainDocumentedProgramme(p, answers, "fr");
  assert.match(result.reason, /Berlin/);
  assert.match(result.reason, /niveau et le domaine/);
  assert.match(result.reason, /allemand/);
  assert.doesNotMatch(result.reason, /vérifi|admission|admis|garanti|certificat|date limite|candidature/i);
  assert.equal(JSON.stringify(p), before, "the engine's decisions must remain unchanged");
  assert.equal(Object.hasOwn(result, "checks"), false, "no student-facing verification list");
});

test("English alternatives are described as opportunities, not student deficiencies", () => {
  const p = programme({
    programme: { teachingLanguage: "English", university: { city: "Hamburg" } },
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "teaching_language_other", status: "conditional" },
      { code: "academic_access_review", status: "missing_information" },
    ],
  });
  const result = explainDocumentedProgramme(p, answers, "fr");
  assert.match(result.reason, /Hamburg/);
  assert.match(result.reason, /anglais/);
  assert.match(result.reason, /autre possibilité/);
  assert.doesNotMatch(result.reason, /différent de votre préférence|vérifi|certificat/i);
});

test("language preferences are not invented for an undecided student", () => {
  const result = explainDocumentedProgramme(programme(), { ...answers, studyLanguage: "À définir" }, "fr");
  assert.match(result.reason, /Elle est proposée en allemand/);
  assert.doesNotMatch(result.reason, /comme vous le souhaitez/);
});

test("preferred city is mentioned only when the engine has established a match", () => {
  const p = programme({
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "preferred_city", status: "eligible" },
    ],
  });
  assert.match(explainDocumentedProgramme(p, answers, "fr").reason, /préférences/);
  assert.doesNotMatch(
    explainDocumentedProgramme({ ...p, rules: p.rules.filter(r => r.code !== "preferred_city") }, answers, "fr").reason,
    /préférences/,
  );
});

test("unconfirmed fit does not become an admission claim", () => {
  const result = explainDocumentedProgramme(programme({
    rules: [{ code: "academic_access_review", status: "missing_information" }],
  }), answers, "fr");
  assert.match(result.reason, /piste supplémentaire/);
  assert.doesNotMatch(result.reason, /admissible|éligible|admis|garanti/i);
});

test("all four locales remain inviting while preserving a factual teaching-language label", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    const result = explainDocumentedProgramme(programme(), answers, locale);
    assert.ok(result.reason.length >= 40, locale);
    assert.ok(result.reason.includes("Berlin"), locale);
    assert.equal(Object.keys(result).join(","), "reason", locale);
  }
});

test("the public result delegates academic checks to Campus Allemagne rather than the student", () => {
  const card = readFileSync("src/components/orientation/OrientationLetterCard.tsx", "utf8");
  const engine = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
  const writer = readFileSync("src/lib/orientation-engine/letter/gemini.ts", "utf8");
  const baseline = readFileSync("src/lib/orientation-engine/intelligence.ts", "utf8");

  assert.match(card, /Des formations à découvrir/);
  assert.match(card, /notre équipe étudiera les conditions/);
  assert.match(card, /reason: t\.researchReason/);
  assert.match(card, /explainDocumentedProgramme\(recommendation, answers, locale\)/);
  assert.doesNotMatch(card, /À vérifier avant de candidater|piste\.checks|t\.toCheck|researchChecks/);
  assert.match(engine, /Comprendre notre analyse en détail/);
  assert.match(writer, /do not give the student an administrative to-do list/i);
  assert.match(baseline, /Si vous choisissez de continuer avec Campus Allemagne/);
});
