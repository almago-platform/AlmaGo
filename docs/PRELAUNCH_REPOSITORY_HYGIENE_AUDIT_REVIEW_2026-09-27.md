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


## Bounded feature-parity pass for #143 and #144

A focused current-main comparison was completed after the initial classification.

### #143 — what is actually unique

Compared with its own base branch, #143 introduces only five public-surface changes:

- homepage insertion of `HomeRoleSection`;
- a new `HomeRoleSection.tsx`;
- small navigation/footer/trust copy changes in `HomeHeader`, `HomeClosing` and `HomeTrustSection`.

Its dedicated role section explains four boundaries:

1. AlmaGo organizes the dossier and next actions;
2. an orientation suggestion is not an admission or eligibility decision;
3. universities/authorities keep their own decision authority;
4. official sources remain the reference for requirements, deadlines and formalities.

Current `main` already preserves most of this semantic contract elsewhere:

- the homepage FAQ says AlmaGo does not guarantee admission or visa;
- the FAQ states the official source remains the reference;
- the footer states AlmaGo is an independent platform and that admissions/visas/official decisions belong to competent bodies;
- the current student dashboard says the student keeps decisions and AlmaGo keeps the steps readable.

What current `main` does **not** preserve is the same standalone, detailed public `HomeRoleSection` presentation.

Refined classification: **SEMANTIC CORE MOSTLY SUPERSEDED; STANDALONE PUBLIC ROLE EXPLANATION OPTIONAL TO EXTRACT**.

Do not merge #143. If a dedicated public role block is still desired, reimplement it against the current homepage composition rather than reviving the old component/style system.

### #144 — what is actually unique

Compared with #143, #144 contains exactly two files:

- `src/app/student/checklist/page.tsx`;
- `src/app/student/page.tsx`.

Its unique copy intent is to make responsibility clearer by replacing or emphasizing labels such as:

- `Suivi par AlmaGo` → `En cours chez AlmaGo`;
- dashboard pills `À faire par vous` and `En cours chez AlmaGo`;
- a stronger `Où en est votre dossier ?` / next-step framing.

Current `main` already expresses the same responsibility model in the redesigned student experience:

- checklist items explicitly show `Responsable : vous`;
- waiting items explicitly show `Responsable : AlmaGo`;
- the dashboard separates `À traiter` from `Suivi AlmaGo`;
- the next action carries an explicit owner label;
- the hero copy centers “Voici ce qui compte maintenant.”

Refined classification: **FUNCTIONALLY SUPERSEDED BY CURRENT STUDENT V2 COPY AND RESPONSIBILITY UI**.

No copy extraction is required before closing #144, provided the owner accepts `Suivi AlmaGo` / `Responsable : AlmaGo` as the current terminology.


## #213 extraction inventory against current main

A path-level extraction scan was completed for files that #213 adds relative to its own base.

#213 adds **84 files** relative to `release/v3-validation-20260925`. Current `main` still does not contain any of the following added application pages:

- `/a-propos`;
- `/accessibilite`;
- admin students list/detail;
- `/aide`;
- `/comprendre-les-demarches`;
- `/confiance`;
- `/parcours-allemagne`;
- `/selon-votre-pays`;
- `/sources-officielles`;
- student `/echeances`;
- student `/notifications`.

The two notification mutation/read-all API routes added by #213 are also absent from current `main`.

The following added components are absent from current `main`:

- `AdminStudentCase.tsx`;
- `AdminStudentsPanel.tsx`;
- `SwitchAccountButton.tsx`;
- `HomeRoleSection.tsx`;
- `PublicBreadcrumbs.tsx`;
- `StudentNotificationsPanel.tsx`.

Among #213-added library files, `src/lib/application-intake.ts` is present on current `main`; the other added helper paths from that set are absent.

None of the **39 tests added by #213 relative to its base** are present under the same paths on current `main`.

This does **not** prove that all missing files should be restored. Some security/business behavior has since been reimplemented differently on current main. It does prove that #213 contains real feature surface that has not been absorbed path-for-path and therefore cannot be labelled “fully superseded”.

Refined #213 treatment:

- **DO NOT MERGE** the 609-commit stack;
- **DO NOT CLOSE AS FULLY SUPERSEDED** yet;
- use it as a feature-parity source;
- extract candidate features one by one against current product priorities;
- re-review security proposals against current Supabase/RLS state before considering any port.

Suggested first extraction candidates, because they are user-facing and bounded:

1. public help / official-sources / accessibility information;
2. student deadlines;
3. student notifications;
4. admin student-case list/detail.

Each candidate should be assessed independently for current product value before implementation.


## V3 feature-parity matrix

A second bounded pass checked whether the most useful #213 surfaces are already supported by current data/security contracts or only by the old UI.

| V3 surface | Current-main state | Classification | Pre-launch treatment |
| --- | --- | --- | --- |
| Student notifications | `notifications` table, own-read RLS, admin inserts, document/application notification producers, and `read_at`-only student write boundary already exist; UI/API routes are absent | **BACKEND READY / UI MISSING** | High-value extraction candidate, but defer implementation until current release chain stabilizes |
| Student deadlines center | application `deadline` + `next_action` are already used on dashboard/applications; dedicated `/student/echeances` is absent | **FUNCTION PARTIAL / DEDICATED VIEW MISSING** | Optional extraction after release gate; not a blocker because critical next deadline is already surfaced |
| Admin students list/detail | current admin has operational queues but no `/admin/students` case workspace | **MISSING OPERATIONAL SURFACE** | Valuable Admin V2 follow-up; requires data-minimization review because the detail view aggregates broad profile/history/note data |
| Public help center | homepage FAQ exists; dedicated `/aide` route is absent | **PARTIAL** | Useful but non-blocking; recompose against current Brand V2 instead of copying V3 layout |
| Official sources page | current student pathway/orientation already exposes official-source links and freshness framing; dedicated public directory is absent | **PARTIAL** | Candidate after factual source review; do not port stale URLs blindly |
| Accessibility page | no dedicated public accessibility route found | **MISSING / NEEDS FACTUAL REVIEW** | Do not copy old claims without an actual accessibility audit and human review |
| About / trust / process public routes | much of the semantic content is already embedded in homepage/footer/FAQ/student pathway | **PARTIALLY SUPERSEDED** | Only extract if navigation/content strategy calls for dedicated SEO/information pages |

### Notifications are unusually extraction-ready

Current `main` already creates notifications from trusted backend workflows:

- document review writes document-status notifications;
- application status changes write application notifications;
- RLS allows users to read only their own notifications;
- students may update only `read_at`, reinforced by migration `0029_profile_notification_write_boundary.sql`.

Therefore the V3 notification page does **not** require a new notification data model. The missing work is primarily current-design UI plus narrow PATCH endpoints that preserve the existing student-role boundary and `read_at`-only write contract.

This makes notifications a safer extraction candidate than reintroducing the entire V3 stack.

### Admin student case needs a stricter privacy gate

The old V3 admin student-case page combines:

- identity/profile fields;
- documents;
- checklist;
- recommendations;
- applications/events;
- student history;
- private admin notes.

That is operationally useful, but it creates a broad single-screen personal-data surface. Any new implementation should be designed from current Admin V2 and A38 data-minimization requirements, not copied wholesale from #213.

## Branch-cleanup interpretation

The current count of 153 branches without open PRs is only a discovery set, not a deletion list.

A branch should be considered a strong deletion candidate only when at least one of these is proven:

1. its tip is reachable from current `main`;
2. all unique commits were intentionally superseded by a later merged implementation;
3. its content is preserved in an explicit archive branch or immutable PR history and the branch has no remaining operational purpose.

Branches tied to unresolved V3 feature parity, experiments that are still under comparison, backups intentionally retained by the owner, or active infrastructure investigations should remain until separately reviewed.


## Branch integration-evidence pass

A stronger branch proof pass was completed against the review snapshot.

Method:

- fetch all current branches;
- fetch all closed pull requests;
- keep only merged pull requests;
- compare each current branch tip SHA with the merged PR head SHA that used the same branch name.

Result:

- current branches: **193**;
- current branch tips that exactly match a merged PR head: **103** (excluding `main`);
- branches whose name has merged-PR history but whose current tip moved after that merge: **2**.

The **103 exact-tip matches are strong cleanup candidates** because their present branch tip is the exact commit GitHub records as merged through a pull request.

This is stronger evidence than merely saying a branch name once appeared on a merged PR.

However, even these are still not deleted by this audit. A separate destructive cleanup step should:

1. exclude any branch intentionally retained as an archive/experiment/reference;
2. exclude branches named by active automation or external tooling;
3. confirm no open PR currently uses the branch;
4. delete only after explicit owner approval.

The two branches whose tips moved after a historical merge must be reviewed separately; their current tips are not proven integrated by the older merge record.

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


## Unused-code evidence

A targeted current-main search found one strong public-component cleanup candidate:

### `HomeProductPreview.tsx`

Current references to `HomeProductPreview` are limited to:

- the component file itself;
- `tests/homepage-v6-visual-density.test.mjs`;
- `tests/homepage-v7-1-product-showcase.test.mjs`;
- `tests/homepage-v7-immersive.test.mjs`.

No current application page imports the component.

Classification: **RUNTIME-UNUSED, TEST-HISTORICAL CLEANUP CANDIDATE**.

Do not delete it in the hygiene audit itself. A bounded cleanup PR should first update/remove only the historical tests that still treat the retired product-preview composition as a source contract, then remove the component if no active PR depends on it.

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
