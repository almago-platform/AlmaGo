import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { chooseDocumentedResearchPistes } from "../src/lib/orientation-engine/discovery/research-pistes.ts";
import { filterSupplementalResearchPistes } from "../src/lib/orientation-engine/result/supplemental.ts";
import { findCuratedUniversityMedia } from "../src/lib/orientation-engine/discovery/curated-university-media.ts";

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
const row = (institution, programme, city, status = "verified") => ({
  institution, programme, city, degree: "Bachelor of Arts",
  teachingLanguage: "German", familyIds: ["languages_humanities"],
  officialUrl: "https://www.uni-regensburg.de/en/studies/bachelor", verificationStatus: status,
  researchStatus: "research_candidate",
});
const bbg = { institution: "University of Bamberg", city: "Bamberg", programme: "German Studies" };
const fau = "Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)";
const joint = "Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU) and Universidad de Sevilla";

test("Erlangen Letters 2027: 1 selected Bamberg plus 2 DISTINCT universities even when joint-degree appears in the source", () => {
  const researched = chooseDocumentedResearchPistes([
    row(fau, "Germanistik", "Erlangen"),
    row(joint, "Germanistik – Iberoromanistik", "Erlangen", "unverified"),
    row("University of Regensburg", "English Linguistics", "Regensburg", "unverified"),
    row("University of Bonn", "English Studies", "Bonn", "needs_review"),
    row("University of Bamberg", "Romance Studies", "Bamberg"),
  ], criteria, 12, { nearbyCities: ["Bamberg"], regionCities: ["Regensburg"] });
  assert.ok(researched.length >= 4);
  const additional = filterSupplementalResearchPistes(researched, [bbg]);
  assert.equal(additional.length, 2);
  assert.deepEqual(additional.map((entry) => entry.city), ["Erlangen", "Regensburg"]);
  assert.equal(additional.filter((entry) => entry.institution.includes("Sevilla")).length, 0);
});

test("FAU consortium degree is the same host university, not a second independently recommended campus", () => {
  const candidates = [
    { institution:fau, programme:"Germanistik", city:"Erlangen", officialUrl:"https://www.fau.de/a", teachingLanguage:"German" },
    { institution:joint, programme:"Germanistik – Iberoromanistik", city:"Erlangen", officialUrl:"https://www.fau.de/b", teachingLanguage:"German" },
  ];
  assert.equal(filterSupplementalResearchPistes(candidates, []).length, 1);
});

test("editorially reviewed licensed photos are attributed and never silently used for a different institution", () => {
  const fauPhoto = findCuratedUniversityMedia(fau, "Erlangen");
  const bambergPhoto = findCuratedUniversityMedia("University of Bamberg", "Bamberg");
  const regensburgPhoto = findCuratedUniversityMedia("University of Regensburg", "Regensburg");
  assert.ok(fauPhoto?.coverImageSourceUrl.includes("Schloss_Erlangen_01.jpg"));
  assert.equal(fauPhoto?.coverImageLicense, "CC BY-SA 4.0");
  assert.equal(bambergPhoto?.coverImageLicense, "CC0");
  assert.ok(regensburgPhoto?.coverImageSourceUrl.includes("Uni-r_Campus_und_Bibliothek_2.jpg"));
  assert.notEqual(fauPhoto?.coverImageUrl, bambergPhoto?.coverImageUrl);
  assert.notEqual(regensburgPhoto?.coverImageUrl, bambergPhoto?.coverImageUrl);
  assert.equal(findCuratedUniversityMedia("OTH Regensburg", "Regensburg"), null);
  assert.equal(findCuratedUniversityMedia("University of Bamberg", "Berlin"), null);
});

test("media API keeps catalog read-only for strangers while preserving real curated photo attribution", () => {
  const api = readFileSync("src/app/api/orientation/university-media/route.ts", "utf8");
  assert.match(api, /findCuratedUniversityMedia/);
  assert.match(api, /cover_image_source_url: curated\.coverImageSourceUrl/);
  assert.match(api, /cover_image_license: curated\.coverImageLicense/);
  assert.match(api, /persistUniversityMediaFile/);
  assert.doesNotMatch(api, /\.insert\(|\.upsert\(/);
});

test("Commons licensing logic does not accidentally match the literal backslash+s", () => {
  const commons = readFileSync("src/lib/orientation-engine/discovery/university-media.ts", "utf8");
  assert.ok(commons.includes(String.raw`(?:\s|$)`));
  assert.ok(!commons.includes(String.raw`(?:\\s|$)`));
});

test("research API and component pass through enough candidates to fill distinct-campus gaps", () => {
  const api = readFileSync("src/app/api/orientation/research-pistes/route.ts", "utf8");
  const ui = readFileSync("src/components/orientation/OrientationResearchPistesCard.tsx", "utf8");
  assert.match(api, /}, 12, \{/);
  assert.match(ui, /data\.items\.slice\(0, 12\)/);
  assert.match(ui, /researchTeachingLanguage\(item\.teachingLanguage, locale\)/);
  assert.match(ui, /filterSupplementalResearchPistes/);
  const writer = readFileSync("src/components/orientation/OrientationPersonalizedWriterCard.tsx", "utf8");
  assert.match(writer, /facts\.length \? t\.confirmed : t\.checking/);
});
