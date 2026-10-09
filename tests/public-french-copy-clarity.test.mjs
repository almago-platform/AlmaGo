import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("French public FAQ uses plain student-facing wording", () => {
  assert.match(copy, /Cherchez ensuite des programmes adaptés/);
  assert.match(copy, /Certaines démarches ne peuvent commencer qu’après une admission/);
  assert.match(copy, /Vous les envoyez selon les consignes de chaque université/);
  assert.match(copy, /nous indiquons la source et la date de vérification/);

  assert.doesNotMatch(copy, /Cherchez ensuite une admission adaptée/);
  assert.doesNotMatch(copy, /par le canal demandé par l’université/);
  assert.doesNotMatch(copy, /date de contrôle quand elles sont disponibles/);
});
