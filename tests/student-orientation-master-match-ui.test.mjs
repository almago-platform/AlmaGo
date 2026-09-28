import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/orientation/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
const orientationCopy = readFileSync("src/content/student-orientation-copy.ts", "utf8");

test("orientation computes Master requirement matching on the server", () => {
  assert.match(page, /readMasterRequirementProfile\(program\.requirements\)/);
  assert.match(page, /matchMasterRequirements\(project \|\| \{\}, profile\)/);
  assert.match(page, /current_diploma,current_german_level,target_intake/);
});

test("technical requirements JSON is not forwarded to the student panel", () => {
  assert.match(page, /requirements: undefined/);
  assert.doesNotMatch(panel, /almago_master_requirements/);
});

test("student UI exposes only human criterion states through localized copy", () => {
  assert.ok(orientationCopy.includes('satisfied: "Critère rempli"'));
  assert.ok(orientationCopy.includes('not_satisfied: "Point à vérifier"'));
  assert.ok(orientationCopy.includes('unknown: "Information manquante"'));
  assert.ok(orientationCopy.includes('needs_manual_review: "À vérifier"'));
  assert.ok(orientationCopy.includes("L’université décide au final"));
  assert.ok(panel.includes("copy.statusLabels"));
});

test("application route is shown separately from eligibility criteria", () => {
  assert.ok(orientationCopy.includes('applicationRoute: "Mode de candidature"'));
  assert.ok(orientationCopy.includes('routeUniAssist: "candidature via uni-assist"'));
  assert.ok(orientationCopy.includes('routeVpd: "VPD à obtenir avant la candidature"'));
  assert.ok(panel.includes("applicationRouteLabel"));
});

test("orientation keeps a recovery state when the student project cannot be read", () => {
  assert.match(page, /criteriaStateError=/);
  assert.ok(orientationCopy.includes("comparaisons personnalisées réapparaîtront"));
  assert.ok(panel.includes("t.criteriaStateDetail"));
});

test("StudentApplicationsPanel has localized progress tracking and RTL-aware layout", () => {
  const applicationsPanel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
  const applicationsCopy = readFileSync("src/content/student-applications-copy.ts", "utf8");
  assert.ok(applicationsPanel.includes("ApplicationStepper"));
  for (const label of ["À préparer", "Préparation", "Prêt", "Envoyé", "Décision"]) {
    assert.ok(applicationsCopy.includes(label));
  }
  assert.ok(applicationsPanel.includes('direction === "rtl"'));
  assert.ok(applicationsCopy.includes("Suivi des candidatures indisponible"));
  assert.ok(applicationsPanel.includes('normalizedStatus === "withdrawn"'));
  assert.ok(applicationsCopy.includes("Le suivi de cette candidature a été retiré."));
  assert.doesNotMatch(applicationsPanel, /"withdrawn"\].*currentIndex/);
});

test("StudentJourneyOverview calculates progress and shows localized visual badges", () => {
  const journeyOverview = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");
  const shared = readFileSync("src/content/student-shared-copy.ts", "utf8");
  assert.ok(journeyOverview.includes("completedStages.length"));
  assert.ok(journeyOverview.includes("progressPercent"));
  assert.ok(journeyOverview.includes("copy.done"));
  assert.ok(journeyOverview.includes("copy.inProgress"));
  assert.ok(journeyOverview.includes("copy.upcoming"));
  assert.ok(journeyOverview.includes("openArrow"));
  assert.ok(shared.includes('done: "Terminé"'));
  assert.ok(shared.includes('inProgress: "En cours"'));
  assert.ok(shared.includes('upcoming: "À venir"'));
  assert.ok(!journeyOverview.toLowerCase().includes("intelligence artificielle"));
  assert.ok(!journeyOverview.toLowerCase().includes("garantie"));

  // No pseudo-precise numeric percentage completion displayed to user as a standalone promise.
  assert.ok(!journeyOverview.includes("whitespace-nowrap"));
});

test("StudentOrientationPanel has explicit unknown route and unique comparison landmarks", () => {
  assert.ok(orientationCopy.includes('routeUnknown: "à confirmer"'));
  assert.ok(panel.includes("copy.comparisonAria"));
  assert.ok(panel.includes("programName"));
});
