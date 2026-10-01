import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const page = read("src/app/orientation/page.tsx");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const publicRoute = read("src/app/api/orientation/prospect/route.ts");
const updateRoute = read("src/app/api/prospect/orientation/route.ts");
const admin = read("src/app/admin/prospects/page.tsx");
const acquisition = read("src/lib/phase2/acquisition.ts");

test("P2.10 attribution enters only through bounded src/ref parsing", () => {
  assert.match(page, /isPhase2AttributionEnabled\(\)/);
  assert.match(page, /normalizeAcquisitionContext\(sourceKind, sourceId\)/);
  assert.match(page, /acquisitionContext=\{acquisitionContext\}/);
  assert.match(form, /acquisitionContext\?: AcquisitionContext \| null/);
  assert.match(capture, /\.\.\.\(acquisitionContext \? \{ acquisition: acquisitionContext \} : \{\}\)/);
  assert.doesNotMatch(acquisition, /email|token|utm_content|cookie|localStorage|sessionStorage/i);
});

test("P2.10 server revalidates and stores only normalized acquisition", () => {
  assert.match(publicRoute, /isPhase2AttributionEnabled\(\)/);
  assert.match(publicRoute, /normalizeAcquisitionContext\(acquisitionRecord\.kind, acquisitionRecord\.sourceId\)/);
  assert.match(publicRoute, /\.\.\.\(acquisition \? \{ acquisition \} : \{\}\)/);
  assert.doesNotMatch(publicRoute, /record\.utm_|record\.email.*acquisition|record\.token.*acquisition/i);
});

test("P2.10 attribution survives prospect account updates without a new tracking identifier", () => {
  assert.match(updateRoute, /\.select\("id,input"\)/);
  assert.match(updateRoute, /acquisitionContextFromStoredInput\(latestOrientation\?\.input\)/);
  assert.match(updateRoute, /\.\.\.\(acquisition \? \{ acquisition \} : \{\}\)/);
  assert.doesNotMatch(updateRoute, /cookie|localStorage|fingerprint|deviceId|advertisingId/i);
});

test("P2.10 admin sees only the normalized bounded source context", () => {
  assert.match(admin, /\.select\("id,prospect_id,input,created_at"\)/);
  assert.match(admin, /acquisitionContextFromStoredInput\(orientation\.input\)/);
  assert.match(admin, /Acquisition :/);
  assert.match(admin, /acquisition\.kind/);
  assert.match(admin, /acquisition\.sourceId/);
});

test("P2.10 stored attribution parser refuses arbitrary orientation input", () => {
  assert.match(acquisition, /acquisitionContextFromStoredInput/);
  assert.match(acquisition, /normalizeAcquisitionContext\(record\.kind, record\.sourceId\)/);
});
