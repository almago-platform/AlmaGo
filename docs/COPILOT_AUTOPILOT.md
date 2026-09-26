# AlmaGo Copilot Autopilot

AlmaGo extends the existing Master Orchestrator with an opt-in GitHub Copilot cloud-agent path. It does not replace PR CI, Browser Quality, the Instant Supervisor, Merge Readiness, Autonomous Codex, AI Queue, or the Patch Bridge.

## Safety defaults

The controller is disabled unless `ALMAGO_COPILOT_AUTOPILOT_ENABLED=true`. Start with `ALMAGO_COPILOT_AUTOPILOT_DRY_RUN=true`.

The user token is read only from the Actions secret `ALMAGO_COPILOT_AUTOPILOT_TOKEN`. It must never be copied into issues, prompts, comments, artifacts, or logs.

The Agent Tasks REST API is public preview. Revalidate the supported model allowlist and required GitHub permissions before changing production policy.

## Pilot sequence

1. Dry-run: validate the plan, token presence, dependencies and locks without creating an Agent Task.
2. SANDBOX-01: documentation-only cloud-agent task, one PR, no automatic merge.
3. Revision pilot: resume on the same branch/PR after bounded supervisor feedback.
4. Two disjoint tasks, then three disjoint tasks using writable-path locks.
5. Replace the LOT7 scaffold only with an approved, exact machine-readable contract.
6. Expand by waves. HUMAN_GATE remains mandatory for secrets, billing, production, destructive operations, real data, critical Auth/RLS/storage, and ambiguous regulatory/business decisions.

## Persistent locks

The controller stores append-only JSON lock snapshots in block-issue comments. It writes `DISPATCHING` before the external Agent Tasks call so a restart does not silently double-dispatch the same block.

Locks track block, task, model/persona, base/head, PR, expected HEAD, writable and forbidden paths, lease and revision count.

## Canonical validation

PR CI remains the canonical source-code validation. Browser Quality is required only when changed UI/product paths make it applicable. Supervisor and Merge Readiness must bind their conclusions to the same remote HEAD.

Automatic merge remains disabled during this pilot.
