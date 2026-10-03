import assert from "node:assert/strict";
import test from "node:test";

const URL="https://almago-dev.onrender.com/api/orientation/engine";

const profiles={
  P05:{
    bacStatus:"obtained",bacYear:"2025",bacTrack:"Mathématiques",generalAverage:"15",averageType:"official",lastDiploma:"Baccalauréat",
    higherEducationStatus:"currently_enrolled",currentStudyField:"Informatique",universitySemesters:"2",studyIntent:"continue_same_field",targetSpecialization:"",
    targetDegree:"Bachelor",targetField:"Informatique",engineeringSpecialty:"",
    germanLevel:"B1",englishLevel:"B2",studyLanguage:"Allemand et anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"800–1 000 € / mois",preferredCities:["Aachen","Bonn"],masterSubjectCredits:{}
  },
  P08:{
    bacStatus:"obtained",bacYear:"2023",bacTrack:"Informatique",generalAverage:"12",averageType:"official",lastDiploma:"Bac + 2",
    higherEducationStatus:"interrupted",currentStudyField:"Informatique",universitySemesters:"4",studyIntent:"transfer_credits",targetSpecialization:"",
    targetDegree:"Bachelor",targetField:"Informatique",engineeringSpecialty:"",
    germanLevel:"A2",englishLevel:"B1",studyLanguage:"Allemand et anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"Moins de 800 € / mois",preferredCities:["Berlin","Leipzig"],masterSubjectCredits:{}
  },
  P07:{
    bacStatus:"obtained",bacYear:"2022",bacTrack:"Mathématiques",generalAverage:"14.5",averageType:"official",lastDiploma:"Licence",
    higherEducationStatus:"completed",currentStudyField:"Computer Science",universitySemesters:"6",studyIntent:"master_after_degree",targetSpecialization:"Data Science and Artificial Intelligence",
    targetDegree:"Master",targetField:"Informatique",engineeringSpecialty:"",
    germanLevel:"B1",englishLevel:"C1",studyLanguage:"Anglais",
    targetIntakeSeason:"winter",targetIntakeYear:"2027",budgetRange:"1 000–1 200 € / mois",preferredCities:["Berlin","Munich","Darmstadt"],masterSubjectCredits:{}
  }
};

async function call(answers){
  let lastStatus=null;
  for(let attempt=1;attempt<=8;attempt++){
    const response=await fetch(URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locale:"fr",answers})});
    lastStatus=response.status;
    if(response.status===200) return response.json();
    if(![502,503,504].includes(response.status)) assert.equal(response.status,200);
    if(attempt<8) await new Promise(r=>setTimeout(r,10000));
  }
  assert.equal(lastStatus,200);
}

function compact(data){
  const content=data.personalized?.content;
  return {
    profile:{
      higherEducationStatus:data.engine?.profile?.higherEducationStatus,
      currentStudyField:data.engine?.profile?.currentStudyField,
      universitySemesters:data.engine?.profile?.universitySemesters,
      studyIntent:data.engine?.profile?.studyIntent,
      targetSpecialization:data.engine?.profile?.targetSpecialization,
    },
    personalizedStatus:data.personalized?.status,
    opening:content?.opening,
    projectStatus:content?.projectStatus,
    priority:content?.mainPriority,
    studyOptions:(content?.studyOptions||[]).map(o=>({
      programme:o.programme,
      institution:o.institution,
      why:o.whyItFits,
    })),
  };
}

test("LIVE #812 distinguishes higher-education situations", async()=>{
  let p05=null;
  for(let attempt=1;attempt<=12;attempt++){
    p05=await call(profiles.P05);
    const deployed=p05.engine?.profile?.higherEducationStatus==="currently_enrolled";
    console.log("DEPLOY_CHECK",JSON.stringify({attempt,deployed,status:p05.engine?.profile?.higherEducationStatus}));
    if(deployed) break;
    if(attempt<12) await new Promise(r=>setTimeout(r,20000));
  }
  assert.equal(p05.engine?.profile?.higherEducationStatus,"currently_enrolled");

  const results={P05:p05,P08:await call(profiles.P08),P07:await call(profiles.P07)};

  assert.equal(results.P05.engine.profile.currentStudyField,"Informatique");
  assert.equal(results.P05.engine.profile.universitySemesters,"2");
  assert.equal(results.P05.engine.profile.studyIntent,"continue_same_field");

  assert.equal(results.P08.engine.profile.higherEducationStatus,"interrupted");
  assert.equal(results.P08.engine.profile.currentStudyField,"Informatique");
  assert.equal(results.P08.engine.profile.universitySemesters,"4");
  assert.equal(results.P08.engine.profile.studyIntent,"transfer_credits");

  assert.equal(results.P07.engine.profile.higherEducationStatus,"completed");
  assert.equal(results.P07.engine.profile.currentStudyField,"Computer Science");
  assert.equal(results.P07.engine.profile.universitySemesters,"6");
  assert.equal(results.P07.engine.profile.studyIntent,"master_after_degree");
  assert.equal(results.P07.engine.profile.targetSpecialization,"Data Science and Artificial Intelligence");

  for(const [id,data] of Object.entries(results)){
    console.log("HIGHER_ED_PROFILE",id,JSON.stringify(compact(data),null,2));
  }

  const interruptedText=JSON.stringify(compact(results.P08));
  assert.doesNotMatch(interruptedText,/étudiez actuellement à l['’]université|actuellement inscrit/i);
});
