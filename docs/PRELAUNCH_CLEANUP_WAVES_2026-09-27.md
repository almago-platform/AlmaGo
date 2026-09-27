# AlmaGo — safe pre-launch repository cleanup waves

Date: 27 September 2026  
Reference: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Status: proposal only; **no cleanup mutation is authorized by this document**.

## Goal

Keep repository cleanup small, reversible and evidence-based.

The repository changed during this review: the legacy V3 PR chain was closed without merge and issue #418 now preserves the extraction backlog. The waves below are refreshed to match that state.

## Wave 0 — finish active release work

Status: **NOT COMPLETE**.

Protected work:

- #399 / #403;
- #401;
- #405;
- #407;
- #410;
- #412;
- #414;
- #416;
- #417;
- #286 GitHub Actions incident;
- A38/A43/A44/A45 gates.

Exit condition: current release work is merged/closed with evidence or explicitly deferred.

## Wave 1 — archive stale V3 PR containers without deleting branches

Status: **COMPLETED OUTSIDE THIS REVIEW BRANCH**.

The legacy V3 PR chain, including #213, is now closed without merge.

This review branch did not perform those closures.

Important: PR closure is **not** branch-deletion authorization and is **not** evidence that every V3 feature shipped.

Canonical unresolved-feature record: **#418**.

## Wave 2 — decide V3 product extractions through #418

Status: **ACTIVE / PRODUCT DECISION REQUIRED**.

Issue #418 now records the features that may still deserve a fresh current-main implementation.

Strong bounded candidates identified by the audit include:

1. #146 — side-by-side programme comparison;
2. #149 — public help center;
3. #147 — plain-language process guidance;
4. #148 — country-of-qualification guidance;
5. #167 — in-app notification inbox;
6. #170 — official-sources reference page;
7. #157 — trust/transparency page;
8. #159 — About AlmaGo page.

Optional/secondary candidates:

- #161 — combined dashboard dossier history;
- #150 — missing-source/missing-deadline programme quality queues;
- #172 — accessibility page only.

Dependent additions:

- #152 contextual help entry only if a help center exists;
- #155 public help navigation only after route decisions;
- #160 breadcrumbs only with retained public guidance pages;
- #171 local search only if the help center is reimplemented.

Exit condition: every feature retained by #418 has a fresh current-main task/implementation or is explicitly declined.

## Wave 3 — preserve V3 branch evidence until extraction decisions finish

Status: **HOLD**.

The repository still contains the historical V3 branches after the PR archive pass.

Do not bulk-delete them while #418 is unresolved.

Reason:

- closed V3 PRs remain source material;
- some features are genuinely absent from current main;
- historical intermediate branches can be necessary to reconstruct a bounded feature delta.

The earlier open-PR-base blocker for `release/v3-validation-20260925` no longer applies because #213 is closed. Its retention reason is now archive/reference preservation, not active dependency.

## Wave 4 — delete only evidence-backed merged-tip branches

Status: **NOT STARTED**.

Starting evidence set: **103 branches** whose current tip exactly equals a merged PR head.

Before deletion, exclude any branch that is:

- head of an open PR;
- base of an open PR;
- referenced by active automation/tooling/configuration;
- an intentional archive/backup/experiment to retain;
- otherwise explicitly retained by the owner.

Delete only in small batches and refresh evidence immediately before each batch.

Suggested batch size: 10–20 branches.

## Wave 5 — review the 76 non-trivial remainder branches

After the V3 PR archive pass, the non-main/non-open-head population is **179**.

Outside the 103 exact merged-tip set, **76 branches** remain:

- 2 post-merge moved-tip branches;
- 67 branches with closed-unmerged PR history;
- 7 branches with no PR history.

The rise in closed-unmerged-history branches is expected because the archived V3 heads moved into that class.

Never infer “safe to delete” from age, naming, or a closed PR alone.

## Wave 6 — unused-code cleanup

Known candidate:

- `src/components/public/HomeProductPreview.tsx` — no current application import; historical tests still reference it.

Before removal:

1. confirm no active PR depends on it;
2. update/remove only the historical tests that encode the retired composition;
3. remove the component in a small dedicated PR;
4. run the relevant test/build checks.

Do not mix unused-code deletion with branch cleanup.

## Wave 7 — documentation archival

Move or banner historical design/status documents only after current operational docs are stable.

Prefer:

- `docs/history/` for historical implementation plans;
- a prominent “historical / not current source of truth” banner;
- links from old docs to the current master plan/runbook where helpful.

Do not mechanically rewrite legal/privacy documents; A38 requires factual and human review.

## Wave 8 — final pre-A45 hygiene snapshot

Immediately before A45:

- record current `main` SHA;
- recount open PRs;
- recount open issues;
- recount branches;
- list active release branches;
- verify #418 extraction decisions are recorded;
- verify no stale PR still claims to be the release source of truth;
- verify branch protection state;
- verify the #286 GitHub Actions disposition;
- verify Render-first operational docs are current.

Publish the final snapshot without making additional cleanup mutations in the same change.

## Safety principle

Repository hygiene should make the project easier to reason about without deleting recoverable evidence or silently changing product scope.

**Close first, extract second, delete last.**
