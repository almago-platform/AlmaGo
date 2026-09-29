import assert from "node:assert/strict";
import test from "node:test";
import { chooseReviewer, parseReview } from "./autonomous-review.mjs";

test("independent reviewer uses the opposite configured provider", () => {
  assert.equal(chooseReviewer({provider:"Gemini",attempts:1},{GROQ_API_KEY:"x"}), "Groq");
  assert.equal(chooseReviewer({provider:"Groq",attempts:1},{GEMINI_API_KEY:"g"}), "Gemini");
});

test("review is skipped after a builder fallback to keep the two-call budget", () => {
  assert.equal(chooseReviewer({provider:"Groq",attempts:2},{GEMINI_API_KEY:"g",GROQ_API_KEY:"x"}), null);
});

test("review is skipped when no independent provider exists", () => {
  assert.equal(chooseReviewer({provider:"Gemini",attempts:1},{GEMINI_API_KEY:"g"}), null);
});

test("review verdict format is strict", () => {
  assert.equal(parseReview("APPROVED\nLooks bounded.").approved, true);
  assert.equal(parseReview("REVISE\n- Fix overflow.").approved, false);
  assert.equal(parseReview("maybe").approved, false);
});
