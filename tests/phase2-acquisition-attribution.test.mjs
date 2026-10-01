import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  acquisitionContextFromSearchParams,
  acquisitionSourceKinds,
  buildAcquisitionOrientationHref,
  isPhase2AttributionEnabled,
  normalizeAcquisitionContext,
} from "../src/lib/phase2/acquisition.ts";

const env = readFileSync(".env.example", "utf8");

test("P2.10B supports only bounded acquisition source kinds", () => {
  assert.deepEqual(acquisitionSourceKinds, [
    "qr",
    "referral",
    "ambassador",
    "campaign",
  ]);

  assert.deepEqual(normalizeAcquisitionContext(" QR ", " School_Tunis_01 "), {
    kind: "qr",
    sourceId: "school_tunis_01",
  });
  assert.deepEqual(normalizeAcquisitionContext("referral", "student-amb-7"), {
    kind: "referral",
    sourceId: "student-amb-7",
  });
});

test("P2.10B rejects private, URL-like and unbounded attribution values", () => {
  for (const [kind, sourceId] of [
    ["other", "school_01"],
    ["qr", "person@example.com"],
    ["qr", "https://example.com/campaign"],
    ["qr", "../secret"],
    ["qr", "contains space"],
    ["qr", "a".repeat(33)],
    ["qr", ""],
    [null, "school_01"],
    ["qr", null],
  ]) {
    assert.equal(normalizeAcquisitionContext(kind, sourceId), null);
  }
});

test("P2.10B reads only src/ref from a link and does not retain arbitrary query data", () => {
  const params = new URLSearchParams({
    src: "campaign",
    ref: "autumn_26",
    email: "person@example.invalid",
    token: "private-value",
    utm_content: "free form text",
  });

  assert.deepEqual(acquisitionContextFromSearchParams(params), {
    kind: "campaign",
    sourceId: "autumn_26",
  });

  const serialized = JSON.stringify(acquisitionContextFromSearchParams(params));
  assert.doesNotMatch(serialized, /person@example|private-value|free form text/);
});

test("P2.10B attribution is explicitly disabled by default", () => {
  assert.match(env, /ALMAGO_PHASE2_ATTRIBUTION_ENABLED=false/);

  const previous = process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED;
  delete process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED;
  assert.equal(isPhase2AttributionEnabled(), false);

  process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED = "true";
  assert.equal(isPhase2AttributionEnabled(), true);

  if (previous === undefined) {
    delete process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED;
  } else {
    process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED = previous;
  }
});

test("P2.10C builds stable bounded orientation links for QR and referral sources", () => {
  assert.equal(
    buildAcquisitionOrientationHref(" QR ", " School_Tunis_01 "),
    "/orientation?src=qr&ref=school_tunis_01",
  );
  assert.equal(
    buildAcquisitionOrientationHref("referral", "student-amb-7"),
    "/orientation?src=referral&ref=student-amb-7",
  );

  const href = buildAcquisitionOrientationHref("campaign", "autumn_26");
  assert.ok(href);
  const url = new URL(href, "https://example.invalid");

  assert.deepEqual(acquisitionContextFromSearchParams(url.searchParams), {
    kind: "campaign",
    sourceId: "autumn_26",
  });
});

test("P2.10C never serializes invalid or private attribution values into links", () => {
  for (const [kind, sourceId] of [
    ["qr", "person@example.com"],
    ["qr", "https://example.com/private"],
    ["referral", "../secret"],
    ["campaign", "contains space"],
    ["other", "school_01"],
  ]) {
    assert.equal(buildAcquisitionOrientationHref(kind, sourceId), null);
  }
});
