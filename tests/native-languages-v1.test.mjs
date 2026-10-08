import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const core = readFileSync("src/lib/i18n.ts", "utf8");
const provider = readFileSync("src/components/i18n/LocaleProvider.tsx", "utf8");
const switcher = readFileSync("src/components/i18n/LanguageSwitcher.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const globalCss = readFileSync("src/app/globals.css", "utf8");

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


test("student workspace uses explicit native copy contracts across core surfaces", () => {
  const files = [
    "student-dashboard-copy.ts",
    "student-documents-copy.ts",
    "student-orientation-copy.ts",
    "student-applications-copy.ts",
    "student-checklist-copy.ts",
    "student-pathway-copy.ts",
    "student-language-courses-copy.ts",
    "student-finance-copy.ts",
    "student-profile-copy.ts",
    "student-project-copy.ts",
    "student-onboarding-copy.ts",
  ];
  for (const file of files) {
    const source = readFileSync(`src/content/${file}`, "utf8");
    assert.ok(source.includes("fr:") || source.includes("const fr"));
    assert.ok(source.includes("ar:") || source.includes("const ar"));
    assert.ok(source.includes("en:") || source.includes("const en"));
    assert.ok(source.includes("de:") || source.includes("const de"));
  }
});

test("dynamic official and user-entered records keep their semantics while Arabic system copy can localize at render time", () => {
  const finance = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
  const applications = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
  const orientation = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");

  assert.ok(finance.includes("localizeFinanceCatalogueField"));
  assert.ok(finance.includes("option.eligibility_notes"));
  assert.ok(applications.includes("application.student_notes"));
  assert.ok(applications.includes("localizeApplicationStoredText(locale, event.message)"));
  assert.ok(orientation.includes("program?.name") || orientation.includes("program.name"));
  assert.ok(orientation.includes("university?.name") || orientation.includes("university.name"));
});

test("regulatory and checklist localization is keyed by stable machine decisions", () => {
  const pathway = readFileSync("src/app/student/pathway/page.tsx", "utf8");
  const pathwayCopy = readFileSync("src/content/student-pathway-copy.ts", "utf8");
  const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
  const checklistCopy = readFileSync("src/content/student-checklist-copy.ts", "utf8");

  assert.ok(pathway.includes("decision.reason_code"));
  assert.ok(pathwayCopy.includes("definitive_admission_accepted"));
  assert.ok(pathwayCopy.includes("academic_evidence_pending_review"));
  assert.ok(checklist.includes("item.key"));
  assert.ok(checklistCopy.includes("academic_evidence_review"));
  assert.ok(checklistCopy.includes("continue_academic_search"));
});


test("non-French student interfaces do not surface raw French API errors", () => {
  const files = [
    "src/components/student/ProfileForm.tsx",
    "src/components/student/DocumentsPanel.tsx",
    "src/components/student/StudentProjectForm.tsx",
    "src/components/student/OnboardingForm.tsx",
    "src/components/student/StudentOrientationPanel.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.ok(source.includes('locale === "fr"'));
    assert.ok(source.includes('typeof result.error === "string"'));
  }
});


test("Arabic project form keeps technical tokens LTR and mirrors the EUR divider", () => {
  const project = readFileSync("src/components/student/StudentProjectForm.tsx", "utf8");
  assert.ok(project.includes('inputDir="ltr"'));
  assert.ok(project.includes('direction === "rtl" ? "border-r" : "border-l"'));
});


test("Arabic Native Polish V2 uses Arabic typography instead of Latin tracking", () => {
  assert.match(layout, /Noto_Sans_Arabic/);
  assert.match(layout, /Noto_Kufi_Arabic/);
  assert.match(layout, /--font-arabic/);
  assert.match(layout, /--font-arabic-display/);
  assert.match(globalCss, /html\[dir="rtl"\] body/);
  assert.match(globalCss, /font-family: var\(--font-arabic\)/);
  assert.match(css, /Arabic Native Polish V2/);
  assert.match(css, /letter-spacing: 0/);
  assert.match(css, /text-transform: none/);
});

test("Arabic public copy is written as direct native guidance", () => {
  assert.match(copy, /طريقك إلى الدراسة في ألمانيا/);
  assert.match(copy, /ابدأ بتوجيه مجاني، اكتشف الخيارات المتاحة/);
  assert.match(copy, /ست خطوات/);
  assert.match(copy, /اختر نقطة البداية المناسبة لك/);
  assert.match(copy, /أنشئ ملفك/);
  assert.doesNotMatch(copy, /بشكل أوضح/);
  assert.doesNotMatch(copy, /إنشاء ملفي/);
});


test("Arabic homepage mirrors the visual hierarchy and protects tablet RTL layout", () => {
  assert.match(css, /Arabic Native Layout V3/);
  assert.match(css, /Arabic Editorial UX V4/);
  assert.match(css, /\.hero \.heroDossier/);
  assert.match(css, /linear-gradient\(\s*270deg/);
  assert.match(css, /min-width: 768px\) and \(max-width: 899px\)/);
  assert.match(css, /\.quickLinks a:first-child/);
  assert.match(css, /margin-left: -16px/);
});


test("English and German public copy are native rewrites rather than French-shaped translations", () => {
  assert.match(copy, /Plan your studies/);
  assert.match(copy, /with a clear next step/);
  assert.match(copy, /Get started/);
  assert.match(copy, /Sign in and continue where you left off/);
  assert.doesNotMatch(copy, /Your study plans/);
  assert.doesNotMatch(copy, /made clearer/);
  assert.doesNotMatch(copy, /Start my file/);

  assert.match(copy, /Plane dein Studium/);
  assert.match(copy, /Schritt für Schritt/);
  assert.match(copy, /Jetzt starten/);
  assert.match(copy, /Melde dich an und mach dort weiter, wo du aufgehört hast/);
  assert.doesNotMatch(copy, /klarer gemacht/);
  assert.doesNotMatch(copy, /Akte starten/);
  assert.doesNotMatch(copy, /Meine Akte/);
});
