import assert from "node:assert/strict";
import test from "node:test";

const URL="https://almago-dev.onrender.com/api/orientation/engine";
const profiles={
  P06:{bacStatus:"obtained",bacYear:"2023",bacTrack:"Sciences techniques",generalAverage:"14",averageType:"official",lastDiploma:"Bac + 2",targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"electrical_electronics",germanLevel:"B2",englishLevel:"B2",studyLanguage:"Allemand",targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"1 000–1 200 € / mois",preferredCities:["Aachen","Munich","Stuttgart"],masterSubjectCredits:{}},
  P09:{bacStatus:"obtained",bacYear:"2024",bacTrack:"Lettres",generalAverage:"14",averageType:"official",lastDiploma:"Bac + 1",targetDegree:"Bachelor",targetField:"Économie/Gestion",engineeringSpecialty:"",germanLevel:"A2",englishLevel:"B2",studyLanguage:"Anglais",targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"800–1 000 € / mois",preferredCities:["Berlin","Cologne"],masterSubjectCredits:{}},
  P10:{bacStatus:"obtained",bacYear:"2020",bacTrack:"Sciences techniques",generalAverage:"13",averageType:"official",lastDiploma:"Licence",targetDegree:"Master",targetField:"Ingénierie",engineeringSpecialty:"automotive",germanLevel:"B2",englishLevel:"B2",studyLanguage:"Allemand et anglais",targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"Plus de 1 200 € / mois",preferredCities:["Stuttgart","Munich"],masterSubjectCredits:{}}
};

async function call(answers){
  let lastStatus=null;
  for(let attempt=1;attempt<=6;attempt++){
    const response=await fetch(URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locale:"fr",answers})});
    lastStatus=response.status;
    if(response.status===200) return response.json();
    if(![502,503,504].includes(response.status)) {
      assert.equal(response.status,200);
    }
    if(attempt<6) await new Promise(r=>setTimeout(r,10000));
  }
  assert.equal(lastStatus,200);
}

function identity(items){
  return items.map(x=>({position:x.position,institution:x.institution,programme:x.programme,city:x.city}));
}

test("LIVE #810 exposes one canonical shortlist for divergent profiles", async()=>{
  let first=null;
  for(let attempt=1;attempt<=10;attempt++){
    first=await call(profiles.P06);
    if(first.shortlist?.source==="personalized_verified") break;
    if(attempt<10) await new Promise(r=>setTimeout(r,20000));
  }
  assert.equal(first.shortlist?.source,"personalized_verified");

  const results={P06:first,P09:await call(profiles.P09),P10:await call(profiles.P10)};
  for(const [id,data] of Object.entries(results)){
    console.log("CANONICAL_PROFILE",id,JSON.stringify({
      engineRecommendationCount:data.engine?.recommendations?.length,
      personalizedCount:data.personalized?.selected?.length,
      source:data.shortlist?.source,
      canonical:data.shortlist?.items
    },null,2));
    assert.equal(data.shortlist?.source,"personalized_verified",id);
    assert.deepEqual(data.shortlist.items,identity(data.personalized.selected),id);
  }
});
