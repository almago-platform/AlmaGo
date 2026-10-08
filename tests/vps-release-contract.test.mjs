import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const release = readFileSync(".github/workflows/almago-release.yml", "utf8");
const authenticated = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
const health = readFileSync("src/app/api/health/route.ts", "utf8");
const nextConfig = readFileSync("next.config.ts", "utf8");

test("release and authenticated E2E target the actual VPS domain, never suspended Render", () => {
  assert.match(release, /PRODUCTION_URL: https:\/\/campusallemagne\.tn/);
  assert.match(release, /target: vps/);
  assert.match(authenticated, /default: vps/);
  assert.match(authenticated, /options: \[vps, local\]/);
  assert.match(authenticated, /ALMAGO_BASE_URL=https:\/\/campusallemagne\.tn/);
  assert.match(authenticated, /Unsupported E2E target/);
  assert.doesNotMatch(release + authenticated, /onrender\.com|target: render|RENDER_GIT_|ALMAGO_PRODUCTION_URL/i);
});

test("production release refuses stale VPS builds and still checks GitHub main", () => {
  assert.match(release, /git ls-remote origin refs\/heads\/main/);
  assert.match(release, /expected="\$\{GITHUB_SHA:0:12\}"/);
  assert.match(release, /revision=.*\.revision \/\/ empty/);
  assert.match(release, /if \[ "\$revision" = "\$expected" \]/);
  assert.match(authenticated, /git ls-remote origin refs\/heads\/main/);
  assert.match(authenticated, /if \[ "\$revision" != "\$expected" \]/);
  assert.match(authenticated, /main changed during authenticated E2E/);
});

test("VPS build identity is immutable and requires a real Git SHA", () => {
  assert.match(nextConfig, /gitBuildValue\("rev-parse", "--verify", "HEAD"\)/);
  assert.match(nextConfig, /ALMAGO_BUILD_COMMIT: \/\^\[0-9a-f\]\{40\}\$\//);
  assert.match(health, /process\.env\.ALMAGO_BUILD_COMMIT\?\.slice\(0, 12\)/);
  assert.match(health, /"Cache-Control": "no-store"/);
  assert.doesNotMatch(health, /RENDER_GIT_/);
});

test("A38 and admin AAL2 exact-SHA gates remain in place for VPS", () => {
  assert.match(authenticated, /Require A38 human gate before VPS evidence/);
  assert.match(authenticated, /A38 \(#66\) must be genuinely closed/);
  assert.match(authenticated, /Require exact-SHA human admin AAL2 evidence/);
  assert.match(authenticated, /almago-a43-admin-human-approved:sha=\$GITHUB_SHA/);
  assert.match(authenticated, /Revalidate A38 human gate after authenticated evidence/);
});
