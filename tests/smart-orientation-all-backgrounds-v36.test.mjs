import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createEmptyPublicOrientationAnswers,
  restorePublicOrientationAnswers,
} from "../src/lib/orientation/public.ts";
import { evaluateSmartOrientationPriority } from "../src/lib/phase2/smart-orientation.ts";
import {
  getAcademicAccessConclusion,
  getVerifiedProgrammeSet,
} from "../src/lib/orientation/verified-academic-options.ts";

const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const copy = readFileSync("src/content/orientation-copy.ts", "utf8");
const options = readFileSync("src/lib/student/profile-options.ts", "utf8");
const guidance = readFileSync("src/lib/orientation/universal-guidance.ts", "utf8");
const report = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const publicApi = readFileSync("src/app/api/orientation/prospect/route.ts", "utf8");
const prospectApi = readFileSync("src/app/api/prospect/orientation/route.ts", "utf8");
const validation = readFileSync("src/lib/orientation/validate.ts", "utf8");

function noBacAnswers(overrides = {}) {
  return restorePublicOrientationAnswers({
    ...createEmptyPublicOrientationAnswers(),
    bacStatus: "no_bac",
    lastDiploma: "none",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    germanLevel: "A1",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    budgetRange: "À définir",
    preferredCities: ["Berlin"],
    ...overrides,
  });
}

test("SO-V3.6 preserves a no-bac starting point without inventing Bac data", () => {
  const answers = noBacAnswers();
  assert.equal(answers.bacStatus, "no_bac");
  assert.equal(answers.bacYear, "");
  assert.equal(answers.bacTrack, "");
  assert.equal(answers.generalAverage, "");
});

test("SO-V3.6 keeps a complete no-bac project in the orientation flow with human review", () => {
  const result = evaluateSmartOrientationPriority(noBacAnswers());
  assert.equal(result.state, "priority_standard");
  assert.equal(result.requiresHumanReview, true);
  assert.ok(result.reasonCodes.includes("no_bac"));
  assert.equal(result.reasonCodes.includes("average_missing"), false);
  assert.equal(result.reasonCodes.includes("project_information_missing"), false);
});

test("SO-V3.6 never invents university access or exact programme fit without a Bac", () => {
  const answers = noBacAnswers();
  const access = getAcademicAccessConclusion(answers);
  assert.equal(access.status, "needs_human_verification");
  assert.match(access.detail, /ne suppose pas un accès universitaire automatique/);
  assert.equal(getVerifiedProgrammeSet(answers), null);
});

test("SO-V3.6 form explicitly supports with-Bac, preparing-Bac and no-Bac students", () => {
  assert.match(form, /\["obtained", "preparing", "no_bac"\]/);
  assert.match(form, /answers\.bacStatus !== "no_bac"/);
  assert.match(form, /answers\.bacStatus === "no_bac" && !answers\.lastDiploma/);
  assert.match(copy, /Je n’ai pas de Bac ni de diplôme secondaire équivalent/);
  assert.match(copy, /I do not have a Baccalaureate or equivalent school-leaving qualification/);
});

test("SO-V3.6 broadens the previous-education choices", () => {
  assert.match(options, /value: "none", label: "Aucun diplôme"/);
  assert.match(options, /value: "secondary_other"/);
  assert.match(options, /value: "Bac \+ 1"/);
  assert.match(options, /value: "Bac \+ 2"/);
  assert.match(options, /value: "Licence"/);
  assert.match(options, /value: "Master"/);
  assert.match(options, /value: "other"/);
});

test("SO-V3.6 APIs validate no-Bac submissions without requiring fake Bac year or track", () => {
  assert.match(publicApi, /validatePublicOrientationAnswers/);
  assert.match(prospectApi, /validatePublicOrientationAnswers/);
  assert.match(validation, /answers\.bacStatus !== "no_bac"/);
  assert.match(validation, /answers\.bacStatus === "no_bac" && !answers\.lastDiploma/);
  assert.match(validation, /answers\.bacYear \|\| answers\.bacTrack \|\| answers\.generalAverage/);
});

test("SO-V3.6 gives no-Bac students an understandable, non-rejection explanation", () => {
  assert.match(guidance, /Votre point de départ académique doit être vérifié/);
  assert.match(guidance, /Cela n’est pas un refus/);
  assert.match(guidance, /lastDiploma/);
  assert.match(guidance, /avant de vous proposer une candidature universitaire/);
});

test("SO-V3.6 PDF adapts both education and study-language profile lines", () => {
  assert.match(report, /answers\.bacStatus === "no_bac"/);
  assert.match(report, /Sans Bac · Dernier niveau/);
  assert.match(report, /answers\.studyLanguage === "Anglais"/);
  assert.match(report, /answers\.studyLanguage === "Allemand et anglais"/);
  assert.match(report, /DE \$\{german\} · EN \$\{english\}/);
});


test("SO-V3.6 Master guidance evaluates the previous university qualification, not only the Bac", () => {
  assert.match(guidance, /Votre projet de Master doit être vérifié/);
  assert.match(guidance, /votre diplôme précédent \(\$\{lastDiploma\}\) devient la base principale de l’évaluation/);
  assert.match(guidance, /prérequis académiques, la langue et les conditions propres aux programmes/);
});

test("SO-V3.6 no-Bac guidance waits for access confirmation before programme selection", () => {
  assert.match(guidance, /Après confirmation de votre accès académique/);
  assert.match(guidance, /confirmer votre accès académique, puis retenir 2 ou 3 programmes vérifiés/);
  assert.match(guidance, /documents scolaires disponibles/);
});

test("SO-V3.6 does not tell language-ready students they are waiting for language", () => {
  assert.match(guidance, /La sélection académique et le dossier avancent ensemble, sans étape d’attente artificielle/);
  assert.match(guidance, /votre diplôme universitaire précédent et ses relevés/);
});
