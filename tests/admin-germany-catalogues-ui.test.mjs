import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const financeApi = readFileSync("src/app/api/admin/finance-insurance/route.ts", "utf8");
const financePage = readFileSync("src/app/admin/finance-insurance/page.tsx", "utf8");
const financePanel = readFileSync("src/components/admin/AdminFinanceInsurancePanel.tsx", "utf8");
const languagePage = readFileSync("src/app/admin/language-courses/page.tsx", "utf8");
const languagePanel = readFileSync("src/components/admin/AdminLanguageCoursesPanel.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("finance catalogue writes require the existing admin guard and strict parser", () => {
  assert.match(financeApi, /getAdminUser/);
  assert.match(financeApi, /if \(!user\).*401/s);
  assert.match(financeApi, /if \(!isAdmin\).*403/s);
  assert.match(financeApi, /parseFinanceInsuranceAdminInput/);
  assert.doesNotMatch(financeApi, /service_role|createAdminClient/i);
});

test("admin finance page and panel manage the factual catalogue only", () => {
  assert.match(financePage, /from\("finance_insurance_catalog"\)/);
  assert.match(financePanel, /\/api\/admin\/finance-insurance/);
  assert.match(financePanel, /Source officielle/);
  assert.match(financePanel, /Publier dans l’espace étudiant/);
  assert.doesNotMatch(financePanel, /score|ranking|visa garanti|éligible au visa/i);
});

test("admin language page uses the bounded language-course API", () => {
  assert.match(languagePage, /from\("language_courses"\)/);
  assert.match(languagePanel, /\/api\/admin\/language-courses/);
  assert.match(languagePanel, /Préparation aux études/);
  assert.match(languagePanel, /Cours de langue autonome/);
});

test("real admin shell exposes both Germany catalogues", () => {
  assert.match(shell, /\/admin\/language-courses/);
  assert.match(shell, /\/admin\/finance-insurance/);
});
