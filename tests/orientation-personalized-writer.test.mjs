import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildDeterministicOrientationWriterContent,
  buildOrientationWriterContext,
  orientationWriterLanguageFocus,
  parseOrientationWriterPayload,
} = await import("../src/lib/orientation-engine/writer/core.ts");

const geminiSource = readFileSync(
  "src/lib/orientation-engine/writer/gemini.ts",
  "utf8",
);
const serviceSource = readFileSync(
  "src/lib/orientation-engine/writer/service.ts",
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
    germanLevel: "A2",
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
      : "https://www.example-university.de/programme",
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

function selectedItem(position, overrides = {}) {
  const institution = overrides.institution || `University ${position}`;
  const programme = overrides.programme || "Automotive Engineering";
  const city = overrides.city || (position === 1 ? "Aachen" : "Berlin");
  const overallStatus = overrides.overallStatus || "verified";

  return {
    position,
    verification: {
      candidate: {
        institution,
        programme,
        degree: "Bachelor",
        city,
        teachingLanguage: "German",
        officialProgrammeUrl: "https://www.example-university.de/programme",
        officialUniversityUrl: "https://www.example-university.de",
        discoveryReason: "Relevant programme.",
        sourceUrls: ["https://www.example-university.de/programme"],
        status: "research_candidate",
      },
      overallStatus,
      facts: [
        fact("programme_exists", true),
        fact("degree_level", "Bachelor"),
        fact("city", city),
        fact("teaching_language", "German"),
        fact("german_language_requirement", "B2"),
        fact("english_language_requirement", null, "unknown"),
        fact("accepted_language_certificates", null, "unknown"),
        fact("intake_terms", ["Winter semester"]),
        fact("winter_deadline", "15 July 2027"),
        fact("summer_deadline", null, "unknown"),
        fact("application_route", "direct"),
        fact("application_url", null, "unknown"),
        fact("studienkolleg_requirement", null, "unknown"),
        fact("tuition_or_semester_fees", null, "unknown"),
      ],
      sourceUrls: ["https://www.example-university.de/programme"],
      verifiedAt: "2026-10-02T20:30:00.000Z",
    },
    excluded: false,
    exclusionCodes: [],
    baseScore: 100 - position,
    finalScore: 100 - position,
    breakdown: {
      verification: 35,
      degree: 20,
      field: 25,
      language: 12,
      city: position === 1 ? 8 : -2,
      intake: 8,
      readiness: 0,
      diversity: 0,
    },
    reasons: [
      "core_verified",
      "degree_match",
      "specialty_match",
      "field_match",
      "study_language_match",
      ...(position === 1 ? ["preferred_city_match"] : []),
      "intake_match",
      "application_route_known",
      "deadline_known",
    ],
    warnings: [
      "language_requirement_to_complete",
      "fees_unknown",
    ],
    missingFacts: [
      "english_language_requirement",
      "accepted_language_certificates",
      "summer_deadline",
      "application_url",
      "studienkolleg_requirement",
      "tuition_or_semester_fees",
    ],
    ...overrides.item,
  };
}

function selection(count = 3) {
  const selected = Array.from({ length: count }, (_, index) =>
    selectedItem(index + 1)
  );
  return {
    profile: profile(),
    status: count >= 3 ? "ready" : count > 0 ? "partial" : "insufficient_evidence",
    selected,
    considered: count,
    excluded: [],
    unselected: [],
    targetSize: { min: 3, max: 4 },
    generatedBy: "deterministic_selection_v1",
  };
}

function input(overrides = {}) {
  const p = overrides.profile || profile();
  const s = overrides.selection || {
    ...selection(3),
    profile: p,
  };

  return {
    locale: "fr",
    profile: p,
    selection: s,
    campusOptions: [
      {
        code: "document_preparation",
        label: "Préparation du dossier",
        description: "Campus Allemagne vous aide à organiser les documents nécessaires au dossier.",
      },
      {
        code: "programme_comparison",
        label: "Comparaison des programmes",
        description: "Campus Allemagne vous accompagne pour comparer les pistes retenues.",
      },
    ],
    availableActions: [
      {
        id: "review_shortlist",
        label: "Voir mes pistes",
        description: "Examiner les pistes retenues et les points à vérifier.",
      },
    ],
    ...overrides,
  };
}

function validPayload(writerInput = input()) {
  const focus = orientationWriterLanguageFocus(writerInput.profile);
  return {
    opening: "Félicitations pour votre Bac avec 15/20. Votre projet automobile peut maintenant avancer concrètement.",
    project_status: "Nous avons plusieurs pistes sérieuses à comparer avant les candidatures.",
    main_priority: {
      title: "Votre priorité maintenant",
      text: "Continuez votre progression linguistique pendant que les pistes universitaires restent organisées.",
      next_step: "Passez de A2 à B1 comme prochaine étape utile.",
    },
    language_plan: {
      show: focus.show,
      current_level: focus.current_level,
      next_level: focus.next_level,
      text: "Vous êtes actuellement à A2 ; concentrez-vous sur B1 comme prochaine étape.",
      available_paths: [],
    },
    campus_value: "Campus Allemagne vous aide à organiser les documents nécessaires au dossier et à comparer les pistes retenues.",
    study_options: writerInput.selection.selected.map((item) => ({
      option_id: `option_${item.position}`,
      why_it_fits: "Cette piste correspond à votre spécialité automobile et au Bachelor visé.",
      verification_note: "La piste est documentée, mais les conditions encore inconnues restent à vérifier avant candidature.",
    })),
    roadmap: [
      {
        id: "language",
        label: "Langue",
        text: "Avancer vers B1.",
      },
      {
        id: "shortlist",
        label: "Pistes universitaires",
        text: "Comparer les programmes retenus.",
      },
      {
        id: "documents",
        label: "Dossier",
        text: "Organiser les documents nécessaires.",
      },
    ],
    reassurance: "Vous n’avez pas besoin de tout régler aujourd’hui : la prochaine étape est déjà claire.",
    cta: {
      action_id: "review_shortlist",
      label: "Voir mes pistes",
      text: "Examiner les pistes retenues et les points à vérifier.",
    },
  };
}

test("D sends only a minimized profile and C shortlist, never B source URLs or scores", () => {
  const context = buildOrientationWriterContext(input());
  const serialized = JSON.stringify(context);

  assert.ok(context.PROFIL_ETUDIANT);
  assert.ok(context.FAITS_VERIFIES);
  assert.ok(context.OPTIONS_CAMPUS_ALLEMAGNE);
  assert.ok(context.ACTIONS_DISPONIBLES);
  assert.equal(context.FAITS_VERIFIES.programmes.length, 3);
  assert.equal(context.FAITS_VERIFIES.programmes[0].option_id, "option_1");

  assert.doesNotMatch(serialized, /sourceUrl|source_urls|officialProgrammeUrl|officialUniversityUrl/);
  assert.doesNotMatch(serialized, /baseScore|finalScore|breakdown/);
  assert.doesNotMatch(serialized, /email|phone|passport|student_name/i);
});

test("D separates verified facts from needs-review facts before Gemini sees them", () => {
  const writerInput = input();
  writerInput.selection.selected[0].verification.facts = [
    fact("degree_level", "Bachelor", "verified"),
    fact("application_route", "uni_assist", "needs_review"),
    fact("winter_deadline", null, "unknown"),
  ];

  const context = buildOrientationWriterContext(writerInput);
  const programme = context.FAITS_VERIFIES.programmes[0];

  assert.deepEqual(programme.verified_facts, [
    { field: "degree_level", value: "Bachelor" },
  ]);
  assert.deepEqual(programme.facts_to_review, [
    { field: "application_route", value: "uni_assist" },
  ]);
  assert.ok(programme.missing_facts.includes("english_language_requirement"));
});

test("D language plan focuses on only the immediate next level", () => {
  assert.deepEqual(
    orientationWriterLanguageFocus(profile({ germanLevel: "A2" })),
    {
      show: true,
      current_level: "A2",
      next_level: "B1",
    },
  );

  assert.deepEqual(
    orientationWriterLanguageFocus(profile({ germanLevel: "B2" })),
    {
      show: true,
      current_level: "B2",
      next_level: "C1",
    },
  );
});

test("D deterministic fallback remains useful when Gemini is unavailable", () => {
  const content = buildDeterministicOrientationWriterContent(input());

  assert.match(content.opening, /Félicitations/i);
  assert.match(content.opening, /15\/20/);
  assert.equal(content.languagePlan.currentLevel, "A2");
  assert.equal(content.languagePlan.nextLevel, "B1");
  assert.equal(content.studyOptions.length, 3);
  assert.equal(content.studyOptions[0].institution, "University 1");
  assert.equal(content.cta.actionId, "review_shortlist");
  assert.match(content.campusValue, /Campus Allemagne/);
});

test("D parser accepts a grounded structured payload and injects programme names from C", () => {
  const writerInput = input();
  const raw = validPayload(writerInput);
  raw.study_options[0].institution = "Invented University";
  raw.study_options[0].programme = "Invented Programme";

  const parsed = parseOrientationWriterPayload(writerInput, raw);

  assert.ok(parsed);
  assert.equal(parsed.studyOptions[0].institution, "University 1");
  assert.equal(parsed.studyOptions[0].programme, "Automotive Engineering");
  assert.equal(parsed.studyOptions.length, 3);
});

test("D rejects a Gemini option that is not in the deterministic C shortlist", () => {
  const writerInput = input();
  const raw = validPayload(writerInput);
  raw.study_options[0].option_id = "option_99";

  assert.equal(parseOrientationWriterPayload(writerInput, raw), null);
});

test("D rejects invented CEFR levels and unsupported numeric claims", () => {
  const writerInput = input();

  const inventedLevel = validPayload(writerInput);
  inventedLevel.language_plan.text =
    "Vous êtes à A2 mais ce programme exige C2.";
  assert.equal(
    parseOrientationWriterPayload(writerInput, inventedLevel),
    null,
  );

  const inventedDuration = validPayload(writerInput);
  inventedDuration.main_priority.text =
    "Votre préparation durera exactement 6 mois.";
  assert.equal(
    parseOrientationWriterPayload(writerInput, inventedDuration),
    null,
  );
});

test("D rejects admission guarantees even when all programme core facts are verified", () => {
  const writerInput = input();
  const raw = validPayload(writerInput);
  raw.reassurance = "Votre admission est garantie avec ces pistes.";

  assert.equal(parseOrientationWriterPayload(writerInput, raw), null);
});

test("D rejects invented Studienkolleg or uni-assist claims when absent from context", () => {
  const writerInput = input();

  const studienkolleg = validPayload(writerInput);
  studienkolleg.project_status =
    "Vous devrez obligatoirement passer par un Studienkolleg.";
  assert.equal(parseOrientationWriterPayload(writerInput, studienkolleg), null);

  const uniAssist = validPayload(writerInput);
  uniAssist.project_status =
    "Toutes vos candidatures passeront obligatoirement par uni-assist.";
  assert.equal(parseOrientationWriterPayload(writerInput, uniAssist), null);
});

test("D CTA must be one of the backend actions actually available", () => {
  const writerInput = input();
  const raw = validPayload(writerInput);
  raw.cta.action_id = "pay_now";

  assert.equal(parseOrientationWriterPayload(writerInput, raw), null);
});

test("D requires every selected option exactly once", () => {
  const writerInput = input();
  const raw = validPayload(writerInput);
  raw.study_options = raw.study_options.slice(0, 2);

  assert.equal(parseOrientationWriterPayload(writerInput, raw), null);
});

test("D Gemini adapter is server-only, structured, bounded and has no research tools", () => {
  assert.match(geminiSource, /import "server-only"/);
  assert.match(geminiSource, /ALMAGO_ORIENTATION_WRITER_PROVIDER/);
  assert.match(geminiSource, /GEMINI_API_KEY/);
  assert.match(geminiSource, /gemini-3\.8-flash/);
  assert.match(geminiSource, /responseMimeType: "application\/json"/);
  assert.match(geminiSource, /responseSchema/);
  assert.match(geminiSource, /REQUEST_TIMEOUT_MS = 10_000/);
  assert.match(geminiSource, /CACHE_TTL_MS = 30 \* 60 \* 1000/);
  assert.doesNotMatch(geminiSource, /googleSearch|web_search|urlContext|tools:/);
  assert.match(geminiSource, /never decide admission eligibility/i);
  assert.match(geminiSource, /Do not invent deadlines, fees, language thresholds/i);
});

test("D service delegates only to the writer and does not alter C selection", () => {
  assert.match(serviceSource, /runGeminiOrientationWriter/);
  assert.doesNotMatch(serviceSource, /buildOrientationSelection|evaluateOrientationSelectionCandidate/);
});
