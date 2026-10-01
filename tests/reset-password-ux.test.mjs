import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const form = readFileSync("src/components/auth/ResetPasswordForm.tsx", "utf8");
const copy = readFileSync("src/content/account-state-copy.ts", "utf8");

test("reset password supports an accessible localized visibility toggle", () => {
  assert.match(form, /const \[showPassword, setShowPassword\] = useState\(false\)/);
  assert.match(form, /type=\{showPassword \? "text" : "password"\}/);
  assert.match(form, /aria-label=\{showPassword \? t\.hidePassword : t\.showPassword\}/);
  assert.match(form, /setShowPassword\(\(value\) => !value\)/);
  assert.match(form, /dir="ltr"/);
  assert.match(form, /autoComplete="new-password"/);
});

test("reset password visibility labels exist in every supported locale", () => {
  for (const label of [
    'showPassword: "Afficher"',
    'hidePassword: "Masquer"',
    'showPassword: "إظهار"',
    'hidePassword: "إخفاء"',
    'showPassword: "Show"',
    'hidePassword: "Hide"',
    'showPassword: "Anzeigen"',
    'hidePassword: "Ausblenden"',
  ]) {
    assert.match(copy, new RegExp(label));
  }
});
