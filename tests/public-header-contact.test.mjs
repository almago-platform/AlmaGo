import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const copy = readFileSync("src/content/homepage-v42-copy.ts", "utf8");

test("public header connects Contact and the real About and Services sections", () => {
  assert.match(header, /\[marketingNav\.contact, "\/contact"\]/);
  assert.match(header, /\[marketingNav\.about, "#apropos"\]/);
  assert.match(header, /\[marketingNav\.services, "#services"\]/);
  assert.equal((header.match(/navigation\.map/g) || []).length, 2, "desktop and mobile share marketing navigation");
});

test("marketing header labels exist in four languages", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp("^  " + locale + ": \\{", "m"));
  }
  assert.match(copy, /contact: "Contact"/);
  assert.match(copy, /contact: "اتصل بنا"/);
  assert.match(copy, /contact: "Kontakt"/);
});
