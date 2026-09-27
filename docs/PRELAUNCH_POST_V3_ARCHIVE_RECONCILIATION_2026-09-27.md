# AlmaGo — post-V3 archive reconciliation

Date: 27 September 2026  
Current main: `0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: repository-state reconciliation only.

## State change detected

During the hygiene review, the repository changed independently of this review branch.

The legacy V3 pull-request chain was closed **without merge** in a concentrated archive pass. This includes #142–#173 (where applicable) and the full integration PR #213.

Issue **#418 — [V3 ARCHIVE] Reconcile legacy V3 features into current-main extraction backlog** now preserves the unresolved product intent and explicitly states that closure of the old PR containers does not mean those features were shipped or rejected.

This is the correct separation of concerns:

- stale stacked PR containers: closed;
- historical branches: retained for now;
- product intent: preserved in #418;
- future retained features: to be rebuilt from current `main`;
- no resurrection of the old V3 stack.

## Current open-PR count

After the V3 archive pass, the repository has **13 open PRs**.

The previous hygiene counts remain valid only for their own snapshots and should not be reused as current counts.

Current open PRs:

- #138 — A38 retention/deletion proposal;
- #193 — Germany study/visa worksite plan;
- #395 — Dependabot minor/patch update;
- #399 — prebuild source-contract repair;
- #401 — Render runbook/observability;
- #403 — Render Pexels hardening;
- #405 — A43 Render target;
- #407 — A45 Render-native gate;
- #410 — original hygiene audit;
- #412 — main-only release evidence guards;
- #414 — Render merge-readiness alignment;
- #416 — owner-action documentation refresh;
- #417 — hygiene review delta.

## Branch population after V3 PR closure

The repository still has **193 branches** because closing PRs did not delete their branches.

There are now:

- **13** branches that are heads of open PRs;
- **179** non-main branches that are not open-PR heads;
- among those 179:
  - **103** current tips exactly match a merged PR head;
  - **2** have merged-PR history but moved after the merge;
  - **67** have closed-unmerged PR history;
  - **7** have no PR history under the same branch name.

The rise from 40 to 67 closed-unmerged-history branches is expected: the newly archived V3 heads moved into that class.

## V3 preservation hold

At least **35 branches** in the current closed-unmerged-history set are V3-related or directly connected to the V3 archive history.

These branches must **not** be bulk-deleted merely because their PRs are now closed.

Reason:

- #418 still uses the old PR/branch history as feature-source material;
- several closed V3 PRs contain bounded features not present on current main;
- some branches are intermediate bases in the historical stack and may be useful when reconstructing the exact feature delta.

Recommended rule:

> Keep the legacy V3 branch set until #418 has completed the extraction/decline decision for every retained product feature.

After #418 is reconciled, the V3 branches can enter a separate deletion review.

## Important correction to the previous active-base warning

Before the archive pass, `release/v3-validation-20260925` was the base of open PR #213 and therefore could not be deleted.

#213 is now closed.

Therefore that specific **active-open-PR-base** blocker no longer applies.

However, `release/v3-validation-20260925` should still be retained while #418 uses #213 and the historical V3 integration tree as reference material.

The reason changed from **active dependency** to **archive/reference preservation**.

## No cleanup mutation from this reconciliation

This review branch did not perform the V3 closures.

No branch was deleted, no closed V3 PR was merged, and no product feature was silently marked complete.

The archive pass and issue #418 should now be treated as the canonical transition from “open stale stack” to “closed historical source + current-main extraction backlog”.
