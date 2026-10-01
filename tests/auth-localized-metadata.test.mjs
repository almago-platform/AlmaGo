import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const login = read("src/app/login/page.tsx");
const signup = read("src/app/signup/page.tsx");
const reset = read("src/app/reset-password/page.tsx");
const nativeCopy = read("src/content/native-copy.ts");
const accountStateCopy = read("src/content/account-state-copy.ts");

test("login and signup metadata follow the active locale copy", () => {
  for (const page of [login, signup]) {
    assert.match(page, /export async function generateMetadata\(\): Promise<Metadata>/);
    assert.match(page, /getRequestCopy\(\)/);
    assert.match(page, /robots: \{ index: false, follow: false \}/);
    assert.doesNotMatch(page, /export const metadata: Metadata/);
  }

  assert.match(login, /title: copy\.auth\.titles\.login/);
  assert.match(login, /description: copy\.auth\.subtitles\.login/);
  assert.match(signup, /title: copy\.auth\.titles\.signup/);
  assert.match(signup, /description: copy\.auth\.subtitles\.signup/);
});

test("reset-password metadata follows the localized account-state copy", () => {
  assert.match(reset, /export async function generateMetadata\(\): Promise<Metadata>/);
  assert.match(reset, /const locale = await getRequestLocale\(\)/);
  assert.match(reset, /const t = accountStateCopy\[locale\]\.reset/);
  assert.match(reset, /title: t\.formTitle/);
  assert.match(reset, /description: t\.formText/);
  assert.match(reset, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(reset, /export const metadata: Metadata/);
});

test("metadata sources contain native copy for all supported locales", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(nativeCopy, new RegExp(`const ${locale} =`));
    assert.match(accountStateCopy, new RegExp(`\\b${locale}: \\{`));
  }
});
