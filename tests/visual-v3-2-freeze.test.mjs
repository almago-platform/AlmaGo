import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const freeze = read("docs/product-system-v3-2-freeze.md");
const quality = read("docs/quality-gates.md");
const release = read("docs/release-checklist.md");
const logo = read("src/components/brand/BrandLogo.tsx");
const designSystem = read("src/app/design-system.css");
const homeHeader = read("src/components/public/HomeHeader.tsx");
const homepageCss = read("src/components/public/Homepage.module.css");
const prospectHero = read("src/components/prospect/ProspectPageHero.tsx");
const dossierHeader = read("src/components/product/DossierHeader.tsx");
const shell = read("src/components/layout/AppShell.tsx");
const browserWorkflow = read(".github/workflows/almago-browser-quality.yml");
const authWorkflow = read(".github/workflows/almago-authenticated-e2e.yml");
const playwright = read("playwright.config.mjs");

test("V3.2 freeze records the complete scoped delivery chain", () => {
  for (const pr of ["#931", "#933", "#940", "#942", "#944", "#946", "#948"]) {
    assert.ok(freeze.includes(pr), pr);
  }
  for (const sha of [
    "dd1a554f59c82c8d5db061fd3c31076f5834c7e9",
    "2395e8f6117de307ed1f395046de38b3b8b4e60b",
    "78c5bbef88a2c5f04ddcd356ea24315196673d4e",
    "0089f2a46745c83b4d5542d6654a1b8c213a6eb9",
    "23ed4f118c2fec7403f6ca59078f1df6b02b78d1",
    "a3ef277892b23b7fe764b2aa8874aa814a7573c5",
    "c80a074ebd0a3225ef99a42f2128790cd4d9401b",
  ]) {
    assert.ok(freeze.includes(sha), sha);
  }
});

test("V3.2 freeze keeps the exact approved Campus Allemagne assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
  assert.match(freeze, /campus-allemagne-logo-approved\.png/);
  assert.match(freeze, /campus-allemagne-symbol-approved\.png/);
});

test("V3.2 shared premium primitives remain the canonical visual layer", () => {
  for (const primitive of [
    ".pc-card",
    ".pc-card-interactive",
    ".pc-panel",
    ".pc-hero",
    ".pc-kicker",
    ".pc-empty-state",
    ".pc-soft-strip",
    ".pc-waiting-strip",
    ".pc-button",
  ]) {
    assert.ok(designSystem.includes(primitive), primitive);
    assert.ok(freeze.includes("`" + primitive + "`"), primitive);
  }
  for (const token of [
    "--premium-ink",
    "--premium-cream",
    "--premium-border",
    "--premium-radius-card",
    "--premium-radius-panel",
    "--premium-radius-hero",
    "--premium-shadow-card",
    "--premium-shadow-hero",
  ]) {
    assert.ok(designSystem.includes(token), token);
  }
});

test("V3.2 preserves light public header and dark authenticated hero signatures", () => {
  assert.match(homeHeader, /BrandLogo/);
  assert.match(homeHeader, /phase2Enabled \? "\/orientation" : "\/signup"/);
  assert.match(homepageCss, /\.header\s*\{[\s\S]*background:\s*#fffdf8/);
  assert.match(designSystem, /\.pc-hero\s*\{[\s\S]*var\(--premium-ink\)/);
  assert.match(prospectHero, /pc-hero/);
  assert.match(dossierHeader, /pc-hero/);
});

test("V3.2 keeps real RTL boundaries and intentional Admin LTR", () => {
  assert.match(shell, /dir=\{role === "admin" \? "ltr" : direction\}/);
  assert.match(designSystem, /html\[dir="rtl"\] \.pc-kicker/);
  assert.match(designSystem, /html\[dir="rtl"\] \.pc-hero::before/);
  assert.match(freeze, /Admin stays LTR until genuinely localized/);
});

test("V3.2 responsive and reduced-motion contracts stay frozen", () => {
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    assert.match(playwright, new RegExp(`width: ${width}\\b`), `missing width ${width}`);
  }
  assert.match(designSystem, /prefers-reduced-motion: reduce/);
  assert.match(designSystem, /\.pc-card[\s\S]*min-width: 0[\s\S]*max-width: 100%/);
  assert.match(designSystem, /\.pc-panel[\s\S]*min-width: 0[\s\S]*max-width: 100%/);
});

test("V3.2 public Browser Quality stays bounded and automatic for UI pull requests", () => {
  assert.match(browserWorkflow, /pull_request:/);
  assert.match(browserWorkflow, /tests\/e2e\/visual-v3-2-gate\.spec\.mjs/);
  for (const project of [
    "mobile-compact-chromium",
    "mobile-chromium",
    "desktop-1280-chromium",
    "desktop-chromium",
  ]) {
    assert.match(browserWorkflow, new RegExp(`--project=${project}`));
  }
  assert.match(browserWorkflow, /Gemini visual review of screenshots[\s\S]*github\.event_name == 'workflow_dispatch'/);
  assert.match(browserWorkflow, /Lighthouse advisory budgets[\s\S]*github\.event_name == 'workflow_dispatch'/);
  assert.match(quality, /320×720/);
  assert.match(quality, /1280×800/);
});

test("V3.2 keeps authenticated Student/Admin quality owned by A43", () => {
  assert.match(authWorkflow, /A43 AUTHENTICATED E2E PROBE/);
  assert.match(authWorkflow, /ALMAGO_E2E_STUDENT_PASSWORD/);
  assert.match(authWorkflow, /ALMAGO_E2E_ADMIN_PASSWORD/);
  assert.match(authWorkflow, /student-space-quality\.spec\.mjs/);
  assert.match(authWorkflow, /admin-space-quality\.spec\.mjs/);
  assert.match(freeze, /A43 Authenticated E2E/);
});

test("design freeze is explicitly not a launch or payment activation", () => {
  assert.match(freeze, /does \*\*not\*\* mean that AlmaGo is publicly launched/);
  assert.match(freeze, /does not authorize production payment activation/);
  assert.match(release, /does \*\*not\*\* mean public launch, payment activation/);
  assert.match(release, /A45 is the last publication gate/);
});
