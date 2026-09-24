import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  hasVerifiedProgramSource,
  hasVerifiedUniversitySource,
  isHttpSourceUrl,
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
});

test("students only receive recommendations backed by verified source evidence", () => {
  assert.match(studentPage, /hasVerifiedProgramSource/);
  assert.match(studentPage, /recommendations=\{visibleRecommendations\}/);
  assert.match(studentDashboard, /source_url,application_url,verified_at/);
  assert.match(studentDashboard, /hasVerifiedProgramSource/);
});

test("student application creation rejects unverified programme recommendations", () => {
  assert.match(studentApplicationsRoute, /source_url,application_url,verified_at/);
  assert.match(studentApplicationsRoute, /hasVerifiedProgramSource\(program\)/);
  assert.match(studentApplicationsRoute, /Cette piste doit être vérifiée avant de pouvoir créer une candidature/);
});

test("admin publication verifies programme evidence before recommendation upsert", () => {
  const checkPosition = adminOrientationRoute.indexOf('from("programs")');
  const upsertPosition = adminOrientationRoute.indexOf('from("program_recommendations").upsert');

  assert.ok(checkPosition >= 0);
  assert.ok(upsertPosition > checkPosition);
  assert.match(adminOrientationRoute, /is_active,source_url,application_url,verified_at/);
  assert.match(adminOrientationRoute, /hasVerifiedProgramSource\(program\)/);
  assert.match(adminOrientationRoute, /Vérifiez la source officielle du programme avant de publier cette piste/);
});

test("admin selector offers verified programmes while existing recommendations stay reviewable", () => {
  assert.match(adminOrientationPage, /source_url,application_url,verified_at/);
  assert.match(adminOrientationPanel, /programs\.filter\(hasVerifiedProgramSource\)\.map/);
  assert.match(adminOrientationPanel, /Seuls les programmes disposant d’une source officielle et d’une date de vérification/);
  assert.match(adminOrientationPanel, /visible\.map\(\(recommendation\)/);
});

test("verification guard does not introduce privileged secrets or schema changes", () => {
  for (const source of [studentApplicationsRoute, adminOrientationRoute]) {
    assert.doesNotMatch(source, /service_role|SUPABASE_SECRET|secret key/i);
  }
});
