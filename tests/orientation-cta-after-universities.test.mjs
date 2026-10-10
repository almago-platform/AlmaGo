import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const parent = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
const writer = readFileSync("src/components/orientation/OrientationPersonalizedWriterCard.tsx", "utf8");
const research = readFileSync("src/components/orientation/OrientationResearchPistesCard.tsx", "utf8");

test("render all documented university cards BEFORE the single human continuation CTA", () => {
  const inParent = parent.indexOf("<OrientationPersonalizedWriterCard");
  const extras = parent.indexOf("<OrientationResearchPistesCard");
  const closing = parent.indexOf("<OrientationHumanClosingCard");
  assert.ok(inParent >= 0 && extras > inParent && closing > extras);
  assert.match(parent, /<OrientationPersonalizedWriterCard[\s\S]*?showClosing=\{false\}/);
  assert.match(parent, /personalized && !isBachelorFirstContact \? \(/);
  assert.match(parent, /<OrientationHumanClosingCard locale=\{locale\} \/>/);
  assert.doesNotMatch(parent, /<OrientationHumanClosingCard[\s\S]*?showCta=\{prospectCaptureEnabled && isBachelorFirstContact\}/);
  assert.match(writer, /showClosing = true/);
  assert.match(writer, /\{showClosing \? \([\s\S]*?<OrientationHumanClosingCard/);
  assert.equal((parent.match(/<OrientationHumanClosingCard/g) || []).length, 1);
  assert.match(writer, /href="#orientation-prospect-capture"/);
});

test("the verified selection counter and dynamically fetched supplementary count are separate", () => {
  assert.match(writer, /primarySelectionCount\(result\.selected\.length, locale\)/);
  assert.match(writer, /1 piste prioritaire/);
  assert.match(writer, /pistes sélectionnées/);
  assert.match(research, /additionalCount: \(count: number\)/);
  assert.match(research, /1 autre université à découvrir/);
  assert.match(research, /autres universités à découvrir/);
  assert.match(research, /status === "ready" && supplemental\.length > 0/);
  assert.match(research, /filterSupplementalResearchPistes\(items, existingShortlist\)/);
  assert.match(research, /existingShortlist\.length >= 3/);
  assert.match(research, /t\.disclaimer/);
  assert.doesNotMatch(research, /promesse d.admission confirmée/);
});

test("a positive invitation must not be presented as academic eligibility confirmation", () => {
  assert.match(writer, /Pourquoi cette piste mérite votre attention/);
  assert.match(writer, /Une formation en lien avec votre projet, à approfondir avec notre équipe/);
  assert.match(writer, /Une piste prometteuse, à approfondir avec notre équipe/);
  assert.doesNotMatch(writer, /Profil globalement compatible, avec des points à confirmer/);
  assert.doesNotMatch(writer, /Compatibilité avec les critères vérifiés/);
  assert.match(writer, /Seule l’université peut décider d’une admission/);
});

test("priority and additional-university labels support French, Arabic, English and German", () => {
  for (const text of [
    "1 piste prioritaire", "خيار رئيسي واحد", "1 priority option", "1 bevorzugte Option",
    "autres universités à découvrir", "جامعات أخرى لاكتشافها",
    "more universities to explore", "weitere Hochschulen entdecken",
  ]) assert.ok((writer + research).includes(text), `Missing locale phrase: ${text}`);
});
