import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/not-found.tsx", "utf8");

test("public not-found page stays useful and non-indexable", () => {
  assert.match(page, /Page introuvable/);
  assert.match(page, /index:\s*false/);
  assert.match(page, /follow:\s*false/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/aide"/);
  assert.match(page, /href="\/login"/);
});

test("not-found page does not expose technical failure language", () => {
  assert.equal(/stack trace|exception|internal server error|>\s*500\s*</i.test(page), false);
  assert.match(page, /Aucun élément de votre dossier n’est modifié/);
  assert.match(page, /Sources officielles/);
});
