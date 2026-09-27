# AlmaGo — live hygiene reconciliation snapshot

Date: 27 September 2026  
Current main: `0a37fd411880744596ca3b2ed68086591e311deb`  
Scope: non-destructive continuation of PR #417. No merge, branch deletion, PR mutation outside #417, Supabase/Auth/RLS/secret/runtime change.

## Why this snapshot exists

The earlier review documents in #417 intentionally preserve their own point-in-time counts. Repository state changed again while the hygiene audit was still open, especially because the legacy V3 PR containers were archived.

This file records the later live state without rewriting the historical snapshots.

## Live repository state

Verified against GitHub:

- `main` is still exactly `0a37fd411880744596ca3b2ed68086591e311deb`;
- open pull requests: **13**;
- open issues: **21**;
- branches: **193**;
- no branch deletion occurred as part of the V3 archive step;
- the V3 feature branches and `release/v3-validation-20260925` are still present as recoverable source history.

The 13 open PRs are:

- #138 — A38 retention/deletion baseline;
- #193 — Germany study/visa worksite plan;
- #395 — dependency update;
- #399 — stale prebuild-contract repair;
- #401 — Render runbook/observability;
- #403 — Render Pexels upstream hardening;
- #405 — A43 authenticated Render target;
- #407 — A45 Render-native gate;
- #410 — original repository-hygiene audit;
- #412 — main-only release evidence guards;
- #414 — Render-aligned merge readiness;
- #416 — owner-action documentation refresh;
- #417 — this hygiene review.

## Legacy V3 archive reconciliation

The legacy V3 PR stack is no longer present in the open-PR set.

Confirmed examples:

- #143 is **closed, not merged**;
- #144 is **closed, not merged**;
- #213 is **closed, not merged**.

Issue #418 now preserves the unresolved V3 product intent as a current-main extraction backlog. This is the correct archive boundary: stale stacked PR containers can be closed without pretending that every feature was shipped or rejected.

Consequences:

- #144 requires no extraction for its responsibility-copy intent because current Student V2 already covers the functional responsibility model;
- #143 remains optional product-content source material for a dedicated public “role of AlmaGo / competent authorities” explanation;
- #213 remains an immutable feature-parity source, never a merge candidate.

## Exact collision pass across all open PRs

A changed-file intersection over all 13 open PRs found only two overlaps.

### #405 ↔ #412

Shared file:

- `.github/workflows/almago-authenticated-e2e.yml`

This is a real integration collision. The eventual integrated workflow must preserve both contracts:

- from #405: local + Render target selection, Render wake/health preflight and authenticated E2E target behavior;
- from #412: main-only completion/evidence guards, A38 prerequisite and protected-path coverage.

Whichever PR lands second must be reconciled against the first rather than accepted through a blind conflict resolution.

### #399 ↔ #403

Shared file:

- `tests/homepage-v5-density.test.mjs`

This overlap is expected because #403 is intentionally stacked on the head branch of #399:

- #399 head: `test/prebuild-contract-repair-final`;
- #403 base: `test/prebuild-contract-repair-final`.

Treat #399 → #403 as one ordered stack, not as two independent main-target changes.

No other pair among the 13 currently open PRs shares a changed path.

## Base-age awareness

Current-main-based PRs already recording `0a37fd4...` as base include #412, #414, #416 and #417.

Several active release PRs still record the earlier `9635315...` base (#399, #401, #405, #407). Their lag is currently the single main change introduced by #409; no file-level overlap with that profile-upsert repair was found in the active collision pass.

#138 and #193 are materially older, both based on `92eba1d...`. They should be reconciled as source material/current-plan input rather than merged blindly.

#395 is the only currently open non-draft PR in this set and is currently reported non-mergeable. It changes only `package.json` and `package-lock.json`; keep it out of the release/hygiene integration until the active release chain is stable.

## Branch-cleanup impact

Closing the V3 PR containers does **not** make their branches deletion candidates automatically.

The repository still has 193 branches, and the V3 branches remain present. That is desirable until extraction decisions are complete.

The previously proven exact-merged-tip bucket remains the safest starting point for a future destructive cleanup, but deletion still requires a fresh preflight immediately before execution:

1. exclude all open PR heads and bases;
2. exclude archive/backup/experiment/release/integration branches retained intentionally;
3. search active workflow/tooling/config references;
4. verify the branch tip has not moved since the evidence snapshot;
5. delete only with explicit owner approval, in small batches.

## Most extraction-ready V3 feature

The notification inbox remains the cleanest bounded product extraction after the release chain stabilizes.

Current main already provides the backend/security foundation:

- `notifications` table;
- student own-read RLS;
- backend notification production from document/application workflows;
- student update permission restricted to `read_at`.

The archived V3 implementation supplies a useful reference shape:

- student notifications page;
- client inbox panel;
- PATCH-one route;
- PATCH-read-all route;
- focused regression tests.

A future implementation should start from current `main`, keep the current `getStudentUser()` role boundary, update only `read_at`, and rebuild the UI in the current design system instead of reviving the V3 stack.

## Current hygiene conclusion

The repository is materially cleaner than at the first audit snapshot:

- legacy V3 PR noise has been archived without merging the stale stack;
- unresolved V3 product value is preserved in #418;
- the active PR set is down to 13;
- the live collision surface is small and explicit;
- branch history remains intact for later, separately approved cleanup.

The next repository-hygiene action should remain **non-destructive** until the active release chain (#399/#403, #401, #405/#412, #407, #414, #416) is resolved and GitHub Actions incident #286 is dispositioned.
