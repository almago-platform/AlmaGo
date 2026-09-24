import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const a38 = readFileSync(".github/workflows/almago-a38-human-approval.yml", "utf8");
const a38Readiness = readFileSync(".github/workflows/almago-a38-readiness.yml", "utf8");
const failureWatch = readFileSync(".github/workflows/almago-automation-failure-watch.yml", "utf8");
const authenticatedE2E = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
const masterOrchestrator = readFileSync(".github/workflows/almago-master-orchestrator.yml", "utf8");
const finalRelease = readFileSync(".github/workflows/almago-final-release-gate.yml", "utf8");

test("A38 approval gate skips ordinary comments before runner allocation", () => {
  assert.match(a38, /approve-a38:\s*\n\s*if: >-/);
  assert.match(a38, /github\.event\.issue\.pull_request == null/);
  assert.match(a38, /github\.event\.comment\.user\.login == github\.repository_owner/);
  assert.match(a38, /contains\(github\.event\.comment\.body, 'A38 HUMAN REVIEW APPROVED'\)/);

  // The prefilter is only an optimization: the exact security checks stay in the script.
  assert.match(a38, /approval !== "A38 HUMAN REVIEW APPROVED"/);
  assert.match(a38, /comment\.user\?\.login !== context\.repo\.owner/);
  assert.match(a38, /almago-a38-review-ready:sha=/);
});

test("failure watch requests a runner only for failed automation issue branches", () => {
  assert.match(failureWatch, /mark-blocked:\s*\n\s*if: >-/);
  assert.match(failureWatch, /github\.event\.workflow_run\.conclusion == 'failure'/);
  assert.match(
    failureWatch,
    /startsWith\(github\.event\.workflow_run\.head_branch, 'automation\/issue-'\)/,
  );

  // The script still revalidates the concrete PR and plan issue before mutation.
  assert.match(failureWatch, /pr\.head\.ref\.match\(\/\^automation\\\/issue-/);
  assert.match(failureWatch, /pr\.head\.sha !== run\.head_sha/);
  assert.match(failureWatch, /labels\.has\("almago-plan"\)/);
});


test("A43 closes only from authenticated evidence on main", () => {
  assert.match(
    authenticatedE2E,
    /Complete A43 after successful authenticated evidence\s*\n\s*if: success\(\) && github\.ref == 'refs\/heads\/main'/,
  );
  assert.match(authenticatedE2E, /almago-a43-evidence:run=/);
  assert.match(authenticatedE2E, /state_reason: "completed"/);
});


test("A38 readiness evidence is published only from main", () => {
  assert.match(
    a38Readiness,
    /Publish exact-SHA readiness evidence\s*\n\s*if: steps\.flag\.outputs\.ready == 'true' && github\.ref == 'refs\/heads\/main'/,
  );
});

test("master orchestrator never syncs the plan from a non-main ref", () => {
  assert.match(
    masterOrchestrator,
    /orchestrate:\s*\n\s*if: github\.ref == 'refs\/heads\/main'/,
  );
});


test("final release gate reuses the A43 test identity defaults", () => {
  assert.match(
    finalRelease,
    /ALMAGO_E2E_STUDENT_EMAIL: \$\{\{ vars\.ALMAGO_E2E_STUDENT_EMAIL \|\| 'phase3\.student\.a@almago\.test' \}\}/,
  );
  assert.match(
    finalRelease,
    /ALMAGO_E2E_ADMIN_EMAIL: \$\{\{ vars\.ALMAGO_E2E_ADMIN_EMAIL \|\| 'phase3\.admin@almago\.test' \}\}/,
  );
  assert.doesNotMatch(finalRelease, /secrets\.ALMAGO_E2E_STUDENT_EMAIL/);
  assert.doesNotMatch(finalRelease, /secrets\.ALMAGO_E2E_ADMIN_EMAIL/);
});
