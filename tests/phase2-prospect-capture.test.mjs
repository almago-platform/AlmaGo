import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const privileged = read("src/lib/supabase/privileged.ts");
const route = read("src/app/api/orientation/prospect/route.ts");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const config = read("src/lib/phase2/config.ts");
const env = read(".env.example");
const css = read("src/app/globals.css");

test("privileged Supabase access is isolated to a server-only client", () => {
  assert.match(privileged, /import "server-only"/);
  assert.match(privileged, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(privileged, /NEXT_PUBLIC_SUPABASE_SECRET|SERVICE_ROLE/i);
  assert.match(privileged, /persistSession:\s*false/);
  assert.doesNotMatch(capture, /SUPABASE_SECRET|service_role/i);
});

test("prospect capture remains independently feature-gated", () => {
  assert.match(config, /isPhase2ProspectCaptureEnabled/);
  assert.match(config, /ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED/);
  assert.match(env, /ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED=false/);
  assert.match(env, /SUPABASE_SECRET_KEY=sb_secret_/);
});

test("public prospect API validates and recomputes the diagnostic server-side", () => {
  assert.match(route, /MAX_BODY_BYTES = 24_000/);
  assert.match(route, /validEmail/);
  assert.match(route, /validatePublicOrientationAnswers/);
  assert.match(route, /privacyAcknowledged === true/);
  assert.match(route, /buildPublicOrientationDiagnostic\(answers\)/);
  assert.match(route, /ENGINE_VERSION = "public-orientation-v1"/);
  assert.match(route, /createPrivilegedSupabaseClient/);
  assert.match(route, /from\("prospects"\)/);
  assert.match(route, /from\("orientations"\)/);
  assert.doesNotMatch(route, /console\.(?:log|error)|email.*console/i);
});

test("prospect capture creates no Auth user and keeps direct anon table access closed", () => {
  assert.doesNotMatch(route, /auth\.admin|createUser|signUp/);
  assert.doesNotMatch(route, /grant|policy|service_role/i);
});

test("orientation report can be saved through the browser print-to-PDF path", () => {
  assert.match(form, /window\.print\(\)/);
  assert.match(form, /orientation-print-report/);
  assert.match(css, /@media print/);
  assert.match(css, /orientation-print-hide/);
});

test("email capture is optional and shown only when the server flag enables it", () => {
  assert.match(form, /prospectCaptureEnabled\s*\?\s*\([\s\S]*<ProspectCaptureCard/);
  assert.match(capture, /type="email"/);
  assert.match(capture, /privacyAcknowledged/);
  assert.match(capture, /\/legal\/privacy/);
  assert.match(capture, /fetch\("\/api\/orientation\/prospect"/);
});

test("prospect email capture is mobile-friendly and accessibly validates without enabling the feature", () => {
  assert.match(capture, /noValidate aria-busy=\{status === "saving"\}/);
  assert.match(capture, /name="email"/);
  assert.match(capture, /inputMode="email"/);
  assert.match(capture, /autoCapitalize="none"/);
  assert.match(capture, /spellCheck=\{false\}/);
  assert.match(capture, /required/);
  assert.match(capture, /aria-invalid=\{status === "error" && message === copy\.invalidEmail\}/);
  assert.match(capture, /aria-describedby=\{message \? "orientation-capture-message" : undefined\}/);
  assert.match(capture, /id="orientation-capture-message"/);
  assert.match(capture, /name="privacyAcknowledged"/);
  assert.match(capture, /rel="noopener noreferrer"/);
});
