import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/orientation/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");

test("orientation computes Master requirement matching on the server", () => {
  assert.match(page, /readMasterRequirementProfile\(program\.requirements\)/);
  assert.match(page, /matchMasterRequirements\(project \|\| \{\}, profile\)/);
  assert.match(page, /current_diploma,current_german_level,target_intake/);
});

test("technical requirements JSON is not forwarded to the student panel", () => {
  assert.match(page, /requirements: undefined/);
  assert.doesNotMatch(panel, /almago_master_requirements/);
});

test("student UI exposes only human criterion states", () => {
  assert.match(panel, /Critère rempli/);
  assert.match(panel, /Écart potentiel/);
  assert.match(panel, /Information manquante/);
  assert.match(panel, /À vérifier/);
  assert.match(panel, /Ce n’est pas une décision d’admission/);
});

test("application route is shown separately from eligibility criteria", () => {
  assert.match(panel, /Mode de candidature/);
  assert.match(panel, /candidature via uni-assist/);
  assert.match(panel, /VPD à obtenir avant la candidature/);
});

test("orientation keeps a recovery state when the student project cannot be read", () => {
  assert.match(page, /criteriaStateError=/);
  assert.match(panel, /comparaisons personnalisées réapparaîtront/);
});

test("StudentApplicationsPanel has enhanced progress tracking and mobile layout", () => {
  const applicationsPanel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
  assert.match(applicationsPanel, /ApplicationStepper/);
  assert.match(applicationsPanel, /"Intérêt"/);
  assert.match(applicationsPanel, /"Préparation"/);
  assert.match(applicationsPanel, /"Prêt"/);
  assert.match(applicationsPanel, /"Envoyé"/);
  assert.match(applicationsPanel, /"Décision"/);
  assert.match(applicationsPanel, /text-left sm:text-right flex flex-col items-start sm:items-end/);
  assert.match(applicationsPanel, /Suivi des candidatures indisponible/);
});

test("StudentJourneyOverview calculates progress and shows visual badges", () => {
  const journeyOverview = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");
  assert.match(journeyOverview, /completedStages\.length/);
  assert.match(journeyOverview, /progressPercent/);
  assert.match(journeyOverview, /Terminé/);
  assert.match(journeyOverview, /En cours/);
  assert.match(journeyOverview, /À venir/);
  assert.match(journeyOverview, /Accéder/);
  assert.doesNotMatch(journeyOverview, /intelligence artificielle/i);
  assert.doesNotMatch(journeyOverview, /garantie/i);
});
