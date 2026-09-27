# AlmaGo — safe pre-launch repository cleanup waves

Date: 27 September 2026  
Reference: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Status: proposal only; **no cleanup mutation is authorized by this document**.

## Goal

Turn the hygiene audit into small, reversible cleanup waves instead of one large destructive operation.

Each wave has its own stop condition. If evidence is incomplete, stop and keep the item.

## Wave 0 — finish active release work

Do not clean around moving release branches.

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

Exit condition: current release chain is either merged/closed with evidence or explicitly deferred.

## Wave 1 — close superseded legacy PR noise, no branch deletion

Candidate group after owner review:

- #145 — official-source visibility is already represented on current main;
- #151 — old public-language source-contract test;
- #156 — indexing boundary mostly superseded; preserve sitemap idea separately if wanted;
- #162/#163 — old programme/university verification-date implementation, superseded by later verification model.

Review-first candidates:

- #142 — copy parity only;
- #143 — semantic role/trust core present; dedicated role block optional;
- #165/#166 — partial overlap with the later revalidation model.

Do **not** include #146/#147/#148/#149/#157/#159/#167/#170 in this wave because they still contain bounded user-facing features absent from current main.

Wave 1 must close PRs only; keep their branches until dependency/base analysis says deletion is safe.

## Wave 2 — decide product extractions

Create fresh current-main issues/branches only for features the owner still wants.

Strong bounded candidates:

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
- #150 — programme missing-source/missing-deadline quality queues;
- #172 — accessibility page only.

Dependent additions:

- #152 contextual help entry only if help center exists;
- #155 public help navigation only after route decisions;
- #160 breadcrumbs only with retained public guidance pages;
- #171 local search only if #149 is extracted.

Exit condition: every retained feature has a fresh current-main implementation task or is explicitly declined.

## Wave 3 — archive the legacy V3 stack

After Wave 2 decisions are recorded:

- close remaining legacy V3 PRs with a short supersession/extraction note;
- treat #173 as historical documentation;
- treat #213 as the immutable integration/reference source;
- do not merge the 609-commit V3 integration into current main.

Keep all base branches until every open dependent PR is closed.

## Wave 4 — delete only evidence-backed merged-tip branches

Starting evidence set: **103 branches** whose current tip exactly equals a merged PR head.

Before deletion, remove from the batch any branch that is:

- head of an open PR;
- base of an open PR;
- referenced by active automation/tooling/configuration;
- an intentional archive/backup/experiment to retain;
- otherwise explicitly retained by the owner.

Delete in small batches, then recount branches after each batch.

Suggested batch size: 10–20 branches.

Stop immediately if branch state changed since the audit evidence was collected.

## Wave 5 — review the 49 non-trivial remainder branches

The remainder outside the 103 exact merged-tip set is:

- 2 post-merge moved-tip branches;
- 40 branches with closed-unmerged PR history;
- 7 branches with no PR history.

These require individual treatment.

Never infer “safe to delete” from age, naming, or a closed PR alone.

## Wave 6 — unused-code cleanup

Known candidate:

- `src/components/public/HomeProductPreview.tsx` — no current application import; only historical tests reference it.

Before removal:

1. confirm no active PR depends on it;
2. update/remove historical tests that intentionally encode the retired composition;
3. remove the component in a small dedicated PR;
4. run source-contract tests/build locally or in functioning CI.

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
- verify no stale PR still claims to be the release source of truth;
- verify branch protection state;
- verify the #286 GitHub Actions disposition;
- verify Render-first operational docs are current.

Publish the final snapshot without making additional cleanup mutations in the same change.

## Safety principle

Repository hygiene should make the project easier to reason about without deleting recoverable evidence or silently changing product scope.

**Close first, extract second, delete last.**
