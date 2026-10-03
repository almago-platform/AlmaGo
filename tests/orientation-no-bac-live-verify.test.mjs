import assert from "node:assert/strict";
import test from "node:test";

const URL = "https://almago-dev.onrender.com/api/orientation/engine";

const answers = {
  targetSpecialization: "",
  engineeringSpecialty: "",
  scienceSpecialty: "",
  currentStudyField: "",
  universitySemesters: "",
  studyIntent: "",
  targetIntakeSeason: "winter",
  targetIntakeYear: "2027",
  preferredCities: ["Berlin"],
  masterSubjectCredits: {},
  bacStatus: "no_bac",
  bacYear: "",
  bacTrack: "",
  generalAverage: "",
  averageType: "",
  lastDiploma: "secondary_other",
  higherEducationStatus: "not_started",
  targetDegree: "Bachelor",
  targetField: "Informatique",
  germanLevel: "A1",
  englishLevel: "A2",
  studyLanguage: "À définir",
  budgetRange: "Moins de 800 € / mois",
};

async function callUntilDeployed() {
  let last = null;

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: "fr", answers }),
    });

    if ([502, 503, 504].includes(response.status)) {
      if (attempt < 8) {
        await new Promise((resolve) => setTimeout(resolve, 15000));
        continue;
      }
      assert.equal(response.status, 200);
    }

    assert.equal(response.status, 200);
    const data = await response.json();
    last = data;

    if (
      data.shortlist?.source === "none"
      && Array.isArray(data.shortlist?.items)
      && data.shortlist.items.length === 0
      && data.scout?.status === "disabled"
    ) {
      return data;
    }

    if (attempt < 8) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  return last;
}

test("LIVE P02 no-Bac route exposes no university shortlist", async () => {
  const data = await callUntilDeployed();

  assert.ok(data);
  assert.equal(data.shortlist?.source, "none");
  assert.deepEqual(data.shortlist?.items, []);
  assert.equal(data.scout?.status, "disabled");
  assert.equal(data.personalized?.selected?.length ?? 0, 0);

  const letterText = [
    ...(data.letter?.paragraphs || []),
    data.letter?.closing || "",
  ].join(" ");

  assert.match(letterText, /ne proposons pas encore d’université/i);
  assert.match(letterText, /clarifier votre situation académique/i);

  console.log("LIVE_P02_NO_BAC", JSON.stringify({
    canonicalSource: data.shortlist?.source,
    canonicalCount: data.shortlist?.items?.length ?? null,
    scoutStatus: data.scout?.status ?? null,
    personalizedStatus: data.personalized?.status ?? null,
    personalizedCount: data.personalized?.selected?.length ?? null,
  }, null, 2));
});
