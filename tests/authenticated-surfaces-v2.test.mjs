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
const globals = readFileSync("src/app/globals.css", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
const checklistCopy = readFileSync("src/content/student-checklist-copy.ts", "utf8");
const dashboardCopy = readFileSync("src/content/student-dashboard-copy.ts", "utf8");
const profileCopy = readFileSync("src/content/student-profile-copy.ts", "utf8");
const profileControls = readFileSync("src/components/student/ProfileControls.tsx", "utf8");
const projectCopy = readFileSync("src/content/student-project-copy.ts", "utf8");
const projectForm = readFileSync("src/components/student/StudentProjectForm.tsx", "utf8");
const journeyOverview = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");

test("student shell groups navigation by dossier, parcours and resources", () => {
  assert.ok(shell.includes("const studentGroupIndexes"));
  assert.ok(shell.includes("studentGroups = studentGroupIndexes.map"));
  assert.ok(shell.includes("studentGroups.map"));
  assert.ok(shell.includes("shell.studentMobileNavigation"));
  assert.ok(nativeCopy.includes('groups: ["Dossier", "Parcours", "Ressources"]'));
  assert.ok(nativeCopy.includes('groups: ["ملفي", "خطواتي", "الموارد"]'));
  assert.ok(nativeCopy.includes('groups: ["My workspace", "My journey", "Resources"]'));
  assert.ok(nativeCopy.includes('groups: ["Mein Bereich", "Mein Weg", "Ressourcen"]'));
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


test("Arabic student shell reserves the sidebar on the correct RTL edge", () => {
  assert.ok(shell.includes("student-shell-sidebar"));
  assert.ok(shell.includes("student-shell-content"));
  assert.ok(shell.includes("student-shell-main"));
  assert.ok(shell.includes("student-shell-active-edge"));
  assert.match(globals, /Arabic Student Space RTL V2/);
  assert.match(globals, /html\[dir="rtl"\] \.student-shell \.student-shell-sidebar/);
  assert.match(globals, /right: 0/);
  assert.match(globals, /padding-right: 15\.5rem/);
  assert.match(globals, /border-left: 1px solid var\(--border\)/);
});

test("student priority accents use logical inline positioning for RTL", () => {
  assert.ok(dashboard.includes("student-accent-edge"));
  assert.ok(dashboard.includes("student-accent-content"));
  assert.ok(dashboard.includes("student-split-border"));
  assert.match(globals, /inset-inline-start: 0/);
  assert.match(globals, /padding-inline-start: 0\.5rem/);
  assert.match(globals, /border-inline-end: 1px solid var\(--border\)/);
});


test("recorded checklist templates are localized by stable template key", () => {
  assert.ok(checklist.includes("checklist_templates(key,category,sort_order)"));
  assert.ok(dashboard.includes("checklist_templates(key)"));
  assert.ok(dashboard.includes("checklistCopy.recorded.items[relation.key]"));
  assert.ok(checklist.includes("localizedTitle"));
  assert.ok(checklist.includes("localizedDescription"));
  assert.ok(checklist.includes("localizedCategory"));
  assert.ok(checklist.includes("t.recorded.items[templateKey]"));
  assert.ok(checklistCopy.includes('passport: { title: "أضف جواز سفرك"'));
  assert.ok(checklistCopy.includes('translation: { title: "جهّز الترجمات المطلوبة"'));
  assert.ok(checklistCopy.includes('orientation: { title: "قارن البرامج المناسبة لك"'));
  assert.ok(checklistCopy.includes('applications: { title: "حضّر طلبات التقديم"'));
  assert.ok(checklistCopy.includes('Traduction: "الترجمات"'));
  assert.ok(checklistCopy.includes('Orientation: "اختيار البرامج"'));
  assert.ok(checklistCopy.includes('Candidatures: "طلبات التقديم"'));
});


test("Arabic dashboard V3 prioritizes the concrete next action and one progress source", () => {
  assert.ok(dashboard.includes('select("path").eq("student_id", user.id).maybeSingle()'));
  assert.ok(dashboard.includes("waitingAlmaGo.length > 0"));
  assert.ok(dashboard.includes("label: nextItem.title"));
  assert.ok(dashboard.includes("cta: t.openStep"));
  assert.ok(dashboard.includes("showProgressSummary={false}"));
  assert.ok(journeyOverview.includes("showProgressSummary = true"));
  assert.ok(dashboardCopy.includes('statusTodo: "خطوات مطلوبة"'));
  assert.ok(dashboardCopy.includes('openStep: "فتح الخطوة"'));
  assert.ok(dashboardCopy.includes('germanyReadyTitle: "هدفك محفوظ، والخطوات مرتبطة به."'));
});

test("Arabic profile and project V3 isolate Latin data instead of mixing scripts", () => {
  assert.ok(profileCopy.includes('Bachelor: "بكالوريوس"'));
  assert.ok(profileCopy.includes('Master: "ماجستير"'));
  assert.ok(profileCopy.includes('Brême: "Bremen"'));
  assert.ok(profileCopy.includes('Cologne: "Köln"'));
  assert.ok(profileCopy.includes('Dresde: "Dresden"'));
  assert.ok(profileCopy.includes("\\u2066800–1,000 €\\u2069 شهريًا"));
  assert.ok(profileControls.includes('<bdi dir={locale === "ar" ? "ltr" : undefined}>'));
  assert.ok(projectCopy.includes('language_only: { title: "دراسة اللغة الألمانية فقط"'));
  assert.ok(projectCopy.includes('filingCountry: "البلد الذي ستقدّم منه"'));
  assert.ok(projectForm.includes('name="current_german_level"'));
  assert.ok(projectForm.includes('inputDir="ltr"'));
  assert.ok(projectForm.includes('dir="ltr"'));
  assert.ok(projectForm.includes('rows={3}'));
});


test("Arabic project V4 isolates mixed free-text values and official city names", () => {
  assert.ok(projectForm.includes('name="current_diploma"'));
  assert.ok(projectForm.includes('name="target_degree"'));
  assert.ok(projectForm.includes('name="target_field"'));
  assert.ok(projectForm.includes('name="target_intake"'));
  assert.ok(projectForm.includes('name="preferred_study_language"'));
  assert.ok(projectForm.includes("PreferredCitiesPicker"));
  assert.ok(projectForm.includes("preferred_cities: preferredCities"));
  assert.doesNotMatch(projectForm, /String\(form\.get\("preferred_cities"\)/);
  assert.ok(projectForm.includes('inputDir="auto"'));
  assert.ok(projectForm.includes('inputDir="ltr"'));
  assert.ok(projectForm.includes('dir="auto"'));
  assert.ok(projectForm.includes('inputDir?: "ltr" | "rtl" | "auto"'));
});
