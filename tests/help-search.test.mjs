import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const search = readFileSync("src/components/public/HelpQuestionSearch.tsx", "utf8");
const helpPage = readFileSync("src/app/aide/page.tsx", "utf8");

test("help search stays local and does not send the query anywhere", () => {
  assert.equal(/fetch\s*\(/.test(search), false);
  assert.equal(/analytics|telemetry|track\s*\(/i.test(search), false);
  assert.match(search, /La recherche filtre uniquement les réponses affichées sur cette page/);
  assert.match(search, /n’est pas envoyée à un service externe/);
});

test("help search remains accessible and reversible", () => {
  assert.match(search, /type="search"/);
  assert.match(search, /aria-live="polite"/);
  assert.match(search, /Voir toutes les questions/);
  assert.match(search, /Effacer/);
});

test("help page uses the searchable question component", () => {
  assert.match(helpPage, /HelpQuestionSearch/);
  assert.match(helpPage, /groups=\{questions\}/);
});
