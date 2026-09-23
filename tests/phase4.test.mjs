import assert from "node:assert/strict";
import test from "node:test";
import {
  isActiveApplication,
  isPastDeadline,
  nextActiveDeadline,
} from "../src/lib/phase4.ts";

test("completed and withdrawn applications cannot become current actions", () => {
  for (const status of ["admission", "accepted", "rejection", "rejected", "withdrawn"]) {
    assert.equal(isActiveApplication(status), false, status);
  }
  for (const status of ["interested", "preparing", "submitted", "waiting_university"]) {
    assert.equal(isActiveApplication(status), true, status);
  }
});

test("earliest active deadline excludes closed dossiers and keeps overdue dates visible", () => {
  const applications = [
    { id: "closed", status: "admission", deadline: "2026-01-01" },
    { id: "later", status: "preparing", deadline: "2026-10-01" },
    { id: "none", status: "submitted", deadline: null },
    { id: "overdue", status: "documents_missing", deadline: "2026-09-01" },
  ];
  assert.equal(nextActiveDeadline(applications)?.id, "overdue");
  assert.deepEqual(applications.map(({ id }) => id), ["closed", "later", "none", "overdue"]);
  assert.equal(nextActiveDeadline([{ status: "withdrawn", deadline: "2026-09-01" }]), undefined);
});

test("deadline changes to overdue at midnight in Berlin", () => {
  const beforeMidnight = new Date("2026-09-23T21:59:00Z");
  const afterMidnight = new Date("2026-09-23T22:01:00Z");
  assert.equal(isPastDeadline("2026-09-23", beforeMidnight), false);
  assert.equal(isPastDeadline("2026-09-23", afterMidnight), true);
  assert.equal(isPastDeadline("2026-09-24", afterMidnight), false);
});
