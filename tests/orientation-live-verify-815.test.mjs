import assert from "node:assert/strict";
import test from "node:test";

const URL = "https://almago-dev.onrender.com/api/orientation/engine";

const profiles = {
  P04: {
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Sciences expérimentales",
    generalAverage: "13",
    averageType: "official",
    lastDiploma: "Baccalauréat",
    higherEducationStatus: "not_started",
    currentStudyField: "",
    universitySemesters: "",
    studyIntent: "",
    targetSpecialization: "",
    targetDegree: "Bachelor",
    targetField: "Sciences",
    engineeringSpecialty: "",
    scienceSpecialty: "biology_life_sciences",
    germanLevel: "A2",
    englishLevel: "B1",
    studyLanguage: "Allemand",
    targetIntakeSeason: "summer",
    targetIntakeYear: "2027",
    budgetRange: "Moins de 800 € / mois",
    preferredCities: ["Bonn", "Leipzig"],
    masterSubjectCredits: {}
  },
  P09: {
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Lettres",
    generalAverage: "14",
    averageType: "official",
    lastDiploma: "Bac + 1",
    higherEducationStatus: "currently_enrolled",
    currentStudyField: "Lettres / Langues",
    universitySemesters: "2",
    studyIntent: "switch_field",
    targetSpecialization: "",
    targetDegree: "Bachelor",
    targetField: "Économie/Gestion",
    engineeringSpecialty: "",
    scienceSpecialty: "",
    germanLevel: "A2",
    englishLevel: "C1",
    studyLanguage: "Anglais",
    targetIntakeSeason: "winter",
    targetIntakeYear: "2027",
    budgetRange: "800–1 000 € / mois",
    preferredCities: ["Berlin", "Cologne"],
    masterSubjectCredits: {}
  }
};

async function call(answers) {
  let lastStatus = null;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const response = await fetch(URL, {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({locale:"fr", answers}),
    });
    lastStatus = response.status;
    if (response.status === 200) return response.json();
    if (![502,503,504].includes(response.status)) {
      assert.equal(response.status, 200);
    }
    if (attempt < 8) await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  assert.equal(lastStatus, 200);
}

async function waitForDeploy() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const data = await call(profiles.P04);
    const deployed = data?.engine?.profile?.scienceSpecialty === "biology_life_sciences";
    console.log("DEPLOY_CHECK", JSON.stringify({attempt, deployed, scienceSpecialty:data?.engine?.profile?.scienceSpecialty ?? null}));
    if (deployed) return data;
    if (attempt < 10) await new Promise((resolve) => setTimeout(resolve, 20000));
  }
  throw new Error("Render did not serve #815 within the verification window.");
}

test("LIVE #815 narrows Sciences and explicitly frames field changes", async () => {
  const p04 = await waitForDeploy();
  const p09 = await call(profiles.P09);

  console.log("P04_LIVE", JSON.stringify({
    profileScienceSpecialty: p04.engine?.profile?.scienceSpecialty,
    source: p04.shortlist?.source,
    shortlist: p04.shortlist?.items,
    projectStatus: p04.personalized?.content?.projectStatus,
  }, null, 2));

  console.log("P09_LIVE", JSON.stringify({
    studyIntent: p09.engine?.profile?.studyIntent,
    currentStudyField: p09.engine?.profile?.currentStudyField,
    targetField: p09.engine?.profile?.targetField,
    projectStatus: p09.personalized?.content?.projectStatus,
    priority: p09.personalized?.content?.mainPriority,
    source: p09.shortlist?.source,
    shortlist: p09.shortlist?.items,
  }, null, 2));

  assert.equal(p04.engine.profile.scienceSpecialty, "biology_life_sciences");
  assert.equal(p04.shortlist.source, "personalized_verified");
  const scienceNames = p04.shortlist.items
    .map((item) => `${item.programme} ${item.institution}`)
    .join(" ");
  assert.doesNotMatch(scienceNames, /\b(?:Mathematics|Mathematik|Mathématiques|Physics|Physik|Physique)\b/i);

  assert.equal(p09.engine.profile.studyIntent, "switch_field");
  assert.equal(p09.engine.profile.currentStudyField, "Lettres / Langues");
  assert.equal(p09.engine.profile.targetField, "Économie/Gestion");
  assert.match(p09.personalized.content.projectStatus, /Lettres \/ Langues/);
  assert.match(p09.personalized.content.projectStatus, /Économie\/Gestion/);
  assert.match(p09.personalized.content.projectStatus, /compatibilité académique/i);
});
