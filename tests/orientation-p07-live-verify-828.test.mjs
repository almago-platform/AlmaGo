import assert from "node:assert/strict";
import test from "node:test";

const URL = "https://almago-dev.onrender.com/api/orientation/engine";
const answers = {
  targetSpecialization: "Data Science and Artificial Intelligence",
  engineeringSpecialty: "",
  scienceSpecialty: "",
  currentStudyField: "Computer Science",
  universitySemesters: "6",
  studyIntent: "master_after_degree",
  targetIntakeSeason: "winter",
  targetIntakeYear: "2027",
  preferredCities: ["Berlin", "Munich", "Darmstadt"],
  masterSubjectCredits: {},
  bacStatus: "obtained",
  bacYear: "2022",
  bacTrack: "Mathématiques",
  generalAverage: "14.5",
  averageType: "official",
  lastDiploma: "Licence",
  higherEducationStatus: "completed",
  targetDegree: "Master",
  targetField: "Informatique",
  germanLevel: "B1",
  englishLevel: "C1",
  studyLanguage: "Anglais",
  budgetRange: "1 000–1 200 € / mois",
};

function relevantProgramme(value) {
  return /data\s*science|artificial\s*intelligence|machine\s*learning|(^|\W)ai(\W|$)/i.test(
    String(value || ""),
  );
}

async function callLive() {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale: "fr", answers }),
  });

  if ([502, 503, 504].includes(response.status)) return null;
  assert.equal(response.status, 200);
  return response.json();
}

test("LIVE P07 specialization survives discovery, verification, selection and canonical projection", async () => {
  let last = null;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const data = await callLive();
    if (data) last = data;

    const canonicalRelevant = (last?.shortlist?.items || []).some((item) =>
      relevantProgramme(item.programme)
    );
    const personalizedRelevant = (last?.personalized?.selected || []).some((item) =>
      relevantProgramme(item.programme)
    );

    if (
      last?.shortlist?.source === "personalized_verified"
      && canonicalRelevant
      && personalizedRelevant
    ) {
      break;
    }

    if (attempt < 12) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  assert.ok(last);

  const canonical = (last.shortlist?.items || []).map((item) => ({
    institution: item.institution,
    programme: item.programme,
    city: item.city,
  }));
  const personalized = (last.personalized?.selected || []).map((item) => ({
    institution: item.institution,
    programme: item.programme,
    city: item.city,
    overallStatus: item.overallStatus,
  }));

  console.log("LIVE_P07_AFTER_828", JSON.stringify({
    canonicalSource: last.shortlist?.source ?? null,
    canonical,
    personalizedStatus: last.personalized?.status ?? null,
    personalized,
    targetSpecialization: last.engine?.profile?.targetSpecialization ?? null,
  }, null, 2));

  assert.equal(last.shortlist?.source, "personalized_verified");
  assert.equal(
    last.engine?.profile?.targetSpecialization,
    "Data Science and Artificial Intelligence",
  );
  assert.equal(
    canonical.some((item) => relevantProgramme(item.programme)),
    true,
    "P07 canonical shortlist must contain the requested Data/AI specialization.",
  );
  assert.equal(
    personalized.some((item) => relevantProgramme(item.programme)),
    true,
    "P07 personalized selection must contain the requested Data/AI specialization before canonical projection.",
  );
});
