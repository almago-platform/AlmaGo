import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const form = read("src/components/orientation/PublicOrientationForm.tsx");
const card = read("src/components/orientation/SmartOrientationResultCard.tsx");
const copy = read("src/content/smart-orientation-copy.ts");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");

test("SO-2 keeps legacy Smart Orientation available outside the Bachelor first-contact view", () => {
  assert.match(form, /evaluateSmartOrientationPriority\(answers\)/);
  assert.match(form, /isBachelorFirstContact = answers\.targetDegree === "Bachelor"/);
  assert.match(form, /!isBachelorFirstContact \? \(/);
  assert.match(form, /<SmartOrientationResultCard[\s\S]*result=\{smartPriority\}/);
  assert.match(form, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
  assert.match(form, /Voir les informations de mon profil/);
});

test("SO-2 exposes no technical priority enum to the visitor", () => {
  assert.doesNotMatch(card, /priority_ready|priority_prepare_now|priority_standard|priority_follow_up/);
  assert.match(card, /copy\.states\[result\.state\]/);
});

test("SO-2 explains language preparation without lowering priority", () => {
  assert.match(card, /language_preparation_needed/);
  assert.match(copy, /Votre niveau de langue devient une étape de la route/);
  assert.match(copy, /مستواك اللغوي يصبح جزءًا من المسار/);
});

test("SO-2 gives sensitive fields an explicit human-review notice", () => {
  assert.match(card, /result\.requiresHumanReview/);
  assert.match(copy, /Votre domaine demande une vérification individualisée/);
  assert.match(copy, /مجالك يحتاج إلى مراجعة فردية/);
});

test("SO-2 provides copy for every supported locale and every priority state", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: SmartOrientationCopy`));
  }
  for (const state of [
    "priority_ready",
    "priority_prepare_now",
    "priority_standard",
    "priority_follow_up",
  ]) {
    assert.match(copy, new RegExp(`${state}:`));
  }
});

test("SO-2 CTA points to optional existing prospect capture only when enabled", () => {
  assert.match(card, /prospectCaptureEnabled \?/);
  assert.match(card, /href="#orientation-prospect-capture"/);
  assert.match(capture, /id="orientation-prospect-capture"/);
});

test("SO-2 copy does not promise admission or visa outcomes", () => {
  assert.doesNotMatch(
    copy,
    /fortes chances|admission garantie|visa garanti|garantit? (?:une )?admission|guaranteed admission|guaranteed visa/i,
  );
  assert.match(copy, /ne constitue ni une admission universitaire, ni une garantie de visa/);
  assert.match(copy, /ولا تمثل قبولًا جامعيًا أو ضمانًا للحصول على التأشيرة/);
});
