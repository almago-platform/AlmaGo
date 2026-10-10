import assert from "node:assert/strict";
import test from "node:test";

const {
  buildOrientationCanonicalShortlist,
} = await import("../src/lib/orientation-engine/result/canonical.ts");

function engine(recommendations = [], bacStatus = "obtained") {
  return {
    profile: { bacStatus },
    recommendations,
  };
}

function deterministicRecommendation({
  institution = "Fallback University",
  programme = "Fallback Programme",
  city = "Berlin",
} = {}) {
  return {
    status: "eligible",
    rules: [
      { code: "degree_match", status: "eligible" },
      { code: "field_match", status: "eligible" },
      { code: "source_verified", status: "eligible" },
    ],
    sources: [
      { kind: "university", url: "https://university.example/programme", verifiedAt: "2026-09-01" },
    ],
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

test("canonical shortlist never exposes university programmes for a no-Bac route", () => {
  const result = buildOrientationCanonicalShortlist(
    engine([
      deterministicRecommendation({
        institution: "Should Not Surface University",
        programme: "Informatik",
      }),
    ], "no_bac"),
    personalized([]),
  );

  assert.deepEqual(result, {
    source: "none",
    items: [],
  });
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

test("canonical shortlist excludes unrelated programmes even when they rank in the catalogue", () => {
  const unrelated = deterministicRecommendation({
    institution: "Example University",
    programme: "Electrical Engineering",
    city: "Erlangen",
  });
  unrelated.rules = [
    { code: "degree_match", status: "eligible" },
    { code: "field_match", status: "not_eligible" },
    { code: "source_verified", status: "eligible" },
  ];
  const shortlist = buildOrientationCanonicalShortlist(
    engine([unrelated]),
    null,
  );
  assert.deepEqual(shortlist, { source: "none", items: [] });
});

test("canonical shortlist does not present undated sources or unverified recommendations as confirmed", () => {
  const undated = deterministicRecommendation();
  undated.rules = undated.rules.filter((rule) => rule.code !== "source_verified");
  assert.deepEqual(
    buildOrientationCanonicalShortlist(engine([undated]), null),
    { source: "none", items: [] },
  );
  const unlinked = deterministicRecommendation();
  unlinked.sources = [{ kind: "university", url: "http://university.example/programme", verifiedAt: "2026-09-01" }];
  assert.deepEqual(
    buildOrientationCanonicalShortlist(engine([unlinked]), null),
    { source: "none", items: [] },
  );
});
