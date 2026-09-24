import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPublicLocale,
  publicLocales,
  readyPublicLocales,
} from "../src/lib/public-locales.ts";

test("French remains the only public-ready locale until full translations are reviewed", () => {
  assert.equal(defaultPublicLocale.code, "fr");
  assert.equal(defaultPublicLocale.status, "ready");

  const ready = readyPublicLocales();
  assert.deepEqual(ready.map((locale) => locale.code), ["fr"]);
});

test("planned AlmaGo locales are explicit and structurally ready for RTL", () => {
  assert.deepEqual(
    publicLocales.map((locale) => locale.code),
    ["fr", "en", "de", "ar"],
  );

  assert.equal(new Set(publicLocales.map((locale) => locale.code)).size, publicLocales.length);
  assert.equal(publicLocales.find((locale) => locale.code === "ar")?.direction, "rtl");

  for (const locale of publicLocales) {
    assert.match(locale.htmlLang, /^[a-z]{2}$/);
    assert.match(locale.openGraphLocale, /^[a-z]{2}_[A-Z]{2}$/);
    assert.ok(locale.label.length > 0);
  }
});
