# AlmaGo — Multi-Agent Operating Model

**Reference date:** 2026-09-26

## Goal

Use several coding models in parallel as sustained, bounded work blocks that maximize visible product progress without letting agents edit the same surface or merge unreviewed work.

GitHub is the source of truth. Every implementation task must have an explicit issue/task contract, a dedicated branch, a dedicated pull request, validation evidence, and a supervisor review.

## Authority and responsibilities

### ChatGPT Supervisor

ChatGPT is the orchestration and final review layer for agent work.

Responsibilities:
- maintain the product and technical plan;
- define large enough bounded work blocks with ordered internal checkpoints on non-overlapping writable surfaces;
- define the exact base branch and owned paths for each task;
- detect collisions between open PRs before assigning work;
- work directly on architecture, documentation, audits, small isolated fixes, and integration tasks when useful;
- review every agent PR against the task contract, security boundaries, tests, and current plan;
- issue one of the canonical review outcomes:
  - `SUPERVISOR: APPROVED`
  - `SUPERVISOR: APPROVED_WITH_CHANGES`
  - `SUPERVISOR: REVISE`
  - `SUPERVISOR: BLOCKED`

No agent may merge its own work. A green CI run is required evidence, not an automatic authorization to merge.

### Codex — Core implementer

Primary scope:
- domain logic;
- API/backend work;
- database-safe application logic;
- deterministic workflow/state-machine implementation;
- targeted bug fixes;
- sequential Germany worksite blocks already assigned to Codex.

Current protected ownership:
- the stacked Germany chain beginning with PR #214 and currently extending through PR #233;
- follow-up implementation on that chain until the supervisor explicitly reassigns a block.

Codex must continue to follow the Codex-specific delivery bridge in `AGENTS.md`.

### Gemini — Student UX and accessibility specialist

Preferred runtime model when launched through GitHub Copilot cloud agent: **Gemini 3.5 Flash**.

Primary scope:
- student-facing UX;
- responsive behavior;
- accessibility;
- interaction clarity;
- multilingual presentation and copy consistency;
- frontend/component tests related to its assigned UI block;
- visual/UX review reports.

Default forbidden scope unless an issue explicitly overrides it:
- Supabase migrations;
- RLS/Auth changes;
- GitHub Actions workflows;
- secrets;
- broad backend/domain refactors;
- files already owned by another open implementation PR.

Gemini receives one bounded frontend block at a time. A block may span several related student-facing files when every writable path is explicit and does not overlap another active implementation block.

### Claude — Deep engineering, debugging and hardening specialist

Preferred runtime model when launched through GitHub Copilot cloud agent: **Claude Sonnet 5** when available in the selector.

Primary scope:
- deep codebase analysis and root-cause debugging;
- complex isolated implementation blocks explicitly assigned by the supervisor;
- integration review across related PRs;
- state invariants, edge cases and failure modes;
- regression tests and hardening;
- performance or robustness issues that can be demonstrated.

Default mode is **understand-first / tests-first**. Production-code edits require an explicit writable-path grant in the task.

Default forbidden scope unless an issue explicitly overrides it:
- Supabase migrations;
- RLS/Auth policy redesign;
- GitHub Actions workflows;
- secrets;
- broad refactors;
- overlapping files with another active implementation task.

## Block execution mode

The default unit of work is a **block**, not an isolated micro-task, whenever scope can be bounded safely.

A production block should normally:
- contain several ordered checkpoints that form one coherent outcome;
- keep exact writable paths and an exact base SHA/branch;
- continue automatically from checkpoint to checkpoint without another user prompt;
- include implementation, focused regression coverage, and integration validation when they belong to the same bounded surface;
- favor visible vertical progress over audit-only output;
- stop early only for a real blocker, scope collision, moved base, or explicit safety boundary.

Audit-only work is appropriate when production edits would be unsafe or ownership is not granted. Otherwise, a deep-engineering block should prefer the sequence **understand → test → bounded fix → validate** when the contract explicitly authorizes those paths.

### Continuous / overnight utilization

The user should be able to launch a large block once and let the agent work through its internal checkpoints for several hours.

The supervisor should:
- keep the next dependency-safe block prepared before the active wave completes;
- review new PR HEADs and CI as soon as they are available;
- issue `APPROVED`, `REVISE`, or `BLOCKED` without requiring the user to relay reports;
- reuse an existing agent session for revision when supported;
- maintain an integration/preview checkpoint so approved work becomes visible in the product quickly.

Do not assume a brand-new GitHub Copilot cloud-agent session can start unattended unless an actual launch mechanism is available. If a new session needs a manual launch, prepare the complete next block in advance so the user's intervention is a single launch action.

### Integration / preview rule

Large feature chains should periodically converge into a dedicated integration/preview state. The purpose is to let the team evaluate real student-visible behavior together instead of accumulating a long stack of isolated PRs.

Integration issues discovered at this checkpoint become bounded fixes. They do not automatically trigger another broad audit cycle.

## Branch naming

Use one branch per task:

- `agent/codex/<issue>-<slug>`
- `agent/gemini/<issue>-<slug>`
- `agent/claude/<issue>-<slug>`
- `agent/chatgpt/<issue>-<slug>`

Existing historical branches do not need to be renamed.

## Mandatory task contract

Every task given to an agent must state:

1. **Agent / runtime model**
2. **Exact base branch or base SHA**
3. **Goal**
4. **Owned writable paths**
5. **Read-only context paths**
6. **Forbidden paths**
7. **Acceptance criteria**
8. **Required validation commands**
9. **Expected deliverable**
10. **Stop condition**

If writable paths overlap with another active implementation PR, the task is blocked until the supervisor resolves ownership.

## Concurrency rules

Parallel work is allowed only when the writable surfaces are disjoint.

Allowed:
- Codex implements backend contract while Gemini reviews an already-stable UI surface.
- Claude writes isolated regression tests while another agent works on unrelated documentation.
- ChatGPT audits PRs and prepares future task contracts while implementation continues.

Not allowed:
- two agents editing the same production file;
- two agents creating competing migrations;
- one agent rebasing or rewriting another agent's active branch;
- an agent changing the base branch without supervisor approval;
- an agent expanding scope because it found adjacent cleanup work.

## Pull request requirements

Each agent PR must include:
- agent name;
- requested base branch;
- actual head SHA;
- exact files changed;
- validation commands and results;
- known limitations;
- explicit statement that no out-of-scope files were intentionally changed.

The agent stops only after the **entire assigned block** is complete, then opens/updates its PR and publishes the required evidence. Internal checkpoints are not stop points unless the contract explicitly says so.

## Review gate

The supervisor checks:
- task/base correctness;
- file ownership;
- behavior and regression risk;
- security boundaries;
- tests/typecheck/lint/build as applicable;
- `git diff --check`;
- interaction with all currently open stacked PRs.

A PR is not considered accepted until the supervisor publishes a canonical review outcome.

## Current allocation — 2026-09-26

### Active sprint

Parent sprint: **#248 — Germany visible progress**.

- **Codex #245** — LOT 3 workflow reliability block, checkpoints C1 → C2 → C3.
- **Gemini #246** — visible student experience block, checkpoints G1 → G2 → G3.
- **Claude #247** — LOT 4 evidence hardening block, checkpoints H1 → H2 → H3.
- **Supervisor #249** — Germany integration/preview checkpoint after the three agent blocks are accepted.

### Codex

Own backend/domain/database-safe implementation and workflow reliability. Prefer a complete functional block with tests over a sequence of tiny bug-fix prompts.

### Gemini

Own coherent student-facing UX blocks: orientation, application progress, journey clarity, responsive behavior, accessibility, and copy. Changes remain inside explicitly granted frontend/test paths.

### Claude

Own deep hardening blocks: invariants, edge cases, regression coverage, root-cause debugging, and integration-readiness review. Production edits remain opt-in through explicit writable paths.

### ChatGPT Supervisor

Own block planning, collision checks, exact-base verification, review, integration, and preparation of the next wave before the current one finishes.

## Product boundaries that no agent may weaken

- Auth and Student/Admin isolation remain strict.
- RLS and private storage must not be weakened.
- No secret is exposed.
- No real data is deleted.
- No admission, deadline, responsibility, partner, legal fact, or visa guarantee is invented.
- Sensitive regulatory rules remain sourced, dated, and revalidatable.
- No automatic merge.
