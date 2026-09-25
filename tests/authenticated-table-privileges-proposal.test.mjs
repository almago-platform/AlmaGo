import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync(
  "supabase/proposals/0015_revoke_unused_authenticated_table_privileges.sql",
  "utf8",
);

test("unused authenticated privilege hardening stays proposal-only", () => {
  assert.match(proposal, /PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY/);
});

test("proposal revokes only TRUNCATE REFERENCES and TRIGGER", () => {
  assert.match(
    proposal,
    /revoke truncate, references, trigger\s+on all tables in schema public\s+from authenticated/i,
  );
  assert.doesNotMatch(proposal, /revoke[^;]*\bselect\b/i);
  assert.doesNotMatch(proposal, /revoke[^;]*\binsert\b/i);
  assert.doesNotMatch(proposal, /revoke[^;]*\bupdate\b/i);
  assert.doesNotMatch(proposal, /revoke[^;]*\bdelete\b/i);
});

test("proposal does not change rows or RLS policies", () => {
  assert.doesNotMatch(proposal, /delete from|insert into|update public\./i);
  assert.doesNotMatch(proposal, /create policy|drop policy|alter policy/i);
});
