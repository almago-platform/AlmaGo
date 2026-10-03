import assert from "node:assert/strict";
import test from "node:test";

const URL="https://almago-dev.onrender.com/api/orientation/engine";
const base={
  targetSpecialization:"", engineeringSpecialty:"", scienceSpecialty:"",
  currentStudyField:"", universitySemesters:"", studyIntent:"",
  targetIntakeSeason:"winter", targetIntakeYear:"2027",
  preferredCities:[], masterSubjectCredits:{}
};
const P=(id,label,answers)=>({id,label,answers:{...base,...answers}});
const profiles=[
  P("P01","Lycéen — Bac en préparation",{bacStatus:"preparing",bacYear:"2027",bacTrack:"Informatique",generalAverage:"14",averageType:"current_estimate",lastDiploma:"none",higherEducationStatus:"not_started",targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"computer_engineering",germanLevel:"A1",englishLevel:"B1",studyLanguage:"Allemand et anglais",budgetRange:"800–1 000 € / mois",preferredCities:["Aachen","Berlin"]}),
  P("P02","Sans Bac",{bacStatus:"no_bac",bacYear:"",bacTrack:"",generalAverage:"",averageType:"",lastDiploma:"secondary_other",higherEducationStatus:"not_started",targetDegree:"Bachelor",targetField:"Informatique",germanLevel:"A1",englishLevel:"A2",studyLanguage:"À définir",budgetRange:"Moins de 800 € / mois",preferredCities:["Berlin"]}),
  P("P03","Nouveau bachelier 16/20",{bacStatus:"obtained",bacYear:"2026",bacTrack:"Informatique",generalAverage:"16",averageType:"official",lastDiploma:"Baccalauréat",higherEducationStatus:"not_started",targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"computer_engineering",germanLevel:"A2",englishLevel:"B2",studyLanguage:"Anglais",budgetRange:"800–1 000 € / mois",preferredCities:["Hambourg","Hanovre","Bonn"]}),
  P("P04","Sciences → Biologie",{bacStatus:"obtained",bacYear:"2024",bacTrack:"Sciences expérimentales",generalAverage:"13",averageType:"official",lastDiploma:"Baccalauréat",higherEducationStatus:"not_started",targetDegree:"Bachelor",targetField:"Sciences",scienceSpecialty:"biology_life_sciences",germanLevel:"A2",englishLevel:"B1",studyLanguage:"Allemand",targetIntakeSeason:"summer",budgetRange:"Moins de 800 € / mois",preferredCities:["Bonn","Leipzig"]}),
  P("P05","Bac+1 Informatique — inscrit",{bacStatus:"obtained",bacYear:"2025",bacTrack:"Mathématiques",generalAverage:"15",averageType:"official",lastDiploma:"Bac + 1",higherEducationStatus:"currently_enrolled",currentStudyField:"Informatique",universitySemesters:"2",studyIntent:"continue_same_field",targetDegree:"Bachelor",targetField:"Informatique",germanLevel:"B1",englishLevel:"B2",studyLanguage:"Allemand et anglais",budgetRange:"800–1 000 € / mois",preferredCities:["Aachen","Bonn"]}),
  P("P06","Bac+2 Électrotechnique — inscrit",{bacStatus:"obtained",bacYear:"2023",bacTrack:"Sciences techniques",generalAverage:"14",averageType:"official",lastDiploma:"Bac + 2",higherEducationStatus:"currently_enrolled",currentStudyField:"Électrotechnique",universitySemesters:"4",studyIntent:"continue_same_field",targetDegree:"Bachelor",targetField:"Ingénierie",engineeringSpecialty:"electrical_electronics",germanLevel:"B2",englishLevel:"B2",studyLanguage:"Allemand",budgetRange:"1 000–1 200 € / mois",preferredCities:["Aachen","Munich","Stuttgart"]}),
  P("P07","Licence Informatique → Master Data/AI",{bacStatus:"obtained",bacYear:"2022",bacTrack:"Mathématiques",generalAverage:"14.5",averageType:"official",lastDiploma:"Licence",higherEducationStatus:"completed",currentStudyField:"Computer Science",universitySemesters:"6",studyIntent:"master_after_degree",targetSpecialization:"Data Science and Artificial Intelligence",targetDegree:"Master",targetField:"Informatique",germanLevel:"B1",englishLevel:"C1",studyLanguage:"Anglais",budgetRange:"1 000–1 200 € / mois",preferredCities:["Berlin","Munich","Darmstadt"]}),
  P("P08","Études interrompues après Bac+2",{bacStatus:"obtained",bacYear:"2023",bacTrack:"Informatique",generalAverage:"12",averageType:"official",lastDiploma:"Bac + 2",higherEducationStatus:"interrupted",currentStudyField:"Informatique",universitySemesters:"4",studyIntent:"transfer_credits",targetDegree:"Bachelor",targetField:"Informatique",germanLevel:"A2",englishLevel:"B1",studyLanguage:"Allemand et anglais",budgetRange:"Moins de 800 € / mois",preferredCities:["Berlin","Leipzig"]}),
  P("P09","Lettres → Gestion",{bacStatus:"obtained",bacYear:"2024",bacTrack:"Lettres",generalAverage:"14",averageType:"official",lastDiploma:"Bac + 1",higherEducationStatus:"currently_enrolled",currentStudyField:"Lettres / Langues",universitySemesters:"2",studyIntent:"switch_field",targetDegree:"Bachelor",targetField:"Économie/Gestion",germanLevel:"A2",englishLevel:"C1",studyLanguage:"Anglais",budgetRange:"800–1 000 € / mois",preferredCities:["Berlin","Cologne"]}),
  P("P10","Licence mécanique → Master automobile",{bacStatus:"obtained",bacYear:"2020",bacTrack:"Sciences techniques",generalAverage:"13",averageType:"official",lastDiploma:"Licence",higherEducationStatus:"completed",currentStudyField:"Mechanical Engineering",universitySemesters:"6",studyIntent:"master_after_degree",targetSpecialization:"Automotive Engineering",targetDegree:"Master",targetField:"Ingénierie",engineeringSpecialty:"automotive",germanLevel:"B2",englishLevel:"B2",studyLanguage:"Allemand et anglais",budgetRange:"Plus de 1 200 € / mois",preferredCities:["Stuttgart","Munich"]})
];

async function call(answers){
  let lastStatus=null;
  for(let attempt=1;attempt<=5;attempt++){
    const r=await fetch(URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locale:"fr",answers})});
    lastStatus=r.status;
    if(r.status===200) return r.json();
    if(![502,503,504].includes(r.status)) assert.equal(r.status,200);
    if(attempt<5) await new Promise(resolve=>setTimeout(resolve,10000));
  }
  assert.equal(lastStatus,200);
}

function compact(p,data){
  const content=data.personalized?.content;
  return {
    id:p.id,label:p.label,
    academicAccessStatus:data.engine?.academicAccessStatus,
    canonicalSource:data.shortlist?.source,
    canonicalCount:data.shortlist?.items?.length ?? 0,
    programmes:(data.shortlist?.items||[]).map(x=>`${x.programme} — ${x.institution}`),
    personalizedStatus:data.personalized?.status ?? null,
    opening:content?.opening ?? null,
    projectStatus:content?.projectStatus ?? null,
    priority:content?.mainPriority ?? null,
    languagePlan:content?.languagePlan ? {
      show:content.languagePlan.show,
      currentLevel:content.languagePlan.currentLevel,
      nextLevel:content.languagePlan.nextLevel,
      text:content.languagePlan.text,
    }:null,
    higherEducationStatus:data.engine?.profile?.higherEducationStatus ?? null,
    currentStudyField:data.engine?.profile?.currentStudyField ?? null,
    studyIntent:data.engine?.profile?.studyIntent ?? null,
    targetSpecialization:data.engine?.profile?.targetSpecialization ?? null,
    scienceSpecialty:data.engine?.profile?.scienceSpecialty ?? null,
  };
}

test("LIVE full 10-profile orientation regression",async()=>{
  const outputs=[];
  for(const p of profiles){
    const data=await call(p.answers);
    assert.ok(data.engine,p.id);
    outputs.push(compact(p,data));
  }
  for(const output of outputs){
    console.log("REGRESSION_PROFILE",output.id,JSON.stringify(output,null,2));
  }
  assert.equal(outputs.length,10);
});
