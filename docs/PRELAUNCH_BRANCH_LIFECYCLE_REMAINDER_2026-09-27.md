# AlmaGo — pre-launch branch lifecycle remainder

Date: 27 September 2026  
Review base: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: evidence only; no branch deletion.

## Why this appendix exists

The first cleanup appendix proves 103 branch tips exactly match the head SHA of a merged pull request.

This pass closes the remaining classification gap and adds one important safety rule: **a branch can be unsafe to delete even when it is not the head of an open PR, because an open PR may use it as its base**.

## Exact branch partition

Current repository state:

- total branches: **193**;
- distinct branches used as heads by open PRs: **40**;
- `main`: **1**;
- non-main branches that are not open-PR heads: **152**.

Those 152 branches partition exactly as follows:

| Category | Count | Meaning |
| --- | ---: | --- |
| Current tip exactly equals a merged PR head | 103 | Strong cleanup evidence, subject to operational-reference exclusions |
| Branch name has merged-PR history but current tip moved after merge | 2 | Current tip is **not** proven integrated |
| Closed-unmerged PR history, no merged PR for that branch name | 40 | Preserve until supersession/value is reviewed |
| No PR history found for the branch name | 7 | Requires direct-purpose review |
| **Total** | **152** | Complete non-main/non-open-head partition |

The earlier phrase “153 branches have no open PR” counts `main` as a branch that is not an open-PR head. For destructive cleanup, the useful non-main population is **152**, not 153.

## Active-base safety rule

Open PRs currently use **28 non-main base branches**.

Most are also heads of another open PR in the legacy stacked V3 chain and were already excluded from cleanup by the open-head rule.

One branch is especially important because it is **not** an open-PR head but **is** still an active open-PR base:

- `release/v3-validation-20260925` → base of open PR **#213**.

Therefore `release/v3-validation-20260925` must not be deleted while #213 remains open, even though the branch has no open PR of its own.

**Improved deletion preflight:** exclude both open-PR head branches **and open-PR base branches**.

## Two branches whose tips moved after an earlier merge

These names have merged-PR history, but their current branch tips no longer equal the recorded merged head SHA:

| Branch | Latest merged PR | Merged head | Current tip | Treatment |
| --- | ---: | --- | --- | --- |
| `feat/germany-lot3-database-hardening` | #266 | `ff7a18530155` | `c76b6f52582e` | REVIEW CURRENT TIP |
| `feat/v3-student-deadline-priority-20260924` | #192 | `99d52cf53f38` | `a65473397103` | REVIEW CURRENT TIP |

Do not classify either branch as integrated merely from the historical merge. Their post-merge commits need a separate compare/reachability check.

## Forty branches with closed-unmerged PR history

These branches are not open PR heads and have no merged PR under the same branch name, but they do have closed-unmerged PR history.

This is **not deletion evidence** by itself. A closed-unmerged PR may have been superseded, abandoned, extracted elsewhere, or intentionally preserved.

| Branch | Closed PR |
| --- | ---: |
| `agent/chatgpt/sandbox-01-autopilot-doc` | #285 |
| `automation/almago-failure-watch-20260923` | #33 |
| `chore/a44-observability-gate-20260924` | #140 |
| `copilot/almago-platformalmago246` | #250 |
| `copilot/codex-diagnose-github-actions-startup-failure` | #287 |
| `copilot/codex-reconcile-germany-lot0-8` | #290 |
| `copilot/gemini-audit-germany-student-ux` | #238 |
| `copilot/gemini-audit-student-matching-ux` | #240 |
| `design/homepage-v2-h3-six-step-20260923` | #107 |
| `docs/almago-v3-trust-guidance-plan-20260924` | #141 |
| `docs/v3-implementation-status-20260924` | #158 |
| `docs/v3-null-safe-application-uniqueness-20260925` | #202 |
| `experiment/homepage-v4-work-challenger` | #329 |
| `feat/germany-foundations-hardening` | #218 |
| `feat/germany-lot0-lot1` | #214 |
| `feat/germany-lot2-academic-prefilter` | #219 |
| `feat/germany-lot2-admin-master-requirements-api` | #222 |
| `feat/germany-lot2-admin-master-requirements-ui` | #223 |
| `feat/germany-lot2-master-requirements-contract` | #220 |
| `feat/germany-lot2-master-requirements-matching` | #224 |
| `feat/germany-lot2-master-requirements-persistence` | #221 |
| `feat/germany-lot2-safe-publication-gate` | #226 |
| `feat/germany-lot2-student-master-match-ui` | #225 |
| `feat/germany-lot3-admin-application-observability` | #231 |
| `feat/germany-lot3-application-transition-preflight` | #228 |
| `feat/germany-lot3-application-workflow-contract` | #227 |
| `feat/germany-lot3-safe-application-intake` | #229 |
| `feat/germany-lot3-student-workflow-alignment` | #230 |
| `feat/germany-lot4-academic-evidence-contract` | #233 |
| `feat/germany-wave2-lot7-8` | #288 |
| `feat/v3-accessibility-page-20260924` | #168 |
| `feat/v3-admin-quality-overview-20260924` | #164 |
| `feat/v3-public-not-found-20260924` | #169 |
| `feat/v3-trust-center-20260924` | #154 |
| `fix/a45-e2e-email-defaults-20260924` | #139 |
| `fix/actions-preflight-filters-20260924` | #184 |
| `fix/baseline-test-contract-drift` | #331 |
| `fix/noindex-private-auth` | #333 |
| `fix/security-response-headers` | #335 |
| `fix/v3-catalogue-fixture-cleanup-ui-20260924` | #195 |

Recommended next pass for this set: label each branch as **superseded**, **feature source**, **incident evidence**, or **intentional experiment/archive** before any deletion.

## Seven branches with no PR history under the same branch name

| Branch | Immediate treatment |
| --- | --- |
| `archive/homepage-v3-chatgpt-2026-09-27` | INTENTIONAL ARCHIVE — retain unless owner explicitly retires it |
| `automation/master-plan-orchestrator-20260923` | AUTOMATION-NAMED — review automation/tooling references before deletion |
| `backup/homepage-before-v2-20260923` | INTENTIONAL BACKUP — owner decision required |
| `copilot/almago-platformalma-go245` | ORPHAN CANDIDATE — inspect tip/purpose before deletion |
| `feat/germany-lot4-academic-evidence-persistence` | FEATURE/STACK CANDIDATE — inspect ancestry and extraction history |
| `fix/autonomous-pr-gates-20260923` | INFRASTRUCTURE CANDIDATE — inspect workflow history before deletion |
| `release/v3-validation-20260925` | **ACTIVE BASE OF #213 — DO NOT DELETE** |

A current-main code search found no literal references to the six non-active-base branch names above. That absence reduces one risk but does **not** prove that external automation, GitHub configuration or human workflow does not depend on them.

## Strong-candidate count after active-base exclusion

The 103 exact merged-tip branches remain the strongest evidence-backed cleanup set, but deletion still requires the exclusions already documented for archive/experiment/automation references.

The remainder should not be bulk-deleted.

## Destructive cleanup preflight

Before deleting any branch, verify all of the following at deletion time:

1. branch is not `main`;
2. branch is not the head of an open PR;
3. branch is not the base of an open PR;
4. branch is not referenced by active automation/workflow/configuration;
5. branch is not a deliberate archive, backup or experiment that the owner wants to retain;
6. branch tip is proven integrated or intentionally superseded;
7. the evidence is refreshed immediately before deletion because branch/PR state can change.

No branch was deleted while producing this appendix.
