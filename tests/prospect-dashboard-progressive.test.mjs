import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/prospect/page.tsx", "utf8");

test("prospect dashboard streams optional academic recommendations after its core content", () => {
  assert.match(page, /import \{ Suspense \} from "react"/);
  assert.match(page, /const cataloguePromise = loadVerifiedProgrammeCatalogue\(\)/);
  assert.match(page, /const state = await loadProspectHubState\(/);
  assert.doesNotMatch(page, /const \[state, catalogue\] = await Promise\.all/);
  assert.match(page, /<Suspense fallback=\{null\}>/);
  assert.match(page, /<ProspectDashboardRecommendations/);
  assert.match(page, /cataloguePromise=\{cataloguePromise\}/);
  assert.match(page, /await cataloguePromise\.catch\(/);
  assert.match(page, /ProspectProgrammeRecommendationCard/);
});

test("prospect dashboard verifies identity and role before loading academic data", () => {
  const catalogueStart = page.indexOf("const cataloguePromise = loadVerifiedProgrammeCatalogue()");
  assert.ok(catalogueStart > page.indexOf('if (!access.user) redirect("/login")'));
  assert.ok(catalogueStart > page.indexOf('if (!access.isStudent) redirect("/unauthorized")'));
  assert.ok(catalogueStart > page.indexOf("if (!access.phase2Enabled || access.canUseClientFeatures)"));
});

test("deferred recommendations do not expose personalised results between accounts", () => {
  assert.match(page, /answers=\{state\.answers\}/);
  assert.match(page, /prospectCatalogueRecommendations\(answers, catalogue\)/);
  assert.doesNotMatch(page, /unstable_cache|cache: "force-cache"/);
});
