import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  DISCOVERY_MAX_CANDIDATES,
  DISCOVERY_MAX_SEARCH_QUERIES,
  ORIENTATION_DISCOVERY_POLICY,
  buildOrientationDiscoveryPlan,
  createOrientationResearchCandidate,
} = await import("../src/lib/orientation-engine/discovery/contract.ts");

const contractSource = readFileSync(
  "src/lib/orientation-engine/discovery/contract.ts",
  "utf8",
);
const typesSource = readFileSync(
  "src/lib/orientation-engine/discovery/types.ts",
  "utf8",
);

function answers(overrides = {}) {
  return {
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Sciences techniques",
    generalAverage: "15",
    averageType: "official",
    lastDiploma: "Baccalauréat",
    targetDegree: "Bachelor",
    targetField: "Ingénierie",
    engineeringSpecialty: "automotive",
    germanLevel: "A2",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    targetIntakeSeason: "winter",
    targetIntakeYear: "2027",
    budgetRange: "800–1 000 € / mois",
    preferredCities: [],
    masterSubjectCredits: {},
    ...overrides,
  };
}

test("A1 builds a bounded ready discovery plan for a complete Bachelor profile", () => {
  const plan = buildOrientationDiscoveryPlan(answers());

  assert.equal(plan.status, "ready");
  assert.equal(plan.reason, null);
  assert.equal(plan.profile.averageOutOf20, 15);
  assert.equal(plan.profile.targetIntakeYear, 2027);
  assert.ok(plan.searchQueries.length > 0);
  assert.ok(plan.searchQueries.length <= DISCOVERY_MAX_SEARCH_QUERIES);
  assert.equal(plan.policy.maxCandidates, DISCOVERY_MAX_CANDIDATES);
  assert.equal(plan.policy.maxCandidates, 20);
  assert.equal(plan.policy.maxSearchQueries, 8);
});

test("A1 owns an automotive programme-family map instead of asking the provider to invent taxonomy", () => {
  const plan = buildOrientationDiscoveryPlan(answers());
  const aliases = plan.programmeFamilies.flatMap((family) => family.aliases);

  assert.ok(aliases.includes("Automotive Engineering"));
  assert.ok(aliases.includes("Vehicle Engineering"));
  assert.ok(aliases.includes("Fahrzeugtechnik"));
  assert.ok(aliases.includes("Mechanical Engineering automotive"));
  assert.ok(aliases.includes("Mechatronics automotive"));
  assert.ok(plan.searchQueries.some((query) => query.includes("Automotive Engineering")));
});

test("A1 narrows generic Sciences to the selected science speciality", () => {
  const plan = buildOrientationDiscoveryPlan(answers({
    targetField: "Sciences",
    engineeringSpecialty: "",
    scienceSpecialty: "biology_life_sciences",
  }));
  const aliases = plan.programmeFamilies.flatMap((family) => family.aliases);

  assert.equal(plan.status, "ready");
  assert.ok(aliases.includes("Biology"));
  assert.ok(aliases.includes("Life Sciences"));
  assert.equal(aliases.includes("Mathematics"), false);
  assert.equal(aliases.includes("Physics"), false);
  assert.ok(
    plan.searchQueries.some((query) => /Biology|Life Sciences/i.test(query)),
  );
  assert.equal(
    plan.searchQueries.some((query) => /Mathematics|Physics/i.test(query)),
    false,
  );
});

test("A1 refuses normal university discovery for no-Bac profiles until the academic route is reviewed", () => {
  const plan = buildOrientationDiscoveryPlan(answers({
    bacStatus: "no_bac",
    bacYear: "",
    bacTrack: "",
    generalAverage: "",
    averageType: "",
    lastDiploma: "Bac + 1",
  }));

  assert.equal(plan.status, "route_requires_review");
  assert.equal(plan.reason, "no_bac_requires_route_review");
  assert.deepEqual(plan.searchQueries, []);
});

test("A1 does not market Studienkolleg as a current Campus Allemagne service route", () => {
  assert.equal(ORIENTATION_DISCOVERY_POLICY.campusOffersStudienkolleg, false);
  assert.equal(
    ORIENTATION_DISCOVERY_POLICY.studienkollegHandling,
    "flag_and_review",
  );
});

test("A1 blocks discovery when the target degree or field is missing", () => {
  const missingDegree = buildOrientationDiscoveryPlan(answers({ targetDegree: "" }));
  assert.equal(missingDegree.status, "profile_incomplete");
  assert.equal(missingDegree.reason, "target_degree_missing");
  assert.deepEqual(missingDegree.searchQueries, []);

  const missingField = buildOrientationDiscoveryPlan(answers({ targetField: "" }));
  assert.equal(missingField.status, "profile_incomplete");
  assert.equal(missingField.reason, "target_field_missing");
  assert.deepEqual(missingField.searchQueries, []);
});

test("A1 research candidates are only research candidates and keep unknown fields unknown", () => {
  const candidate = createOrientationResearchCandidate({
    institution: "  Example University  ",
    programme: " Automotive Engineering B.Eng. ",
    discoveryReason: " Close to the student's automotive goal. ",
    degree: "Bachelor",
    city: "Ingolstadt",
    officialProgrammeUrl: "https://example.edu/programme",
    officialUniversityUrl: "http://insecure.example.edu",
    sourceUrls: [
      "https://example.edu/programme",
      "https://example.edu/programme",
      "not-a-url",
    ],
  });

  assert.ok(candidate);
  assert.equal(candidate.status, "research_candidate");
  assert.equal(candidate.institution, "Example University");
  assert.equal(candidate.teachingLanguage, null);
  assert.equal(candidate.officialUniversityUrl, null);
  assert.deepEqual(candidate.sourceUrls, ["https://example.edu/programme"]);
});

test("A1 discovery input remains identity-minimised", () => {
  for (const forbidden of [
    "email",
    "phone",
    "passport",
    "full_name",
    "first_name",
    "last_name",
    "postal_address",
  ]) {
    assert.doesNotMatch(contractSource, new RegExp(forbidden, "i"));
    assert.doesNotMatch(typesSource, new RegExp(forbidden, "i"));
  }

  assert.match(typesSource, /OrientationDiscoveryProfile/);
  assert.match(typesSource, /status: "research_candidate"/);
  assert.match(contractSource, /official university programme/);
  assert.match(contractSource, /DISCOVERY_MAX_SEARCH_QUERIES = 8/);
  assert.match(contractSource, /DISCOVERY_MAX_CANDIDATES = 20/);
});
