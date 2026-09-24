import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationStatuses,
  daysUntilDeadline,
  formatDeadline,
  isActiveApplication,
  isPastDeadline,
  nextActiveDeadline,
} from "../src/lib/phase4.ts";

test("canonical and legacy terminal applications cannot become current actions", () => {
  for (const status of ["admission", "accepted", "rejection", "rejected", "withdrawn"]) {
    assert.equal(isActiveApplication(status), false, status);
  }

  const canonicalActive = applicationStatuses.filter(
    (status) => !["admission", "rejection", "withdrawn"].includes(status),
  );
  for (const status of [...canonicalActive, "draft", "planned", "in_review"]) {
    assert.equal(isActiveApplication(status), true, status);
  }
});

test("unknown application states fail closed instead of becoming actionable", () => {
  for (const status of ["", "unknown", "processing_elsewhere", "ADMIN_OVERRIDE"]) {
    assert.equal(isActiveApplication(status), false, status);
  }
});

test("earliest active deadline excludes closed dossiers, invalid dates, and keeps overdue dates visible", () => {
  const applications = [
    { id: "closed", status: "admission", deadline: "2026-01-01" },
    { id: "later", status: "preparing", deadline: "2026-10-01" },
    { id: "invalid", status: "submitted", deadline: "2026-02-30" },
    { id: "none", status: "submitted", deadline: null },
    { id: "overdue", status: "documents_missing", deadline: "2026-09-01" },
  ];

  assert.equal(nextActiveDeadline(applications)?.id, "overdue");
  assert.deepEqual(applications.map(({ id }) => id), ["closed", "later", "invalid", "none", "overdue"]);
  assert.equal(nextActiveDeadline([{ status: "withdrawn", deadline: "2026-09-01" }]), undefined);
});

test("deadline changes to overdue at midnight in Berlin", () => {
  const beforeMidnight = new Date("2026-09-23T21:59:00Z");
  const afterMidnight = new Date("2026-09-23T22:01:00Z");
  assert.equal(isPastDeadline("2026-09-23", beforeMidnight), false);
  assert.equal(isPastDeadline("2026-09-23", afterMidnight), true);
  assert.equal(isPastDeadline("2026-09-24", afterMidnight), false);
});

test("invalid or missing deadlines are never treated as real deadlines", () => {
  for (const deadline of ["", "23-09-2026", "2026-13-01", "2026-02-30"]) {
    assert.equal(isPastDeadline(deadline), false, deadline);
    assert.equal(formatDeadline(deadline), "Date à confirmer", deadline);
  }
  assert.equal(formatDeadline(null), "Date à confirmer");
  assert.equal(formatDeadline(undefined), "Date à confirmer");
});


test("deadline countdown follows the same Berlin calendar day", () => {
  const beforeBerlinMidnight = new Date("2026-09-23T21:59:00Z");
  const afterBerlinMidnight = new Date("2026-09-23T22:01:00Z");

  assert.equal(daysUntilDeadline("2026-09-24", beforeBerlinMidnight), 1);
  assert.equal(daysUntilDeadline("2026-09-24", afterBerlinMidnight), 0);
  assert.equal(daysUntilDeadline("2026-09-23", afterBerlinMidnight), -1);
  assert.equal(daysUntilDeadline("2026-02-30", afterBerlinMidnight), null);
});
