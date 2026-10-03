import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const service = read("src/lib/orientation-engine/result/service.ts");
const publicTypes = read("src/lib/orientation-engine/result/types.ts");
const route = read("src/app/api/orientation/engine/route.ts");
const engineCard = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const writerCard = read("src/components/orientation/OrientationPersonalizedWriterCard.tsx");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const adminPanel = read("src/components/admin/AdminOrientationPanel.tsx");

test("E orchestrates A/B/C/D only after the discovery contract allows university discovery", () => {
  assert.match(service, /buildOrientationDiscoveryPlan\(profile\)/);
  assert.match(
    service,
    /if \(plan\.status !== "ready"\) \{[\s\S]*?return resultFromSelection\(\{[\s\S]*?plan,[\s\S]*?selection: emptySelection\(\)[\s\S]*?\}\);[\s\S]*?runOrientationDiscovery\(plan\)/,
  );
  assert.match(service, /runOrientationVerification\(discovery\.candidates\)/);
  assert.match(service, /runOrientationSelection\(profile, verification\.programmes\)/);
  assert.match(service, /runOrientationPersonalizedWriter\(input\)/);
});

test("E keeps the existing deterministic orientation alive when the new pipeline fails", () => {
  assert.match(route, /buildOrientationEngineResult\(profile, catalogue\)/);
  assert.match(route, /buildOrientationIntelligence/);
  assert.match(route, /let personalized: OrientationPublicPersonalizedResult \| null = null/);
  assert.match(
    route,
    /try \{[\s\S]*?runOrientationResultPipeline\(locale, profile\)[\s\S]*?catch \{[\s\S]*?personalized = null/,
  );
  assert.match(route, /engine: engineResult/);
  assert.match(route, /letter: intelligence\.letter/);
  assert.match(route, /personalized/);
});

test("E public projection does not expose selection scores or provider internals", () => {
  assert.doesNotMatch(publicTypes, /baseScore|finalScore|breakdown|provider|model|usage/i);
  assert.match(publicTypes, /OrientationWriterContent/);
  assert.match(publicTypes, /facts: OrientationPublicPersonalizedFact\[\]/);
  assert.match(publicTypes, /post_result_audit/);
  assert.match(publicTypes, /blocksResult: false/);
  assert.doesNotMatch(publicTypes, /pending_admin_approval|counselor_validation_required/);
});

test("E makes the controlled writer primary only when a real shortlist exists", () => {
  assert.match(engineCard, /result\.personalized\.selected\.length > 0/);
  assert.match(engineCard, /<OrientationPersonalizedWriterCard/);
  assert.match(engineCard, /personalized \? \(/);
  assert.match(engineCard, /<OrientationLetterCard/);
  assert.match(engineCard, /!personalized \? \(/);
});

test("E writer UI presents a premium progressive result with one CTA and verified details", () => {
  assert.match(writerCard, /content\.opening/);
  assert.match(writerCard, /content\.projectStatus/);
  assert.match(writerCard, /content\.mainPriority/);
  assert.match(writerCard, /content\.studyOptions\.map/);
  assert.match(writerCard, /content\.roadmap\[0\]/);
  assert.match(writerCard, /content\.campusValue/);
  assert.match(writerCard, /content\.cta\.label/);
  assert.match(writerCard, /href="#orientation-prospect-capture"/);
  assert.equal((writerCard.match(/href="#orientation-prospect-capture"/g) || []).length, 1);
  assert.match(writerCard, /result\.selected\.map/);
  assert.match(writerCard, /fact\.sourceUrl/);
  assert.match(writerCard, /humanReview\.mode === "post_result_audit"/);
  assert.match(writerCard, /Les programmes retenus pour vous/);
  assert.match(writerCard, /Comment nous avançons ensemble/);
  assert.match(writerCard, /Votre priorité du moment/);
  assert.match(writerCard, /Voir les informations vérifiées et les sources officielles/);
  assert.match(engineCard, /answers=\{answers\}/);
});

test("E returns the candidate result without waiting for any admin approval state", () => {
  assert.match(service, /return projectPublicResult/);
  assert.doesNotMatch(service, /pending_admin_approval|review_status|approved_selection/);
  assert.doesNotMatch(route, /pending_admin_approval|review_status|approved_selection/);
});

test("E reuses the existing consented prospect flow and protected counselor publication boundary", () => {
  assert.match(
    form,
    /prospectCaptureEnabled=\{prospectCaptureEnabled && !authenticatedUpdate\}/,
  );
  assert.match(adminPanel, /Nouvelle recommandation/);
  assert.match(adminPanel, /Documenter les éléments vérifiés/);
  assert.match(adminPanel, /ne constitue ni une décision officielle, ni une garantie d’admission/);
  assert.match(adminPanel, /\/api\/admin\/orientation/);
});
