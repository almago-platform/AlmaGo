# AlmaGo — Pre-launch repository hygiene audit review delta

Date: 27 September 2026  
Original audit snapshot: `main@963531573ceb7ba0e33ecbed2884323f7c8d47d6`  
Review snapshot: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: read-only review and reconciliation. No branch deletion, no PR closure, no merge, no mutation of active release work.

## Purpose

This review does not replace the original hygiene audit. It records the repository drift that occurred after the audit snapshot and sharpens the classification of the legacy V3 pull-request chain.

A separate draft audit already exists on PR #410. This review intentionally does not modify PR #410 or its branch.

## Repository delta since the original snapshot

At the review snapshot:

- `main` advanced from `963531573ceb7ba0e33ecbed2884323f7c8d47d6` to `0a37fd411880744596ca3b2ed68086591e311deb`;
- the intervening main change is the secure student profile-upsert repair merged by #409;
- the repository has **40 open pull requests**;
- the repository has **192 branches**;
- **39 distinct branches** back currently open PRs;
- **153 branches** have no open PR and therefore require a separate reachability/supersession pass before any deletion;
- new current-main release/hygiene work appeared after the audit, including #412, #414 and #416.

Counts in the original audit remain valid for its own timestamp. They should not be silently rewritten to current values.

## Collision record

The originally requested branch `agent/codex/prelaunch-repository-hygiene-audit` is occupied by draft PR #410.

This review is therefore isolated on:

`agent/codex/prelaunch-repository-hygiene-audit-review`

No content from #410 is modified here.

## Legacy V3 refinement

The V3 stack remains structurally stale relative to current `main`, but the review distinguishes three different cases rather than treating the chain as one cleanup unit.

### PR #143 — role/trust layer

Current comparison against review-main:

- status: diverged;
- 25 commits ahead;
- 86 commits behind;
- merge base: `92eba1d8c6c1447fb68191806a2f565ba4dd3f84`.

The diff still introduces or changes public trust/copy surfaces, including `HomeRoleSection.tsx`, homepage navigation/copy and student/admin wording.

Classification: **EXTRACT / COMPARE BEFORE CLOSE**.

Do not merge the stacked PR directly. First compare its intended trust statements and role boundary against the current public homepage and current legal/trust wording. If current `main` already expresses the same contract, close as superseded with evidence; otherwise port only the missing content onto a fresh current-main branch.

### PR #144 — student responsibility copy layer

Current comparison against review-main:

- status: diverged;
- 27 commits ahead;
- 86 commits behind;
- merge base: `92eba1d8c6c1447fb68191806a2f565ba4dd3f84`.

Its unique intent is primarily responsibility language and dossier-state wording rather than backend behavior.

Classification: **EXTRACT / COMPARE BEFORE CLOSE**.

This is a good candidate for a bounded copy-parity check because it is materially smaller than the full V3 integration tree. Do not revive the stack itself.

### PR #213 — full V3 integration validation

Current comparison against review-main:

- status: diverged;
- 609 commits ahead;
- 83 commits behind;
- 147 changed files in the PR metadata;
- it contains public routes, authenticated surfaces, admin UX, notifications, deadlines, accessibility, security proposals, tests and historical A44/observability work.

Classification: **ARCHIVE / FEATURE-PARITY SOURCE, NOT A MERGE CANDIDATE**.

The tree is too broad and too old to use as a release candidate against current `main`. Useful product ideas should be extracted individually. Security proposals and old release/observability material must not be copied blindly because current main already contains later security, Germany and Render-era work.

## Current active work that hygiene must not disturb

The following current-main or release-chain PRs remain outside cleanup scope:

- #399 — stale prebuild-contract repair;
- #401 — Render runbook and observability alignment;
- #403 — Render upstream image hardening, stacked after #399;
- #405 — authenticated A43 Render target;
- #407 — Render-native A45 gate;
- #410 — original hygiene audit;
- #412 — main-only evidence guards extracted from stale release work;
- #414 — Render-aligned merge readiness;
- #416 — owner-action documentation refresh.

Where two active PRs touch the same workflow or documentation, resolve that overlap in their own release block rather than through repository hygiene.

## Branch-cleanup interpretation

The current count of 153 branches without open PRs is only a discovery set, not a deletion list.

A branch should be considered a strong deletion candidate only when at least one of these is proven:

1. its tip is reachable from current `main`;
2. all unique commits were intentionally superseded by a later merged implementation;
3. its content is preserved in an explicit archive branch or immutable PR history and the branch has no remaining operational purpose.

Branches tied to unresolved V3 feature parity, experiments that are still under comparison, backups intentionally retained by the owner, or active infrastructure investigations should remain until separately reviewed.

## Documentation cleanup refinement

Historical design/status documents should not be deleted merely because they are old. Prefer one of:

- add a clear historical banner;
- move them under a history/archive documentation directory;
- replace obsolete operational instructions with a pointer to the current source of truth.

Operational documents that still instruct Vercel-era release behavior should be reconciled with the Render-first release chain. Legal/privacy documents remain subject to A38 factual and human review and must not be mechanically rewritten.

## Unused-code cleanup refinement

Unused components are candidates only after two checks:

1. no import or route references remain on current `main`;
2. no active PR is intentionally reintroducing or depending on them.

Do not delete components solely because they are absent from the current homepage composition if they are still used by authenticated/admin surfaces or an active migration/release branch.

## Recommended execution order

1. Preserve the original audit as the immutable snapshot of `main@9635315...`.
2. Finish the active release chain and resolve #286 GitHub Actions startup failure.
3. Run bounded feature-parity checks for #143 and #144.
4. Treat #213 as an extraction/archive source only.
5. Classify the 153 no-open-PR branches by reachability and supersession evidence.
6. Separate cleanup mutations into small PRs: stale PR closure, documentation archival, unused-code deletion and branch deletion should not be mixed.
7. Recount PRs/issues/branches immediately before A45 and publish a final hygiene snapshot.

## Safety conclusion

The repository still benefits more from **classification and extraction** than from aggressive deletion.

The review confirms that the original audit should remain snapshot-based, while current cleanup decisions must use the later `main@0a37fd411880744596ca3b2ed68086591e311deb` state. No change in this review modifies #399, #410, or any existing branch/PR.
