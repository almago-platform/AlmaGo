import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const form = read("src/components/orientation/PublicOrientationForm.tsx");
const engine = read("src/lib/orientation/diagnostic.ts");
const copy = read("src/content/orientation-diagnostic-copy.ts");
const arabicCopy = copy.slice(copy.indexOf("const ar:"), copy.indexOf("const en:"));

test("public orientation summary renders the deterministic diagnostic", () => {
  assert.match(form, /buildPublicOrientationDiagnostic/);
  assert.match(form, /diagnostic\.paths/);
  assert.match(form, /diagnostic\.priorities/);
  assert.match(form, /diagnostic\.checks/);
  assert.match(form, /orientationDiagnosticCopy/);
});

test("diagnostic engine is pure and contains no database or network calls", () => {
  assert.doesNotMatch(engine, /supabase|fetch\s*\(|service_role|process\.env/i);
  assert.match(engine, /paths:\s*paths\.slice\(0, 3\)/);
  assert.match(engine, /ruleTrace/);
});

test("diagnostic copy exists for all supported locales and avoids guarantees", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: DiagnosticCopy`));
  }
  assert.doesNotMatch(copy, /100%|garanti(?:e)? d.admission|guaranteed admission/i);
  assert.match(copy, /ni une décision d’admission, ni une décision de visa/);
});

test("French diagnostic copy uses simple student-facing language", () => {
  assert.match(copy, /Ce que votre projet montre maintenant/);
  assert.match(copy, /Avant et après le Bac/);
  assert.match(copy, /Accès aux études/);
  assert.match(copy, /Conditions d’accès au Master/);
  assert.match(copy, /Où et quand candidater/);
  assert.doesNotMatch(copy, /programmes sourcés/);
  assert.doesNotMatch(copy, /Roadmap avant et après le Bac/);
  assert.doesNotMatch(copy, /Canal et date de candidature/);
  assert.doesNotMatch(copy, /la langue reste un chantier important/);
});

test("Arabic diagnostic copy uses native degree names in user-visible text", () => {
  assert.match(arabicCopy, /البحث عن برامج البكالوريوس/);
  assert.match(arabicCopy, /البحث عن برامج الماجستير/);
  assert.match(arabicCopy, /استهداف برامج الماجستير/);
  assert.doesNotMatch(arabicCopy, /"[^"]*(?:Bachelor|Master)[^"]*"/);
  assert.match(arabicCopy, /uni-assist/);
});

test("Arabic diagnostic copy avoids internal or admission-sounding wording", () => {
  assert.match(arabicCopy, /شروط القبول في كل جامعة/);
  assert.match(arabicCopy, /البدء في البحث عن برامج ماجستير مناسبة لمسارك/);
  assert.match(arabicCopy, /قارن برامج من مصادر رسمية/);
  assert.match(arabicCopy, /شروط الدخول إلى الدراسة/);
  assert.match(arabicCopy, /تحقق منها في المصدر الرسمي/);
  assert.doesNotMatch(arabicCopy, /القبول الأكاديمي|تاريخ تحقق|برامج موثقة/);
});
