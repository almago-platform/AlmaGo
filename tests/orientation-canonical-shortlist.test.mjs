import assert from "node:assert/strict";
import test from "node:test";

const {
  buildOrientationCanonicalShortlist,
} = await import("../src/lib/orientation-engine/result/canonical.ts");

function engine(recommendations = []) {
  return { recommendations };
}

function deterministicRecommendation({
  institution = "Fallback University",
  programme = "Fallback Programme",
  city = "Berlin",
} = {}) {
  return {
    programme: {
      name: programme,
      university: {
        name: institution,
        city,
      },
    },
  };
}

function personalized(selected = []) {
  return {
    selected,
  };
}

test("canonical shortlist always prefers the verified personalized selection", () => {
  const result = buildOrientationCanonicalShortlist(
    engine([
      deterministicRecommendation({
        institution: "Old Catalogue University",
        programme: "Old Catalogue Programme",
      }),
    ]),
    personalized([
      {
        position: 1,
        institution: "Verified University",
        programme: "Verified Programme",
        city: "Hamburg",
      },
      {
        position: 2,
        institution: "Second University",
        programme: "Second Programme",
        city: "Bonn",
      },
    ]),
  );

  assert.equal(result.source, "personalized_verified");
  assert.deepEqual(result.items, [
    {
      position: 1,
      institution: "Verified University",
      programme: "Verified Programme",
      city: "Hamburg",
    },
    {
      position: 2,
      institution: "Second University",
      programme: "Second Programme",
      city: "Bonn",
    },
  ]);
  assert.equal(
    result.items.some((item) => item.programme === "Old Catalogue Programme"),
    false,
  );
});

test("canonical shortlist falls back to deterministic catalogue only when personalized selection is empty", () => {
  const result = buildOrientationCanonicalShortlist(
    engine([
      deterministicRecommendation(),
      deterministicRecommendation({
        institution: "Fallback University 2",
        programme: "Fallback Programme 2",
        city: "Aachen",
      }),
    ]),
    personalized([]),
  );

  assert.equal(result.source, "deterministic_fallback");
  assert.deepEqual(result.items, [
    {
      position: 1,
      institution: "Fallback University",
      programme: "Fallback Programme",
      city: "Berlin",
    },
    {
      position: 2,
      institution: "Fallback University 2",
      programme: "Fallback Programme 2",
      city: "Aachen",
    },
  ]);
});

test("canonical shortlist is empty only when neither pipeline has a candidate", () => {
  assert.deepEqual(
    buildOrientationCanonicalShortlist(engine([]), null),
    {
      source: "none",
      items: [],
    },
  );
});
