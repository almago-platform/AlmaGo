import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

// Exercise the production request builder without importing its server-only runtime
// or sending candidate details to Gemini. This is a prompt-contract test, not a
// test of live model output.
const source = readFileSync("src/lib/orientation-engine/letter/gemini.ts", "utf8");

function buildRequestForTest(locale, baseline) {
  const localeBlock = source.match(/const localeInstructions: Record<Locale, string> = \{[\s\S]*?\n\};/)?.[0];
  const requestBlock = source.match(
    /function requestBody\(locale: Locale, baseline: OrientationLetterOutput\) \{[\s\S]*?\n\}\n\nasync function generateLetter/,
  )?.[0];

  assert.ok(localeBlock, "locale instructions must be present");
  assert.ok(requestBlock, "the production request builder must be present");

  const executable = [
    localeBlock.replace("const localeInstructions: Record<Locale, string>", "const localeInstructions"),
    requestBlock
      .replace(/\n\nasync function generateLetter$/, "")
      .replace(
        "function requestBody(locale: Locale, baseline: OrientationLetterOutput)",
        "function requestBody(locale, baseline)",
      ),
    "requestBody",
  ].join("\n");

  const builder = runInNewContext(executable);
  return builder(locale, baseline);
}

const examples = [
  {
    name: "Bac économie et gestion, accès académique non confirmé, aucune ville",
    paragraphs: [
      "Avec un bac Économie et gestion obtenu en 2024 et une moyenne de 15/20, vous envisagez un Bachelor en informatique.",
      "Votre accès académique doit encore être vérifié selon les règles officielles applicables à votre diplôme.",
      "Vous déclarez un niveau B1 en allemand et B2 en anglais. Les certificats acceptés restent à vérifier.",
      "Vous n'avez pas encore choisi de ville. Plusieurs régions peuvent être comparées.",
      "Les programmes cités sont des pistes à examiner. Leurs conditions d'admission ne sont pas encore confirmées.",
    ],
    closing: "Commencez par vérifier votre accès académique et les exigences linguistiques des formations envisagées.",
  },
  {
    name: "Bac sciences, allemand avancé, ville choisie",
    paragraphs: [
      "Après un bac Sciences obtenu en 2025, vous souhaitez étudier l'ingénierie en Bachelor.",
      "L'accès académique repose sur une règle vérifiée, mais la décision finale appartient à l'université.",
      "Vous indiquez un niveau C1 en allemand. Le type de certificat attendu reste à confirmer.",
      "Vous préférez la ville d'Aachen. Nous la gardons comme préférence.",
      "Les formations proposées sont des options à comparer, et non des admissions accordées.",
    ],
    closing: "Vérifiez les exigences propres aux formations envisagées avant de préparer les candidatures.",
  },
  {
    name: "Sans bac, route académique et niveau linguistique inconnus",
    paragraphs: [
      "Vous n'avez pas de baccalauréat et souhaitez commencer des études en Allemagne.",
      "Votre voie d'accès aux études supérieures doit être clarifiée avant de choisir des universités.",
      "Votre niveau d'allemand et votre niveau d'anglais restent à préciser.",
      "Vous n'avez pas indiqué de ville préférée.",
      "Nous ne proposons pas d'université à ce stade, car le parcours académique n'est pas établi.",
    ],
    closing: "Clarifiez d'abord votre parcours scolaire et les possibilités d'accès aux études.",
  },
];

const locales = ["fr", "ar", "en", "de"];

test("Gemini prompt keeps safety, plain language and paragraph roles explicit", () => {
  const { systemInstruction } = buildRequestForTest("fr", examples[0]);
  const instruction = systemInstruction.parts[0].text;

  for (const phrase of [
    "Never invent university admission",
    "Keep all cautions, limitations",
    "If academic access is unconfirmed",
    "Language levels in the reference are student-declared",
    "If no city was chosen",
    "Programme leads are options to examine",
    "Return exactly the same number of paragraphs",
    "one or two short sentences per paragraph",
    "Avoid filler, repeated reassurance",
    "closing to one short, practical next step",
  ]) {
    assert.ok(instruction.includes(phrase), `Missing instruction: ${phrase}`);
  }
  assert.ok(instruction.includes("Vouvoie toujours le candidat"));
  assert.ok(instruction.includes("sans jargon administratif"));
});

test("FR/AR/EN/DE all receive the plain-language editorial requirements", () => {
  const languageMarkers = {
    fr: "français simple",
    ar: "العربية الفصحى السهلة",
    en: "clear, direct everyday English",
    de: "einfaches, direktes Deutsch",
  };

  for (const locale of locales) {
    const text = buildRequestForTest(locale, examples[0]).systemInstruction.parts[0].text;
    assert.ok(text.includes(languageMarkers[locale]), `No accessible language guidance for ${locale}`);
    assert.ok(text.includes("Keep all cautions, limitations"), `Missing shared safeguards for ${locale}`);
  }
});

for (const example of examples) {
  test(`request contract preserves all supplied facts: ${example.name}`, () => {
    for (const locale of locales) {
      const baseline = {
        provider: "deterministic-letter-v1",
        mode: "deterministic",
        title: "Votre orientation pour étudier en Allemagne",
        paragraphs: example.paragraphs,
        closing: example.closing,
        scoutUsed: false,
      };
      const request = buildRequestForTest(locale, baseline);
      const payload = JSON.parse(request.contents[0].parts[0].text);
      const schema = request.generationConfig.responseJsonSchema.properties.paragraphs;

      assert.equal(payload.locale, locale);
      assert.equal(JSON.stringify(payload.reference_paragraphs), JSON.stringify(example.paragraphs));
      assert.equal(payload.reference_closing, example.closing);
      assert.equal(
        JSON.stringify(Object.keys(payload).sort()),
        JSON.stringify(["locale", "reference_paragraphs", "reference_closing"].sort()),
      );
      assert.equal(schema.minItems, example.paragraphs.length);
      assert.equal(schema.maxItems, example.paragraphs.length);
      assert.equal(request.generationConfig.responseMimeType, "application/json");
      assert.ok(!("tools" in request), "Letter rewriting must not run internet searches");
    }
  });
}
