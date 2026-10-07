import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isFreeValidationPilotEnabled,
  isPhase2AccessEnabled,
  isPhase2AccountLinkingEnabled,
  isPhase2EmailDeliveryEnabled,
  isPhase2PaymentOrchestrationEnabled,
  isPhase2ProspectCaptureEnabled,
} from "../src/lib/phase2/config.ts";
import { isPhase2AttributionEnabled } from "../src/lib/phase2/acquisition.ts";
import { isPublicIndexingEnabled } from "../src/lib/public-indexing.ts";
import {
  getRuntimeExposureMode,
  isPartnerPrelaunchModeEnabled,
} from "../src/lib/prelaunch.ts";

const envExample = readFileSync(".env.example", "utf8");
const telemetry = readFileSync("src/lib/phase2/funnel-telemetry.ts", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const banner = readFileSync(
  "src/components/prelaunch/PartnerPrelaunchBanner.tsx",
  "utf8",
);
const authForm = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const signupPage = readFileSync("src/app/signup/page.tsx", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
const health = readFileSync("src/app/api/health/route.ts", "utf8");

const partnerEnv = {
  NODE_ENV: "development",
  ALMAGO_PARTNER_PRELAUNCH_MODE: "true",
  ALMAGO_PUBLIC_INDEXING_ENABLED: "true",
  ALMAGO_PHASE2_ENABLED: "true",
  ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
  ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED: "true",
  ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "true",
  ALMAGO_PHASE2_PAYMENT_ORCHESTRATION_ENABLED: "true",
  ALMAGO_PHASE2_ATTRIBUTION_ENABLED: "true",
  ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED: "true",
  ALMAGO_FREE_VALIDATION_PILOT_ENABLED: "true",
};

test("partner prelaunch mode is opt-in and reports an explicit runtime mode", () => {
  assert.match(envExample, /ALMAGO_PARTNER_PRELAUNCH_MODE=false/);
  assert.equal(isPartnerPrelaunchModeEnabled({}), false);
  assert.equal(
    isPartnerPrelaunchModeEnabled({ ALMAGO_PARTNER_PRELAUNCH_MODE: "true" }),
    true,
  );
  assert.equal(getRuntimeExposureMode({}), "standard");
  assert.equal(getRuntimeExposureMode(partnerEnv), "partner_prelaunch");
});

test("partner mode keeps Phase 2 UI available but fails closed on persistence and payments", () => {
  assert.equal(isPhase2AccessEnabled(partnerEnv), true);
  assert.equal(isPhase2ProspectCaptureEnabled(partnerEnv), false);
  assert.equal(isPhase2AccountLinkingEnabled(partnerEnv), false);
  assert.equal(isPhase2EmailDeliveryEnabled(partnerEnv), false);
  assert.equal(isPhase2PaymentOrchestrationEnabled(partnerEnv), false);
  assert.equal(isFreeValidationPilotEnabled(partnerEnv), false);
});

test("partner mode forces public indexing and attribution off", () => {
  assert.equal(isPublicIndexingEnabled(partnerEnv), false);
  assert.equal(isPhase2AttributionEnabled(partnerEnv), false);
  assert.match(
    telemetry,
    /isPartnerPrelaunchEnabled\(env\)[\s\S]*return false/,
  );
});

test("partner mode is visible and auth creation/recovery actions are neutralized", () => {
  assert.match(layout, /PartnerPrelaunchBanner enabled=\{partnerPrelaunch\}/);
  assert.match(banner, /data-partner-prelaunch="true"/);
  assert.match(banner, /Pré-lancement partenaire/);
  assert.match(banner, /نسخة تجريبية للشركاء/);

  assert.match(authForm, /restrictedAction = partnerPrelaunch && mode !== "login"/);
  assert.match(authForm, /if \(restrictedAction\)[\s\S]*return;/);
  assert.match(authForm, /disabled=\{loading \|\| !hydrated \|\| restrictedAction\}/);
  assert.match(signupPage, /partnerPrelaunch=\{partnerPrelaunch\}/);
  assert.match(loginPage, /partnerPrelaunch=\{partnerPrelaunch\}/);
});

test("health endpoint exposes only the non-secret exposure mode", () => {
  assert.match(health, /exposureMode: getRuntimeExposureMode\(\)/);
  assert.doesNotMatch(health, /SUPABASE_SECRET_KEY|RESEND_API_KEY|PASSWORD/);
});

test("normal mode retains explicit opt-in behavior outside the safety lock", () => {
  const normalEnv = {
    NODE_ENV: "development",
    ALMAGO_PARTNER_PRELAUNCH_MODE: "false",
    ALMAGO_PUBLIC_INDEXING_ENABLED: "true",
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
    ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED: "true",
    ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "true",
    ALMAGO_PHASE2_PAYMENT_ORCHESTRATION_ENABLED: "true",
    ALMAGO_PHASE2_ATTRIBUTION_ENABLED: "true",
    ALMAGO_FREE_VALIDATION_PILOT_ENABLED: "true",
  };

  assert.equal(isPublicIndexingEnabled(normalEnv), true);
  assert.equal(isPhase2ProspectCaptureEnabled(normalEnv), true);
  assert.equal(isPhase2AccountLinkingEnabled(normalEnv), true);
  assert.equal(isPhase2EmailDeliveryEnabled(normalEnv), true);
  assert.equal(isPhase2PaymentOrchestrationEnabled(normalEnv), true);
  assert.equal(isPhase2AttributionEnabled(normalEnv), true);
  assert.equal(isFreeValidationPilotEnabled(normalEnv), true);
});
