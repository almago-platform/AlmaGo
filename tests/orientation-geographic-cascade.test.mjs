import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationDiscoveryPlanForScope,
} = await import("../src/lib/orientation-engine/discovery/contract.ts");

const routeSource = readFileSync(
  "src/app/api/orientation/engine/route.ts",
  "utf8",
);
const discoveryServiceSource = readFileSync(
  "src/lib/orientation-engine/discovery/service.ts",
  "utf8",
);
const discoveryScopeSource = readFileSync(
  "src/lib/orientation-engine/discovery/scope.ts",
  "utf8",
);

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


test("scoped discovery queries stay inside the current geographic tier", () => {
  const profile = {
    bacStatus: "obtained",
    bacYear: "2025",
    bacTrack: "Sciences techniques",
    generalAverage: "14",
    averageType: "official",
    lastDiploma: "Baccalauréat",
    higherEducationStatus: "not_started",
    currentStudyField: "",
    universitySemesters: "",
    studyIntent: "restart_bachelor",
    targetSpecialization: "",
    targetDegree: "Bachelor",
    targetField: "Ingénierie",
    engineeringSpecialty: "electrical_electronics",
    scienceSpecialty: "",
    germanLevel: "B2",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    targetIntakeSeason: "winter",
    targetIntakeYear: "2027",
    budgetRange: "800–1 000 € / mois",
    preferredCities: ["Aachen"],
    masterSubjectCredits: {},
  };

  const nearby = buildOrientationGeographicScopes(["Aachen"]).find(
    (scope) => scope.tier === "nearby",
  );
  assert.ok(nearby);

  const plan = buildOrientationDiscoveryPlanForScope(profile, nearby);
  assert.equal(plan.geographicScope?.tier, "nearby");
  assert.ok(plan.searchQueries.length > 0);
  assert.ok(
    plan.searchQueries.every((query) =>
      nearby.queryLocations.some((city) => query.includes(city))
    ),
  );
  assert.ok(plan.searchQueries.every((query) => !query.includes(" Germany ")));
});

test("route enforces catalogue before OpenAI at every geographic scope", () => {
  const loopIndex = routeSource.indexOf("for (const scope of scopes)");
  const catalogueIndex = routeSource.indexOf(
    "buildOrientationEngineResultForGeographicScope",
    loopIndex,
  );
  const catalogueMatchIndex = routeSource.indexOf(
    "hasStrongCatalogueMatch",
    catalogueIndex,
  );
  const openAIIndex = routeSource.indexOf(
    "runOrientationSelectionPipeline",
    catalogueMatchIndex,
  );

  assert.ok(loopIndex >= 0);
  assert.ok(catalogueIndex > loopIndex);
  assert.ok(catalogueMatchIndex > catalogueIndex);
  assert.ok(openAIIndex > catalogueMatchIndex);
});

test("scoped discovery filters both cache and OpenAI candidates before selection", () => {
  assert.match(discoveryServiceSource, /candidatesForGeographicScope/);
  assert.match(discoveryScopeSource, /orientationScopeContainsCity/);
  assert.match(
    discoveryServiceSource,
    /const cachedCandidates = candidatesForGeographicScope/,
  );
  assert.match(
    discoveryServiceSource,
    /const scopedResearchCandidates = candidatesForGeographicScope/,
  );
});

test("geographic route records resolved tier and source for transparent UX", () => {
  assert.match(routeSource, /resolvedTier: OrientationGeographicScope\["tier"\] \| null/);
  assert.match(routeSource, /source: "catalogue" \| "openai" \| null/);
  assert.match(routeSource, /geography\.resolvedTier = scope\.tier/);
  assert.match(routeSource, /geography\.source = "catalogue"/);
  assert.match(routeSource, /geography\.source = "openai"/);
});
