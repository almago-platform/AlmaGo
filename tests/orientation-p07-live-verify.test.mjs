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

async function call() {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale: "fr", answers }),
  });
  if ([502, 503, 504].includes(response.status)) return null;
  assert.equal(response.status, 200);
  return response.json();
}

function relevant(item) {
  return /data\s*science|artificial\s*intelligence|machine\s*learning|(^|\W)ai(\W|$)/i.test(
    String(item?.programme || ""),
  );
}

test("LIVE P07 Master Data/AI specialization reaches canonical shortlist", async () => {
  let last = null;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const data = await call();
    if (data) last = data;

    if (
      last?.shortlist?.source === "personalized_verified"
      && (last.shortlist.items || []).some(relevant)
    ) {
      break;
    }

    if (attempt < 10) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  assert.ok(last);
  const programmes = (last.shortlist?.items || []).map(
    (item) => `${item.programme} — ${item.institution}`,
  );

  console.log("LIVE_P07_AFTER_826", JSON.stringify({
    canonicalSource: last.shortlist?.source ?? null,
    canonicalCount: last.shortlist?.items?.length ?? null,
    programmes,
    personalizedStatus: last.personalized?.status ?? null,
    targetSpecialization: last.engine?.profile?.targetSpecialization ?? null,
  }, null, 2));

  assert.equal(last.shortlist?.source, "personalized_verified");
  assert.equal(last.engine?.profile?.targetSpecialization, "Data Science and Artificial Intelligence");
  assert.equal(
    (last.shortlist?.items || []).some(relevant),
    true,
    "P07 must surface at least one Data Science / AI-relevant verified Master.",
  );
});
