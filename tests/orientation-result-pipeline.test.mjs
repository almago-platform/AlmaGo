import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const service = read("src/lib/orientation-engine/result/service.ts");
const publicTypes = read("src/lib/orientation-engine/result/types.ts");
const route = read("src/app/api/orientation/engine/route.ts");
const canonical = read("src/lib/orientation-engine/result/canonical.ts");
const engineCard = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const writerCard = read("src/components/orientation/OrientationPersonalizedWriterCard.tsx");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const adminPanel = read("src/components/admin/AdminOrientationPanel.tsx");
const universalGuidance = read("src/lib/orientation/universal-guidance.ts");

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

test("E exposes one canonical shortlist source and lets it drive presentation", () => {
  assert.match(route, /buildOrientationCanonicalShortlist\([\s\S]*?engineResult,[\s\S]*?personalized/);
  assert.match(route, /shortlist,/);
  assert.match(canonical, /source: "personalized_verified"/);
  assert.match(canonical, /source: "deterministic_fallback"/);
  assert.match(canonical, /source: "none"/);
  assert.match(canonical, /personalized\.selected\.map/);
  assert.match(canonical, /engine\.recommendations\.map/);
  assert.match(engineCard, /result\?\.shortlist\.source === "personalized_verified"/);
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
  assert.match(writerCard, /t\.humanCta/);
  assert.match(writerCard, /href="#orientation-prospect-capture"/);
  assert.equal((writerCard.match(/href="#orientation-prospect-capture"/g) || []).length, 1);
  assert.match(writerCard, /result\.selected\.map/);
  assert.match(writerCard, /fact\.sourceUrl/);
  assert.match(writerCard, /humanReview\.mode === "post_result_audit"/);
  assert.match(writerCard, /Les programmes que nous étudions pour votre projet/);
  assert.match(writerCard, /Pourquoi elle ressort pour vous/);
  assert.match(writerCard, /Repères vérifiés pour votre décision/);
  assert.match(writerCard, /winter_deadline/);
  assert.match(writerCard, /summer_deadline/);
  assert.match(writerCard, /\.slice\(0, 4\)/);
  assert.match(writerCard, /Ce que nous retenons de votre dossier/);
  assert.match(writerCard, /Votre dossier est encourageant/);
  assert.match(writerCard, /Ce qui ressort/);
  assert.match(writerCard, /Première estimation Campus Allemagne/);
  assert.match(writerCard, /Fortes chances d’admission/);
  assert.match(writerCard, /Bon potentiel d’admission/);
  assert.match(writerCard, /Nous avançons en parallèle/);
  assert.match(writerCard, /Vous avancez sur le B1\. Nous avançons sur le reste/);
  assert.match(writerCard, /La piste qui ressort le plus aujourd’hui/);
  assert.match(writerCard, /Autres pistes que nous continuons à étudier/);
  assert.match(writerCard, /Aujourd’hui, une piste ressort clairement/);
  assert.match(writerCard, /Ce que nous vérifions encore/);
  assert.match(writerCard, /Voir ce que nous vérifions/);
  assert.match(writerCard, /decisionFactParts/);
  assert.match(writerCard, /admissionOutlook/);
  assert.match(writerCard, /featuredOption/);
  assert.match(writerCard, /otherOptions/);
  assert.match(writerCard, /mt-auto border-t/);
  assert.match(writerCard, /env\. \$\{cleanAmount\} € \/ semestre/);
  assert.match(writerCard, /Préparation à distance adaptée à votre niveau/);
  assert.match(writerCard, /Puis, on décide ensemble/);
  assert.match(writerCard, /On reprend ce rapport avec vous/);
  assert.match(writerCard, /Parler de mon orientation avec Campus Allemagne/);
  assert.match(writerCard, /simpleLanguagePriority/);
  assert.match(writerCard, /Passez de \$\{currentLevel\} à \$\{nextLevel\}/);
  assert.match(writerCard, /bg-\[var\(--accent-light\)\]/);
  assert.match(writerCard, /bg-\[var\(--brand\)\]/);
  assert.match(writerCard, /Studienkolleg si nécessaire/);
  assert.doesNotMatch(writerCard, /orchestrons|Notre ingénierie|auditons|verrouillons|architecturons/i);
  assert.doesNotMatch(writerCard, /summaryTags|campusTasks/);
  assert.doesNotMatch(writerCard, /selon l’accompagnement choisi|forfait|option commerciale/i);
  assert.match(writerCard, /Vos options pour avancer en allemand/);
  assert.match(writerCard, /buildUniversalOrientationGuidance/);
  assert.match(writerCard, /Votre priorité maintenant/);
  assert.match(writerCard, /Votre parcours, étape par étape/);
  assert.match(writerCard, /Objectif final · Départ/);
  assert.match(writerCard, /Prochaine action/);
  assert.match(writerCard, /Voir ma prochaine étape/);
  assert.match(writerCard, /journeyCompletedCount/);
  assert.match(writerCard, /journeyRemainingCount/);
  assert.match(writerCard, /--success/);
  assert.match(writerCard, /bg-\[var\(--success\)\]/);
  assert.equal((writerCard.match(/aria-labelledby="orientation-journey"/g) || []).length, 1);
  assert.match(writerCard, /Voir les informations vérifiées et les sources officielles/);
  assert.match(writerCard, /determineJourneyStep/);
  assert.doesNotMatch(writerCard, /bg-\[var\(--foreground\)\][\s\S]*bg-\[var\(--foreground\)\][\s\S]*orientation-main-priority/);
  assert.match(engineCard, /answers=\{answers\}/);
  assert.match(form, /\{step <= 4 \? \([\s\S]*copy\.intro\.eyebrow/);
  assert.match(form, /\{step <= 4 \? \([\s\S]*role="progressbar"/);
});

test("E language and post-admission guidance keep partner and agency claims bounded", () => {
  assert.match(
    universalGuidance,
    /école partenaire validée, si votre situation et la voie administrative le permettent/,
  );
  assert.match(
    universalGuidance,
    /Après une admission : nous vous guidons dans l’ordre des démarches/,
  );
  assert.doesNotMatch(
    universalGuidance,
    /selon l’accompagnement choisi|according to the support selected|je nach gewählter Begleitung|حسب نوع المرافقة المختار/i,
  );
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
