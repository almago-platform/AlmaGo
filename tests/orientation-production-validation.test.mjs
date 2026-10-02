import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationDiscoveryPlan,
} = await import("../src/lib/orientation-engine/discovery/contract.ts");
const {
  buildOrientationSelection,
} = await import("../src/lib/orientation-engine/selection/core.ts");
const {
  buildDeterministicOrientationWriterContent,
} = await import("../src/lib/orientation-engine/writer/core.ts");
function profile(overrides = {}) {
  return {
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Sciences techniques",
    generalAverage: "14",
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

function fact(field, value, status = "verified") {
  return {
    field,
    status,
    value,
    sourceUrl: status === "unknown" ? null : "https://example.edu/programme",
    sourceKind: status === "verified" ? "official_programme" : "official_registry",
    verifiedAt: status === "unknown" ? null : "2026-10-02T20:30:00.000Z",
  };
}

function studienkollegVerification() {
  return {
    candidate: {
      institution: "Example Hochschule",
      programme: "Automotive Engineering",
      degree: "Bachelor",
      city: "Aachen",
      teachingLanguage: "German",
      officialProgrammeUrl: "https://example.edu/programme",
      officialUniversityUrl: "https://example.edu",
      discoveryReason: "Relevant engineering programme.",
      sourceUrls: ["https://example.edu/programme"],
      status: "research_candidate",
    },
    overallStatus: "verified",
    facts: [
      fact("programme_exists", true),
      fact("degree_level", "Bachelor"),
      fact("city", "Aachen"),
      fact("teaching_language", "German"),
      fact("german_language_requirement", "B2"),
      fact("english_language_requirement", null, "unknown"),
      fact("accepted_language_certificates", null, "unknown"),
      fact("intake_terms", ["Winter semester"]),
      fact("winter_deadline", "15 July 2027"),
      fact("summer_deadline", null, "unknown"),
      fact("application_route", "direct"),
      fact("application_url", "https://example.edu/apply"),
      fact("studienkolleg_requirement", true),
      fact("tuition_or_semester_fees", null, "unknown"),
    ],
    sourceUrls: ["https://example.edu/programme"],
    verifiedAt: "2026-10-02T20:30:00.000Z",
  };
}

const scenarios = [
  ["Bac obtenu + A2", profile()],
  ["Bac en préparation + aucun allemand", profile({
    bacStatus: "preparing",
    averageType: "current_estimate",
    germanLevel: "none",
  })],
  ["B2 prêt pour travail candidature", profile({
    germanLevel: "B2",
    generalAverage: "16",
  })],
  ["Budget très limité", profile({
    budgetRange: "Moins de 800 € / mois",
  })],
  ["Ville fixe", profile({
    preferredCities: ["Berlin"],
  })],
  ["Ingénierie indécise", profile({
    engineeringSpecialty: "undecided",
    studyLanguage: "À définir",
  })],
  ["Automotive", profile({
    engineeringSpecialty: "automotive",
  })],
  ["Computer Engineering", profile({
    engineeringSpecialty: "computer_engineering",
  })],
  ["Architecture", profile({
    targetField: "Architecture",
    engineeringSpecialty: "",
  })],
];

test("F production profiles produce bounded A1 plans", () => {
  for (const [label, candidate] of scenarios) {
    const plan = buildOrientationDiscoveryPlan(candidate);
    assert.equal(plan.status, "ready", label);
    assert.ok(plan.searchQueries.length >= 1, label);
    assert.ok(plan.searchQueries.length <= 8, label);
  }
});

test("F fixed-city profiles reserve discovery budget for the requested city", () => {
  const plan = buildOrientationDiscoveryPlan(profile({
    preferredCities: ["Berlin"],
  }));

  assert.equal(plan.status, "ready");
  assert.ok(
    plan.searchQueries.some((query) => query.includes("Berlin")),
    "at least one bounded A query must preserve the fixed-city preference",
  );
  assert.ok(plan.searchQueries.length <= 8);
});

test("F programme-family coverage includes undecided engineering, Automotive, Computer Engineering and Architecture", () => {
  const undecided = buildOrientationDiscoveryPlan(profile({
    engineeringSpecialty: "undecided",
    studyLanguage: "À définir",
  }));
  assert.ok(undecided.programmeFamilies.some((family) => family.id === "broad_engineering"));

  const automotive = buildOrientationDiscoveryPlan(profile({
    engineeringSpecialty: "automotive",
  }));
  assert.ok(automotive.programmeFamilies.some((family) => family.id === "automotive_engineering"));

  const computer = buildOrientationDiscoveryPlan(profile({
    engineeringSpecialty: "computer_engineering",
  }));
  assert.ok(computer.programmeFamilies.some((family) => family.id === "computer_engineering"));

  const architecture = buildOrientationDiscoveryPlan(profile({
    targetField: "Architecture",
    engineeringSpecialty: "",
  }));
  assert.ok(architecture.programmeFamilies.some((family) => family.id === "architecture"));
});

test("F no-Bac profile never enters normal university discovery", () => {
  const candidate = profile({
    bacStatus: "no_bac",
    bacYear: "",
    bacTrack: "",
    generalAverage: "",
    averageType: "",
    lastDiploma: "secondary_other",
  });

  const plan = buildOrientationDiscoveryPlan(candidate);

  assert.equal(plan.status, "route_requires_review");
  assert.equal(plan.reason, "no_bac_requires_route_review");
  assert.deepEqual(plan.searchQueries, []);
});

test("F no reliable programme found produces an understandable deterministic fallback instead of a fake shortlist", () => {
  const candidate = profile();
  const selection = buildOrientationSelection(candidate, []);
  const content = buildDeterministicOrientationWriterContent({
    locale: "fr",
    profile: candidate,
    selection,
  });

  assert.equal(selection.status, "insufficient_evidence");
  assert.equal(selection.selected.length, 0);
  assert.equal(content.studyOptions.length, 0);
  assert.ok(content.opening.length > 0);
  assert.ok(content.mainPriority.nextStep.length > 0);
  assert.ok(content.roadmap.length >= 2);
  assert.ok(content.cta.actionId.length > 0);
});

test("F a documented Studienkolleg requirement remains a review warning, never a silent exclusion or Campus service", () => {
  const candidate = profile();
  const selection = buildOrientationSelection(
    candidate,
    [studienkollegVerification()],
  );

  assert.equal(selection.selected.length, 1);
  assert.equal(selection.selected[0].excluded, false);
  assert.ok(selection.selected[0].warnings.includes("studienkolleg_review"));

  const writer = buildDeterministicOrientationWriterContent({
    locale: "fr",
    profile: candidate,
    selection,
  });
  assert.equal(writer.studyOptions.length, 1);
});

test("F provider outage and invalid writer output keep deterministic fallbacks wired", () => {
  const resultService = readFileSync(
    "src/lib/orientation-engine/result/service.ts",
    "utf8",
  );
  const writerCore = readFileSync(
    "src/lib/orientation-engine/writer/core.ts",
    "utf8",
  );
  const gemini = readFileSync(
    "src/lib/orientation-engine/writer/gemini.ts",
    "utf8",
  );

  assert.match(
    resultService,
    /catch \{[\s\S]*?provider: "deterministic"[\s\S]*?buildDeterministicOrientationWriterContent/,
  );
  assert.match(resultService, /discovery: null[\s\S]*?verification: null/);
  assert.match(writerCore, /if \(unsupportedRiskClaim\(payload, context\)\) return null/);
  assert.match(gemini, /invalid_output/);
  assert.match(gemini, /fallbackResult/);
});
