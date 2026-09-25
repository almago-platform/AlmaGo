import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("supabase/proposals/0017_catalogue_student_read_rls.sql", "utf8");
const verification = readFileSync("src/lib/source-verification.ts", "utf8");

test("catalogue read hardening stays proposal-only", () => {
  assert.match(proposal, /PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY/);
});

test("student universities are limited to active records while admin stays allowed", () => {
  assert.match(proposal, /create policy "catalog student active read"/);
  assert.match(proposal, /using \(is_active or public\.is_admin\(\)\)/);
});

test("student programs require active verified HTTP-backed records and active parent university", () => {
  assert.match(proposal, /create policy "programs student publishable read"/);
  assert.match(proposal, /verified_at is not null/);
  assert.match(proposal, /nullif\(trim\(source_url\), ''\) ~\* '\^https\?:\/\/'/);
  assert.match(proposal, /nullif\(trim\(application_url\), ''\) ~\* '\^https\?:\/\/'/);
  assert.match(proposal, /university\.is_active/);
  assert.match(proposal, /public\.is_admin\(\)/);
});

test("proposal remains aligned with application publishability semantics", () => {
  assert.match(verification, /program\?\.is_active === true/);
  assert.match(verification, /university\?\.is_active === true/);
  assert.match(verification, /hasVerifiedProgramSource\(program\)/);
});

test("catalogue read proposal does not mutate rows or grants", () => {
  assert.doesNotMatch(proposal, /delete from|insert into|update public\./i);
  assert.doesNotMatch(proposal, /grant\s|revoke\s/i);
});
