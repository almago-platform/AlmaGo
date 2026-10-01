# Partner-Ready Calm Mode

Partner-Ready Calm Mode reduces automation fan-out while Campus Allemagne is being prepared for partner demonstrations.

## Automatic checks that remain enabled

- **AlmaGo PR CI** on non-draft pull requests: tests, TypeScript, lint, build and `git diff --check`.

Browser Quality remains available by manual dispatch for UI/UX changes, milestone rehearsals and final release evidence, but does not run on every PR during Calm Mode.

## Workflows paused from automatic execution

The following workflows remain in the repository and can still be launched with `workflow_dispatch`, but their schedules and/or `push main` triggers are paused:

- Master Orchestrator
- AI Backlog Dispatch
- Prelaunch Self-Heal
- Browser Quality
- Authenticated E2E (manual dispatch or the narrowly scoped A43 owner probe only)
- Prelaunch Visual Quality
- Prelaunch Performance Improvement
- Post-Merge Sentinel
- Merged Branch Cleanup
- A38 Review Readiness
- Autopilot Safe Merge
- Autopilot Safe Merge Observer

This prevents a normal merge from fanning out into repeated E2E, repair, orchestration, AI-provider and post-merge jobs.

## Vercel

Automatic Git deployments are disabled through `vercel.json` while Calm Mode is active. Manual Vercel deployments remain possible when a preview is explicitly needed. Render remains the intended Partner-Ready demonstration target.

## Re-enabling automation

Re-enable only the specific workflow needed for a milestone. Before Public Live, review this file and restore the required exact-SHA release gates deliberately rather than reactivating the entire automation stack at once.

Calm Mode does not weaken Auth, Supabase/RLS, payment, secrets or branch protections.
