# AlmaGo — pre-launch open PR triage

Date: 27 September 2026  
Review base: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: classification only. No PR closure, merge, rebase, retarget or branch deletion.

## Objective

Reduce the risk of treating the legacy V3 stack as one undifferentiated cleanup block.

This triage separates:

- current release work that must stay isolated;
- legacy work whose intent is already represented on current `main`;
- legacy work that still contains user-facing product value not present on current `main`;
- mixed PRs that must be decomposed before any extraction.

## Current release / pre-launch work — keep isolated

Do not use repository hygiene to rewrite or close these:

| PR | Treatment |
| --- | --- |
| #399 | KEEP — release test-contract repair |
| #401 | KEEP — Render runbook / observability |
| #403 | KEEP — Render image-upstream hardening; stacked after #399 |
| #405 | KEEP — A43 authenticated Render target |
| #407 | KEEP — A45 Render-native release gate |
| #410 | KEEP — original hygiene audit |
| #412 | KEEP — current-main evidence guards |
| #414 | KEEP — Render merge-readiness alignment |
| #416 | KEEP — owner-action docs |
| #417 | KEEP — this review |
| #395 | HOLD — dependency update; review after release gate stabilizes |

## Human/legal gate

### #138 — A38 retention/deletion baseline

Current-main path check:

- `docs/A38_OWNER_CONFIRMATION.md` exists;
- `docs/A38_FINALIZATION_MATRIX.md` does not;
- `docs/A38_RETENTION_POLICY_PROPOSAL.md` does not.

Classification: **KEEP AS A38 SOURCE / DO NOT MERGE BLINDLY**.

The legal/privacy gate is still human-owned. If this material remains useful, port the still-valid proposal text onto current `main` through the A38 workstream rather than merging the old branch wholesale.

## Legacy V3 — evidence-based triage

### #142 — language/trust copy modernization

Touches only existing public/student/admin copy surfaces. Since that branch, current `main` has received multiple later public, student and admin redesign waves.

Classification: **COPY-PARITY REVIEW, NOT DIRECT MERGE**.

No unique route or standalone feature requires preserving the branch itself. Before closure, compare only the remaining wording that still has policy/trust value.

### #143 — role/trust layer

Current-main already preserves the core semantic boundaries:

- AlmaGo does not guarantee admission or visa;
- official sources remain authoritative;
- official decisions belong to competent bodies;
- the student keeps the decision while AlmaGo structures the process.

What is missing is the dedicated public `HomeRoleSection`.

Classification: **SEMANTIC CORE MOSTLY SUPERSEDED; OPTIONAL UI EXTRACTION**.

If a dedicated “Notre rôle” block is still desired, rebuild it in the current homepage system.

### #145 — official-source visibility

Current `main` already contains:

- student orientation copy explicitly telling users to verify the official source;
- a visible “Vérifier la source officielle” action;
- admin programme forms with official-source fields;
- verification gates using `source_url`, `application_url` and verification evidence.

Classification: **FUNCTIONALLY SUPERSEDED**.

Closure can be considered after owner confirmation; direct merge would reintroduce old component history for behavior already present.

### #146 — programme comparison

Unique feature proven in the PR diff:

- local selection state;
- up to three programmes;
- side-by-side comparison;
- remove/clear actions;
- no ranking/winner.

Current `StudentOrientationPanel` uses “Comparez avant de décider” framing but has no `comparisonIds` selection state and no equivalent side-by-side comparison block.

Classification: **UNABSORBED BOUNDED FEATURE SOURCE**.

If wanted, extract this feature onto current `main` as a fresh bounded issue/branch. Do not merge the old stacked PR.

### #147 — plain-language study-process guidance

Adds `/comprendre-les-demarches`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #148 — country-of-qualification guidance

Adds `/selon-votre-pays`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #149 — public help center

Adds `/aide`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #150 — programme information-quality queues

Unique behavior includes:

- active-program count;
- missing-source count;
- missing-deadline count;
- admin filters for those gaps.

Current `main` has a later 30-day verification/revalidation model and a current admin freshness dashboard, but not the same programme quality-card/filter implementation.

Classification: **PARTIAL OVERLAP; EXTRACT ONLY IF THE MISSING-SOURCE / MISSING-DEADLINE QUEUES ARE STILL DESIRED**.

Do not merge the old panel wholesale.

### #151 — public-language source-contract test

This test was written against the old V3 public copy chain.

Classification: **HISTORICAL TEST CONTRACT**.

Do not revive it unchanged. Any useful assertions should be rewritten against the current public copy contract.

### #152 — contextual help entry

Adds student-shell help navigation toward the V3 help center.

Because the target `/aide` page is absent on current `main`, this PR should not be ported independently.

Classification: **DEPENDENT FEATURE SOURCE — ONLY WITH #149 HELP-CENTER EXTRACTION**.

### #153 — multilingual readiness scaffolding

Adds planning docs, locale metadata/scaffolding and tests without a complete translation rollout.

Classification: **PRODUCT-DECISION / DEFERRED FEATURE SOURCE**.

Do not merge as pre-launch cleanup. Revisit only if multilingual rollout becomes an explicit current priority.

### #155 — public help navigation

Depends on the V3 public help/guidance route set.

Classification: **DEPENDENT FEATURE SOURCE**.

Rebuild navigation only after deciding which public guidance routes should exist.

### #156 — sitemap/private indexing boundaries

Current-main evidence:

- `src/app/robots.ts` exists;
- private/auth noindex behavior has since been implemented through later security work;
- `src/app/sitemap.ts` is absent.

Classification: **PARTIALLY SUPERSEDED**.

The indexing boundary is already represented; sitemap generation remains a separable optional extraction.

### #157 — trust/transparency page

Adds `/confiance`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #159 — About AlmaGo page

Adds `/a-propos`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #160 — public breadcrumbs

Adds `PublicBreadcrumbs.tsx` and applies it to V3 public guidance pages.

Current-main component path: absent.

Classification: **DEPENDENT FEATURE SOURCE**.

Only extract if the corresponding public guidance pages are chosen.

### #161 — combined dossier history on student dashboard

Current `main` already exposes:

- document history on the documents surface;
- application-event history on student applications.

What it does not currently expose is the same combined dashboard-level recent-history feed proposed by #161.

Classification: **FUNCTIONAL CORE PRESENT; AGGREGATED DASHBOARD HISTORY OPTIONAL**.

### #162 / #163 — programme and university verification dates

Current `main` already uses verification timestamps and source evidence across the Germany/catalogue model, including programme verification logic and verified source/date concepts in admin workflows.

Classification: **LARGELY SUPERSEDED BY LATER VERIFICATION MODEL**.

Do not merge the old implementation directly. Any missing university-specific parity should be handled against the current schema/API.

### #165 / #166 — catalogue maintenance priority and quality deep links

Current `main` contains a later “Fraîcheur des sources / Révalidations du catalogue Allemagne” admin model with expiry/due-soon handling. The V3 PRs use a different quality-gap model centered on missing source/verification fields for programmes/universities.

Classification: **PARTIAL OVERLAP / DO NOT DIRECT-MERGE**.

Only extract a specific missing queue or deep link if it remains useful after the current revalidation model is stabilized.

### #167 — student notification inbox

Current-main backend evidence:

- `notifications` table exists;
- notification generation exists;
- write boundary is hardened to `read_at`.

Current-main user-facing paths are absent:

- `src/app/student/notifications/page.tsx`;
- notification read-one/read-all API routes;
- `StudentNotificationsPanel.tsx`.

Classification: **BACKEND PRESENT, USER-FACING INBOX UNABSORBED**.

This is a strong bounded extraction candidate if an in-app inbox is still wanted.

### #170 — official sources reference page

Adds `/sources-officielles`.

Current-main path: absent.

Classification: **UNABSORBED PUBLIC FEATURE SOURCE**.

### #171 — local help-center search

Depends on `/aide`, which is absent on current `main`.

Classification: **DEPENDENT FEATURE SOURCE — ONLY AFTER #149**.

### #172 — accessibility/public-404 integration plus historical security/release work

This PR is mixed and therefore unsafe to treat as one feature:

- `/accessibilite` is absent on current `main`;
- V3 public/help/admin work is bundled with security proposal docs and old A44/workflow changes;
- later current-main security and Render release work supersedes much of the operational/security portion.

Classification: **DECOMPOSE; NEVER DIRECT-MERGE**.

Potential extraction: accessibility page only, after a fresh current-main review. Security/release sections must be re-evaluated against current migrations/workflows rather than copied.

### #173 — V3 implementation-status documents

Adds V3 status/plan documents tied to the legacy chain.

Classification: **HISTORICAL DOCUMENTATION / CLOSURE CANDIDATE AFTER FEATURE-PARITY DECISIONS**.

Do not let these become a current source of truth.

### #213 — full V3 validation integration

Current comparison remains 609 commits ahead and 83 behind the review-main snapshot.

It contains real unabsorbed user-facing surface, but also obsolete and later-reimplemented security/release material.

Classification: **ARCHIVE / FEATURE-PARITY SOURCE, NOT A MERGE CANDIDATE**.

## #193 — Germany study/visa worksite plan

Adds a 648-line planning document. The current repository now contains a much later implemented Germany stack and current master-plan state.

Classification: **PLAN RECONCILIATION REQUIRED**.

Do not merge the old plan as current truth. Compare it to the implemented Germany features and current master plan; preserve only still-useful planning/history content.

## Dependency-aware cleanup order for legacy V3

Because the V3 PRs are stacked, cleanup should preserve base branches until all dependent PRs are resolved.

Recommended order:

1. Decide bounded product extractions first: #146, #147, #148, #149, #157, #159, #167, #170, optional pieces from #161/#172.
2. Resolve dependent PRs only after their parent feature decision: #152/#155/#160/#171.
3. Record closure evidence for superseded/overlapped PRs: #142/#143/#145/#151/#156/#162/#163/#165/#166.
4. Close/archive #173 only after the feature-parity record is final.
5. Treat #213 as the final archive/reference node.
6. Only after all open dependents are closed should V3 base branches become eligible for branch-deletion review.

## Important branch rule

Never delete a branch merely because it is not the head of an open PR.

A branch may still be the **base of another open PR**. The active example remains:

- `release/v3-validation-20260925` — base of #213.

Deletion preflight must exclude both open-PR heads and open-PR bases.

## Conclusion

The legacy V3 backlog is not one cleanup action.

It contains three materially different things:

1. behavior already represented on current `main`;
2. bounded product features that remain genuinely absent;
3. mixed historical integration/release material that should only be used as reference.

This classification supports closing stale PR noise later without discarding useful product work or reviving obsolete implementation stacks.
