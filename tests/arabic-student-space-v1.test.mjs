import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/content/student-dashboard-copy.ts", "utf8");
const project = readFileSync("src/content/student-project-copy.ts", "utf8");
const documents = readFileSync("src/content/student-documents-copy.ts", "utf8");
const checklist = readFileSync("src/content/student-checklist-copy.ts", "utf8");
const applications = readFileSync("src/content/student-applications-copy.ts", "utf8");
const pathway = readFileSync("src/content/student-pathway-copy.ts", "utf8");
const orientation = readFileSync("src/content/student-orientation-copy.ts", "utf8");
const onboarding = readFileSync("src/content/student-onboarding-copy.ts", "utf8");
const shared = readFileSync("src/content/student-shared-copy.ts", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const guidance = readFileSync("src/components/student/StudentGuidancePanel.tsx", "utf8");
const onboardingForm = readFileSync("src/components/student/OnboardingForm.tsx", "utf8");
const pathwayPage = readFileSync("src/app/student/pathway/page.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("Arabic Student Space uses direct, native guidance", () => {
  assert.match(dashboard, /هذه أهم الأمور التي تحتاج إلى انتباهك الآن/);
  assert.match(project, /حدّد هدفك في ألمانيا/);
  assert.match(documents, /حالة المستند وحالته كإثبات أكاديمي ليستا الشيء نفسه/);
  assert.match(checklist, /اعرف ما عليك فعله الآن، وما نتابعه معك، وما اكتمل/);
  assert.match(applications, /قبل التقديم/);
  assert.match(pathway, /المعلومات الرسمية التي يجب التحقق منها/);
  assert.match(orientation, /إذا كان مناسبًا، أضفه إلى طلبات التقديم/);
  assert.match(onboarding, /ابدأ بالمعلومات الأساسية عنك وعن هدفك/);
  assert.match(shared, /اعرف أين وصلت/);
});

test("Arabic Student Space preserves clear official-decision boundaries", () => {
  assert.match(dashboard, /القرارات الرسمية تتخذها الجامعات والجهات المختصة/);
  assert.match(documents, /ولا يعني هذا التصنيف قبولًا جامعيًا أو قرار تأشيرة/);
  assert.match(pathway, /هذا ليس قرار قبول أو تأشيرة أو إقامة/);
  assert.match(orientation, /ظهور برنامج هنا لا يعني حصولك على قبول/);
});

test("Arabic Student Space protects RTL typography and mixed-direction terms", () => {
  assert.match(css, /Arabic Student Space Editorial V1/);
  assert.match(css, /font-family: var\(--font-arabic-display\)/);
  assert.match(shell, /shellHomeAria/);
  assert.match(pathwayPage, /<bdi dir="ltr">\{decision\.route\}<\/bdi>/);
  assert.match(pathway, /\\u2066Studium\\u2069/);
  assert.match(guidance, /student-guidance-panel/);
  assert.match(onboardingForm, /student-onboarding-grid/);
  assert.match(css, /html\[dir="rtl"\] \.student-guidance-panel/);
  assert.match(css, /html\[dir="rtl"\] \.student-onboarding-grid/);
  assert.match(orientation, /\\u2066VPD\\u2069/);
  assert.match(orientation, /\\u2066ECTS\\u2069/);
});

test("Arabic Student Space avoids legacy tanwin spellings in revised core copy", () => {
  const revised = [
    dashboard,
    project,
    documents,
    checklist,
    applications,
    pathway,
    orientation,
    onboarding,
    shared,
  ].join("\n");

  for (const legacy of ["حالياً", "فعلياً", "مؤقتاً", "دائماً", "تلقائياً", "جامعياً", "نهائياً", "لاحقاً"]) {
    assert.doesNotMatch(revised, new RegExp(legacy));
  }
});
