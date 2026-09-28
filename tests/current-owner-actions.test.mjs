import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const required = readFileSync("docs/USER_ACTION_REQUIRED.md", "utf8");
const minimal = readFileSync("docs/AYOUB_ACTIONS_MINIMALES.md", "utf8");

test("owner docs require only the two A43 password secrets", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /ALMAGO_E2E_STUDENT_PASSWORD/);
    assert.match(source, /ALMAGO_E2E_ADMIN_PASSWORD/);
    assert.doesNotMatch(source, /ALMAGO_AUTH_E2E_ENABLED=true/);
  }
});

test("owner docs identify Render as the canonical runtime", () => {
  assert.match(required, /almago-dev\.onrender\.com/);
  assert.match(required, /\/api\/health/);
  assert.match(minimal, /runtime est Render, pas Vercel/);
  assert.match(minimal, /almago-dev\.onrender\.com/);
});

test("owner docs preserve current human gates and infrastructure blockers", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /A38/);
    assert.match(source, /A43/);
    assert.match(source, /A44/);
    assert.match(source, /A45/);
    assert.match(source, /#286/);
    assert.match(source, /#389/);
    assert.match(source, /#336/);
  }
});

test("optional external AI is not presented as a launch requirement", () => {
  assert.match(required, /n’est \*\*pas\*\* une action nécessaire au lancement AlmaGo/);
  assert.match(minimal, /Ce qui n’est pas requis maintenant/);
  assert.match(minimal, /activer Gemini\/Grok/);
});


test("owner docs use durable workstream references and completed catalogue cleanup", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /#66/);
    assert.match(source, /#84/);
    assert.match(source, /#448/);
    assert.match(source, /#433/);
    assert.match(source, /#406/);
    assert.match(source, /#439/);
    assert.match(source, /#176/);
    assert.match(source, /0 fixture active/);
    assert.doesNotMatch(source, /PR #\d+/);
    assert.doesNotMatch(source, /Draft #405/);
    assert.doesNotMatch(source, /Draft #407/);
    assert.doesNotMatch(source, /#430/);
    assert.doesNotMatch(source, /1 recommandation test à archiver/);
  }
});


test("owner docs require one exact release-candidate SHA across A38 to A45", () => {
  for (const source of [required, minimal]) {
    assert.match(source, /SHA exact/);
    assert.match(source, /A38 → A43 → A44 → A45/);
    assert.match(source, /si `main` change/i);
    assert.match(source, /nouveau SHA/);
  }
});
