# AlmaGo — pre-launch branch lifecycle remainder

Date: 27 September 2026  
Review base: `main@0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: evidence only; no branch deletion.

## Post-archive state

The legacy V3 pull-request chain was closed without merge after the first version of this appendix was written.

Current repository state:

- total branches: **193**;
- open PRs: **13**;
- distinct open-PR heads: **13**;
- non-main branches that are not open-PR heads: **179**.

Those 179 branches now partition exactly as follows:

| Category | Count | Meaning |
| --- | ---: | --- |
| Current tip exactly equals a merged PR head | 103 | Strong cleanup evidence, subject to operational/archive exclusions |
| Branch name has merged-PR history but current tip moved after merge | 2 | Current tip is **not** proven integrated |
| Closed-unmerged PR history, no merged PR for that branch name | 67 | Preserve until supersession/extraction/value is reviewed |
| No PR history found for the branch name | 7 | Requires direct-purpose review |
| **Total** | **179** | Complete non-main/non-open-head partition |

The increase from 40 to 67 closed-unmerged-history branches is primarily the result of the V3 archive pass.

## Open-PR base safety rule

Deletion preflight must exclude both:

- branches that are heads of open PRs;
- branches that are bases of open PRs.

Current non-main open-PR base set:

- `test/prebuild-contract-repair-final` — base of #403.

The former example `release/v3-validation-20260925` is no longer an active open-PR base because #213 is now closed.

It should still be retained while issue #418 uses #213/the legacy integration tree as extraction reference material.

## Two post-merge moved-tip branches

These names have merged-PR history, but their current tips moved after the recorded merge:

| Branch | Latest merged PR | Merged head | Current tip | Treatment |
| --- | ---: | --- | --- | --- |
| `feat/germany-lot3-database-hardening` | #266 | `ff7a18530155` | `c76b6f52582e` | REVIEW CURRENT TIP |
| `feat/v3-student-deadline-priority-20260924` | #192 | `99d52cf53f38` | `a65473397103` | REVIEW CURRENT TIP |

Do not classify either branch as integrated solely from the historical merge.

## V3 closed-unmerged branch hold

The closed V3 PR archive moved many V3 branch heads into the closed-unmerged-history category.

At least **35** currently retained branches are V3-related or directly tied to that archive history.

They remain evidence sources for issue #418.

**Do not bulk-delete the V3 branch family until #418 has resolved the extract/decline decision for retained features.**

Closing a stale PR container is not evidence that its branch has no remaining reference value.

## Seven branches with no PR history under the same branch name

| Branch | Immediate treatment |
| --- | --- |
| `archive/homepage-v3-chatgpt-2026-09-27` | INTENTIONAL ARCHIVE — retain unless owner explicitly retires it |
| `automation/master-plan-orchestrator-20260923` | AUTOMATION-NAMED — review tooling references before deletion |
| `backup/homepage-before-v2-20260923` | INTENTIONAL BACKUP — owner decision required |
| `copilot/almago-platformalma-go245` | ORPHAN CANDIDATE — inspect tip/purpose before deletion |
| `feat/germany-lot4-academic-evidence-persistence` | FEATURE/STACK CANDIDATE — inspect ancestry/extraction history |
| `fix/autonomous-pr-gates-20260923` | INFRASTRUCTURE CANDIDATE — inspect workflow history before deletion |
| `release/v3-validation-20260925` | V3 ARCHIVE/REFERENCE — retain while #418 is unresolved |

A current-main code search found no literal references to the six non-V3-reference branch names above. That reduces one risk but does not prove that external automation, GitHub configuration or human workflow does not depend on them.

## Strong cleanup set

The **103 exact merged-tip branches** remain the strongest evidence-backed cleanup candidates.

Even those require a fresh pre-delete check for:

1. not `main`;
2. not an open-PR head;
3. not an open-PR base;
4. not referenced by active automation/workflow/configuration;
5. not an intentional archive/backup/experiment;
6. no owner retention decision;
7. unchanged tip since the evidence pass.

## Destructive cleanup preflight

Before deleting any branch:

1. refresh branch and PR state;
2. confirm the branch tip;
3. confirm open-head and open-base exclusions;
4. confirm archive/automation exclusions;
5. delete only in a small batch;
6. recount branches after the batch;
7. stop if state changed unexpectedly.

No branch was deleted while producing or refreshing this appendix.
