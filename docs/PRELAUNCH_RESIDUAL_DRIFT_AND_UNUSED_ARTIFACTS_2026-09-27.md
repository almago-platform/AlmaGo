# AlmaGo — residual pre-launch drift and unused-artifact inventory

Date: 27 September 2026  
Current main reviewed: `0a37fd411880744596ca3b2ed68086591e311deb`

Purpose: identify the remaining **small, concrete hygiene debt on current main** after the large V3 archive cleanup, without mutating product/runtime behavior.

No file listed here is deleted or rewritten by this inventory.

## 1. Runtime/deployment wording still stale on current main

A current-main search for `Vercel` shows several categories. They should not all be treated the same.

### Already covered by open release PRs

These current-main references are stale today but already have an isolated replacement in an open PR:

| Current-main file | Problem | Existing fix |
| --- | --- | --- |
| `docs/observability.md` | still describes Vercel as runtime context | #401 |
| `docs/safe-automerge.md` | still requires Vercel success | #414 |
| `.github/workflows/almago-safe-automerge.yml` | still looks for commit status context `Vercel` | #414 |
| `docs/release-checklist.md` | still requires exact-main Vercel success | #407 |
| `.github/workflows/almago-final-release-gate.yml` | final gate still named/implemented around Vercel | #407 |
| `docs/AYOUB_ACTIONS_MINIMALES.md` | still presents Vercel as runtime context | #416 |
| `docs/USER_ACTION_REQUIRED.md` | contains old A43/Vercel-era setup guidance | #416 |

Do not create duplicate fixes for those paths while the listed PRs remain open.

## 2. Residual documentation drift not covered by those open PRs

### `docs/authenticated-e2e.md`

Current text still says A43 activation requires:

- repository variable `ALMAGO_AUTH_E2E_ENABLED=true`;
- six secrets documented in `docs/USER_ACTION_REQUIRED.md`.

That no longer matches the current A43/owner-action contract, where the remaining sensitive values are the two dedicated test-account passwords and the obsolete enable toggle is being removed from owner guidance.

Classification: **STALE CURRENT-MAIN DOC — FOLLOW-UP REQUIRED**.

Do not edit it inside #421 because #405/#412 are still changing the A43 workflow contract. Reconcile this document after the final combined A43 workflow is known.

### Legal/privacy factual drafts

These files still state that Vercel provides hosting/deployment:

- `docs/legal-privacy-draft.md`;
- `docs/A38_OWNER_CONFIRMATION.md`;
- `docs/data-processing-inventory.md`.

The canonical runtime is now Render, but these files belong to the A38 factual/legal review boundary.

Classification: **FACTUAL DRIFT INSIDE HUMAN/LEGAL GATE**.

Required treatment:

1. do not mechanically replace “Vercel” with “Render” in isolation;
2. first confirm the actual production/subprocessor facts that will apply at launch;
3. update all three A38 facts consistently;
4. preserve the human legal review requirement;
5. do not claim a provider/subprocessor role that has not been factually verified.

This belongs to A38/#66/#138, not ordinary repository cleanup.

## 3. Vercel compatibility artifacts that are not automatically stale

### `vercel.json`

Current repository still contains a Vercel ignore command.

### `tests/vercel-ignore.test.mjs`

The test verifies that the Vercel integration skips docs-only/non-app commits while building app/config changes.

Classification: **COMPATIBILITY / INTEGRATION ARTIFACT — DO NOT DELETE BLINDLY**.

Even though Render is canonical, these files can still be useful while a Vercel Git integration/status context exists on the repository. Removing the files does not itself guarantee that the external Vercel integration disappears.

Decision should be made only after:

- #414 removes Vercel from merge-readiness semantics;
- the repository owner decides whether Vercel integration should remain connected at all;
- external Vercel status/build behavior is verified.

If Vercel is fully disconnected later, these two files become straightforward cleanup candidates.

## 4. Runtime-unused component candidates

A current-main code search found three component files with **no runtime import from another `src/**` file**.

### `src/components/public/HomeProductPreview.tsx`

Evidence:

- the current homepage `src/app/page.tsx` does **not** import/render it;
- repository references are the component itself plus historical homepage tests;
- current homepage renders Hero → Quick Access → Photo Band → Journey → Trust → FAQ → Final CTA.

Historical tests still reference the retired product-preview composition:

- `tests/homepage-v6-visual-density.test.mjs`;
- `tests/homepage-v7-1-product-showcase.test.mjs`;
- `tests/homepage-v7-immersive.test.mjs`.

Classification: **STRONG UNUSED-RUNTIME CANDIDATE**.

Do not delete until #399 settles the current homepage source-contract test baseline. After #399, remove the dead component and retire/update only tests that still encode the old composition.

### `src/components/admin/AdminNav.tsx`

Evidence:

- no current `src/app/**` or other runtime component imports `AdminNav`;
- `src/app/admin/layout.tsx` renders `AppShell role="admin"`;
- search references are the file itself and an autonomy test.

Classification: **STRONG UNUSED-RUNTIME CANDIDATE**.

Removal should verify whether the autonomy test intentionally protects the old path/name or can be updated to the current `AppShell` architecture.

### `src/components/student/StudentNav.tsx`

Evidence:

- no current runtime source imports `StudentNav`;
- `src/app/student/layout.tsx` renders `AppShell role="student"`;
- remaining references are the file itself, a historical/config reference and a UI test.

Classification: **STRONG UNUSED-RUNTIME CANDIDATE**.

As with `AdminNav`, removal should be a small dedicated cleanup after release-critical workflow/test work stabilizes.

## 5. Why these components are not removed in the hygiene PR

Deleting them now would mix three different concerns:

- release-critical source-contract repair (#399);
- current product/runtime behavior;
- historical-test cleanup.

That would make the pre-launch release chain harder to reason about.

Recommended sequence:

1. land/resolve #399;
2. confirm current homepage/authenticated-shell tests;
3. create one bounded “remove retired components” PR;
4. delete only components with zero runtime references;
5. update only tests/config entries that explicitly encode the retired architecture;
6. run build/type/lint/source-contract checks.

## 6. Residual drift that is intentionally deferred

The following are **not** pre-launch blockers unless explicitly promoted:

- V3 feature extraction backlog #418 — post-launch;
- Germany LOT 9–19 backlog #420 — post-launch;
- optional removal of Vercel compatibility files after integration decisions;
- removal of retired UI components after release-critical test stabilization.

## 7. Pre-launch hygiene stop condition

Repository hygiene is sufficiently complete for pre-launch when:

- active release PRs no longer contain stale Vercel-era release semantics;
- A38 factual provider/runtime wording is reviewed and corrected as part of the human/legal gate;
- `docs/authenticated-e2e.md` matches the final A43 workflow contract;
- branch cleanup is either executed from #419 or explicitly deferred;
- dead components are recorded and isolated from release-critical changes;
- no post-launch backlog is misrepresented as an A45 blocker.

The remaining work should now be **small and bounded**, not another repository-wide cleanup wave.
