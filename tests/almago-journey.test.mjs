import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync("src/components/student/AlmagoJourney.tsx", "utf8");
const styles = readFileSync("src/components/student/AlmagoJourney.module.css", "utf8");
const model = readFileSync("src/lib/student/almago-journey.ts", "utf8");
const copy = readFileSync("src/content/almago-journey-copy.ts", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");

test("Almago Journey defines the eight canonical student stages", () => {
  for (const key of ["project", "profile", "documents", "programmes", "applications", "admission", "visa", "departure"]) {
    assert.match(model, new RegExp(`key: "${key}"`));
  }
  assert.match(copy, /project: "Projet"/);
  assert.match(copy, /profile: "Profil"/);
  assert.match(copy, /documents: "Documents"/);
  assert.match(copy, /programmes: "Programmes"/);
  assert.match(copy, /applications: "Candidatures"/);
  assert.match(copy, /admission: "Admission"/);
  assert.match(copy, /visa: "Visa & préparation"/);
  assert.match(copy, /departure: "Départ"/);
});

test("Almago Journey supports completed, current, upcoming and blocked states", () => {
  assert.match(model, /"completed" \| "current" \| "upcoming" \| "blocked"/);
  assert.match(component, /s\[step\.status\]/);
  assert.match(styles, /\.completed \.node/);
  assert.match(styles, /\.current \.node/);
  assert.match(styles, /\.blocked \.node/);
  assert.match(copy, /blocked: "Bloqué"/);
});

test("Almago Journey shows progress, remaining tasks, next action and blockers", () => {
  assert.match(component, /model\.completedCount/);
  assert.match(component, /model\.remainingTasks/);
  assert.match(component, /copy\.nextAction/);
  assert.match(component, /copy\.blocker/);
  assert.match(component, /nextAction\?\.label/);
  assert.match(model, /remainingTasks:/);
  assert.match(model, /blocker: documentsBlocked/);
  assert.match(model, /blocker: applicationsBlocked/);
});

test("Almago Journey is a journey rail on desktop and a vertical timeline on mobile", () => {
  assert.match(styles, /grid-template-columns: repeat\(8/);
  assert.match(styles, /@media \(max-width: 699px\)/);
  assert.match(styles, /\.rail \{[\s\S]*display: block/);
  assert.match(styles, /\.step::before/);
  assert.match(styles, /\.step::after/);
  assert.doesNotMatch(component, /ProgressBar/);
});

test("dashboard and checklist share the central Almago Journey component", () => {
  assert.match(dashboard, /<AlmagoJourney/);
  assert.match(dashboard, /buildAlmagoJourney/);
  assert.match(checklist, /<AlmagoJourney/);
  assert.match(checklist, /buildAlmagoJourney/);
  assert.match(checklist, /variant="compact"/);
});

test("Almago Journey preserves factual dependencies instead of inventing visa progress", () => {
  assert.match(model, /const visaStatus:[\s\S]*hasAdmission[\s\S]*"current"[\s\S]*"blocked"/);
  assert.match(model, /blocker: !hasAdmission \? "admission" : undefined/);
  assert.match(model, /const departureStatus:[\s\S]*germanyPreparationCompleted[\s\S]*"current"[\s\S]*"upcoming"/);
});
