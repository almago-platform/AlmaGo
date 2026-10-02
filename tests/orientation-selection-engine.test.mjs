import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationSelection,
  evaluateOrientationSelectionCandidate,
} = await import("../src/lib/orientation-engine/selection/core.ts");

const selectionSource = readFileSync(
  "src/lib/orientation-engine/selection/core.ts",
  "utf8",
);
const serviceSource = readFileSync(
  "src/lib/orientation-engine/selection/service.ts",
  "utf8",
);

function profile(overrides = {}) {
  return {
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Sciences techniques",
    generalAverage: "15",
    averageType: "official",
    lastDiploma: "Baccalauréat",
    targetDegree: "Bachelor",
    targetField: "Ingénierie",
    engineeringSpecialty: "automotive",
    germanLevel: "B2",
    englishLevel: "B1",
    studyLanguage: "Allemand",
    targetIntakeSeason: "winter",
    targetIntakeYear: "2027",
    budgetRange: "800–1 000 € / mois",
    preferredCities: ["Aachen"],
    masterSubjectCredits: {},
    ...overrides,
  };
}

function fact(field, value, status = "verified") {
  return {
    field,
    status,
    value,
    sourceUrl: status === "unknown"
      ? null
      : "https://www.example-university.de/study/programme",
    sourceKind: status === "verified"
      ? "official_programme"
      : status === "needs_review"
        ? "official_registry"
        : null,
    verifiedAt: status === "verified"
      ? "2026-10-02T20:30:00.000Z"
      : null,
  };
}

function verification({
  institution = "Example Universität",
  programme = "Automotive Engineering",
  city = "Aachen",
  degree = "Bachelor",
  teachingLanguage = "German",
  overallStatus = "verified",
  programmeExists = true,
  intakeTerms = ["Winter semester"],
  germanRequirement = "B1",
  englishRequirement = null,
  applicationRoute = "direct",
  winterDeadline = "15 July 2027",
  summerDeadline = null,
  studienkolleg = false,
  fees = null,
  factStatus = "verified",
} = {}) {
  const candidate = {
    institution,
    programme,
    degree,
    city,
    teachingLanguage,
    officialProgrammeUrl: "https://www.example-university.de/study/programme",
    officialUniversityUrl: "https://www.example-university.de",
    discoveryReason: "Relevant programme.",
    sourceUrls: ["https://www.example-university.de/study/programme"],
    status: "research_candidate",
  };

  return {
    candidate,
    overallStatus,
    facts: [
      fact("programme_exists", programmeExists, factStatus),
      fact("degree_level", degree, factStatus),
      fact("city", city, factStatus),
      fact("teaching_language", teachingLanguage, factStatus),
      fact(
        "german_language_requirement",
        germanRequirement,
        germanRequirement === null ? "unknown" : factStatus,
      ),
      fact(
        "english_language_requirement",
        englishRequirement,
        englishRequirement === null ? "unknown" : factStatus,
      ),
      fact("accepted_language_certificates", [], "unknown"),
      fact(
        "intake_terms",
        intakeTerms,
        intakeTerms.length === 0 ? "unknown" : factStatus,
      ),
      fact(
        "winter_deadline",
        winterDeadline,
        winterDeadline === null ? "unknown" : factStatus,
      ),
      fact(
        "summer_deadline",
        summerDeadline,
        summerDeadline === null ? "unknown" : factStatus,
      ),
      fact(
        "application_route",
        applicationRoute,
        applicationRoute === null ? "unknown" : factStatus,
      ),
      fact("application_url", null, "unknown"),
      fact("studienkolleg_requirement", studienkolleg, factStatus),
      fact(
        "tuition_or_semester_fees",
        fees,
        fees === null ? "unknown" : factStatus,
      ),
    ],
    sourceUrls: ["https://www.example-university.de/study/programme"],
    verifiedAt: "2026-10-02T20:30:00.000Z",
  };
}

test("C deterministically selects at most four useful programme pistes", () => {
  const programmes = [
    verification({ institution: "A University", city: "Aachen" }),
    verification({ institution: "B University", city: "Berlin" }),
    verification({ institution: "C University", city: "Cologne" }),
    verification({ institution: "D University", city: "Darmstadt" }),
    verification({ institution: "E University", city: "Stuttgart" }),
  ];

  const result = buildOrientationSelection(profile(), programmes);

  assert.equal(result.status, "ready");
  assert.equal(result.selected.length, 4);
  assert.deepEqual(
    result.selected.map((item) => item.position),
    [1, 2, 3, 4],
  );
  assert.equal(result.generatedBy, "deterministic_selection_v1");
  assert.equal(result.targetSize.min, 3);
  assert.equal(result.targetSize.max, 4);
});

test("C excludes only a verified degree conflict instead of treating unknown degree as rejection", () => {
  const mismatch = verification({
    institution: "Master University",
    degree: "Master",
  });
  const unknownDegree = verification({
    institution: "Review University",
    degree: null,
    overallStatus: "needs_review",
    factStatus: "needs_review",
  });
  unknownDegree.facts = unknownDegree.facts.map((item) =>
    item.field === "degree_level"
      ? fact("degree_level", null, "unknown")
      : item
  );

  const mismatchEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    mismatch,
  );
  const unknownEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    unknownDegree,
  );

  assert.equal(mismatchEvaluation.excluded, true);
  assert.ok(mismatchEvaluation.exclusionCodes.includes("degree_mismatch"));
  assert.equal(unknownEvaluation.excluded, false);
  assert.ok(unknownEvaluation.warnings.includes("degree_needs_review"));
});

test("C excludes a programme officially marked not current", () => {
  const item = evaluateOrientationSelectionCandidate(
    profile(),
    verification({ programmeExists: false }),
  );

  assert.equal(item.excluded, true);
  assert.ok(item.exclusionCodes.includes("programme_not_current"));
});

test("C excludes a verified unavailable intake but not an unknown intake", () => {
  const unavailable = verification({
    institution: "Summer Only University",
    intakeTerms: ["Summer semester"],
  });
  const unknown = verification({
    institution: "Unknown Intake University",
    intakeTerms: [],
  });

  const unavailableEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    unavailable,
  );
  const unknownEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    unknown,
  );

  assert.equal(unavailableEvaluation.excluded, true);
  assert.ok(
    unavailableEvaluation.exclusionCodes.includes("intake_unavailable"),
  );
  assert.equal(unknownEvaluation.excluded, false);
  assert.ok(unknownEvaluation.warnings.includes("intake_unknown"));
});

test("C treats current language below a verified requirement as a condition, not an exclusion", () => {
  const item = evaluateOrientationSelectionCandidate(
    profile({ germanLevel: "A2" }),
    verification({ germanRequirement: "C1" }),
  );

  assert.equal(item.excluded, false);
  assert.ok(item.warnings.includes("language_requirement_to_complete"));
  assert.equal(
    item.reasons.includes("current_language_sufficient"),
    false,
  );
});

test("C never forces completely unknown B records into the shortlist", () => {
  const reviewedA = verification({
    institution: "Review A",
    overallStatus: "needs_review",
    factStatus: "needs_review",
  });
  const reviewedB = verification({
    institution: "Review B",
    overallStatus: "needs_review",
    factStatus: "needs_review",
  });
  const unknown = verification({
    institution: "Unknown University",
    overallStatus: "unknown",
    factStatus: "needs_review",
  });

  const result = buildOrientationSelection(
    profile(),
    [reviewedA, reviewedB, unknown],
  );

  assert.equal(result.status, "partial");
  assert.equal(result.selected.length, 2);
  assert.equal(
    result.selected.some(
      (item) => item.verification.candidate.institution === "Unknown University",
    ),
    false,
  );
});

test("C applies soft institution and city diversity after relevance scoring", () => {
  const programmes = [
    verification({
      institution: "Same University",
      programme: "Automotive Engineering",
      city: "Aachen",
    }),
    verification({
      institution: "Same University",
      programme: "Vehicle Engineering",
      city: "Berlin",
    }),
    verification({
      institution: "Different University",
      programme: "Vehicle Engineering",
      city: "Cologne",
    }),
    verification({
      institution: "Fourth University",
      programme: "Mobility Engineering",
      city: "Darmstadt",
    }),
  ];

  const result = buildOrientationSelection(
    profile({ preferredCities: [] }),
    programmes,
  );

  assert.equal(result.selected.length, 4);
  assert.equal(result.selected[0].verification.candidate.institution, "Different University");
  assert.ok(
    result.selected.some((item) =>
      item.reasons.includes("institution_diversity")
    ),
  );
  assert.ok(
    result.selected.some((item) =>
      item.reasons.includes("city_diversity")
    ),
  );
});

test("C rewards the requested engineering specialty without using an LLM ranker", () => {
  const automotive = verification({
    institution: "Automotive University",
    programme: "Automotive Engineering",
  });
  const generic = verification({
    institution: "Generic University",
    programme: "General Engineering",
  });

  const automotiveEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    automotive,
  );
  const genericEvaluation = evaluateOrientationSelectionCandidate(
    profile(),
    generic,
  );

  assert.ok(automotiveEvaluation.reasons.includes("specialty_match"));
  assert.ok(automotiveEvaluation.baseScore > genericEvaluation.baseScore);
  assert.doesNotMatch(selectionSource, /OPENAI_API_KEY|GEMINI_API_KEY|web_search|fetch\(/);
  assert.doesNotMatch(serviceSource, /openai|gemini|fetch\(/i);
});

test("C surfaces conditions such as Studienkolleg and unknown fees without converting them into hidden rejection", () => {
  const item = evaluateOrientationSelectionCandidate(
    profile(),
    verification({
      studienkolleg: true,
      fees: null,
    }),
  );

  assert.equal(item.excluded, false);
  assert.ok(item.warnings.includes("studienkolleg_review"));
  assert.ok(item.warnings.includes("fees_unknown"));
});

test("C output remains explainable through score breakdown, reasons, warnings and missing facts", () => {
  const result = buildOrientationSelection(
    profile({ preferredCities: ["Aachen"] }),
    [verification()],
  );

  const item = result.selected[0];
  assert.ok(item.breakdown.verification > 0);
  assert.ok(item.breakdown.degree > 0);
  assert.ok(item.breakdown.field > 0);
  assert.ok(item.reasons.includes("preferred_city_match"));
  assert.ok(Array.isArray(item.warnings));
  assert.ok(Array.isArray(item.missingFacts));
});
