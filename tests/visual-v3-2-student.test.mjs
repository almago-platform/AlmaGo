import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const procedure = readFileSync("src/app/student/procedure/page.tsx", "utf8");
const documentsPage = readFileSync("src/app/student/documents/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/student/applications/page.tsx", "utf8");
const journeyHeader = readFileSync("src/components/student/StudentJourneyHeader.tsx", "utf8");
const resourceHeader = readFileSync("src/components/student/StudentResourceHeader.tsx", "utf8");
const journeyOverview = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");
const documents = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const applications = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
const guidance = readFileSync("src/components/student/StudentGuidancePanel.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");

test("Student V3.2 uses premium headers and cockpit composition", () => {
  assert.match(dashboard, /PremiumSectionHeader/);
  assert.match(dashboard, /PremiumEmptyState/);
  assert.match(dashboard, /pc-panel/);
  assert.match(dashboard, /pc-card/);
  assert.match(procedure, /PremiumSectionHeader/);
  assert.match(procedure, /PremiumEmptyState/);
  assert.match(procedure, /pc-panel/);
});

test("Student V3.2 unifies journey and resource hero surfaces", () => {
  assert.match(journeyHeader, /pc-hero/);
  assert.match(journeyHeader, /pc-hero-orbit/);
  assert.match(journeyHeader, /pc-kicker pc-kicker-inverse/);
  assert.match(journeyHeader, /pc-panel/);
  assert.match(resourceHeader, /pc-hero/);
  assert.match(resourceHeader, /pc-panel/);
  assert.match(journeyOverview, /pc-panel/);
});

test("Student V3.2 keeps documents and applications inside premium primitives", () => {
  assert.match(documentsPage, /PremiumEmptyState/);
  assert.match(applicationsPage, /PremiumEmptyState/);
  assert.match(documents, /pc-card/);
  assert.match(documents, /pc-soft-strip/);
  assert.match(documents, /PremiumSectionHeader/);
  assert.match(documents, /PremiumEmptyState/);
  assert.match(applications, /pc-card/);
  assert.match(applications, /PremiumSectionHeader/);
  assert.match(applications, /PremiumEmptyState/);
});

test("Student V3.2 preserves RTL and E2E structural contracts", () => {
  assert.match(guidance, /student-guidance-panel/);
  assert.match(documents, /student-accent-edge/);
  assert.match(applications, /student-accent-edge/);
  assert.match(documents, /documents-summary-approved/);
  assert.match(applications, /applications-empty-title/);
});

test("Student V3.2 keeps the exact approved Campus Allemagne logo assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
