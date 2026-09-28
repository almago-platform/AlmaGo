import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const resourceHeader = readFileSync("src/components/student/StudentResourceHeader.tsx", "utf8");
const language = readFileSync("src/app/student/language-courses/page.tsx", "utf8");
const finance = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
const resetPage = readFileSync("src/app/reset-password/page.tsx", "utf8");
const resetForm = readFileSync("src/components/auth/ResetPasswordForm.tsx", "utf8");
const unauthorized = readFileSync("src/app/unauthorized/page.tsx", "utf8");
const fallback = readFileSync("src/app/student/[section]/page.tsx", "utf8");

test("student shell groups navigation by dossier, parcours and resources", () => {
  assert.match(shell, /const studentGroupIndexes/);
  assert.match(shell, /studentGroups = studentGroupIndexes.map/);
  assert.match(shell, /studentGroups.map/);
  assert.match(shell, /shell.studentMobileNavigation/);
  assert.match(nativeCopy, /groups: ["Dossier", "Parcours", "Ressources"]/);
  assert.match(nativeCopy, /groups: ["ملفي", "مساري", "موارد"]/);
  assert.match(nativeCopy, /groups: ["My file", "My journey", "Resources"]/);
  assert.match(nativeCopy, /groups: ["Meine Akte", "Mein Weg", "Ressourcen"]/);
});

test("language and finance surfaces share resource context", () => {
  assert.match(resourceHeader, /Pour préparer votre projet/);
  assert.match(resourceHeader, /label: "Parcours"/);
  assert.match(resourceHeader, /Cours de langue/);
  assert.match(resourceHeader, /Finance & assurance/);
  assert.match(language, /StudentResourceHeader/);
  assert.match(language, /current="language"/);
  assert.match(finance, /StudentResourceHeader/);
  assert.match(finance, /current="finance"/);
});

test("resource redesign preserves factual catalogue boundaries", () => {
  assert.match(language, /StudentLanguageCoursesPanel/);
  assert.match(finance, /from("finance_insurance_catalog")/);
  assert.match(finance, /isPublishableFinanceInsuranceOption/);
  assert.match(finance, /ne classe pas les fournisseurs/);
});

test("password reset matches the account entry composition without changing auth behavior", () => {
  assert.match(resetPage, /linear-gradient/);
  assert.match(resetPage, /max-w-7xl/);
  assert.match(resetPage, /max-w-[36rem]/);
  assert.match(resetForm, /auth.updateUser({ password })/);
  assert.match(resetForm, /aria-busy={saving}/);
  assert.match(resetForm, /min-h-12/);
});

test("fallback and unauthorized states stay explicit and actionable", () => {
  assert.match(unauthorized, /Cet espace n’est pas disponible pour ce compte/);
  assert.match(unauthorized, /Rien n’a été modifié dans votre dossier/);
  assert.match(unauthorized, /Retour à mon dossier/);
  assert.match(fallback, /Cette adresse ne correspond pas à une page active/);
  assert.match(fallback, /Rien n’a été modifié dans votre dossier/);
});
