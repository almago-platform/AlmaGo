import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const risk = read("src/lib/admin/application-risk.ts");
const dashboard = read("src/app/admin/page.tsx");
const people = read("src/app/admin/people/page.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const team = read("src/app/admin/team/page.tsx");

test("Admin V11 application risk derives only from verified official hard deadlines", () => {
  assert.match(risk, /deadline_kind !== "official_hard_deadline"/);
  assert.match(risk, /!application\.deadlineTrusted/);
  assert.match(risk, /isActiveApplication/);
  assert.match(risk, /isSubmittedApplicationStatus/);
  assert.match(risk, /todayKey < targetDate/);
});

test("Admin V11 uses the validated internal VPD and uni-assist preparation targets", () => {
  assert.match(risk, /"uni_assist"/);
  assert.match(risk, /"vpd_then_direct"/);
  assert.match(risk, /method === "uni_assist" \? 56 : 70/);
  assert.match(applications, /D-\{routeRisk\.leadDays\}/);
  assert.match(applications, /elle ne remplace pas la deadline officielle/);
});

test("Admin V11 exposes dedicated deadline verification and route-risk people queues", () => {
  assert.match(people, /"deadline_verify"/);
  assert.match(people, /"application_risk"/);
  assert.match(people, /deadline_verify: "Dates à vérifier"/);
  assert.match(people, /application_risk: "VPD \/ uni-assist à risque"/);
  assert.match(people, /work === "deadline_verify"/);
  assert.match(people, /work === "application_risk"/);
  assert.match(people, /applicationRouteRisks/);
});

test("Admin V11 dashboard links source and route risks back to actionable queues", () => {
  assert.match(dashboard, /unverifiedDeadlineCaseIds/);
  assert.match(dashboard, /applicationRiskCaseIds/);
  assert.match(dashboard, /\/admin\/people\?work=deadline_verify/);
  assert.match(dashboard, /\/admin\/people\?work=application_risk/);
  assert.match(dashboard, /Dates à vérifier/);
  assert.match(dashboard, /VPD \/ uni-assist à risque/);
  assert.match(dashboard, /D-70 \(VPD\) ou D-56 \(uni-assist\)/);
});

test("Admin V11 application cards show route risk without relabelling the internal target as official", () => {
  assert.match(applications, /applicationRouteRisk/);
  assert.match(applications, /applicationRouteRiskLabel/);
  assert.match(applications, /VPD \/ uni-assist à risque/);
  assert.match(applications, /cible interne D-/);
  assert.match(applications, /deadline officielle/);
});

test("Admin V11 Team cockpit uses the same source and application-route risk queues", () => {
  assert.match(team, /applicationRouteRisk/);
  assert.match(team, /unverifiedDeadlineStudentIds/);
  assert.match(team, /applicationRiskStudentIds/);
  assert.match(team, /\/admin\/people\?work=deadline_verify/);
  assert.match(team, /\/admin\/people\?work=application_risk/);
  assert.match(team, /Dates à vérifier/);
  assert.match(team, /VPD \/ uni-assist à risque/);
});
