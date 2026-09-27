# AlmaGo — active pre-launch PR collision matrix

Date: 27 September 2026  
Current main: `0a37fd411880744596ca3b2ed68086591e311deb`  
Open PRs reviewed: **13**.

This matrix is sequencing evidence only. It does not authorize any merge.

## Direct file overlaps

Across the 13 currently open PRs, only two direct changed-file collisions are present.

| PR pair | Shared file | Treatment |
| --- | --- | --- |
| #399 ↔ #403 | `tests/homepage-v5-density.test.mjs` | **Intentional stack**. #403 is based on #399. Preserve order #399 → #403 or restack #403 after #399 lands. |
| #405 ↔ #412 | `.github/workflows/almago-authenticated-e2e.yml` | **Real collision**. Whichever lands second must preserve both the Render target behavior from #405 and the main-only/A38 safety guards from #412. |

No other current open-PR pair changes the same file at this snapshot.

## Current-main divergence

Comparison of each PR head against current `main`:

| PR | Ahead | Behind | Interpretation |
| --- | ---: | ---: | --- |
| #138 | 3 | 86 | Very old A38 branch; preserve as legal source, not blind merge |
| #193 | 1 | 86 | Very old planning branch; reconcile, do not merge as current truth |
| #395 | 1 | 3 | Small dependency update; retest against latest release state |
| #399 | 10 | 1 | Near-current release repair |
| #401 | 4 | 1 | Near-current Render docs/tests |
| #403 | 17 | 1 | Stacked release hardening; includes #399 ancestry |
| #405 | 2 | 1 | Near-current A43 change |
| #407 | 3 | 1 | Near-current A45 change |
| #410 | 4 | 1 | Snapshot audit branch |
| #412 | 5 | 1 | Near-current release-safety change |
| #414 | 3 | 1 | Near-current merge-readiness change |
| #416 | 3 | 1 | Near-current owner-doc change |
| #417 | 12 | 0 | Current hygiene review branch is based on latest main |

GitHub currently reports these PRs as mergeable, but “mergeable” is not equivalent to “ready”.

## Recommended integration sequencing

### Release/test chain

1. **#399** — repair stale prebuild contracts.
2. **#403** — apply image-upstream hardening after #399 because it is stacked on #399.

Do not merge #403 first without explicitly restacking/rebasing its intended delta.

### A43 workflow collision

#405 and #412 both change `almago-authenticated-e2e.yml`.

Required merged behavior must include both:

- #405:
  - Render execution target;
  - Render health wake/check;
  - local mode preservation;
  - Render/local evidence labeling.

- #412:
  - main-only completion/evidence;
  - A38 prerequisite;
  - protected-path trigger coverage;
  - release-safety guards.

Before the second PR lands, compare the resulting workflow rather than resolving the overlap mechanically.

### Independent near-current changes

At current file scope, these are independent of each other:

- #401 — Render runbook/observability;
- #407 — A45 Render gate;
- #414 — merge readiness;
- #416 — owner-action docs;
- #410/#417 — hygiene documentation.

They still need semantic review because multiple documents may describe the same release process even without editing the same file.

## Old-base PRs requiring reconciliation rather than ordinary merge

### #138

A38 human/legal source material.

Its branch is 86 commits behind current main. Do not treat its clean Git mergeability as evidence that its legal/business assumptions are current.

Port only still-valid material through the A38 workflow.

### #193

Germany worksite planning document.

Also 86 commits behind current main, while the Germany implementation has advanced substantially since that plan.

Treat as historical/reconciliation input, not current operational truth.

## Dependency update

### #395

Only `package.json` and `package-lock.json`.

It is file-disjoint from the current release PRs but should be validated **after** the release-critical test/runtime chain stabilizes so dependency drift does not complicate diagnosis.

## Hygiene PRs

#410 and #417 should not both become competing “current truth” documents without a final reconciliation.

Preferred final state:

- keep #410 as the original immutable audit snapshot;
- use #417 as the later delta/reconciliation evidence;
- if both are eventually merged, clearly link them and label their snapshot dates/states.

## Merge-readiness principle

Before any open PR is merged:

1. re-check current `main`;
2. re-check open PR file overlaps;
3. verify the PR is still based on the intended product/runtime assumptions;
4. run functioning tests/CI where available;
5. do not use GitHub mergeability alone as readiness evidence.

No merge was performed while producing this matrix.
