import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const core = readFileSync("src/lib/i18n.ts", "utf8");
const provider = readFileSync("src/components/i18n/LocaleProvider.tsx", "utf8");
const switcher = readFileSync("src/components/i18n/LanguageSwitcher.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("Native Languages V1 supports French Arabic English and German", () => {
  assert.match(core, /supportedLocales = \["fr", "ar", "en", "de"\]/);
  assert.match(copy, /const fr =/);
  assert.match(copy, /const ar =/);
  assert.match(copy, /const en =/);
  assert.match(copy, /const de =/);
  assert.match(switcher, /supportedLocales\.map/);
});

test("Arabic is a real RTL experience", () => {
  assert.match(core, /locale === "ar" \? "rtl" : "ltr"/);
  assert.match(layout, /dir=\{localeDirection\(locale\)\}/);
  assert.match(provider, /document\.documentElement\.dir = localeDirection\(nextLocale\)/);
  assert.match(css, /html\[dir="rtl"\]/);
  assert.match(css, /data-home-icon="arrow"/);
});

test("each language keeps the no-guarantee admission and visa boundary", () => {
  assert.match(copy, /AlmaGo organise votre préparation\. Les admissions, visas/);
  assert.match(copy, /القبول والتأشيرة والقرارات الرسمية الأخرى/);
  assert.match(copy, /Admission, visa and other official decisions/);
  assert.match(copy, /Über Zulassung, Visum und andere offizielle Fragen/);
});

test("language selection persists without changing application routes", () => {
  assert.match(core, /LOCALE_COOKIE = "almago_locale"/);
  assert.match(provider, /document\.cookie/);
  assert.match(provider, /router\.refresh\(\)/);
  assert.doesNotMatch(switcher, /window\.location\.href/);
});
