import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { orientationCandidatePriority } from "../src/lib/orientation-engine/writer/candidate-priority.ts";

const profile = {
  targetDegree: "Bachelor",
  bacStatus: "preparing",
  bacYear: "2027",
  germanLevel: "B2",
  studyLanguage: "Allemand",
};

test("Bac Lettres 2027 B2: prioritize the actual Bac rather than a generic action or assumed C1", () => {
  const result = orientationCandidatePriority(profile, "fr");
  assert.match(result.title, /Bac 2027/);
  assert.match(result.text, /B2/);
  assert.match(result.text, /Notre équipe/);
  assert.doesNotMatch(result.title + result.text, /C1|admis|éligible|garanti/);
  assert.doesNotMatch(result.title, /Votre prochaine action/);
});

test("obtained Bac: declared German level drives a plausible personal study step, not an admission claim", () => {
  const learning = orientationCandidatePriority({ ...profile, bacStatus: "obtained", germanLevel: "B1" }, "fr");
  assert.match(learning.title, /allemand/);
  assert.match(learning.text, /B1/);
  assert.doesNotMatch(learning.text, /B2 exigé|C1 exigé|certificat accepté/);
  const fluent = orientationCandidatePriority({ ...profile, bacStatus: "obtained", germanLevel: "C1" }, "fr");
  assert.match(fluent.title, /prochaine rentrée/);
  assert.doesNotMatch(fluent.text, /admission confirmée/);
});

test("no Bac and unknown status never invent a completed Bac, required certificates or a visa pathway", () => {
  const withoutBac = orientationCandidatePriority({ ...profile, bacStatus: "no_bac" }, "fr");
  assert.match(withoutBac.title, /prochaine étape/);
  assert.doesNotMatch(withoutBac.text, /Bac acquis|félicitations|Studienkolleg obligatoire/);
  assert.equal(orientationCandidatePriority({ ...profile, bacStatus: "unknown" }, "fr"), null);
  assert.equal(orientationCandidatePriority({ ...profile, targetDegree: "Master" }, "fr"), null);
});

test("custom year and language text is bounded to declared safe values", () => {
  const invalid = orientationCandidatePriority({ ...profile, bacYear: "2027 <script>", germanLevel: "C1 - certificate" }, "fr");
  assert.doesNotMatch(invalid.title + invalid.text, /<script>|C1 - certificate/);
  assert.match(invalid.title, /Bac/);
});

test("the four languages remain human and prioritize the same academic stage", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    const next = orientationCandidatePriority(profile, locale);
    assert.ok(next.title.length >= 10);
    assert.ok(next.text.length >= 55);
    assert.ok(next.yourStep.length >= 20);
    assert.ok(!/guaranteed admission|admission garantie|Zulassung garantiert/.test(next.text));
  }
});

test("single welcome message, single city expansion and single actionable conversion for personalized first contact", () => {
  const parent = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
  const writer = readFileSync("src/components/orientation/OrientationPersonalizedWriterCard.tsx", "utf8");
  const captureCopy = readFileSync("src/content/orientation-prospect-copy.ts", "utf8");
  assert.match(parent, /geographicFallback && !personalized/);
  assert.doesNotMatch(parent, /isBachelorFirstContact && bacWelcome && personalized/);
  assert.match(parent, /welcome=\{isBachelorFirstContact \? bacWelcome : null\}/);
  assert.match(parent, /personalized && !isBachelorFirstContact \? \(/);
  assert.match(writer, /const candidatePriority = orientationCandidatePriority\(answers, locale\)/);
  assert.match(writer, /\{priorityTitle\}/);
  assert.match(writer, /candidatePriority\?\.yourStep/);
  assert.match(writer, /showCityFallback/);
  assert.match(captureCopy, /Votre avenir en Allemagne commence ici/);
  assert.match(captureCopy, /Créer mon espace gratuit et continuer/);
  assert.match(parent, /<OrientationResearchPistesCard[\s\S]*?personalized && !isBachelorFirstContact/);
});
