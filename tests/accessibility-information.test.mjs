import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/accessibilite/page.tsx", "utf8");

test("accessibility page describes real measures without claiming certification", () => {
  assert.match(page, /Navigation au clavier/);
  assert.match(page, /Libellés compréhensibles/);
  assert.match(page, /différents écrans/);
  assert.match(page, /vérifications automatisées d’accessibilité/);

  assert.equal(/conforme\s+(WCAG|RGAA)/i.test(page), false);
  assert.equal(/certifi[eé][e]?\s+(WCAG|RGAA|accessible)/i.test(page), false);
  assert.match(page, /ne constituent pas une déclaration de conformité/i);
});
