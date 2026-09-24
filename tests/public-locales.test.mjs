import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPublicLocale,
  publicLocales,
  readyPublicLocales,
} from "../src/lib/public-locales.ts";

test("French remains the only public locale marked ready until translations are complete", () => {
  assert.equal(defaultPublicLocale.code, "fr");
  assert.equal(defaultPublicLocale.status, "ready");

  assert.deepEqual(
    readyPublicLocales().map((locale) => locale.code),
    ["fr"],
  );

  for (const locale of publicLocales.filter((item) => item.code !== "fr")) {
    assert.equal(locale.status, "planned");
  }
});

test("Arabic locale is prepared for right-to-left rendering before activation", () => {
  const arabic = publicLocales.find((locale) => locale.code === "ar");

  assert.ok(arabic);
  assert.equal(arabic.direction, "rtl");
  assert.equal(arabic.status, "planned");
});

test("every public locale has complete metadata before it can become ready", () => {
  for (const locale of publicLocales) {
    assert.match(locale.code, /^[a-z]{2}$/);
    assert.ok(locale.label.trim());
    assert.ok(locale.htmlLang.trim());
    assert.match(locale.openGraphLocale, /^[a-z]{2}_[A-Z]{2}$/);
    assert.ok(["ltr", "rtl"].includes(locale.direction));
    assert.ok(["ready", "planned"].includes(locale.status));
  }
});
