import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const studentSharedCopy = readFileSync("src/content/student-shared-copy.ts", "utf8");
const financeCopy = readFileSync("src/content/student-finance-copy.ts", "utf8");
const accountCopy = readFileSync("src/content/account-state-copy.ts", "utf8");
const resourceHeader = readFileSync("src/components/student/StudentResourceHeader.tsx", "utf8");
const language = readFileSync("src/app/student/language-courses/page.tsx", "utf8");
const finance = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
const resetPage = readFileSync("src/app/reset-password/page.tsx", "utf8");
const resetForm = readFileSync("src/components/auth/ResetPasswordForm.tsx", "utf8");
const unauthorized = readFileSync("src/app/unauthorized/page.tsx", "utf8");
const fallback = readFileSync("src/app/student/[section]/page.tsx", "utf8");

test("student shell groups navigation by dossier, parcours and resources", () => {
  assert.ok(shell.includes("const studentGroupIndexes"));
  assert.ok(shell.includes("studentGroups = studentGroupIndexes.map"));
  assert.ok(shell.includes("studentGroups.map"));
  assert.ok(shell.includes("shell.studentMobileNavigation"));
  assert.ok(nativeCopy.includes('groups: ["Dossier", "Parcours", "Ressources"]'));
  assert.ok(nativeCopy.includes('groups: ["ملفي", "خطواتي", "الموارد"]'));
  assert.ok(nativeCopy.includes('groups: ["My file", "My journey", "Resources"]'));
  assert.ok(nativeCopy.includes('groups: ["Meine Akte", "Mein Weg", "Ressourcen"]'));
});

test("language and finance surfaces share localized resource context", () => {
  assert.ok(studentSharedCopy.includes('resourceEyebrow: "Pour préparer votre projet"'));
  assert.ok(studentSharedCopy.includes('resourceLinks: ["Parcours", "Cours de langue", "Finance & assurance"]'));
  assert.ok(resourceHeader.includes("studentSharedCopy[locale]"));
  assert.ok(language.includes("StudentResourceHeader"));
  assert.ok(language.includes('current="language"'));
  assert.ok(finance.includes("StudentResourceHeader"));
  assert.ok(finance.includes('current="finance"'));
});

test("resource redesign preserves factual catalogue boundaries", () => {
  assert.ok(language.includes("StudentLanguageCoursesPanel"));
  assert.ok(finance.includes('from("finance_insurance_catalog")'));
  assert.ok(finance.includes("isPublishableFinanceInsuranceOption"));
  assert.ok(financeCopy.includes("ne classe pas les fournisseurs"));
});

test("password reset matches the account entry composition without changing auth behavior", () => {
  assert.ok(resetPage.includes("linear-gradient"));
  assert.ok(resetPage.includes("max-w-7xl"));
  assert.ok(resetPage.includes("max-w-[36rem]"));
  assert.ok(resetPage.includes("LanguageSwitcher"));
  assert.ok(resetForm.includes("auth.updateUser({ password })"));
  assert.ok(resetForm.includes("aria-busy={saving}"));
  assert.ok(resetForm.includes("min-h-12"));
});

test("fallback and unauthorized states stay explicit, actionable and localized", () => {
  assert.ok(accountCopy.includes("Cet espace n’est pas disponible pour ce compte"));
  assert.ok(accountCopy.includes("Rien n’a été modifié dans votre dossier"));
  assert.ok(accountCopy.includes("Retour à mon dossier"));
  assert.ok(accountCopy.includes("This space is not available for this account"));
  assert.ok(accountCopy.includes("Diese Adresse gehört zu keiner aktiven Seite"));
  assert.ok(unauthorized.includes("accountStateCopy[locale].unauthorized"));
  assert.ok(fallback.includes("accountStateCopy[locale].unknownStudent"));
});
