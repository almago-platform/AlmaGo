import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const auth = read("src/lib/auth/access.ts");
const phase2Access = read("src/lib/phase2/access.ts");
const studentLayout = read("src/app/student/layout.tsx");
const prospectLayout = read("src/app/prospect/layout.tsx");
const prospectPage = read("src/app/prospect/page.tsx");
const prospectHubState = read("src/lib/prospect/hub.ts");
const prospectLoading = read("src/app/prospect/loading.tsx");
const prospectShell = read("src/components/layout/ProspectShell.tsx");
const prospectCopy = read("src/content/prospect-dashboard-copy.ts");
const prospectHubCopy = read("src/content/prospect-hub-copy.ts");
const documentView = read("src/app/api/documents/[id]/view/route.ts");

test("P2.5 keeps technical role and commercial client access separate", () => {
  assert.match(auth, /getTechnicalStudentUser/);
  assert.match(auth, /isPhase2AccessEnabled/);
  assert.match(auth, /from\("customer_access"\)/);
  assert.match(auth, /client_active/);
  assert.match(auth, /client_completed/);
  assert.match(phase2Access, /getTechnicalStudentUser/);
  assert.doesNotMatch(auth, /user_metadata|raw_user_meta_data/);
});

test("Phase 1 student space redirects a free prospect before rendering client pages", () => {
  assert.match(studentLayout, /getPhase2StudentAccess/);
  assert.match(studentLayout, /access\.phase2Enabled && !access\.canUseClientFeatures/);
  assert.match(studentLayout, /redirect\("\/prospect"\)/);
});

test("prospect space is available only to authenticated non-client students", () => {
  assert.match(prospectLayout, /getPhase2StudentAccess/);
  assert.match(prospectLayout, /if \(!user\) redirect\("\/login"\)/);
  assert.match(prospectLayout, /!access\.phase2Enabled \|\| access\.canUseClientFeatures/);
  assert.match(prospectLayout, /redirect\("\/student"\)/);
  assert.match(prospectLayout, /ProspectShell/);
});

test("prospect dashboard reads only the linked prospect orientation through the shared hub boundary", () => {
  assert.match(prospectPage, /loadProspectHubState/);
  assert.match(prospectHubState, /from\("prospects"\)/);
  assert.match(prospectHubState, /\.eq\("user_id", userId\)/);
  assert.match(prospectHubState, /from\("orientations"\)/);
  assert.match(prospectHubState, /\.eq\("prospect_id", prospectId\)/);
  assert.match(prospectHubState, /public-orientation-v1/);
  assert.doesNotMatch(prospectPage, /from\("applications"\)|from\("student_checklist_items"\)/);
});

test("prospect navigation uses real hub routes and no dead hash anchors", () => {
  for (const route of [
    "/prospect/orientation",
    "/prospect/catalogue",
    "/prospect/proposal",
    "/prospect/roadmap",
    "/prospect/documents",
    "/prospect/solutions",
    "/prospect/offers",
    "/prospect/payment",
  ]) {
    assert.match(prospectShell, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.doesNotMatch(prospectShell, /\/prospect#/);
  assert.doesNotMatch(prospectShell, /\/student\/documents|\/student\/applications|\/student\/checklist|\/student\/finance-insurance/);
});

test("prospect copy is localized and states the free-versus-paid boundary", () => {
  assert.match(prospectCopy, /Ce qui est gratuit et ce qui est réservé aux clients/);
  assert.match(prospectCopy, /الحساب المجاني لا يعني مرافقة مدفوعة/);
  assert.match(prospectCopy, /Free account ≠ paid support/);
  assert.match(prospectCopy, /Kostenloses Konto ≠ bezahlte Begleitung/);
});

test("French prospect copy avoids internal or anglicized dashboard jargon", () => {
  assert.match(prospectCopy, /Mes prochaines étapes/);
  assert.match(prospectCopy, /liste complète du dossier/);
  assert.doesNotMatch(prospectCopy, /Ma roadmap|checklist dossier|Compte gratuit ≠ accompagnement payé/);
});

test("direct document viewing requires the same client entitlement as student APIs", () => {
  assert.match(documentView, /getStudentUser/);
  assert.match(documentView, /if \(!isStudent\)/);
  assert.match(documentView, /status: 403/);
});

test("prospect dashboard has a localized accessible loading state", () => {
  assert.match(prospectLoading, /"use client"/);
  assert.match(prospectLoading, /useLocale\(\)/);
  assert.match(prospectLoading, /aria-busy="true"/);
  assert.match(prospectLoading, /role="status"/);
  assert.match(prospectLoading, /aria-live="polite"/);
  assert.match(prospectLoading, /Chargement de votre espace gratuit/);
  assert.match(prospectLoading, /جارٍ تحميل مساحتك المجانية/);
  assert.match(prospectLoading, /Loading your free space/);
  assert.match(prospectLoading, /Dein kostenloser Bereich wird geladen/);
  assert.match(prospectLoading, /prospectDashboardCopy\[locale\]\.page/);
});

test("prospect navigation exposes the current route accessibly", () => {
  assert.match(prospectShell, /usePathname\(\)/);
  assert.match(prospectShell, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(prospectShell, /const activeFor/);
  assert.match(prospectShell, /pathname === href \|\| pathname\.startsWith/);
  assert.match(prospectShell, /href: "\/prospect\/offers"/);
  assert.match(prospectShell, /href: "\/prospect\/payment"/);
  assert.doesNotMatch(prospectShell, /useSyncExternalStore|window\.location\.hash|#orientation/);
});


test("prospect hub copy keeps the project relationship visible instead of framing the whole area as a limitation", () => {
  assert.match(prospectHubCopy, /Mon espace Campus Allemagne/);
  assert.match(prospectHubCopy, /Ma proposition/);
  assert.match(prospectHubCopy, /Programmes & catalogue/);
  assert.match(prospectHubCopy, /Prestataires & solutions/);
  assert.match(prospectHubCopy, /Compte gratuit/);
});

test("prospect dashboard exposes lifecycle, Prospect action, Campus action and proposal status", () => {
  assert.match(prospectPage, /JourneyRail/);
  assert.match(prospectPage, /NextActionPanel/);
  assert.match(prospectPage, /ResponsibilityStrip/);
  assert.match(prospectPage, /nextAction/);
  assert.match(prospectPage, /campusWork/);
  assert.match(prospectPage, /proposalStatus/);
  assert.match(prospectPage, /Espace étudiant non activé/);
  assert.match(prospectPage, /\/prospect\/catalogue/);
  assert.match(prospectPage, /ProspectProgrammeRecommendationCard/);
  assert.doesNotMatch(prospectPage, /orientationVersionSummary/);
});
