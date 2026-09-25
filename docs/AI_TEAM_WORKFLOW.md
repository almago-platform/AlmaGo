# AlmaGo — Multi-Agent Operating Model

**Reference date:** 2026-09-25

## Goal

Use several coding models in parallel without letting them edit the same surface or merge unreviewed work.

GitHub is the source of truth. Every implementation task must have an explicit issue/task contract, a dedicated branch, a dedicated pull request, validation evidence, and a supervisor review.

## Authority and responsibilities

### ChatGPT Supervisor

ChatGPT is the orchestration and final review layer for agent work.

Responsibilities:
- maintain the product and technical plan;
- split work into small, non-overlapping tasks;
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

Gemini receives one bounded surface at a time.

### Claude — Deep engineering, debugging and hardening specialist

Preferred runtime model when launched through GitHub Copilot cloud agent: **Claude Opus 5.5**.

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

The agent stops after opening/updating its PR and publishing the required evidence.

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

## Current allocation — 2026-09-25

### Codex
Continue to own the active Germany implementation chain #214 → #233. Do not duplicate these changes elsewhere.

### Gemini
First assignment after this operating model is available on the default branch:
- perform a bounded UX/accessibility review of a supervisor-selected student-facing surface;
- produce concrete findings and, only when writable paths are explicitly granted, a small isolated PR.

### Claude
First assignment after this operating model is available on the default branch:
- deeply review a supervisor-selected workflow/state contract and its integration chain;
- identify reproducible edge cases, root causes, and missing regression tests;
- start review-first and modify production code only when exact paths are granted.

### ChatGPT
Continue architecture, task decomposition, collision checks, direct repository work where appropriate, and final review of Codex/Gemini/Claude outputs.

## Product boundaries that no agent may weaken

- Auth and Student/Admin isolation remain strict.
- RLS and private storage must not be weakened.
- No secret is exposed.
- No real data is deleted.
- No admission, deadline, responsibility, partner, legal fact, or visa guarantee is invented.
- Sensitive regulatory rules remain sourced, dated, and revalidatable.
- No automatic merge.
