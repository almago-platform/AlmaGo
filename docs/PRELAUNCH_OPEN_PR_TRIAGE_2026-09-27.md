# AlmaGo — legacy V3 PR triage and extraction evidence

Date: 27 September 2026  
Review base: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: classification only.

## Status update

The legacy V3 PR chain described below has now been **closed without merge**.

Issue **#418 — [V3 ARCHIVE] Reconcile legacy V3 features into current-main extraction backlog** is the canonical current record for deciding which bounded features should be reimplemented from current `main`.

Therefore this document is no longer an “open PR” action list. It is preserved as the evidence explaining why closure of the stale PR containers does **not** imply that every feature was shipped or rejected.

No V3 branch deletion is authorized by this document.

## Current release / pre-launch work — still open and isolated

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

The legal/privacy gate remains human-owned.

## Legacy V3 classification preserved for #418

### Functionally or largely superseded

- #142 — language/trust copy: later public/student/admin redesigns supersede most of the old copy layer; compare wording only.
- #143 — role/trust: semantic core is already present; only the dedicated standalone role block remains optional.
- #145 — official-source visibility: current orientation/admin flows already expose and verify official-source evidence.
- #151 — old public-language contract: historical test contract only.
- #156 — private indexing boundary is represented later; sitemap remains optional.
- #162/#163 — old verification-date implementation is largely superseded by the later verification model.
- #165/#166 — partial overlap with the later revalidation/freshness model; extract only a specific missing queue if still needed.

### Unabsorbed bounded feature sources

- #146 — selectable side-by-side comparison of up to three programmes.
- #147 — `/comprendre-les-demarches`.
- #148 — `/selon-votre-pays`.
- #149 — `/aide`.
- #157 — `/confiance`.
- #159 — `/a-propos`.
- #167 — student notification inbox + related read APIs.
- #170 — `/sources-officielles`.

### Optional / partial-overlap feature sources

- #150 — missing-source/missing-deadline programme quality queues.
- #161 — combined dashboard-level dossier history; underlying document/application history already exists.
- #172 — accessibility page only; the bundled security/release material is historical and must not be copied wholesale.

### Dependent feature sources

- #152 — contextual help entry, only if the help center is retained.
- #155 — public help navigation, only after route decisions.
- #160 — public breadcrumbs, only with retained guidance pages.
- #171 — local help-center search, only if #149 is reimplemented.

### Product-decision / deferred source

- #153 — multilingual readiness scaffolding/policy.

### Historical/archive-only containers

- #173 — old V3 implementation-status documents.
- #213 — full 609-commit V3 validation/integration tree; archive/feature-parity source only, never a current-main merge candidate.

## Current-main evidence behind key classifications

### #146 programme comparison

The old PR adds local `comparisonIds` selection, up to three programmes, side-by-side facts and clear/remove actions.

Current `StudentOrientationPanel` uses comparison-oriented copy but does not contain that dedicated selection/comparison interaction.

### #167 notifications

Current main has:

- the `notifications` table;
- notification generation;
- a hardened `read_at` write boundary.

Current main lacks the old V3 user-facing notification page/panel/read-one/read-all routes.

### #161 dossier history

Current main already exposes:

- document history on the documents surface;
- application event history on the applications surface.

The old V3 proposal adds a combined recent-history feed on the student dashboard. That aggregation remains optional rather than a missing data foundation.

### #150/#162/#163/#165/#166 catalogue verification

Current main has a later 30-day catalogue freshness/revalidation model and verified-source fields across current Germany/catalogue workflows.

The old V3 chain contains a different set of quality queues and explicit programme/university verification UI. These are not safe to merge wholesale but may still inform a bounded enhancement.

## #193 — Germany study/visa worksite plan

Adds a 648-line planning document based on a much older repository state.

Classification: **PLAN RECONCILIATION REQUIRED**.

Do not merge it as current truth. Compare it with the implemented Germany stack and current master plan; preserve only useful historical/planning content.

## Extraction rule

For anything retained from #418:

1. start from current `main`;
2. verify current product value and overlap;
3. create one bounded issue/branch;
4. do not resurrect the old stacked V3 chain;
5. re-check Auth/RLS/security assumptions instead of copying old proposals;
6. close the extraction task only after current-main validation.

## Branch rule after PR archive

The V3 PR containers are closed, but their branches remain reference material.

Do not delete the V3 branch family until #418 records extraction/decline decisions for the retained feature set.

## Conclusion

The V3 archive now has a clean semantic model:

- stale PR containers: closed;
- feature intent: preserved in #418;
- old branches: retained temporarily as source evidence;
- future implementation: fresh branches from current `main`;
- old integration stack: never revived as a release candidate.
