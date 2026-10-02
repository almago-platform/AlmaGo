import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const options = readFileSync("src/lib/student/profile-options.ts", "utf8");
const publicAnswers = readFileSync("src/lib/orientation/public.ts", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const publicApi = readFileSync("src/app/api/orientation/prospect/route.ts", "utf8");
const accountApi = readFileSync("src/app/api/prospect/orientation/route.ts", "utf8");
const savedReport = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");

test("SO-V3.2 exposes the engineering-specialty taxonomy", () => {
  for (const value of [
    "computer_engineering",
    "electrical_electronics",
    "mechanical",
    "mechatronics_robotics",
    "civil",
    "industrial_production",
    "automotive",
    "aerospace",
    "energy",
    "undecided",
    "other",
  ]) {
    assert.ok(options.includes(value), `missing engineering specialty ${value}`);
  }
});

test("SO-V3.2 persists, restores and validates engineering specialty", () => {
  assert.match(publicAnswers, /engineeringSpecialty: string/);
  assert.match(publicAnswers, /engineeringSpecialty: readString\(record, "engineeringSpecialty"\)/);
  assert.match(form, /answers\.targetField === "Ingénierie"/);
  assert.match(form, /value=\{answers\.engineeringSpecialty\}/);
  assert.match(form, /setField\("engineeringSpecialty"/);
  assert.match(publicApi, /engineeringSpecialtyOptions/);
  assert.match(publicApi, /answers\.targetField === "Ingénierie"[\s\S]*allowed\.engineeringSpecialty/);
  assert.match(accountApi, /engineeringSpecialtyOptions/);
});

test("SO-V3.2 shows the specialty in live and saved summaries", () => {
  assert.match(form, /engineeringSpecialtyCopy\.label/);
  assert.match(savedReport, /engineeringSpecialtyLabel/);
  assert.match(savedReport, /answers\.engineeringSpecialty/);
});
