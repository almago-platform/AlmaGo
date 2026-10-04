import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mailer = readFileSync("src/lib/email/transactional.ts", "utf8");
const route = readFileSync("src/app/api/orientation/prospect/route.ts", "utf8");

test("transactional email failures retain provider diagnostics without exposing recipient addresses", () => {
  assert.match(mailer, /status: "failed";\s+provider: "resend" \| "smtp"/);
  assert.match(mailer, /httpStatus\?: number/);
  assert.match(mailer, /errorCode\?: string/);
  assert.match(mailer, /safeProviderErrorDetail/);
  assert.match(mailer, /\[redacted-email\]/);
  assert.match(mailer, /httpStatus: response\.status/);
  assert.match(mailer, /errorCode: safeProviderErrorDetail\(payload\?\.name\)/);
  assert.match(mailer, /detail: safeProviderErrorDetail\(payload\?\.message\)/);
});

test("orientation save logs a safe provider failure and keeps the provider in delivery metadata", () => {
  assert.match(route, /orientation_email_delivery_failed/);
  assert.match(route, /httpStatus: delivery\.httpStatus \?\? null/);
  assert.match(route, /errorCode: delivery\.errorCode \?\? null/);
  assert.match(route, /detail: delivery\.detail \?\? null/);
  assert.match(route, /else if \(delivery\.status === "failed"\)/);
  assert.match(route, /deliveryMetadata\.delivery_provider = delivery\.provider/);
});

test("account continuation remains independent from email delivery", () => {
  assert.match(route, /const signupPath = isPhase2AccountLinkingEnabled\(\)/);
  assert.match(route, /\/signup\?orientation_token=/);
  assert.match(route, /signupUrl\.searchParams\.set\("orientation_token", resume\.token\)/);
});
