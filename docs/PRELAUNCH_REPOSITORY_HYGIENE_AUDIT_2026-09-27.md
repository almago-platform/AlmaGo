# AlmaGo — Pre-launch repository hygiene audit

Date: 27 September 2026  
Audit base: `main@963531573ceb7ba0e33ecbed2884323f7c8d47d6`  
Mode: read-only findings; no branch deletion, no merge, no production mutation.

## Executive summary

The repository is functionally much further ahead than its GitHub surface suggests.

At audit start:

- `main` is at the expected SHA `963531573ceb7ba0e33ecbed2884323f7c8d47d6`;
- `main` is still unprotected and repository rulesets are empty;
- there are **39 open pull requests**;
- there are **187 branches**;
- only **38 branches** are current open-PR heads;
- a large V3 stacked chain from 24 September remains open even though current `main` has moved roughly 85 commits beyond those bases;
- several pre-launch issues were already satisfied by current code but still open.

This audit intentionally separates:

1. safe issue cleanup already supported by current `main`;
2. clearly superseded PRs;
3. stale stacked work that may still contain useful product ideas and therefore should be archived/extracted rather than blindly deleted;
4. active Render/release work that must not be touched.

## Actions already completed during this audit

The following open issues were verified as already satisfied and closed with evidence:

- **#332** — private/auth surfaces noindex: satisfied by merged #382;
- **#334** — baseline security headers without speculative CSP: satisfied by merged #382;
- **#330** — the five named stale test-contract failures: satisfied by merged #394/#397;
- **#390** — run source-contract tests before Render builds: satisfied by merged #392.

No branch was deleted and no pull request was merged.

## Pull requests — keep active

Do not close, rebase, retarget, or modify these as part of repository hygiene:

| PR | Purpose | Status |
| --- | --- | --- |
| #399 | final stale prebuild-contract repair | draft, mergeable |
| #401 | Render runbook + observability docs | draft, mergeable |
| #403 | bound/compress remote Pexels upstream assets for Render | draft, mergeable, stacked on #399 |
| #405 | authenticated A43 E2E target against Render | draft, mergeable |
| #407 | Render-native A45 final release gate | draft, mergeable |
| #395 | Dependabot npm minor/patch group | open; review only after release gate stabilizes |

These PRs are current pre-launch work and are not hygiene targets.

## Pull requests — clearly superseded / closure candidates

### #287 — GitHub Actions startup-failure diagnostic

Current state:

- 1 commit ahead, 65 behind current `main`;
- comparison against `main` has **0 changed files**;
- issue #286 now contains the continuing infrastructure evidence, including fresh `steps: null` runs.

Action completed during the audit: **#287 was closed without merge** after confirming the comparison against current `main` had 0 changed files. #286 remains the canonical incident record.

### #285 — Copilot Autopilot sandbox note

Current state:

- one documentation file only;
- 66 commits behind `main`;
- purpose was a bounded SANDBOX-01 validation artifact;
- the real Autopilot/release infrastructure has since moved substantially.

Recommendation: **close without merge** unless the sandbox note is still wanted as historical documentation. If historical value is desired, move the five-line note into an archive/history document rather than keeping a live PR.

### #184 — old Actions/release hardening stack

Current state:

- 26 commits ahead but 85 behind `main`;
- touches seven workflows and assumes Vercel as final runtime evidence;
- current release work now targets Render through #405/#407;
- GitHub Actions startup failure is separately tracked in #286.

Recommendation: **do not merge this branch as-is**. Extract any still-missing workflow guard in a fresh PR against current `main`, then close #184.

### #193 — Germany study/visa worksite plan

Current state:

- documentation only;
- 85 commits behind `main`;
- merge conflict reported;
- content may still have product/planning value.

Recommendation: **do not discard blindly**. First compare the plan against the current Germany/Tunisia implementation and current master plan. If already represented, close as superseded; otherwise port only the still-relevant planning text into a fresh current-main document.

## Legacy V3 stacked PR chain

The open V3 chain includes PRs #142–#173 plus #213 and is structurally stale.

Representative comparisons against current `main`:

- #142: 19 ahead / 85 behind;
- #152: 42 ahead / 85 behind;
- #161: 85 ahead / 85 behind;
- #170: 119 ahead / 85 behind;
- #172/#213: roughly 609 ahead / 82 behind.

The chain includes public guidance, help, trust, programme comparison, source visibility, student history/notifications, catalogue quality and accessibility work.

Recommendation:

- **do not merge the old stack directly**;
- **do not delete its branches yet**;
- perform a feature-parity extraction pass against current `main`;
- for each still-useful feature, open a new bounded issue/branch from current `main`;
- once useful work is extracted or confirmed already present, close the old PR chain as superseded.

This is safer than attempting a 40+ branch rebase through several generations of design, security, Germany and Render changes.

## Branch inventory

The repository currently has **187 branches**.

### Active open-PR heads

38 branches currently back open PRs. They are not deletion candidates while their PR remains active.

### Strong cleanup candidates after explicit owner approval

There is a large set of branches with no open PR that correspond to already integrated design/security/release work. Examples include:

- `design/admin-v2-operational-workspace`
- `design/authenticated-entry-v2`
- `design/authenticated-surfaces-v2`
- `design/student-dashboard-v2`
- `design/student-journey-v2`
- `design/work-v4-full-rollout`
- `security/prelaunch-web-hardening`
- `security/student-api-role-boundary`
- `security/document-file-signatures`
- `ops/render-health-revision`
- `ci/render-prebuild-tests`
- `test/current-main-contract-repair`
- `test/current-main-contract-repair-2`

There are also many completed homepage/design wave branches and security proposal branches without open PRs.

Before deletion, verify each branch tip is either reachable from `main` or intentionally superseded. Branch deletion should be a separate owner-approved cleanup action.

### V3 branches

There are **41 branches** with `feat/v3-`, `docs/v3-`, or `test/v3-` prefixes.

These should be treated as an archive/extraction set until the open V3 PR chain is reconciled. Do not bulk-delete them before that pass.

### Explicit archive/backup/experiment branches

Currently visible:

- `archive/homepage-v3-chatgpt-2026-09-27`
- `backup/homepage-before-v2-20260923`
- `experiment/homepage-v4-codex-challenger`
- `experiment/homepage-v4-work-challenger`

Recommendation: retain at most the intentionally chosen historical snapshots. Once the current homepage direction is documented and stable, redundant experiment/backup branches can be removed after explicit approval.

## Documentation drift

### Render versus Vercel

Current `main` still contains Vercel-era references in:

- `docs/observability.md`
- `docs/release-checklist.md`
- `docs/AYOUB_ACTIONS_MINIMALES.md`
- `docs/legal-privacy-draft.md`
- `docs/A38_OWNER_CONFIRMATION.md`
- `docs/data-processing-inventory.md`
- `docs/safe-automerge.md`

Not every occurrence should be mechanically replaced.

- #401 already updates observability/runtime documentation toward Render.
- #407 already changes A45 release evidence from Vercel to Render.
- A38 legal/privacy documents describe subprocessors and therefore need an explicit factual update + human legal review; do not silently rewrite them as a generic cleanup.
- `safe-automerge.md` is also stale because it describes Vercel success and autonomous merge semantics that no longer reflect the current pre-launch posture.

### Historical design plans

Files such as:

- `docs/HOMEPAGE_V2_PLAN.md`
- `docs/STUDENT_SPACE_V2_PLAN.md`
- `docs/ADMIN_SPACE_V2_PLAN.md`
- their implementation/status companions

are historical implementation records, not necessarily current operating documentation.

Recommendation: keep them if they serve as architecture/history evidence, but add an explicit historical/status banner or move them under a history/archive directory later. Do not let them compete with the master plan, current owner checklist, Render runbook and release checklist as sources of truth.

## Issues still genuinely open

The following should remain open:

- **#66 / A38** — human legal/privacy review;
- **#84 / A43** — authenticated E2E; still needs two password secrets and an executable GitHub runner;
- **#85 / A44** — observability provider activation after A38/A43;
- **#179** — optional leaked-password protection / Supabase plan decision;
- **#180** — post-A43 Supabase RLS/performance hardening;
- **#286** — GitHub Actions startup failure;
- **#320** — deferred authenticated/mobile QA;
- **#336** — protect `main` once enforceable CI is available;
- **#389** — Render GitHub connection + health-check configuration;
- **#398/#400/#402/#404/#406** — current pre-launch implementation work behind #399/#401/#403/#405/#407.

## Repository-risk findings

### Main is not protected

GitHub reports:

- `protected: false`;
- no repository rulesets;
- required status checks off.

This remains a pre-launch risk. #336 is the correct tracking issue.

Do not require the currently broken GitHub Actions checks until #286 is resolved, or the repository could become unmergeable.

### GitHub Actions remains infrastructure-blocked

Fresh PR runs still create named workflows but jobs fail before executing steps (`steps: null`). This is not evidence that repository tests failed.

Keep #286 as the canonical incident and do not weaken workflow definitions to mask it.

### Render configuration drift remains real

The existing Render service and `render.yaml` are not fully synchronized:

- service health check is empty in the dashboard while the blueprint specifies `/api/health`;
- auto-deploy is configured but recent deploys were API-triggered rather than commit-triggered;
- the service is Free while the blueprint describes a larger plan.

Keep #389 open. Do not change paid plan automatically.

## Recommended cleanup sequence

1. Finish/validate the current release chain (#399 → #403, plus #401/#405/#407 as applicable).
2. Resolve or escalate GitHub Actions startup failure (#286).
3. Protect `main` (#336) with rules that match actually functioning checks.
4. Close the clearly superseded diagnostic/sandbox/workflow PRs (#287, likely #285, then #184 after extraction check).
5. Perform feature-parity extraction for the V3 stacked chain; close old PRs only after useful pieces are retained.
6. Update legal/runtime docs from Vercel to Render as part of A38 factual review, not blind search/replace.
7. Only then perform branch deletion as a separate, explicit owner-approved operation.
8. Recount open PRs/issues/branches and publish a final repository-hygiene snapshot before A45.

## Safety conclusion

The repository needs **surface cleanup**, not aggressive deletion.

The highest-value cleanup is to reduce stale open PRs and old branch noise while preserving any unmerged V3 product value. Current Render/release branches are active and must remain isolated. No branch deletion is justified automatically from this audit alone.
