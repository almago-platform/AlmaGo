import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const page = read("src/app/orientation/page.tsx");
const loading = read("src/app/orientation/loading.tsx");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const publicOrientation = read("src/lib/orientation/public.ts");
const copy = read("src/content/orientation-copy.ts");
const home = read("src/app/page.tsx");
const header = read("src/components/public/HomeHeader.tsx");
const hero = read("src/components/public/HomeHero.tsx");
const journey = read("src/components/public/HomeJourneySection.tsx");
const tools = read("src/components/public/HomeTrustSection.tsx");
const closing = read("src/components/public/HomeClosing.tsx");
const nativeCopy = read("src/content/native-copy.ts");
const sitemap = read("src/app/sitemap.ts");
const env = read(".env.example");

test("public orientation is feature-gated and does not alter the current homepage when disabled", () => {
  assert.match(page, /isPhase2AccessEnabled\(\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(home, /phase2Enabled \? "\/orientation" : "\/signup"/);
  assert.match(hero, /primaryHref/);
  assert.match(home, /<HomeHeader phase2Enabled=\{phase2Enabled\} \/>/);
  assert.match(header, /phase2Enabled \? "\/orientation" : "\/signup"/);
  assert.match(header, /nav\.orientation/);
  assert.match(home, /<HomeJourneySection[\s\S]*primaryHref=\{phase2Enabled \? "\/orientation" : "\/signup"\}/);
  assert.match(home, /<HomeTrustSection[\s\S]*primaryHref=\{phase2Enabled \? "\/orientation" : "\/signup"\}/);
  assert.match(home, /<HomeFinalCta[\s\S]*primaryHref=\{phase2Enabled \? "\/orientation" : "\/signup"\}/);
  assert.match(home, /<HomeFooter[\s\S]*phase2Enabled=\{phase2Enabled\}[\s\S]*orientationLabel=\{copy\.home\.nav\.orientation\}/);
  assert.match(journey, /primaryHref = "\/signup"/);
  assert.match(tools, /index === 0 \? primaryHref/);
  assert.match(closing, /primaryHref = "\/signup"/);
  assert.match(env, /ALMAGO_PHASE2_ENABLED=false/);
});

test("orientation keeps P2.1 questionnaire state browser-only", () => {
  assert.match(form, /sessionStorage/);
  assert.match(form, /PUBLIC_ORIENTATION_SESSION_KEY as SESSION_KEY/);
  assert.match(publicOrientation, /PUBLIC_ORIENTATION_SESSION_KEY = "almago_phase2_orientation_v1"/);
  assert.doesNotMatch(form, /fetch\s*\(/);
  assert.doesNotMatch(form, /supabase/i);
  assert.match(form, /prospectCaptureEnabled\s*\?\s*\([\s\S]*<ProspectCaptureCard/);
});

test("orientation reuses the existing controlled profile option sets", () => {
  for (const name of [
    "tunisianBacTrackOptions",
    "diplomaOptions",
    "degreeOptions",
    "studyFieldOptions",
    "languageLevelOptions",
    "studyLanguageOptions",
    "budgetOptions",
    "preferredCityOptions",
  ]) {
    assert.match(form, new RegExp(name));
  }
  assert.match(form, /localizeProfileOptions/);
});

test("orientation has progressive, labelled and keyboard-friendly structure", () => {
  assert.match(form, /role="progressbar"/);
  assert.match(form, /<fieldset>/);
  assert.match(form, /<legend/);
  assert.match(form, /role="alert"/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.match(form, /type="submit"/);
});

test("orientation provides native copy for all supported locales", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: OrientationCopy`));
  }
  assert.match(nativeCopy, /orientationPrimary: "Faire mon orientation gratuite"/);
  assert.match(nativeCopy, /orientationPrimary: "ابدأ توجيهي المجاني"/);
  assert.match(nativeCopy, /orientationPrimary: "Start my free orientation"/);
  assert.match(nativeCopy, /orientationPrimary: "Kostenlose Orientierung starten"/);
  assert.match(nativeCopy, /orientation: "Orientation gratuite"/);
  assert.match(nativeCopy, /orientation: "توجيه مجاني"/);
  assert.match(nativeCopy, /orientation: "Free orientation"/);
  assert.match(nativeCopy, /orientation: "Kostenlose Orientierung"/);
});

test("orientation is added to the sitemap only when Phase 2 is enabled", () => {
  assert.match(sitemap, /isPhase2AccessEnabled\(\)/);
  assert.match(sitemap, /new URL\("\/orientation", publicOrigin\)/);
});

test("final questionnaire CTA clearly promises the orientation result", () => {
  assert.match(copy, /summary: "Voir mon orientation"/);
  assert.match(copy, /summary: "عرض توجيهي"/);
  assert.match(copy, /summary: "See my orientation"/);
  assert.match(copy, /summary: "Meine Orientierung ansehen"/);
});

test("orientation result has correct skip-link semantics and a way back home", () => {
  assert.match(form, /href="#orientation-main">\{copy\.header\.skip\}<\/a>/);
  assert.doesNotMatch(form, /href="#orientation-main">\{profileCopy\.page\.back\}<\/a>/);
  assert.match(form, /href="\/"[\s\S]*\{copy\.summary\.home\}/);
  assert.match(copy, /skip: "Aller au contenu"/);
  assert.match(copy, /skip: "الانتقال إلى المحتوى"/);
  assert.match(copy, /skip: "Skip to content"/);
  assert.match(copy, /skip: "Zum Inhalt springen"/);
  assert.match(copy, /home: "Retour à l’accueil"/);
  assert.match(copy, /home: "العودة إلى الرئيسية"/);
  assert.match(copy, /home: "Back to home"/);
  assert.match(copy, /home: "Zurück zur Startseite"/);
});

test("orientation metadata follows the active locale instead of staying French-only", () => {
  assert.match(page, /export async function generateMetadata\(\): Promise<Metadata>/);
  assert.match(page, /const \[store, publicOrigin\] = await Promise\.all\(\[cookies\(\), getPublicOrigin\(\)\]\)/);
  assert.match(page, /normalizeLocale\(store\.get\(LOCALE_COOKIE\)\?\.value\)/);
  assert.match(page, /const copy = orientationCopy\[locale\]/);
  assert.match(page, /title: copy\.intro\.eyebrow/);
  assert.match(page, /description: copy\.intro\.lead/);
  assert.match(page, /canonical: new URL\("\/orientation", publicOrigin\)\.toString\(\)/);
  assert.doesNotMatch(page, /title: `\$\{copy\.intro\.eyebrow\} \| AlmaGo`/);
  assert.doesNotMatch(page, /export const metadata: Metadata/);
});

test("orientation has a localized accessible loading state", () => {
  assert.match(loading, /"use client"/);
  assert.match(loading, /useLocale\(\)/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /role="status"/);
  assert.match(loading, /aria-live="polite"/);
  assert.match(loading, /Chargement de votre orientation/);
  assert.match(loading, /جارٍ تحميل التوجيه/);
  assert.match(loading, /Loading your orientation/);
  assert.match(loading, /Deine Orientierung wird geladen/);
  assert.match(loading, /orientationCopy\[locale\]/);
});

test("French orientation summary keeps the admission boundary in plain language", () => {
  assert.match(copy, /Voici le résumé de vos réponses\. Il ne confirme pas une admission\./);
  assert.match(copy, /noticeTitle: "Important"/);
  assert.match(copy, /vérifiez toujours les conditions sur le site officiel/);
  assert.doesNotMatch(copy, /pas encore une évaluation d’admission/);
});

test("Phase 2 footer does not bypass orientation through the legacy signup link", () => {
  assert.match(closing, /phase2Enabled && href === "\/signup"/);
  assert.match(closing, /const resolvedHref = orientationLink \? "\/orientation" : href/);
  assert.match(closing, /const resolvedLabel = orientationLink && orientationLabel \? orientationLabel : label/);
});

test("Arabic orientation copy uses natural MSA for visible questionnaire guidance", () => {
  assert.match(copy, /obtained: "حصلت عليها"/);
  assert.match(copy, /اختر مستواك الحالي كما هو، حتى لو كنت في البداية/);
  assert.match(copy, /ستساعدنا هذه المعلومات لاحقًا على ترتيب الخيارات المناسبة/);
  assert.match(copy, /cities: "المدن التي تهمك"/);
  assert.match(copy, /يجب التحقق من الشروط الدقيقة عبر المصادر الرسمية/);
  assert.doesNotMatch(copy, /تحصلت عليها|أدخل مستواك الحالي كما هو/);
});

test("Arabic city selection count uses natural word order", () => {
  assert.match(form, /locale === "ar"[\s\S]*copy\.controls\.selected[\s\S]*answers\.preferredCities\.length/);
  assert.match(form, /\{copy\.fields\.cities\} · \{selectedCitiesLabel\}/);
  assert.match(copy, /summary: "عرض توجيهي", selected: "تم اختيار"/);
  assert.doesNotMatch(copy, /selected: "تم اختيارها"/);
});
