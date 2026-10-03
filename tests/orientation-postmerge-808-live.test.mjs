import assert from "node:assert/strict";
import test from "node:test";

const URL = "https://almago-dev.onrender.com/api/orientation/engine";

const profiles = {
  P01: {
    bacStatus:"preparing",bacYear:"2027",bacTrack:"Informatique",generalAverage:"14",averageType:"current_estimate",lastDiploma:"none",
    targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"computer_engineering",
    germanLevel:"A1",englishLevel:"B1",studyLanguage:"Allemand et anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"800–1 000 € / mois",preferredCities:["Aachen","Berlin"],masterSubjectCredits:{}
  },
  P03: {
    bacStatus:"obtained",bacYear:"2026",bacTrack:"Informatique",generalAverage:"16",averageType:"official",lastDiploma:"Baccalauréat",
    targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"computer_engineering",
    germanLevel:"A2",englishLevel:"B2",studyLanguage:"Anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"800–1 000 € / mois",preferredCities:["Hambourg","Hanovre","Bonn"],masterSubjectCredits:{}
  },
  P07: {
    bacStatus:"obtained",bacYear:"2022",bacTrack:"Mathématiques",generalAverage:"14.5",averageType:"official",lastDiploma:"Licence",
    targetDegree:"Master",targetField:"Informatique",engineeringSpecialty:"",
    germanLevel:"B1",englishLevel:"C1",studyLanguage:"Anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"1 000–1 200 € / mois",preferredCities:["Berlin","Munich","Darmstadt"],masterSubjectCredits:{}
  },
  P08: {
    bacStatus:"obtained",bacYear:"2023",bacTrack:"Informatique",generalAverage:"12",averageType:"official",lastDiploma:"Bac + 2",
    targetDegree:"Bachelor",targetField:"Informatique",engineeringSpecialty:"",
    germanLevel:"A2",englishLevel:"B1",studyLanguage:"Allemand et anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"Moins de 800 € / mois",preferredCities:["Berlin","Leipzig"],masterSubjectCredits:{}
  },
  P10: {
    bacStatus:"obtained",bacYear:"2020",bacTrack:"Sciences techniques",generalAverage:"13",averageType:"official",lastDiploma:"Licence",
    targetDegree:"Master",targetField:"Ingénierie",engineeringSpecialty:"automotive",
    germanLevel:"B2",englishLevel:"B2",studyLanguage:"Allemand et anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"Plus de 1 200 € / mois",preferredCities:["Stuttgart","Munich"],masterSubjectCredits:{}
  }
};

async function call(answers) {
  const response = await fetch(URL, {
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({locale:"fr",answers}),
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.ok(data.personalized?.content);
  return data;
}

function combinedPriority(content) {
  return [
    content.mainPriority?.title,
    content.mainPriority?.text,
    content.mainPriority?.nextStep,
  ].filter(Boolean).join(" ");
}

function hasStrong(content) {
  return (content.studyOptions || []).some((option) =>
    /fortes chances d[’']admission/i.test(option.whyItFits || "")
  );
}

async function waitForNewDeploy() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const data = await call(profiles.P03);
    const content = data.personalized.content;
    const updated =
      content.languagePlan?.nextLevel === null
      && content.languagePlan?.show === false
      && !/\bC1\b/i.test(combinedPriority(content))
      && !hasStrong(content);
    console.log("DEPLOY_CHECK", JSON.stringify({
      attempt,
      updated,
      priority: combinedPriority(content),
      languagePlan: content.languagePlan,
      strong: hasStrong(content),
    }));
    if (updated) return data;
    if (attempt < 10) await new Promise((resolve) => setTimeout(resolve, 20000));
  }
  throw new Error("Render did not serve #808 behavior within the verification window.");
}

test("LIVE post-merge #808 language and admission gating", async () => {
  const p03 = await waitForNewDeploy();

  const results = {P03:p03};
  for (const id of ["P01","P07","P08","P10"]) {
    results[id] = await call(profiles[id]);
  }

  for (const [id,data] of Object.entries(results)) {
    const content = data.personalized.content;
    console.log("PROFILE", id, JSON.stringify({
      status:data.personalized.status,
      opening:content.opening,
      priority:content.mainPriority,
      languagePlan:content.languagePlan,
      studyOptions:(content.studyOptions||[]).map((o)=>({
        programme:o.programme,
        why:o.whyItFits,
      })),
    }, null, 2));
  }

  assert.equal(results.P03.personalized.content.languagePlan.show, false);
  assert.equal(results.P03.personalized.content.languagePlan.nextLevel, null);
  assert.doesNotMatch(combinedPriority(results.P03.personalized.content), /\bC1\b/i);
  assert.equal(hasStrong(results.P03.personalized.content), false);

  assert.equal(hasStrong(results.P01.personalized.content), false);

  assert.equal(results.P07.personalized.content.languagePlan.show, false);
  assert.equal(results.P07.personalized.content.languagePlan.nextLevel, null);
  assert.doesNotMatch(combinedPriority(results.P07.personalized.content), /\bC2\b/i);
  assert.equal(hasStrong(results.P07.personalized.content), false);

  assert.equal(hasStrong(results.P08.personalized.content), false);

  assert.equal(results.P10.personalized.content.languagePlan.show, false);
  assert.equal(results.P10.personalized.content.languagePlan.nextLevel, null);
  assert.doesNotMatch(combinedPriority(results.P10.personalized.content), /\bC1\b/i);
  assert.equal(hasStrong(results.P10.personalized.content), false);
});
