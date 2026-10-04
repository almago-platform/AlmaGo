import assert from "node:assert/strict";
import test from "node:test";

const {
  buildOrientationGeographicScopes,
  canonicalOrientationCity,
  orientationCityDistanceKm,
  orientationScopeContainsCity,
} = await import("../src/lib/orientation-engine/geography.ts");

test("geography normalizes localized German city names", () => {
  assert.equal(canonicalOrientationCity("Cologne"), "Cologne");
  assert.equal(canonicalOrientationCity("Köln"), "Cologne");
  assert.equal(canonicalOrientationCity("Munich"), "Munich");
  assert.equal(canonicalOrientationCity("München"), "Munich");
  assert.equal(canonicalOrientationCity("Saarbrücken"), "Sarrebruck");
});

test("Aachen cascade is chosen city then nearby then NRW then Germany", () => {
  const scopes = buildOrientationGeographicScopes(["Aachen"]);

  assert.equal(scopes[0].tier, "chosen_city");
  assert.deepEqual(scopes[0].cities, ["Aachen"]);

  const nearby = scopes.find((scope) => scope.tier === "nearby");
  assert.ok(nearby);
  assert.ok(nearby.cities.includes("Cologne"));
  assert.ok(nearby.cities.includes("Bonn"));
  assert.ok(nearby.cities.includes("Düsseldorf"));

  const land = scopes.find((scope) => scope.tier === "land");
  assert.ok(land);
  assert.ok(land.landNames.includes("Nordrhein-Westfalen"));
  assert.ok(orientationScopeContainsCity(land, "Dortmund"));

  assert.equal(scopes.at(-1).tier, "germany");
});

test("Munich cascade stays in Bavaria before Germany", () => {
  const scopes = buildOrientationGeographicScopes(["Munich"]);
  const nearby = scopes.find((scope) => scope.tier === "nearby");
  const land = scopes.find((scope) => scope.tier === "land");

  assert.ok(nearby);
  assert.ok(
    nearby.cities.includes("Augsburg")
      || nearby.cities.includes("Ingolstadt"),
  );
  assert.ok(land);
  assert.ok(land.landNames.includes("Bayern"));
  assert.equal(scopes.at(-1).tier, "germany");
});

test("multiple selected cities share the highest-priority tier before widening", () => {
  const scopes = buildOrientationGeographicScopes(["Aachen", "Bonn"]);

  assert.deepEqual(scopes[0], {
    tier: "chosen_city",
    cities: ["Aachen", "Bonn"],
    landNames: ["Nordrhein-Westfalen"],
    queryLocations: ["Aachen", "Bonn"],
  });
});

test("distance is deterministic and keeps Aachen-Cologne inside 100 km", () => {
  const distance = orientationCityDistanceKm("Aachen", "Cologne");
  assert.ok(distance !== null);
  assert.ok(distance > 50);
  assert.ok(distance < 100);
});
