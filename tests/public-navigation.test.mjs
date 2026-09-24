import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");

test("public header links homepage sections safely from every public page", () => {
  for (const anchor of ["parcours", "role", "espace"]) {
    assert.match(header, new RegExp(`href="/#${anchor}"`));
    assert.equal(
      header.includes(`href="#${anchor}"`),
      false,
      `header must not use page-local #${anchor} outside the homepage`,
    );
  }
});

test("public header exposes help and trust destinations", () => {
  assert.match(header, /href="\/aide"/);
  assert.match(header, /Centre d’aide/);
  assert.match(header, /href="\/confiance"/);
  assert.match(header, />Confiance<\/Link>/);
});
