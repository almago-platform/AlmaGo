# AlmaGo Copilot Autopilot

AlmaGo extends the existing Master Orchestrator with an opt-in GitHub Copilot cloud-agent path. It does not replace PR CI, Browser Quality, the Instant Supervisor, Merge Readiness, Autonomous Codex, AI Queue, or the Patch Bridge.

## Safety defaults

The controller is disabled unless `ALMAGO_COPILOT_AUTOPILOT_ENABLED=true`. Start with `ALMAGO_COPILOT_AUTOPILOT_DRY_RUN=true`.

The user token is read only from the Actions secret `ALMAGO_COPILOT_AUTOPILOT_TOKEN`. It must never be copied into issues, prompts, comments, artifacts, or logs.

The Agent Tasks REST API is public preview. Revalidate the supported model allowlist and required GitHub permissions before changing production policy.

Dry-run is non-destructive: it may read current Agent Task, pull-request, workflow and supervisor evidence, but it does not create Agent Tasks, append lock comments, close issues, merge PRs, or mutate repository state.

## Phase 2 lifecycle

The controller now owns the bounded lifecycle after an Agent Task finishes:

`QUEUED / IN_PROGRESS -> CI -> REVIEW -> MERGE_READY -> DONE`

A completed Agent Task is not treated as finished work. The controller resolves the exact pull-request artifact and current remote HEAD, checks the branch/base contract, checks the changed-file scope, reads canonical `AlmaGo PR CI`, applies `AlmaGo Browser Quality` only when UI paths require it, and accepts supervisor evidence only when `Reviewed HEAD` matches the current 40-character PR HEAD.

Validation or supervisor feedback can enter a bounded revision loop:

`CI/REVIEW -> REVISE -> existing PR branch -> CI`

Revisions reuse the existing `head_ref`; they do not create replacement PRs. The global revision budget remains `maxRevisionAttempts` (currently 3). Scope violations, forbidden-path changes, base/head mismatches, merge conflicts, supervisor `BLOCKED`, expired leases, and exhausted revision budgets fail closed instead of widening the contract.

`MERGE_READY` is a tracked state, not a merge command. With `noAutomaticMerge=true`, the controller waits. After the PR is actually merged, the block becomes `DONE` and its tracking issue is closed.

## Pilot sequence

1. Dry-run: validate the plan, token presence, dependencies, locks, and lifecycle evidence without mutation.
2. SANDBOX-01: documentation-only cloud-agent task, one PR, no automatic merge.
3. Revision pilot: resume on the same branch/PR after bounded CI or supervisor feedback.
4. Two disjoint tasks, then three disjoint tasks using writable-path locks.
5. Replace the LOT7 scaffold only with an approved, exact machine-readable contract.
6. Expand by waves. HUMAN_GATE remains mandatory for secrets, billing, production, destructive operations, real data, critical Auth/RLS/storage, and ambiguous regulatory/business decisions.

## Persistent locks

The controller stores append-only JSON lock snapshots in block-issue comments. It writes `DISPATCHING` before an external Agent Tasks call so a restart does not silently double-dispatch the same block.

Locks track block, task, model/persona, base/head, PR, expected HEAD, writable and forbidden paths, lease, revision count, lifecycle reason, and the last exact-HEAD validation snapshot.

## Canonical validation

PR CI remains the canonical source-code validation. Browser Quality is required only when changed UI/product paths make it applicable. Supervisor evidence must bind its conclusion to the same remote HEAD.

Automatic merge remains disabled. Enabling autonomous merge requires a separate reviewed change and repository-level required checks on the protected default branch.


## Dynamic post-launch contracts

After A45 is complete, the Continuous Improvement discovery/compiler stack may produce open issues labeled `almago-improvement-contract` and `almago-autopilot-contract-ready`. The controller treats those issues as untrusted input and revalidates the embedded block before use.

A dynamic block is loaded only when its source signal is still open and non-human-gated, its base is `main`, its merge class is `AUTONOMOUS_SAFE`, and it contains 1–3 exact existing non-critical `src/**` writable files. The controller scans open pull requests and converts their changed files into external path locks; any overlap blocks new dispatch.

Dynamic contracts do not bypass the normal lifecycle. They still create an Autopilot block issue, launch through Agent Tasks, pass exact-HEAD CI/Browser/Supervisor gates, obey the bounded revision budget, and stop at `MERGE_READY`. Automatic merge remains disabled.


## Safe merge executor

The optional safe-merge executor is intentionally double-gated. A real merge requires both `ALMAGO_AUTOPILOT_AUTOMERGE_ENABLED=true` and `ALMAGO_AUTOPILOT_AUTOMERGE_DRY_RUN=false`. If the dry-run variable is absent, the executor remains in dry-run mode.

Even with both variables set, the executor refuses to merge unless the active default-branch GitHub ruleset requires pull requests and a **strict required status check for the PR CI job `verify`**. It then rechecks the exact PR HEAD, current `main` HEAD, same-repository branch, writable/forbidden scope, critical paths, canonical PR CI, conditional Browser Quality, exact-HEAD Supervisor approval, dynamic signal/contract provenance when applicable, and collisions with every other open PR.

All mutable evidence is fetched again immediately before merge. At most one PR can be squash-merged per executor run. The normal Autopilot reconciliation records `DONE` on the next cycle.

This executor must stay disabled until repository branch/ruleset protection is hardened and the canonical launch/release gates are settled.

## Pre-launch self-healing lane

Before A45 is complete, `AlmaGo Prelaunch Self-Heal` runs on pushes to `main`, hourly, and by manual dispatch. This lane is intentionally narrower than post-launch Continuous Improvement.

It observes TypeScript and lint only. A live Agent Task is allowed only when deterministic evidence identifies at most three exact existing non-critical `src/**` files. Ambiguous evidence, missing files, protected paths, API/Auth/Supabase surfaces, workflows, dependencies, tests, migrations and other critical paths fail closed.

The lane builds a temporary one-block Autopilot plan with `maxConcurrentTasks=1`, `maxRevisionAttempts=2`, `noAutomaticMerge=true`, then runs the normal controller with at most one new task. Open pull requests remain external collision locks, and the resulting repair PR must still pass the normal CI/Browser/Supervisor lifecycle.

This pre-launch lane does not depend on the repository-wide Autopilot dry-run variable because its own workflow is the explicit live-dispatch boundary. Its authority stops at a bounded repair PR / `MERGE_READY`: it cannot merge, deploy or bypass A38, A43, A44 or A45. Once A45 is complete, the lane becomes inactive and the post-launch Continuous Improvement stack takes over.

## Pre-launch measured performance loop

A separate pre-launch performance workflow measures the production build with Lighthouse. It is evidence-driven and does not run after A45.

The homepage budget is 0.80 for the Lighthouse performance category. A task is eligible only when the homepage is below that budget while accessibility remains at least 0.95 and SEO/best-practices remain at least 0.90. The login page is measured for performance/accessibility/best-practices but is not given an SEO category assertion because its deliberate no-index policy is not a public SEO defect.

When eligible, exactly one Codex Agent Task may work on three public files: `HomeHeader.tsx`, `HomeHero.tsx` and `HomeJourneySection.tsx`. The prompt includes measured LCP, Total Blocking Time, Max Potential FID, responsive-image waste and unused-JavaScript evidence. It must preserve content, accessibility, keyboard behavior, SEO and the current visual direction.

Like the lint/typecheck self-heal lane, this loop uses `maxConcurrentTasks=1`, a revision budget of two and `noAutomaticMerge=true`. Open PR collisions and the normal exact-HEAD lifecycle still apply.

