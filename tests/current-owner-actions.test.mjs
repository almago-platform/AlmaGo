import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const required = readFileSync("docs/USER_ACTION_REQUIRED.md", "utf8");
const minimal = readFileSync("docs/AYOUB_ACTIONS_MINIMALES.md", "utf8");

test("owner docs reflect the current P2.4 server-secret boundary", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /SUPABASE_SECRET_KEY/);
    assert.doesNotMatch(source, /ALMAGO_AUTH_E2E_ENABLED=true/);
  }
});

test("owner docs identify Render as the canonical runtime", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /almago-dev\.onrender\.com/);
    assert.match(source, /\/api\/health/);
  }
  assert.match(required, /runtime canonique/);
  assert.match(minimal, /Runtime canonique/);
});

test("owner docs record resolved infrastructure instead of stale blockers", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /#286/);
    assert.match(source, /#389/);
    assert.match(source, /#336/);
    assert.match(source, /résolu|résolue|fermé|fermée|fonctionne|restauré/i);
  }
  assert.doesNotMatch(required, /#286 empêche|#389.*reste open|main.*non protég/i);
  assert.doesNotMatch(minimal, /#286 empêche|#389.*reste open|main.*non protég/i);
});

test("optional external AI is not presented as a launch requirement", () => {
  assert.match(required, /n’est \*\*pas\*\* une action nécessaire au lancement AlmaGo/);
  assert.match(minimal, /Non requis maintenant/);
  assert.match(minimal, /Gemini\/Grok/);
});

test("owner docs use durable release workstreams instead of volatile PR numbers", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /A38/);
    assert.match(source, /A43/);
    assert.match(source, /A44/);
    assert.match(source, /A45/);
    assert.doesNotMatch(source, /PR #\d+/);
    assert.doesNotMatch(source, /Draft #\d+/);
  }
});

test("owner docs require one exact release-candidate SHA across A38 to A45", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /SHA exact/);
    assert.match(source, /A38 → A43 → A44 → A45/);
    assert.match(source, /main.*change|si .*main.*change/i);
    assert.match(source, /nouveau SHA|nouveau release candidate|rejou/i);
  }
});
