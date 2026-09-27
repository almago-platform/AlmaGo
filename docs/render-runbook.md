# AlmaGo Render runbook

Render is the canonical runtime used to validate AlmaGo before public launch.

## Canonical service

Verified on 27 September 2026:

- Render service: `almago-dev`
- URL: `https://almago-dev.onrender.com`
- region: Frankfurt
- branch: `main`
- runtime: Node
- current service plan: Free
- auto-deploy setting: enabled on commit
- pull-request previews: disabled
- service-level health check path: currently empty

The repository also contains `render.yaml`. It describes the intended application contract, including:

- `healthCheckPath: /api/health`
- `autoDeployTrigger: commit`
- Frankfurt region
- Node runtime

The live Render dashboard configuration is authoritative for the existing service. A value in `render.yaml` does not prove that the already-created service has adopted it.

## Known configuration drift

At the time of this runbook:

| Setting | Existing Render service | `render.yaml` |
| --- | --- | --- |
| name | `almago-dev` | `almago` |
| plan | Free | `1c-2g` |
| build command | `npm ci --include=dev && npm run build` | `npm ci && npm run build` |
| health check | empty | `/api/health` |
| auto deploy | commit | commit |

Do not change the paid plan or service identity merely to remove this drift. Plan changes are an owner/cost decision.

## Current release gate

`package.json` runs the source-contract suite before the production build through the `prebuild` hook. On Render this means:

1. dependencies install;
2. `npm test` runs;
3. only if tests pass does the Next.js production build run;
4. only a successful build can replace the current live revision.

A failed build must leave the previous live deploy serving traffic. Do not bypass failing tests by removing the prebuild gate.

## Deploy verification

For every production-intended change:

1. confirm the target commit on `main`;
2. confirm Render starts a deploy for that commit;
3. wait for status `live`;
4. check `/api/health`;
5. verify that the reported shortened revision corresponds to the deployed commit;
6. inspect build/runtime logs for errors;
7. test the affected public or authenticated surface with synthetic/test accounts only.

The health endpoint is deliberately no-store and exposes only bounded deployment metadata. It must not contain secrets, user identifiers, database values, or environment-variable contents.

## Auto-deploy incident

The current service reports auto-deploy enabled, but recent pushes to `main` did not reliably start deployments. Manual API-triggered deploys succeeded. Render build logs also reported that repository access appeared limited.

Track this operational fix in GitHub issue #389:

- reconnect or re-authorize the GitHub repository in Render;
- confirm a new `main` commit starts a deploy without a manual trigger;
- set the service health check path to `/api/health`;
- verify the deployed revision through the health endpoint.

Until that is fixed, do not describe auto-deploy as proven even though the service setting says it is enabled.

## Free-plan cold start

The current service is on Render Free and can display Render's wake-up screen after inactivity before Next.js becomes ready. This is acceptable for development/recette, but it is a launch-quality decision for the owner before public traffic.

Do not upgrade the plan automatically.

## Rollback principle

If a new deploy fails to build, leave the previous live deploy untouched.

If a new deploy becomes live and introduces a verified regression:

- identify the last known-good deploy in Render;
- prefer a code revert on `main` followed by a normal deploy so Git history and runtime stay aligned;
- use dashboard rollback/redeploy only as an emergency operational action, then reconcile `main` immediately.

Never solve a production regression by weakening RLS, removing auth guards, disabling file validation, or exposing secrets.

## Secrets and environment variables

Secrets belong in Render environment configuration or the appropriate GitHub Actions secrets, never in commits, issues, logs, screenshots, or chat.

The public Supabase URL/publishable key are configured separately from protected credentials. Never add the service-role key to client-exposed `NEXT_PUBLIC_*` variables.

## Related gates

- A38: legal/privacy human review
- A43: authenticated student/admin E2E with dedicated test accounts
- A44: observability provider activation after A38 + A43
- A45: final release gate
- #389: Render repository connection + health-check configuration
- #179: optional Supabase leaked-password protection decision
- #180: post-A43 database/RLS performance hardening
