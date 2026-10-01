import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("French public FAQ uses plain student-facing wording", () => {
  assert.match(copy, /Cherchez ensuite des programmes adaptés/);
  assert.match(copy, /Attendez d’avoir une admission avant les démarches qui en dépendent/);
  assert.match(copy, /Vous les envoyez de la façon demandée par l’université/);
  assert.match(copy, /date de vérification lorsqu’elles sont disponibles/);

  assert.doesNotMatch(copy, /Cherchez ensuite une admission adaptée/);
  assert.doesNotMatch(copy, /par le canal demandé par l’université/);
  assert.doesNotMatch(copy, /date de contrôle quand elles sont disponibles/);
});
