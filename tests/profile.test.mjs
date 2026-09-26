import assert from "node:assert/strict";
import test from "node:test";
import { fullNameUpdate } from "../src/lib/student/full-name.ts";

const current = { first_name: "Ancien", last_name: "Nom" };

test("a first-name-only update preserves the current last name", () => {
  assert.deepEqual(fullNameUpdate({ first_name: "Ayoub" }, current), { full_name: "Ayoub Nom" });
});

test("a last-name-only update preserves the current first name", () => {
  assert.deepEqual(fullNameUpdate({ last_name: "Tayari" }, current), { full_name: "Ancien Tayari" });
});

test("an update containing both names derives full_name from both new values", () => {
  assert.deepEqual(fullNameUpdate({ first_name: "Ayoub", last_name: "Tayari" }, current), { full_name: "Ayoub Tayari" });
});

test("an unrelated profile update does not alter full_name", () => {
  assert.deepEqual(fullNameUpdate({ current_city: "Tunis" }, current), {});
});
