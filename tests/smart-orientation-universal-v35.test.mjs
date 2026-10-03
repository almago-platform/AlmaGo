import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guidance = readFileSync("src/lib/orientation/universal-guidance.ts", "utf8");
const route = readFileSync("src/components/orientation/OrientationRouteCard.tsx", "utf8");
const report = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const options = readFileSync("src/lib/student/profile-options.ts", "utf8");

test("SO-V3.5 uses one universal guidance engine on web and in the PDF", () => {
  assert.match(guidance, /buildUniversalOrientationGuidance/);
  assert.match(route, /buildUniversalOrientationGuidance\(answers, locale\)/);
  assert.match(report, /buildUniversalOrientationGuidance\(answers, locale\)/);
});

test("SO-V3.5 reacts to every profile dimension used by the orientation form", () => {
  for (const key of [
    "bacTrack",
    "targetDegree",
    "targetField",
    "germanLevel",
    "englishLevel",
    "studyLanguage",
    "preferredCities",
  ]) {
    assert.match(guidance, new RegExp(`answers\\.${key}`), `missing profile dimension ${key}`);
  }
});

test("SO-V3.5 has safe language routes for German, English, mixed and undecided study languages", () => {
  assert.match(guidance, /studyLanguage === "Anglais"/);
  assert.match(guidance, /studyLanguage === "Allemand et anglais"/);
  assert.match(guidance, /studyLanguage === "À définir"/);
  assert.match(guidance, /priorityKey: "german" \| "english" \| "language_choice" \| "applications"/);
  assert.match(guidance, /Votre priorité maintenant : l’allemand/);
  assert.match(guidance, /Votre priorité maintenant : l’anglais/);
  assert.match(guidance, /Votre priorité maintenant : universités et dossier/);
});

test("SO-V3.5 gives three concrete German-preparation choices without inventing a partner", () => {
  assert.match(guidance, /Tunisie : continuer l’allemand sur place/);
  assert.match(guidance, /En ligne : suivre une préparation à distance avec Campus Allemagne lorsqu’elle est disponible/);
  assert.match(guidance, /Allemagne : étudier une préparation linguistique sur place avec une école partenaire validée/);
  assert.match(guidance, /uniquement si un partenariat validé est disponible/);
});

test("SO-V3.5 works for every city through a generic verified shortlist fallback", () => {
  assert.match(options, /export const preferredCityOptions/);
  assert.match(guidance, /answers\.preferredCities/);
  assert.match(guidance, /Campus Allemagne vérifie 2 ou 3 établissements réellement adaptés/);
  assert.match(guidance, /Nous ne donnons pas de noms non vérifiés/);
});

test("SO-V3.5 keeps verified exact programmes when they exist and otherwise stays generic", () => {
  assert.match(guidance, /getVerifiedProgrammeSet/);
  assert.match(guidance, /programmeOptions\.length > 0/);
  assert.match(guidance, /Nous avons déjà des pistes vérifiées pour votre profil/);
  assert.match(guidance, /Votre ville est encore ouverte/);
});

test("SO-V3.5 makes parallel dossier work and the full after-admission path visible", () => {
  assert.match(guidance, /Pendant que vous apprenez la langue, votre dossier avance/);
  assert.match(guidance, /Bac ou diplôme précédent et les relevés/);
  assert.match(guidance, /traductions ou légalisations nécessaires/);
  assert.match(guidance, /envoyer les candidatures par le canal officiel/);
  assert.match(guidance, /financement, assurance, visa/);
  assert.match(guidance, /logement et préparation de l’arrivée/);
});

test("SO-V3.5 keeps medicine and health under enhanced human review", () => {
  assert.match(guidance, /answers\.targetField === "Médecine\/Santé"/);
  assert.match(guidance, /vérification humaine renforcée/);
});

test("SO-V3.5 keeps the web route scannable while print becomes a readable letter", () => {
  assert.match(route, /guidance\.priorityTitle/);
  assert.match(route, /guidance\.academicTitle/);
  assert.match(route, /guidance\.cityTitle/);
  assert.match(route, /guidance\.parallelTitle/);
  assert.match(route, /guidance\.timeline\.now/);
  assert.match(route, /guidance\.ctaTitle/);
  assert.match(report, /guidance\.academicBody/);
  assert.match(report, /guidance\.priorityBody/);
  assert.match(report, /guidance\.cityBody/);
  assert.match(report, /guidance\.parallelBody/);
  assert.doesNotMatch(report, /<table className="orientation-one-page-table"/);
});
