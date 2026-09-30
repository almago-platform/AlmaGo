import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const auth = read("src/lib/auth/access.ts");
const phase2Access = read("src/lib/phase2/access.ts");
const studentLayout = read("src/app/student/layout.tsx");
const prospectLayout = read("src/app/prospect/layout.tsx");
const prospectPage = read("src/app/prospect/page.tsx");
const prospectShell = read("src/components/layout/ProspectShell.tsx");
const prospectCopy = read("src/content/prospect-dashboard-copy.ts");
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

test("prospect dashboard reads only the linked prospect orientation", () => {
  assert.match(prospectPage, /from\("prospects"\)/);
  assert.match(prospectPage, /\.eq\("user_id", access\.user\.id\)/);
  assert.match(prospectPage, /from\("orientations"\)/);
  assert.match(prospectPage, /\.eq\("prospect_id", prospect\.id\)/);
  assert.match(prospectPage, /public-orientation-v1/);
  assert.doesNotMatch(prospectPage, /from\("documents"\)|from\("applications"\)|from\("student_checklist_items"\)/);
});

test("prospect navigation exposes free-space actions and no client routes", () => {
  assert.match(prospectShell, /\/prospect#orientation/);
  assert.match(prospectShell, /\/prospect#possibilities/);
  assert.match(prospectShell, /\/prospect#roadmap/);
  assert.match(prospectShell, /\/prospect#missing/);
  assert.match(prospectShell, /href: "\/orientation\\?mode=update"/);
  assert.doesNotMatch(prospectShell, /\/student\/documents|\/student\/applications|\/student\/checklist|\/student\/finance-insurance/);
});

test("prospect copy is localized and states the free-versus-paid boundary", () => {
  assert.match(prospectCopy, /Compte gratuit ≠ accompagnement payé/);
  assert.match(prospectCopy, /الحساب المجاني لا يعني مرافقة مدفوعة/);
  assert.match(prospectCopy, /Free account ≠ paid support/);
  assert.match(prospectCopy, /Kostenloses Konto ≠ bezahlte Begleitung/);
});

test("direct document viewing requires the same client entitlement as student APIs", () => {
  assert.match(documentView, /getStudentUser/);
  assert.match(documentView, /if \(!isStudent\)/);
  assert.match(documentView, /status: 403/);
});
