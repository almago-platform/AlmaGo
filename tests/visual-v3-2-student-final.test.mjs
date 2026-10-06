import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/student/page.tsx");
const procedure = read("src/app/student/procedure/page.tsx");
const documentsPage = read("src/app/student/documents/page.tsx");
const applicationsPage = read("src/app/student/applications/page.tsx");
const pageState = read("src/components/student/StudentPageState.tsx");
const journeyHeader = read("src/components/student/StudentJourneyHeader.tsx");
const resourceHeader = read("src/components/student/StudentResourceHeader.tsx");
const journeyOverview = read("src/components/student/StudentJourneyOverview.tsx");
const guidance = read("src/components/student/StudentGuidancePanel.tsx");
const documents = read("src/components/student/DocumentsPanel.tsx");
const applications = read("src/components/student/StudentApplicationsPanel.tsx");
const logo = read("src/components/brand/BrandLogo.tsx");

test("Student V3.2 uses premium composition on canonical student surfaces", () => {
  assert.match(pageState, /pc-card/);
  assert.match(journeyHeader, /pc-panel/);
  assert.match(resourceHeader, /pc-panel/);
  assert.match(journeyOverview, /pc-panel/);
  assert.match(guidance, /student-guidance-panel pc-panel/);
  assert.match(dashboard, /PremiumSectionHeader/);
  assert.match(dashboard, /PremiumEmptyState/);
  assert.match(dashboard, /pc-panel/);
  assert.match(dashboard, /pc-card/);
  assert.match(procedure, /PremiumSectionHeader/);
  assert.match(procedure, /PremiumEmptyState/);
  assert.match(procedure, /pc-panel/);
});

test("Student V3.2 preserves urgency-aware dashboard behavior", () => {
  assert.match(dashboard, /data-dashboard-metrics/);
  assert.match(dashboard, /dueSoon/);
  assert.match(dashboard, /overdue/);
  assert.match(dashboard, /studentDashboardCockpitCopy/);
});

test("Student V3.2 preserves and premiumizes smart documents filters", () => {
  assert.match(documentsPage, /StudentPageFrame/);
  assert.match(documents, /studentDocumentsWorkspaceCopy/);
  assert.match(documents, /data-document-filters/);
  assert.match(documents, /statusFilter/);
  assert.match(documents, /categoryFilter/);
  assert.match(documents, /PremiumSectionHeader/);
  assert.match(documents, /PremiumEmptyState/);
  assert.match(documents, /pc-card/);
  assert.match(documents, /pc-soft-strip/);
  assert.match(documents, /documents-summary-approved/);
});

test("Student V3.2 preserves and premiumizes the application pipeline", () => {
  assert.match(applicationsPage, /StudentPageFrame/);
  assert.match(applications, /studentApplicationsWorkspaceCopy/);
  assert.match(applications, /data-applications-pipeline/);
  assert.match(applications, /data-application-filters/);
  assert.match(applications, /applicationFilter/);
  assert.match(applications, /universityFilter/);
  assert.match(applications, /urgentApplications/);
  assert.match(applications, /PremiumSectionHeader/);
  assert.match(applications, /PremiumEmptyState/);
  assert.match(applications, /pc-card/);
  assert.match(applications, /applications-empty-title/);
});

test("Student V3.2 preserves RTL and approved brand contracts", () => {
  assert.match(guidance, /student-guidance-panel/);
  assert.match(documents, /student-accent-edge/);
  assert.match(applications, /student-accent-edge/);
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
