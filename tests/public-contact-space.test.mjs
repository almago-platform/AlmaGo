import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/contact/page.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("public contact route uses only the confirmed Campus Allemagne email", () => {
  assert.match(page, /contact@campus-allemagne\.info/);
  assert.match(page, /mailto:contact@campus-allemagne\.info/);
  assert.doesNotMatch(page, /tel:/);
  assert.doesNotMatch(page, /<form/);
});

test("contact route keeps a dedicated canonical URL", () => {
  assert.match(page, /new URL\("\/contact", publicOrigin\)/);
  assert.match(page, /index: true/);
  assert.match(page, /follow: true/);
});

test("all four public footer locales expose the contact route", () => {
  assert.equal((copy.match(/"\/contact"/g) || []).length, 4);
  assert.match(copy, /\["Contact", "\/contact"\]/);
  assert.match(copy, /\["تواصل معنا", "\/contact"\]/);
  assert.match(copy, /\["Kontakt", "\/contact"\]/);
});

test("contact route reuses the approved public brand and footer", () => {
  assert.match(page, /BrandLogo/);
  assert.match(page, /HomeFooter/);
  assert.match(page, /rebrandCopy\(getNativeCopy\(locale\)\)/);
});
