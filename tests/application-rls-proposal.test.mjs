import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync(
  "supabase/proposals/0013_application_insert_verified_program_rls.sql",
  "utf8",
);
const appRoute = readFileSync("src/app/api/student/applications/route.ts", "utf8");

test("application RLS proposal stays outside automatic migrations", () => {
  assert.match(proposal, /PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY/);
  assert.doesNotMatch(proposal, /alter table|create table|drop table/i);
});

test("application RLS proposal requires recommendation ownership and allowed state", () => {
  assert.match(proposal, /recommendation\.student_id = \(select auth\.uid\(\)\)/);
  assert.match(proposal, /not recommendation\.is_archived/);
  assert.match(proposal, /recommendation\.status <> 'not_recommended'/);
  assert.match(proposal, /student_id = \(select auth\.uid\(\)\)/);
  assert.match(proposal, /status::text = 'interested'/);
});

test("application RLS proposal requires publishable programme evidence", () => {
  assert.match(proposal, /join public\.programs program/);
  assert.match(proposal, /join public\.universities university/);
  assert.match(proposal, /program\.is_active/);
  assert.match(proposal, /university\.is_active/);
  assert.match(proposal, /program\.verified_at is not null/);
  assert.match(proposal, /program\.source_url/);
  assert.match(proposal, /program\.application_url/);
  assert.match(proposal, /\^https\?:\/\//);
});

test("application route enforces the same publishability boundary before insert", () => {
  assert.match(appRoute, /isPublishableProgram\(program\)/);
  assert.match(appRoute, /recommendation\.is_archived/);
  assert.match(appRoute, /recommendation\.status === "not_recommended"/);
});

test("proposal changes only the student application insert policy", () => {
  assert.match(proposal, /drop policy if exists "applications student from recommendation"/);
  assert.match(proposal, /create policy "applications student from verified recommendation"/);
  assert.doesNotMatch(proposal, /grant\s|revoke\s/i);
  assert.doesNotMatch(proposal, /delete from|update public\.|insert into/i);
});
