import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const report = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");
const metadataBlock = report.match(/export const metadata: Metadata = \{[\s\S]*?\n\};/)?.[0] || "";

test("private orientation report pages are never indexable", () => {
  assert.match(report, /import type \{ Metadata \} from "next"/);
  assert.match(report, /export const metadata: Metadata = \{/);
  assert.match(report, /robots:\s*\{[\s\S]*index: false,[\s\S]*follow: false/);
});

test("private report indexing guard does not expose or alter the resume token", () => {
  assert.match(report, /hashOrientationResumeToken\(token\)/);
  assert.match(report, /resume_token_hash/);
  assert.ok(metadataBlock, "expected static metadata block");
  assert.doesNotMatch(metadataBlock, /token/i);
});
