# AlmaGo — remaining Vercel-era drift after Render migration

Date: 27 September 2026  
Reference main: `0a37fd411880744596ca3b2ed68086591e311deb`  
Mode: audit evidence only. No legal text, runtime configuration, secret, workflow, database or production setting changed.

## Purpose

Current pre-launch work correctly treats Render as AlmaGo's canonical runtime, but a repository-wide search still finds Vercel-era references.

They should not all be treated the same way. Some are already covered by active PRs, some are human/legal factual drift, and some are platform configuration that may remain intentionally until Vercel is explicitly decommissioned.

## Already covered by active PRs

The following current-main Vercel references already have a bounded active replacement:

| Current path | Active PR | Treatment |
| --- | --- | --- |
| `docs/observability.md` | #401 | Replace Vercel runtime framing with Render |
| `docs/safe-automerge.md` | #414 | Remove Vercel status from merge-readiness contract |
| `.github/workflows/almago-safe-automerge.yml` | #414 | Remove Vercel status dependency |
| `docs/release-checklist.md` | #407 | Make final runtime proof Render-native |
| `.github/workflows/almago-final-release-gate.yml` | #407 | Replace Vercel final-gate proof with exact-main Render health/smoke |
| `docs/AYOUB_ACTIONS_MINIMALES.md` | #416 | Refresh owner instructions to Render-first state |

Repository hygiene should not duplicate those edits.

## A38 / legal factual drift not covered by those PRs

Three current-main documents still state that Vercel provides hosting/deployment:

- `docs/legal-privacy-draft.md`;
- `docs/A38_OWNER_CONFIRMATION.md`;
- `docs/data-processing-inventory.md`.

That statement is inconsistent with the current pre-launch operating model in which Render `almago-dev` is the canonical runtime.

Classification: **A38 FACTUAL RECONCILIATION REQUIRED**.

Do not mechanically rewrite these files from the hygiene branch. They are inputs to legal/privacy review and should be corrected in the A38 workstream so that:

1. the actual current processor/runtime facts are verified;
2. any retained Vercel role is described accurately, if it still exists;
3. the privacy draft and processing inventory match the real deployment architecture;
4. the human/legal reviewer sees the corrected facts before A38 is marked ready.

## Implication for PR #138

#138 remains useful as a retention/deletion proposal, but it is based on an older main and should not be merged blindly.

Its patch to `A38_OWNER_CONFIRMATION.md` improves the retention workflow but does not itself reconcile the underlying Vercel-vs-Render hosting fact.

Therefore #138 should be treated as:

**KEEP AS A38 SOURCE MATERIAL / REBASE OR PORT SELECTIVELY AFTER FACTUAL HOSTING RECONCILIATION.**

## Vercel platform files are not proven dead

The repository also contains:

- `vercel.json`;
- `tests/vercel-ignore.test.mjs`.

These are not automatically stale just because Render is canonical.

Evidence that the Vercel integration is still connected exists on current PR commits: GitHub continues to receive a `Vercel` commit status. On the latest #417 audit commit, that status failed with a target indicating a Vercel build-rate-limit condition.

Classification: **KEEP UNTIL EXPLICIT DECOMMISSION DECISION**.

Before deleting Vercel configuration/tests, verify whether Vercel is still intentionally retained for previews, secondary builds, or any fallback. If it is not needed, remove the integration/configuration in a dedicated infrastructure cleanup, not as incidental documentation hygiene.

## Pre-A38 / pre-A45 checklist consequence

Before A38 can be considered factually ready:

- reconcile the three A38/legal Vercel references with the real runtime architecture.

Before A45/final launch hygiene:

- confirm whether Vercel remains an intentional secondary integration;
- if retained, document its limited role;
- if retired, remove its status/configuration in a dedicated reviewed change.

## Conclusion

The Render migration is mostly represented by the active release PR chain, but repository truth is not yet fully consistent.

The remaining high-value cleanup is not another broad replacement of the word “Vercel”. It is a precise split:

- active operational docs/workflows → already covered by #401/#407/#414/#416;
- A38/legal facts → human-reviewed factual correction required;
- Vercel config/integration → keep until an explicit decommission decision.
