import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const notFound = read("src/app/not-found.tsx");
const errorPage = read("src/app/error.tsx");
const copy = read("src/content/public-state-copy.ts");

test("public 404 is branded, localized and offers safe recovery", () => {
  assert.match(notFound, /BrandLogo/);
  assert.match(notFound, /LanguageSwitcher/);
  assert.match(notFound, /getRequestLocale\(\)/);
  assert.match(notFound, /rebrandCopy\(publicStateCopy\[locale\]\.notFound\)/);
  assert.match(notFound, /<ButtonLink href="\/">\{t\.home\}<\/ButtonLink>/);
  assert.match(notFound, /<ButtonLink href="\/contact" variant="secondary">\{t\.contact\}<\/ButtonLink>/);
});

test("public route error offers retry without exposing technical error details", () => {
  assert.match(errorPage, /^"use client";/);
  assert.match(errorPage, /const \{ locale \} = useLocale\(\)/);\n  assert.match(errorPage, /rebrandCopy\(publicStateCopy\[locale\]\.error\)/);
  assert.match(errorPage, /onClick=\{reset\}/);
  assert.match(errorPage, /<ButtonLink href="\/" variant="secondary">\{t\.home\}<\/ButtonLink>/);
  assert.doesNotMatch(errorPage, /error\.message|error\.stack|error\.digest|digest\}/);
});

test("public recovery states have native copy in all supported locales", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`  ${locale}: \\{`));
  }

  assert.match(copy, /Page introuvable/);
  assert.match(copy, /الصفحة غير موجودة/);
  assert.match(copy, /Page not found/);
  assert.match(copy, /Seite nicht gefunden/);
  assert.match(copy, /Réessayer/);
  assert.match(copy, /حاول مرة أخرى/);
  assert.match(copy, /Try again/);
  assert.match(copy, /Erneut versuchen/);
});
