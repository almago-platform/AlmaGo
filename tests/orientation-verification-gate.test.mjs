import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applicationIntakeFromTerms, deadlineForIntake } from "../src/lib/application-intake.ts";
import { isUuid } from "../src/lib/identifiers.ts";
import {
  hasVerifiedProgramSource,
  hasVerifiedUniversitySource,
  isHttpSourceUrl,
  isPublishableProgram,
} from "../src/lib/source-verification.ts";

const studentPage = readFileSync("src/app/student/orientation/page.tsx", "utf8");
const studentDashboard = readFileSync("src/app/student/page.tsx", "utf8");
const studentApplicationsRoute = readFileSync("src/app/api/student/applications/route.ts", "utf8");
const studentApplicationsPage = readFileSync("src/app/student/applications/page.tsx", "utf8");
const adminOrientationRoute = readFileSync("src/app/api/admin/orientation/route.ts", "utf8");
const adminOrientationArchiveRoute = readFileSync("src/app/api/admin/orientation/[id]/route.ts", "utf8");
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
    universities: { is_active: true },
  };
  assert.equal(isPublishableProgram(verifiedProgram), true);
  assert.equal(isPublishableProgram({ ...verifiedProgram, is_active: false }), false);
  assert.equal(
    isPublishableProgram({ ...verifiedProgram, universities: { is_active: false } }),
    false,
  );
});

test("students only receive recommendations backed by verified source evidence", () => {
  assert.match(studentPage, /universities\(name,city,bundesland,is_active\)/);
  assert.match(studentPage, /isPublishableProgram/);
  assert.match(studentPage, /recommendations=\{visibleRecommendations\}/);
  assert.match(studentDashboard, /universities\(name,is_active\)/);
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
  assert.match(studentApplicationsRoute, /source_url,application_url,verified_at,is_active,universities\(is_active\)/);
  assert.match(studentApplicationsRoute, /isPublishableProgram\(program\)/);
  assert.match(studentApplicationsRoute, /Cette piste n’est plus disponible pour créer une candidature/);
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

test("admin publication validates the target student before checking programme evidence", () => {
  const profilePosition = adminOrientationRoute.indexOf('from("profiles")');
  const rolePosition = adminOrientationRoute.indexOf('from("user_roles")');
  const programmePosition = adminOrientationRoute.indexOf('from("programs")');

  assert.ok(profilePosition >= 0);
  assert.ok(rolePosition > profilePosition);
  assert.ok(programmePosition > rolePosition);
  assert.match(adminOrientationRoute, /onboarding_completed/);
  assert.match(adminOrientationRoute, /studentRole\?\.role !== "student"/);
  assert.match(adminOrientationRoute, /profil est complété avant de publier une piste/);
});

test("admin publication verifies programme evidence before recommendation upsert", () => {
  const checkPosition = adminOrientationRoute.indexOf('from("programs")');
  const upsertPosition = adminOrientationRoute.indexOf('from("program_recommendations").upsert');

  assert.ok(checkPosition >= 0);
  assert.ok(upsertPosition > checkPosition);
  assert.match(adminOrientationRoute, /is_active,source_url,application_url,verified_at,universities\(is_active\)/);
  assert.match(adminOrientationRoute, /isPublishableProgram\(program\)/);
  assert.match(adminOrientationRoute, /Le programme et son université doivent être actifs/);
});

test("republishing an archived orientation explicitly restores student visibility", () => {
  assert.match(adminOrientationRoute, /is_archived:\s*false/);
  assert.match(adminOrientationRoute, /archived_at:\s*null/);
  const upsertPosition = adminOrientationRoute.indexOf('from("program_recommendations").upsert');
  const unarchivePosition = adminOrientationRoute.indexOf("is_archived: false");
  assert.ok(unarchivePosition > upsertPosition);
});

test("admin selector offers only publishable programmes while inactive historical recommendations stay identifiable", () => {
  assert.match(adminOrientationPage, /source_url,application_url,verified_at,is_active,universities\(name,city,is_active\)/);
  const programsQuery = adminOrientationPage.slice(
    adminOrientationPage.indexOf('.from("programs")'),
    adminOrientationPage.indexOf('.from("program_recommendations")'),
  );
  assert.doesNotMatch(programsQuery, /\.eq\("is_active", true\)/);
  assert.match(adminOrientationPanel, /programs\.filter\(isPublishableProgram\)\.map/);
  assert.match(adminOrientationPanel, /programmes actifs, rattachés à une université active/);
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


test("student application creation distinguishes lookup failures from unavailable recommendations", () => {
  assert.match(studentApplicationsRoute, /error: recommendationError/);
  assert.match(studentApplicationsRoute, /Impossible de vérifier cette piste pour le moment/);
  assert.match(studentApplicationsRoute, /status: 500/);
  assert.match(studentApplicationsRoute, /Cette recommandation n’est plus disponible/);
});


test("student orientation presents verification dates as recorded evidence, not guarantees", () => {
  const studentPanel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
  assert.match(studentPanel, /hasVerifiedProgramSource/);
  assert.match(studentPanel, /Dernière vérification enregistrée dans AlmaGo/);
  assert.match(studentPanel, /Vérification enregistrée ·/);
  assert.match(studentPanel, /Vérifiez toujours les informations sur la source officielle/);
  assert.doesNotMatch(studentPanel, /Vérifié dans AlmaGo le/);
  assert.doesNotMatch(studentPanel, /`Vérifié le \$\{formatVerificationDate/);
});


test("admin orientation selector offers only completed student-role profiles", () => {
  assert.match(adminOrientationPage, /from\("user_roles"\)/);
  assert.match(adminOrientationPage, /\.eq\("role", "student"\)/);
  assert.match(adminOrientationPage, /studentRoleIds=\{\(studentRoles \|\| \[\]\)\.map/);
  assert.match(adminOrientationPanel, /studentRoleIds: string\[\]/);
  assert.match(adminOrientationPanel, /student\.onboarding_completed && studentRoleIdSet\.has\(student\.id\)/);
});


test("existing applications remain visible independently of later catalogue publication state", () => {
  assert.match(studentApplicationsPage, /from\("applications"\)/);
  assert.match(studentApplicationsPage, /programs\(name,degree_level,universities\(name,city\)\)/);
  assert.doesNotMatch(studentApplicationsPage, /isPublishableProgram/);
  assert.doesNotMatch(studentApplicationsPage, /verified_at/);
  assert.doesNotMatch(studentApplicationsPage, /\.eq\("is_active", true\)/);
});


test("UUID guard rejects malformed identifiers before Supabase lookups", () => {
  assert.equal(isUuid("1074e9a8-4eb3-4f61-8351-d5f60af0945e"), true);
  assert.equal(isUuid("AA74E9A8-4EB3-4F61-8351-D5F60AF0945E"), true);

  for (const value of ["", "a", "123", "1074e9a8-4eb3-4f61-8351", null, undefined, 42]) {
    assert.equal(isUuid(value), false, String(value));
  }

  assert.match(studentApplicationsRoute, /isUuid\(body\.recommendation_id\)/);
  assert.match(adminOrientationRoute, /isUuid\(body\.student_id\)/);
  assert.match(adminOrientationRoute, /isUuid\(body\.program_id\)/);
});


test("orientation archive rejects malformed or missing targets", () => {
  assert.match(adminOrientationArchiveRoute, /isUuid\(id\)/);
  assert.match(adminOrientationArchiveRoute, /Identifiant de piste invalide/);
  assert.match(adminOrientationArchiveRoute, /\.select\("id"\)\s*\.maybeSingle\(\)/);
  assert.match(adminOrientationArchiveRoute, /Piste d’orientation introuvable/);
  assert.match(adminOrientationArchiveRoute, /status: 404/);
});


test("student orientation labels describe evidence without verdict language", () => {
  assert.match(studentPanel, /recommended: "Correspondance relevée"/);
  assert.match(studentPanel, /possible: "Piste à examiner"/);
  assert.match(studentPanel, /ambitious: "Prérequis élevés"/);
  assert.match(studentPanel, /missing_requirements: "Prérequis à compléter"/);
  assert.match(studentPanel, /not_recommended: "Écart avec le profil enregistré"/);

  assert.doesNotMatch(studentPanel, /Piste recommandée/);
  assert.doesNotMatch(studentPanel, /Piste non recommandée/);
  assert.doesNotMatch(studentPanel, /Piste ambitieuse/);
});


test("student orientation never exposes an unknown raw status code", () => {
  assert.match(studentPanel, /"Statut à vérifier"/);
  assert.doesNotMatch(
    studentPanel,
    /recommendationStatusLabels\[recommendation\.status\] \|\| recommendation\.status/,
  );
});
