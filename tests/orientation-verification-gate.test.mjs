import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applicationIntakeFromTerms, deadlineForIntake } from "../src/lib/application-intake.ts";
import {
  hasVerifiedProgramSource,
  hasVerifiedUniversitySource,
  isHttpSourceUrl,
  isPublishableProgram,
} from "../src/lib/source-verification.ts";

const studentPage = readFileSync("src/app/student/orientation/page.tsx", "utf8");
const studentDashboard = readFileSync("src/app/student/page.tsx", "utf8");
const studentApplicationsRoute = readFileSync("src/app/api/student/applications/route.ts", "utf8");
const adminOrientationRoute = readFileSync("src/app/api/admin/orientation/route.ts", "utf8");
const adminOrientationPage = readFileSync("src/app/admin/orientation/page.tsx", "utf8");
const adminOrientationPanel = readFileSync("src/components/admin/AdminOrientationPanel.tsx", "utf8");

test("source verification accepts only real http(s) URLs with a recorded verification date", () => {
  assert.equal(isHttpSourceUrl("https://www.example.edu/programme"), true);
  assert.equal(isHttpSourceUrl("http://www.example.edu/programme"), true);

  for (const value of ["", "a", "javascript:alert(1)", "ftp://example.edu/file", null, undefined]) {
    assert.equal(isHttpSourceUrl(value), false, String(value));
  }

  assert.equal(
    hasVerifiedProgramSource({
      verified_at: "2026-09-24T12:00:00Z",
      source_url: "https://www.example.edu/programme",
      application_url: null,
    }),
    true,
  );
  assert.equal(
    hasVerifiedProgramSource({
      verified_at: null,
      source_url: "https://www.example.edu/programme",
      application_url: null,
    }),
    false,
  );
  assert.equal(
    hasVerifiedProgramSource({
      verified_at: "2026-09-24T12:00:00Z",
      source_url: "a",
      application_url: null,
    }),
    false,
  );
  assert.equal(
    hasVerifiedUniversitySource({
      verified_at: "2026-09-24T12:00:00Z",
      source_url: null,
      website_url: "https://www.example.edu",
    }),
    true,
  );

  const verifiedProgram = {
    is_active: true,
    verified_at: "2026-09-24T12:00:00Z",
    source_url: "https://www.example.edu/programme",
    application_url: null,
  };
  assert.equal(isPublishableProgram(verifiedProgram), true);
  assert.equal(isPublishableProgram({ ...verifiedProgram, is_active: false }), false);
});

test("students only receive recommendations backed by verified source evidence", () => {
  assert.match(studentPage, /isPublishableProgram/);
  assert.match(studentPage, /recommendations=\{visibleRecommendations\}/);
  assert.match(studentDashboard, /source_url,application_url,verified_at/);
  assert.match(studentDashboard, /isPublishableProgram/);
});

test("student orientation links ignore malformed legacy sources and fall back to a valid application URL", () => {
  assert.match(adminOrientationPanel, /isPublishableProgram/);
  const studentPanel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
  assert.match(studentPanel, /isHttpSourceUrl/);
  assert.match(studentPanel, /isHttpSourceUrl\(program\.source_url\)/);
  assert.match(studentPanel, /isHttpSourceUrl\(program\.application_url\)/);
  assert.doesNotMatch(studentPanel, /return program\.source_url \|\| program\.application_url/);
});

test("student application creation rejects unverified programme recommendations", () => {
  assert.match(studentApplicationsRoute, /source_url,application_url,verified_at,is_active/);
  assert.match(studentApplicationsRoute, /isPublishableProgram\(program\)/);
  assert.match(studentApplicationsRoute, /Cette piste doit être vérifiée avant de pouvoir créer une candidature/);
});

test("student application creation prevents duplicate rows when intake is unknown", () => {
  assert.match(studentApplicationsRoute, /existingApplicationQuery/);
  assert.match(studentApplicationsRoute, /intake === null/);
  assert.match(studentApplicationsRoute, /\.is\("intake", null\)/);
  assert.match(studentApplicationsRoute, /\.eq\("intake", intake\)/);
  assert.match(studentApplicationsRoute, /Une candidature existe déjà pour ce programme/);
  assert.match(studentApplicationsRoute, /status: 409/);
});

test("application intake stays uncommitted when several entry terms are possible", () => {
  assert.equal(applicationIntakeFromTerms(["Winter"]), "Winter");
  assert.equal(applicationIntakeFromTerms([" Summer "]), "Summer");
  assert.equal(applicationIntakeFromTerms(["Winter", "Winter"]), "Winter");
  assert.equal(applicationIntakeFromTerms(["Winter", "Summer"]), null);
  assert.equal(applicationIntakeFromTerms([]), null);
  assert.equal(applicationIntakeFromTerms(null), null);
  assert.match(studentApplicationsRoute, /applicationIntakeFromTerms\(program\?\.intake_terms\)/);
});

test("application deadline follows only an unambiguous recorded intake", () => {
  const program = {
    winter_deadline: "2027-01-15",
    summer_deadline: "2027-07-15",
  };

  assert.equal(deadlineForIntake(program, "Winter"), "2027-01-15");
  assert.equal(deadlineForIntake(program, "Wintersemester"), "2027-01-15");
  assert.equal(deadlineForIntake(program, "Summer"), "2027-07-15");
  assert.equal(deadlineForIntake(program, "Sommersemester"), "2027-07-15");
  assert.equal(deadlineForIntake({ ...program, summer_deadline: null }, "Summer"), null);
  assert.equal(deadlineForIntake(program, null), null);
  assert.equal(deadlineForIntake(program, "À confirmer"), null);
  assert.equal(deadlineForIntake(program, "Winter / Summer"), null);
  assert.equal(deadlineForIntake(program, "Winter, Sommersemester"), null);
  assert.match(studentApplicationsRoute, /deadlineForIntake\(program, intake\)/);
});

test("admin publication verifies programme evidence before recommendation upsert", () => {
  const checkPosition = adminOrientationRoute.indexOf('from("programs")');
  const upsertPosition = adminOrientationRoute.indexOf('from("program_recommendations").upsert');

  assert.ok(checkPosition >= 0);
  assert.ok(upsertPosition > checkPosition);
  assert.match(adminOrientationRoute, /is_active,source_url,application_url,verified_at/);
  assert.match(adminOrientationRoute, /isPublishableProgram\(program\)/);
  assert.match(adminOrientationRoute, /Vérifiez la source officielle du programme avant de publier cette piste/);
});

test("republishing an archived orientation explicitly restores student visibility", () => {
  assert.match(adminOrientationRoute, /is_archived:\s*false/);
  assert.match(adminOrientationRoute, /archived_at:\s*null/);
  const upsertPosition = adminOrientationRoute.indexOf('from("program_recommendations").upsert');
  const unarchivePosition = adminOrientationRoute.indexOf("is_archived: false");
  assert.ok(unarchivePosition > upsertPosition);
});

test("admin selector offers only publishable programmes while inactive historical recommendations stay identifiable", () => {
  assert.match(adminOrientationPage, /source_url,application_url,verified_at,is_active/);
  const programsQuery = adminOrientationPage.slice(
    adminOrientationPage.indexOf('.from("programs")'),
    adminOrientationPage.indexOf('.from("program_recommendations")'),
  );
  assert.doesNotMatch(programsQuery, /\.eq\("is_active", true\)/);
  assert.match(adminOrientationPanel, /programs\.filter\(isPublishableProgram\)\.map/);
  assert.match(adminOrientationPanel, /Seuls les programmes disposant d’une source officielle et d’une date de vérification/);
  assert.match(adminOrientationPanel, /visible\.map\(\(recommendation\)/);
  assert.match(adminOrientationPanel, /const publishable = isPublishableProgram\(program\)/);
  assert.match(adminOrientationPanel, /Masquée à l’étudiant/);
  assert.match(adminOrientationPanel, /Pistes d’orientation non archivées/);
});

test("verification guard does not introduce privileged secrets or schema changes", () => {
  for (const source of [studentApplicationsRoute, adminOrientationRoute]) {
    assert.doesNotMatch(source, /service_role|SUPABASE_SECRET|secret key/i);
  }
});
