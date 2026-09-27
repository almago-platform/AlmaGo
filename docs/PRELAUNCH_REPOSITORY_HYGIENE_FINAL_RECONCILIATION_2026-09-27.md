# AlmaGo — final pre-launch repository hygiene reconciliation

Date: 27 September 2026  
Current main: `0a37fd411880744596ca3b2ed68086591e311deb`

This is the **current-state reconciliation** after the original hygiene audit, the V3 archive pass, and the closure of the two audit PR containers #410 and #417.

It does not rewrite those historical snapshots. It records what is true now.

## 1. Current repository state

At the latest refresh, including this reconciliation PR:

- open PRs: **10**;
- open issues: **22**;
- branches: **194**;
- current `main` protection: **disabled**;
- non-main branches that are not heads of open PRs: **183**.

Branch partition for those 183:

| Category | Count |
| --- | ---: |
| Current tip exactly matches a merged PR head | 103 |
| Branch moved after a historical merge | 2 |
| Closed-unmerged PR history | 71 |
| No PR history under the same branch name | 7 |
| **Total** | **183** |

The closed-unmerged-history class includes the archived V3 branches, closed audit branches and other intentionally unmerged work.

## 2. Audit lineage

### Original audit

- task snapshot: `main@963531573ceb7ba0e33ecbed2884323f7c8d47d6`;
- original audit PR: #410;
- state now: **closed, not merged**.

### Review delta

- review snapshot: `main@0a37fd411880744596ca3b2ed68086591e311deb`;
- review PR: #417;
- state now: **closed, not merged**.

The review branch received additional evidence after #417 was closed, so #417 itself must not be treated as the final current-state container.

### Current reconciliation

This document is isolated on:

`agent/codex/prelaunch-hygiene-final-reconciliation`

Current PR: **#421**.

It contains only the final current-state summary instead of republishing the full historical audit tree.

## 3. Legacy V3 status

The old V3 pull-request stack has been **closed without merge**.

Issue #418 is now explicitly a **post-launch V3 archive/current-main backlog**.

Important interpretation:

- closed V3 PR does not mean “feature shipped”;
- closed V3 PR does not mean “feature rejected”;
- old V3 implementation branches remain temporary source evidence;
- any retained feature must be rebuilt from current `main`, not by reviving the old stacked release tree.

Bounded feature ideas still represented in #418 include programme comparison, public guidance/help, notification inbox, official-sources content and optional trust/about/accessibility surfaces.

Because #418 is now post-launch, those product extractions should not block pre-launch unless a separate current release decision promotes one of them.

Do not bulk-delete the V3 branch family while #418 still needs those historical diffs.

## 4. Current open PRs

Current open PR set:

| PR | Purpose | Hygiene treatment |
| --- | --- | --- |
| #138 | A38 retention/deletion proposal | HUMAN/LEGAL SOURCE — reconcile, do not blind-merge |
| #399 | stale prebuild contract repair | RELEASE-CRITICAL |
| #401 | Render runbook/observability | RELEASE-CRITICAL |
| #403 | Pexels upstream hardening | RELEASE-CRITICAL; stacked on #399 |
| #405 | authenticated Render target for A43 | RELEASE-CRITICAL |
| #407 | Render-native A45 gate | RELEASE-CRITICAL |
| #412 | main-only evidence guards | RELEASE-SAFETY |
| #414 | Render merge-readiness alignment | RELEASE-SAFETY |
| #416 | current owner-action docs | RELEASE DOCUMENTATION |
| #421 | this final hygiene reconciliation | DOCUMENTATION ONLY |

### Direct file collisions

Only two direct changed-file collisions remain among the pre-existing release PRs.

#### #399 ↔ #403

Shared file:

`tests/homepage-v5-density.test.mjs`

This is an intentional stack. #403 is based on #399.

Required treatment:

- preserve #399 → #403 order; or
- explicitly restack #403 after #399 lands.

#### #405 ↔ #412

Shared file:

`.github/workflows/almago-authenticated-e2e.yml`

This is a real semantic collision.

The final workflow must preserve both:

- #405: Render target / health wake-check / execution mode;
- #412: main-only evidence / A38 prerequisite / protected-path safety guards.

Do not resolve this overlap mechanically.

## 5. Open issue reconciliation

All **22** current open issues were reconciled against current main and current external evidence.

Result:

- **0** open issues are fully satisfied by current main and immediately safe to close;
- 8 implementation issues have corresponding unmerged PRs;
- 9 remain genuine human/operational/external-system tasks;
- 5 are repository/status/post-launch coordination issues.

### Implementation issue/PR pairs still pending

- #398 → #399;
- #400 → #401;
- #402 → #403;
- #404 → #405;
- #406 → #407;
- #411 → #412;
- #413 → #414;
- #415 → #416.

An open PR is not completion evidence.

### Confirmed still-open technical/human items

#### #336 — main protection

GitHub currently reports:

- `protected: false`;
- branch protection disabled;
- required status-check enforcement off.

So #336 is definitely unresolved.

#### #179 — leaked-password protection

Current Supabase Security Advisor still reports:

**Leaked Password Protection Disabled**.

So #179 is unresolved.

#### #180 — DB performance hardening

The foreign-key index portion is completed by migration 0026.

Current Supabase Performance Advisor still reports:

- **26** `auth_rls_initplan` warnings;
- **10** `multiple_permissive_policies` warnings;
- **21** informational unused-index findings.

Per #180's own contract, RLS/performance rewrites remain post-A43 work.

The `technical_logs` RLS-without-policy advisory remains intentional deny-by-default behavior and should not be “fixed” just to silence the advisor.

#### A38 / A43 / A44

These remain real gates:

- A38: human legal/privacy review;
- A43: authenticated student/admin evidence;
- A44: production observability/analytics activation under reviewed privacy constraints.

### Coordination / post-launch issues

- #19 — master-plan status;
- #22 — owner action checklist;
- #418 — post-launch V3 extraction backlog;
- #419 — manual verified-branch purge;
- #420 — post-launch Germany LOT 9–19 product reconciliation.

#418 and #420 are explicitly post-launch backlogs and should not be allowed to masquerade as pre-launch blockers.

## 6. Controlled branch purge manifest

Issue #419 now explicitly tracks the **manual ref delete** operation.

Its Batch A was rechecked live:

- listed branches: **51**;
- branches still existing: **51 / 51**;
- remote tips matching the expected SHA: **51 / 51**;
- currently open-PR heads: **0 / 51**;
- currently open-PR bases: **0 / 51**.

This is strong evidence for a controlled deletion batch.

It is still **not deletion authorization**.

Before destructive execution:

1. refresh every remote SHA;
2. re-check open PR heads and bases;
3. re-check automation/archive exclusions;
4. delete in a small batch;
5. recount after deletion;
6. stop on any unexpected drift.

## 7. Current cleanup order

### First — stabilize release work

Recommended sequencing:

1. #399;
2. #403 after #399;
3. resolve #405/#412 workflow integration deliberately;
4. #401;
5. #407;
6. #414;
7. #416.

#138 remains human/legal and should not be treated as a normal technical merge.

#421 is documentation only and must not be used to bypass release validation.

### Second — separate pre-launch from post-launch backlog

Keep #418 and #420 as post-launch planning/extraction records.

They should not block A45 unless a new explicit pre-launch decision says otherwise.

### Third — controlled branch deletion

Use #419 only after refreshing its manifest.

The 103 exact merged-tip branches remain the strongest broader cleanup pool, but #419's 51-branch Batch A is the tighter first execution set.

### Fourth — code/document cleanup

After release stabilization:

- remove runtime-unused historical components only in dedicated PRs;
- archive historical design/status docs instead of silently deleting context;
- keep legal docs under A38 human review.

### Fifth — final A45 hygiene snapshot

Immediately before A45:

- record exact main SHA;
- recount PRs/issues/branches;
- verify main protection;
- verify GitHub Actions disposition (#286);
- verify Render operational configuration;
- verify #419 branch-deletion state;
- verify post-launch #418/#420 are not being treated as release blockers;
- verify no stale PR/document claims to be the release source of truth.

## 8. What this reconciliation does not do

- no merge;
- no PR closure;
- no issue closure;
- no branch deletion;
- no rebase or retarget of existing work;
- no Auth/RLS/Supabase mutation;
- no secret/config/runtime mutation;
- no modification of #399 or the closed audit PRs #410/#417.

## Final hygiene principle

The repository is no longer primarily blocked by stale V3 PR noise.

The remaining pre-launch work is concentrated in:

1. the active Render/release PR chain;
2. A38/A43/A44/A45 evidence;
3. GitHub Actions / branch protection / Render operational configuration;
4. controlled branch cleanup.

The V3 and Germany expansion backlogs are now explicitly post-launch records.

**Close stale containers, preserve product intent, merge current work deliberately, and delete branches only from refreshed evidence.**
