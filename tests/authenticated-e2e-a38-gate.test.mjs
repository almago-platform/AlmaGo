import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

const authenticatedWorkflow = await readFile(
  new URL(".github/workflows/almago-authenticated-e2e.yml", root),
  "utf8",
);
const releaseWorkflow = await readFile(
  new URL(".github/workflows/almago-release.yml", root),
  "utf8",
);

test("VPS authenticated evidence fails closed until A38 is closed", () => {
  assert.match(authenticatedWorkflow, /issues:\s*read/);
  assert.match(
    authenticatedWorkflow,
    /Require A38 human gate before VPS evidence/,
  );
  assert.match(
    authenticatedWorkflow,
    /if: env\.ALMAGO_E2E_TARGET == 'vps'/,
  );
  assert.match(
    authenticatedWorkflow,
    /api\.github\.com\/repos\/\$GITHUB_REPOSITORY\/issues\/66/,
  );
  assert.match(authenticatedWorkflow, /jq -r '\.state'/);
  assert.match(authenticatedWorkflow, /\[ "\$state" != "closed" \]/);
  assert.match(
    authenticatedWorkflow,
    /A38 \(#66\) must be genuinely closed before final VPS authenticated evidence/,
  );
});

test("local authenticated tests remain available before A38", () => {
  const gate = authenticatedWorkflow.match(
    /- name: Require A38 human gate before VPS evidence[\s\S]*?(?=\n\s*- name: Install browser tools)/,
  )?.[0] || "";

  assert.match(gate, /if: env\.ALMAGO_E2E_TARGET == 'vps'/);
  assert.doesNotMatch(gate, /== 'local'/);
});

test("the release caller grants the reusable A43 workflow issue-read permission", () => {
  assert.match(releaseWorkflow, /permissions:[\s\S]*contents:\s*read[\s\S]*issues:\s*read/);
  assert.match(
    releaseWorkflow,
    /uses: \.\/\.github\/workflows\/almago-authenticated-e2e\.yml/,
  );
});

test("A38 cannot be reopened during authenticated VPS evidence", () => {
  const revalidateMain = authenticatedWorkflow.indexOf(
    "- name: Revalidate exact main and VPS after authenticated evidence",
  );
  const revalidateA38 = authenticatedWorkflow.indexOf(
    "- name: Revalidate A38 human gate after authenticated evidence",
  );
  assert.ok(revalidateMain !== -1);
  assert.ok(revalidateA38 > revalidateMain);

  const finalGate = authenticatedWorkflow.slice(revalidateA38);
  assert.match(finalGate, /if: env\.ALMAGO_E2E_TARGET == 'vps'/);
  assert.match(finalGate, /api\.github\.com\/repos\/\$GITHUB_REPOSITORY\/issues\/66/);
  assert.match(finalGate, /jq -r '\.state'/);
  assert.match(finalGate, /\[ "\$state" != "closed" \]/);
  assert.match(finalGate, /discard this run/);
});


test("human admin AAL2 evidence is exact-SHA and ordered inside the VPS gate", () => {
  const revalidateMain = authenticatedWorkflow.indexOf(
    "- name: Revalidate exact main and VPS after authenticated evidence",
  );
  const adminEvidence = authenticatedWorkflow.indexOf(
    "- name: Require exact-SHA human admin AAL2 evidence",
  );
  const revalidateA38 = authenticatedWorkflow.indexOf(
    "- name: Revalidate A38 human gate after authenticated evidence",
  );

  assert.ok(revalidateMain !== -1);
  assert.ok(adminEvidence > revalidateMain);
  assert.ok(revalidateA38 > adminEvidence);

  const gate = authenticatedWorkflow.slice(adminEvidence, revalidateA38);
  assert.match(gate, /if: env\.ALMAGO_E2E_TARGET == 'vps'/);
  assert.match(gate, /issues\/84\/comments\?per_page=100/);
  assert.match(gate, /almago-a43-admin-human-approved:sha=\$GITHUB_SHA/);
  assert.match(gate, /author_association/);
  assert.match(gate, /OWNER/);
  assert.match(gate, /MEMBER/);
  assert.match(gate, /COLLABORATOR/);
});
