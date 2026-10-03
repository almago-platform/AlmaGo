import assert from "node:assert/strict";
import test from "node:test";

const URL = "https://almago-dev.onrender.com/api/orientation/engine";
const base = {
  scienceSpecialty: "",
  targetIntakeSeason: "winter",
  targetIntakeYear: "2027",
  masterSubjectCredits: {},
};

const P07 = {
  ...base,
  bacStatus: "obtained",
  bacYear: "2022",
  bacTrack: "Mathématiques",
  generalAverage: "14.5",
  averageType: "official",
  lastDiploma: "Licence",
  higherEducationStatus: "completed",
  currentStudyField: "Computer Science",
  universitySemesters: "6",
  studyIntent: "master_after_degree",
  targetSpecialization: "Data Science and Artificial Intelligence",
  targetDegree: "Master",
  targetField: "Informatique",
  engineeringSpecialty: "",
  germanLevel: "B1",
  englishLevel: "C1",
  studyLanguage: "Anglais",
  budgetRange: "1 000–1 200 € / mois",
  preferredCities: ["Berlin", "Munich", "Darmstadt"],
};

const P10 = {
  ...base,
  bacStatus: "obtained",
  bacYear: "2020",
  bacTrack: "Sciences techniques",
  generalAverage: "13",
  averageType: "official",
  lastDiploma: "Licence",
  higherEducationStatus: "completed",
  currentStudyField: "Mechanical Engineering",
  universitySemesters: "6",
  studyIntent: "master_after_degree",
  targetSpecialization: "Automotive Engineering",
  targetDegree: "Master",
  targetField: "Ingénierie",
  engineeringSpecialty: "automotive",
  germanLevel: "B2",
  englishLevel: "B2",
  studyLanguage: "Allemand et anglais",
  budgetRange: "Plus de 1 200 € / mois",
  preferredCities: ["Stuttgart", "Munich"],
};

async function call(answers) {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale: "fr", answers }),
  });

  if ([502, 503, 504].includes(response.status)) return null;
  assert.equal(response.status, 200);
  return response.json();
}

function identities(data) {
  return (data.shortlist?.items || []).map((item) =>
    `${String(item.institution || "").trim().toLowerCase()}::${String(item.programme || "").trim().toLowerCase()}`
  );
}

function hasTargetSpecialization(data) {
  return (data.shortlist?.items || []).some((item) =>
    /data\s*science|artificial\s*intelligence|machine\s*learning|(^|\W)ai(\W|$)/i.test(
      String(item.programme || ""),
    )
  );
}

function compact(data) {
  return {
    source: data?.shortlist?.source ?? null,
    count: data?.shortlist?.items?.length ?? null,
    programmes: (data?.shortlist?.items || []).map(
      (item) => `${item.programme} — ${item.institution}`,
    ),
    personalizedStatus: data?.personalized?.status ?? null,
  };
}

test("LIVE P07 specialization relevance and P10 exact-identity dedupe", async () => {
  let lastP07 = null;
  let lastP10 = null;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const [p07, p10] = await Promise.all([call(P07), call(P10)]);
    if (p07) lastP07 = p07;
    if (p10) lastP10 = p10;

    const p10Ids = lastP10 ? identities(lastP10) : [];
    const p10Unique = p10Ids.length > 0 && new Set(p10Ids).size === p10Ids.length;
    const p07Relevant = lastP07 ? hasTargetSpecialization(lastP07) : false;

    if (
      lastP07?.shortlist?.source === "personalized_verified"
      && p07Relevant
      && lastP10?.shortlist?.source === "personalized_verified"
      && p10Unique
    ) {
      break;
    }

    if (attempt < 10) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  assert.ok(lastP07);
  assert.ok(lastP10);

  const p10Ids = identities(lastP10);
  console.log("LIVE_P07_AFTER_824", JSON.stringify(compact(lastP07), null, 2));
  console.log("LIVE_P10_AFTER_824", JSON.stringify(compact(lastP10), null, 2));

  assert.equal(lastP07.shortlist?.source, "personalized_verified");
  assert.equal(
    hasTargetSpecialization(lastP07),
    true,
    "P07 should surface at least one Data Science / AI-relevant Master when the requested specialization is available to selection.",
  );

  assert.equal(lastP10.shortlist?.source, "personalized_verified");
  assert.ok(p10Ids.length > 0);
  assert.equal(
    new Set(p10Ids).size,
    p10Ids.length,
    "P10 canonical shortlist must not contain duplicate institution/programme identities.",
  );
});
