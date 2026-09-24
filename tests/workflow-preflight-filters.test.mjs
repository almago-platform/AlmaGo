import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const a38 = readFileSync(".github/workflows/almago-a38-human-approval.yml", "utf8");
const failureWatch = readFileSync(".github/workflows/almago-automation-failure-watch.yml", "utf8");

test("A38 approval gate skips ordinary comments before runner allocation", () => {
  assert.match(a38, /approve-a38:\s*\n\s*if: >-/);
  assert.match(a38, /github\.event\.issue\.pull_request == null/);
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
