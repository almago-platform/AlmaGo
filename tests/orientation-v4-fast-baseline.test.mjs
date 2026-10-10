import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const preview = read("src/app/api/orientation/engine/preview/route.ts");
const full = read("src/app/api/orientation/engine/route.ts");
const form = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const intel = read("src/lib/orientation-engine/intelligence.ts");
const abuse = read("src/lib/security/abuse.ts");

test("fast preview validates inputs, rate limits independently and does not call external services", () => {
  assert.match(preview, /validatePublicOrientationAnswers\(record\.answers\)/);
  assert.match(preview, /PUBLIC_ABUSE_POLICIES\.orientationPreview/);
  assert.match(preview, /buildOrientationEngineResult\(profile, \[\]\)/);
  assert.match(preview, /deterministicLetter\(locale, profile, engine\)/);
  assert.match(preview, /buildOrientationCanonicalShortlist\(engine, null\)/);
  assert.match(preview, /"Cache-Control": "private, no-store"/);
  assert.match(abuse, /orientationPreview: \{/);
  assert.doesNotMatch(preview, /fetch\(|runOpenAI|Gemini|\.rpc\(|loadVerifiedProgrammeCatalogue|createPrivilegedSupabaseClient/);
  assert.match(preview, /personalized: null/);
  assert.match(intel, /export function deterministicLetter/);
});

test("progressive UI preserves a factual letter on provider failures and can retry", () => {
  assert.match(form, /requestEngine\("\/api\/orientation\/engine\/preview"/);
  assert.match(form, /requestEngine\("\/api\/orientation\/engine"/);
  assert.match(form, /\.then\(\(payload\) => publish\(payload, false\)\)/);
  assert.match(form, /\.then\(\(payload\) => publish\(payload, true\)\)/);
  assert.match(form, /fullController\.abort\(\), 45_000/);
  assert.match(form, /degraded: fullFailed && Boolean\(current\.result\)/);
  assert.match(form, /if \(!alive \|\| fullReady\) return/);
  assert.match(form, /if \(!alive \|\| \(!isFull && fullReady\)\) return/);
  assert.match(form, /setRetryVersion\(\(value\) => value \+ 1\)/);
  assert.match(form, /requestState\.enhancing/);
  assert.match(form, /requestState\.degraded/);
  assert.match(form, /onResultReady\?\.\(true\)/);
  assert.match(form, /previewController\.abort\(\)/);
  assert.match(form, /fullController\.abort\(\)/);
});

test("four languages distinguish basic orientation from optional research", () => {
  for (const lang of ["fr", "ar", "en", "de"]) {
    assert.ok(form.includes(lang + ": {"));
  }
  for (const key of ["enriching:", "degraded:", "retry:"]) {
    assert.equal((form.match(new RegExp(key, "g")) || []).length, 4, key);
  }
});

test("geographic catalogue checks run before a single external discovery tier", () => {
  assert.match(full, /for \(const scope of scopes\)/);
  assert.match(full, /buildOrientationEngineResultForGeographicScope/);
  assert.match(full, /hasStrongCatalogueMatch\(scopedEngineResult\)/);
  assert.match(full, /if \(scope\.tier !== "germany"\) continue;/);
  assert.match(full, /runOrientationSelectionPipeline\(profile, scope\)/);
  assert.match(full, /enableScout: false/);
  assert.match(intel, /options\.enableScout === false/);
  assert.match(full, /orientation_v4_engine/);
  assert.doesNotMatch(full, /JSON\.stringify\(profile\)|JSON\.stringify\(request\)/);
});

test("factual fallback never invents verified programmes or admission decisions", () => {
  assert.match(intel, /Votre accès académique dispose déjà d’une base officielle vérifiée/);
  assert.match(intel, /L’accès universitaire avec votre diplôme n’est pas encore confirmé/);
  assert.match(intel, /La décision finale reste toujours celle de l’université/);
  assert.match(preview, /buildOrientationEngineResult\(profile, \[\]\)/);
  assert.match(preview, /buildOrientationCanonicalShortlist\(engine, null\)/);
  assert.doesNotMatch(preview, /recommendations:\s*\[[^\]]*programme/i);
});
