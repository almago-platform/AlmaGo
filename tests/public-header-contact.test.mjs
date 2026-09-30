import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("public header exposes the contact route", () => {
  assert.match(header, /\[nav\.contact, "\/contact"\]/);
});

test("contact header label exists in all four locales", () => {
  assert.equal((copy.match(/contact:/g) || []).length, 4);
  assert.match(copy, /contact: "Contact"/);
  assert.match(copy, /contact: "تواصل معنا"/);
  assert.match(copy, /contact: "Kontakt"/);
});
