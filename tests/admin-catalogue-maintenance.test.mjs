import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminHome = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin home loads catalogue verification evidence", () => {
  assert.match(adminHome, /universities.*source_url,verified_at/s);
  assert.match(adminHome, /programs.*source_url,verified_at/s);
  assert.match(adminHome, /catalogueSourceGaps/);
  assert.match(adminHome, /catalogueVerificationGaps/);
});

test("catalogue quality treats malformed legacy URLs as missing source evidence", () => {
  assert.match(adminHome, /isHttpSourceUrl/);
  assert.match(adminHome, /hasValidUniversitySource/);
  assert.match(adminHome, /hasValidProgramSource/);
  assert.match(adminHome, /hasVerifiedUniversitySource/);
  assert.match(adminHome, /hasVerifiedProgramSource/);
});

test("catalogue maintenance becomes an actionable admin priority", () => {
  assert.match(adminHome, /Catalogue à vérifier/);
  assert.match(adminHome, /Maintenir le catalogue/);
  assert.match(adminHome, /catalogueQualityIssues > 0/);
  assert.match(adminHome, /\/admin\/universities/);
  assert.match(adminHome, /\/admin\/programs/);
});

test("student dossier blockers still outrank catalogue maintenance", () => {
  const documentsPosition = adminHome.indexOf("const priority = documents > 0");
  const applicationsPosition = adminHome.indexOf(": applications > 0");
  const cataloguePosition = adminHome.indexOf(": catalogueQualityIssues > 0");

  assert.ok(documentsPosition >= 0);
  assert.ok(applicationsPosition > documentsPosition);
  assert.ok(cataloguePosition > applicationsPosition);
});


test("admin catalogue quality includes inactive parent universities", () => {
  assert.match(adminHome, /universities\(is_active\)/);
  assert.match(adminHome, /programParentGaps/);
  assert.match(adminHome, /hasActiveProgramUniversity/);
  assert.match(adminHome, /inactive_university/);
  assert.match(adminHome, /sans anomalie de publication visible/);
});


test("admin dashboard excludes canonical and legacy terminal applications", () => {
  assert.match(
    adminHome,
    /\(admission,accepted,rejection,rejected,withdrawn\)/,
  );
});
