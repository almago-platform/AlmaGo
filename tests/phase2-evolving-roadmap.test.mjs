import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const route = read("src/app/api/prospect/orientation/route.ts");
const roadmap = read("src/lib/orientation/roadmap.ts");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const updateCard = read("src/components/orientation/ProspectOrientationUpdateCard.tsx");
const orientationPage = read("src/app/orientation/page.tsx");
const prospectPage = read("src/app/prospect/page.tsx");
const prospectShell = read("src/components/layout/ProspectShell.tsx");
const updateCopy = read("src/content/prospect-orientation-update-copy.ts");
const dashboardCopy = read("src/content/prospect-dashboard-copy.ts");

test("authenticated prospect update resolves identity from auth and never trusts browser ids", () => {
  assert.match(route, /getPhase2StudentAccess/);
  assert.match(route, /if \(!access\.user\)/);
  assert.match(route, /if \(!access\.isStudent \|\| access\.canUseClientFeatures\)/);
  assert.match(route, /from\("prospects"\)/);
  assert.match(route, /\.eq\("user_id", access\.user\.id\)/);
  assert.doesNotMatch(route, /record\.(?:prospect|prospectId|prospect_id|user|userId|user_id)/);
  assert.doesNotMatch(route, /user_metadata|raw_user_meta_data/);
});

test("authenticated update validates, recalculates and persists orientation plus qualification atomically", () => {
  assert.match(route, /MAX_BODY_BYTES = 24_000/);
  assert.match(route, /validAnswers/);
  assert.match(route, /buildPublicOrientationDiagnostic\(answers\)/);
  assert.match(route, /evaluateProspectQualification\(answers, diagnostic\)/);
  assert.match(route, /createPrivilegedSupabaseClient/);
  assert.match(route, /from\("orientations"\)/);
  assert.match(route, /\.order\("created_at", \{ ascending: false \}\)/);
  assert.match(route, /\.order\("id", \{ ascending: false \}\)/);
  assert.match(route, /\.rpc\(\s*"append_phase2_orientation_qualification"/);
  assert.match(route, /p_expected_latest_orientation_id: latestOrientation\?\.id \?\? null/);
  assert.match(route, /p_qualification_state: qualification\.state/);
  assert.match(route, /source: "prospect_account_update"/);
  assert.doesNotMatch(route, /from\("orientations"\)[\s\S]{0,300}?\.(?:insert|update)\(/);
  assert.doesNotMatch(route, /sendTransactionalEmail|resume_token|delivery_message_id/);
});

test("roadmap derives stages from declared profile state without inventing calendar dates", () => {
  assert.match(roadmap, /answers\.bacStatus !== "preparing"/);
  assert.match(roadmap, /future_bac_roadmap/);
  assert.match(roadmap, /finish_bac/);
  assert.match(roadmap, /add_average/);
  assert.match(roadmap, /diagnostic\.checks/);
  assert.doesNotMatch(roadmap, /new Date\(|Date\.now\(|2027-|2028-|2029-|2030-/);
});

test("update questionnaire is prefilled and does not reuse public session persistence", () => {
  assert.match(form, /initialAnswers\?: Answers \| null/);
  assert.match(form, /authenticatedUpdate\?: boolean/);
  assert.match(form, /restorePublicOrientationAnswers\(initialAnswers\)/);
  assert.match(form, /if \(authenticatedUpdate\) return/);
  assert.match(form, /if \(!hydrated \|\| authenticatedUpdate\) return/);
  assert.match(form, /<ProspectOrientationUpdateCard answers=\{answers\}/);
  assert.match(form, /authenticatedUpdate \? updateCopy\.introNotice : copy\.intro\.privacy/);
});

test("orientation update mode loads only the latest orientation linked to the authenticated prospect", () => {
  assert.match(orientationPage, /mode !== "update"/);
  assert.match(orientationPage, /getPhase2StudentAccess/);
  assert.match(orientationPage, /from\("prospects"\)/);
  assert.match(orientationPage, /\.eq\("user_id", access\.user\.id\)/);
  assert.match(orientationPage, /from\("orientations"\)/);
  assert.match(orientationPage, /\.eq\("prospect_id", prospect\.id\)/);
  assert.match(orientationPage, /\.order\("created_at", \{ ascending: false \}\)/);
  assert.match(orientationPage, /\.limit\(1\)/);
  assert.match(orientationPage, /initialAnswers=\{initialAnswers\}/);
  assert.match(orientationPage, /authenticatedUpdate/);
});

test("prospect dashboard uses latest orientation plus a bounded append-only history", () => {
  assert.match(prospectPage, /\.limit\(5\)/);
  assert.match(prospectPage, /buildProspectRoadmap/);
  assert.match(prospectPage, /validOrientations\[0\]/);
  assert.match(prospectPage, /historyTitle/);
  assert.match(prospectPage, /historyCurrent/);
  assert.match(prospectPage, /href="\/orientation\?mode=update"/);
  assert.match(prospectShell, /href: "\/orientation\?mode=update"/);
});

test("authenticated update UI posts only answers and locale and explains version preservation", () => {
  assert.match(updateCard, /fetch\("\/api\/prospect\/orientation"/);
  assert.match(updateCard, /JSON\.stringify\(\{ answers, locale \}\)/);
  assert.match(updateCard, /href="\/prospect"/);
  assert.match(updateCopy, /Votre orientation précédente restera dans votre historique/);
  assert.match(updateCopy, /سيبقى توجيهك السابق في السجل/);
  assert.match(updateCopy, /Your previous orientation will stay in your history/);
  assert.match(updateCopy, /Deine bisherige Orientierung bleibt im Verlauf/);
});

test("roadmap and history copy is available in every supported locale", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(dashboardCopy, new RegExp(`const ${locale}: ProspectDashboardCopy`));
  }
  assert.match(dashboardCopy, /Après vos résultats du Bac/);
  assert.match(dashboardCopy, /بعد نتائج البكالوريا/);
  assert.match(dashboardCopy, /After your Baccalaureate results/);
  assert.match(dashboardCopy, /Nach deinen Baccalauréat-Ergebnissen/);
});
