import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  chooseDocumentedResearchPistes,
  researchFamiliesFor,
} from "../src/lib/orientation-engine/discovery/research-pistes.ts";

const read = (path) => readFileSync(path, "utf8");

const criteria = {
  targetDegree: "Bachelor",
  targetField: "Lettres/Langues",
  preferredCities: ["Erlangen"],
  studyLanguage: "Allemand",
  bacStatus: "preparing",
  targetSpecialization: null,
  engineeringSpecialty: null,
  scienceSpecialty: null,
};
const row = (programme, city, institution, url, verificationStatus = "verified", familyIds = ["languages_humanities"]) => ({
  institution, programme, degree: "Bachelor of Arts", city,
  teachingLanguage: "German", officialUrl: url, familyIds,
  verificationStatus, researchStatus: "research_candidate",
});

const fau = row("Germanistik", "Erlangen", "Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)", "https://www.fau.de/studiengang/germanistik-b-a");
const fauExtra = row("Italoromanistik", "Erlangen", "Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)", "https://www.fau.de/studiengang/italoromanistik-b-a");
const bamberg = row("English and American Studies", "Bamberg", "University of Bamberg", "https://www.uni-bamberg.de/en/ba-english-and-american-studies", "needs_review");
const bonn = row("English Studies", "Bonn", "University of Bonn", "https://www.iaak.uni-bonn.de/en/studying/bachelor/ba-english-studies");
const wrong = row("Architecture", "Erlangen", "Architecture University", "https://university.de/bachelor-architecture", "verified", ["architecture"]);

test("a preparing-Bac Letters candidate gets documented universities, with Erlangen first and institution diversity", () => {
  const result = chooseDocumentedResearchPistes([bonn, fauExtra, wrong, bamberg, fau], criteria);
  assert.equal(result.length, 3);
  assert.equal(result[0].programme, "Germanistik");
  assert.deepEqual(result.slice(0, 2).map((v) => v.city), ["Erlangen","Bamberg"]);
  assert.deepEqual(result.map((v) => v.institution).length, new Set(result.map((v) => v.institution)).size);
  assert.ok(result.every((v) => v.officialUrl.startsWith("https://")));
});

test("a single university can provide several distinct subject options when alternatives are unavailable", () => {
  const result = chooseDocumentedResearchPistes([fau, fauExtra], criteria);
  assert.equal(result.length, 2);
  assert.ok(result.some((v) => v.programme === "Germanistik"));
  assert.ok(result.some((v) => v.programme === "Italoromanistik"));
});

test("documented options never turn missing-Bac profiles into direct university admissions", () => {
  assert.equal(chooseDocumentedResearchPistes([fau, bamberg], {...criteria, bacStatus:"no_bac"}).length, 0);
  assert.equal(chooseDocumentedResearchPistes([fau], {...criteria, targetField:"Médecine/Santé"}).length, 0);
  assert.equal(chooseDocumentedResearchPistes([fau], {...criteria, targetDegree:"Master"}).length, 0);
});

test("untrusted or insufficient research rows never become candidate cards", () => {
  const badLinks = [
    {...fau, officialUrl: "javascript:alert(1)"},
    {...fau, officialUrl: "http://www.fau.de/studiengang/germanistik"},
    {...fau, officialUrl: "https://example.com/programme"},
    {...fau, researchStatus: "rejected"},
    {...fau, verificationStatus: "rejected"},
  ];
  assert.deepEqual(chooseDocumentedResearchPistes(badLinks, criteria), []);
});

test("specialties remain bounded by research family and Master specialization", () => {
  assert.deepEqual(researchFamiliesFor({...criteria, targetField:"Ingénierie",engineeringSpecialty:"aerospace"}),["aerospace_engineering"]);
  assert.deepEqual(researchFamiliesFor({...criteria, targetField:"Informatique"}),["computer_science","computer_engineering"]);
  assert.deepEqual(
    chooseDocumentedResearchPistes([fau], {...criteria,targetDegree:"Master",targetSpecialization:"Aerospace Engineering"}),
    [],
  );
});

test("new API uses canonical existing research data, not fabricated programmes or OpenAI", () => {
  const route = read("src/app/api/orientation/research-pistes/route.ts");
  const ui = read("src/components/orientation/OrientationResearchPistesCard.tsx");
  const parent = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
  assert.match(route, /\.from\("orientation_research_programs"\)/);
  assert.match(route, /\.overlaps\("family_ids", researchFamiliesFor\(criteria\)\)/);
  assert.match(route, /\.limit\(180\)/);
  assert.match(route, /enforceRequestRateLimit/);
  assert.match(route, /acquireRequestConcurrency/);
  assert.doesNotMatch(route, /\.insert\(|\.update\(|\.upsert\(|OPENAI_API_KEY/);
  assert.match(parent, /result\.shortlist\.items\.length === 0/);
  assert.match(parent, /<OrientationResearchPistesCard/);
  assert.match(ui, /useOrientationUniversityMedia/);
  assert.match(ui, /<OrientationRealPhoto/);
  assert.match(ui, /t\.disclaimer/);
  assert.ok(ui.includes("pas une vérification de votre admissibilité") || ui.includes("ni une vérification de votre admissibilité"));
  assert.match(ui, /status === "loading"/);
});
