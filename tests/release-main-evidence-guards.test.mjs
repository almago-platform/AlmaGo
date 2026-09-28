import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const a38Approval = readFileSync(".github/workflows/almago-a38-human-approval.yml", "utf8");
const a38Readiness = readFileSync(".github/workflows/almago-a38-readiness.yml", "utf8");
const a43 = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
const orchestrator = readFileSync(".github/workflows/almago-master-orchestrator.yml", "utf8");

test("A38 human approval is limited to repository admins on issues", () => {
  assert.match(a38Approval, /github\.event\.issue\.pull_request == null/);
  assert.match(a38Approval, /contains\(github\.event\.comment\.body, 'A38 HUMAN REVIEW APPROVED'\)/);
  assert.doesNotMatch(
    a38Approval,
    /github\.event\.comment\.user\.login == github\.repository_owner/,
  );
  assert.match(a38Approval, /getCollaboratorPermissionLevel/);
  assert.match(a38Approval, /approverPermission\.permission !== "admin"/);
  assert.match(a38Approval, /Only a repository admin may approve/);
});

test("A38 readiness evidence can only be published from main", () => {
  assert.match(
    a38Readiness,
    /if: steps\.flag\.outputs\.ready == 'true' && github\.ref == 'refs\/heads\/main'/,
  );
});

test("A43 completion is main-only and requires A38 completion", () => {
  assert.match(a43, /Complete A43 after successful authenticated evidence/);
  assert.match(a43, /success\(\)/);
  assert.match(a43, /github\.ref == 'refs\/heads\/main'/);
  assert.match(a43, /env\.ALMAGO_E2E_TARGET == 'render'/);
  assert.match(a43, /almago-plan-task:A38/);
  assert.match(a43, /A43 evidence is green, but A38 is not complete; A43 will remain open/);
  assert.match(a43, /item\.state === "open"/);
});

test("A43 watches protected API helper and migration paths", () => {
  assert.match(a43, /src\/app\/api\/admin\/\*\*/);
  assert.match(a43, /src\/app\/api\/student\/\*\*/);
  assert.match(a43, /src\/app\/api\/documents\/\*\*/);
  assert.match(a43, /src\/lib\/auth\/\*\*/);
  assert.match(a43, /src\/lib\/documents\.ts/);
  assert.match(a43, /src\/lib\/source-verification\.ts/);
  assert.match(a43, /src\/lib\/application-intake\.ts/);
  assert.match(a43, /supabase\/migrations\/\*\*/);
});

test("Master Orchestrator mutations are main-only", () => {
  assert.match(orchestrator, /orchestrate:\s*\n\s*if: github\.ref == 'refs\/heads\/main'/);
});
