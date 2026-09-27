# AlmaGo — pre-launch open issue reconciliation

Date: 27 September 2026  
Current main: `0a37fd411880744596ca3b2ed68086591e311deb`  
Open issues reviewed: **21**.

This document answers one hygiene question precisely: **which open issues are actually already satisfied by current main, which are represented by an unmerged PR, and which remain genuinely operational/human work?**

No issue is closed by this reconciliation.

## Summary

Current open-issue population:

| Class | Count |
| --- | ---: |
| Implementation prepared in an open PR but **not yet on main** | 8 |
| Human / operational / external-system work still genuinely open | 10 |
| Repository/status coordination issues that should remain open for now | 3 |
| Clearly fully satisfied by current main and safe to close immediately | **0** |
| **Total** | **21** |

The audit therefore does **not** support bulk-closing current open issues.

## Implementation issues with an open PR

These are not satisfied by current `main` yet. Their implementation exists only in an open PR.

| Issue | PR | Status |
| --- | ---: | --- |
| #398 — stale prebuild contracts | #399 | Pending merge/revalidation |
| #400 — Render runbook/observability | #401 | Pending merge/revalidation |
| #402 — Pexels/Render upstream timeout hardening | #403 | Pending merge; stacked on #399 |
| #404 — authenticated Render target for A43 | #405 | Pending merge; collides with #412 on workflow file |
| #406 — Render-native A45 gate | #407 | Pending merge |
| #411 — main-only evidence guards | #412 | Pending merge; collides with #405 on workflow file |
| #413 — remove obsolete Vercel dependency from merge readiness | #414 | Pending merge |
| #415 — refresh owner-action docs | #416 | Pending merge |

Rule: do not close the issue merely because the PR is mergeable. Close only when the intended behavior is actually present on current main and validated.

## Human / operational / external-system issues

### #66 — A38 legal/privacy review

Still open by design.

Requires human factual/legal review and owner confirmation. No repository-hygiene action can satisfy that gate.

### #84 — A43 authenticated student/admin E2E

Still open.

The code path exists, but final authenticated evidence depends on dedicated test secrets and functioning execution infrastructure. #405 also prepares the Render target but is unmerged.

### #85 — A44 production observability/analytics

Still open.

Requires provider/retention/consent decisions and depends on A43/A38. Repository preparation is not equivalent to activation.

### #179 — leaked-password protection

Current Supabase Security Advisor still reports:

- **Leaked Password Protection Disabled** — WARN.

Therefore #179 is definitely **not satisfied**.

The only other current Security Advisor item is `technical_logs` with RLS enabled and no policy, which is intentionally deny-by-default and should not be “fixed” merely to silence the advisory.

### #180 — post-A43 DB hardening/performance

Partially satisfied, but should remain open.

Current main already contains migration `0026_prelaunch_database_baseline.sql`, which added the foreign-key covering indexes that removed the earlier unindexed-FK warning.

Current Supabase Performance Advisor still reports:

- **26** `auth_rls_initplan` warnings;
- **10** `multiple_permissive_policies` warnings;
- **21** informational unused-index findings.

The issue contract explicitly defers policy rewrites/index-removal decisions until authenticated E2E evidence is available.

Classification: **PARTIALLY COMPLETED / KEEP OPEN POST-A43**.

### #286 — GitHub Actions startup failure

Still open and still operationally relevant.

The current release PRs continue to treat the Actions startup problem as a blocker. Hygiene should not close it.

### #320 — waiting design/mobile QA

Still open as a non-blocking waiting item.

It requests authenticated/mobile QA that is not proven complete by current main.

### #336 — protect `main`

Still open.

The GitHub branch endpoint currently reports:

- `protected: false`;
- protection `enabled: false`;
- required status-check enforcement: `off`.

Therefore #336 is directly confirmed as **unsatisfied**.

### #389 — Render GitHub auto-deploy / health check

Still open.

This is an infrastructure/dashboard task. No current-main code commit alone proves repository authorization, automatic deploy triggering or service-level health-check configuration.

### #19 / #22 — master status and owner actions

These remain useful coordination surfaces while A38/A43/A44/A45 and operational blockers remain unresolved.

Do not close them as “stale” merely because many implementation tasks are finished.

## Repository-hygiene coordination issues

### #418 — V3 archive extraction backlog

Keep open.

It is now the canonical record separating:

- closed stale V3 PR containers;
- retained feature intent;
- fresh current-main extraction decisions.

V3 source branches should remain protected from bulk deletion while #418 is unresolved.

### #419 — controlled merged-branch purge manifest

Keep open until the actual branch cleanup is executed.

A live recheck of its **Batch A** found:

- **51 / 51** listed branches still exist;
- **51 / 51** remote tips still exactly equal the expected SHA recorded in #419;
- **0 / 51** are currently an open PR head;
- **0 / 51** are currently an open PR base.

So the manifest remains internally consistent at this snapshot.

This still does **not** delete the branches. Recheck each SHA immediately before destructive execution.

### Hygiene audit tracking

The original hygiene task has transitioned into #410 / #417 evidence plus #418 / #419 execution records. Preserve snapshot dates rather than rewriting historical counts.

## No immediate issue-closure set

After reconciling current main, open PRs, Supabase advisors and branch state, this pass found **zero** currently open issues that are both:

1. fully satisfied on current main; and
2. free of remaining human/operational/extraction work.

That is a useful result: current issue noise is much lower than the earlier stale-PR noise, and the remaining open issues mostly represent real unfinished work.

## Closure rule going forward

An issue should be closed only when one of these is true:

- its acceptance criteria are present and validated on current main;
- its external/human action is actually completed and evidenced;
- it is explicitly superseded by a new canonical issue with all unresolved intent transferred.

An open PR alone is not completion evidence.
