import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { filterSupplementalResearchPistes } from "../src/lib/orientation-engine/result/supplemental.ts";

const card = (institution, programme, city) => ({
  institution, programme, city,
  teachingLanguage: "German",
  officialUrl: "https://www.example-university.de/course",
});

const selectedBamberg = [{
  institution: "Otto-Friedrich-Universität Bamberg",
  programme: "German Language, Literatures and Cultures",
  city: "Bamberg",
}];

test("one verified Bamberg programme is complemented with two distinct documented institutions", () => {
  const result = filterSupplementalResearchPistes([
    card("Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)", "Germanistik", "Erlangen"),
    card("University of Bamberg", "English and American Studies", "Bamberg"),
    card("University of Regensburg", "English Linguistics", "Regensburg"),
    card("University of Bonn", "English Studies", "Bonn"),
  ], selectedBamberg);
  assert.deepEqual(result.map((item) => item.city), ["Erlangen", "Regensburg"]);
  assert.equal(selectedBamberg.length + result.length, 3);
});

test("two selected universities receive at most one additional university", () => {
  const result = filterSupplementalResearchPistes([
    card("University of Bamberg", "English and American Studies", "Bamberg"),
    card("University of Bonn", "English Studies", "Bonn"),
    card("University of Regensburg", "English Linguistics", "Regensburg"),
  ], [...selectedBamberg, {institution:"FAU Erlangen-Nürnberg",programme:"Germanistik",city:"Erlangen"}]);
  assert.equal(result.length, 1);
  assert.equal(result[0].city, "Bonn");
});

test("three selected universities need no extra cards and zero selected can get three", () => {
  const candidates = [
    card("FAU", "Germanistik", "Erlangen"),
    card("University of Bonn", "English Studies", "Bonn"),
    card("University of Regensburg", "English Linguistics", "Regensburg"),
  ];
  assert.deepEqual(filterSupplementalResearchPistes(candidates, [...selectedBamberg, ...candidates.slice(0,2)]), []);
  assert.equal(filterSupplementalResearchPistes(candidates, []).length, 3);
});

test("a researched programme identical to a verified one is never shown twice", () => {
  const selected = [{ institution: "University of Bonn", programme: "English Studies", city: "Bonn" }];
  const result = filterSupplementalResearchPistes([
    card("University of Bonn", "English Studies", "Bonn"),
    card("University of Heidelberg", "English Studies", "Heidelberg"),
  ], selected);
  assert.deepEqual(result.map((item) => item.city), ["Heidelberg"]);
});

test("supplemental cards preserve labels and never replace verified choices", () => {
  const parent = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
  const cardUi = readFileSync("src/components/orientation/OrientationResearchPistesCard.tsx", "utf8");
  const writer = readFileSync("src/components/orientation/OrientationPersonalizedWriterCard.tsx", "utf8");
  assert.match(parent, /result\.shortlist\.items\.length < 3/);
  assert.match(parent, /existingShortlist=\{result\.shortlist\.items\}/);
  assert.match(cardUi, /existingShortlist\.length \+ 1/);
  assert.match(cardUi, /filterSupplementalResearchPistes\(items, existingShortlist\)/);
  assert.match(cardUi, /t\.disclaimer/);
  assert.match(writer, /primarySelectionCount\(result\.selected\.length, locale\)/);
});
