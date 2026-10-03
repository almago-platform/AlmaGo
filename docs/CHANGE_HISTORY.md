# AlmaGo — Change History & Recovery Ledger

This is the human-readable index for selective recovery. Git commits and tags remain canonical.

Policy: `docs/CHANGE_CONTROL.md`

## Recovery summary

| Date | Category | Status | Recovery SHA | Checkpoint tag | Issue / PR | Summary | Selective rollback |
|---|---|---|---|---|---|---|---|
| 2026-10-03 | DOCUMENTS_ASSETS | active | `994086e1fd2ae7086152043c88f94e44028445cd` | N/A | #769 / pending | Introduce change-history and selective rollback governance | Revert only the governance PR/files |
| 2026-10-03 | ALL | baseline | `994086e1fd2ae7086152043c88f94e44028445cd` | N/A | — | Initial prospective recovery baseline | Use this immutable commit only as a verified repository-wide reference |

> History begins prospectively on 2026-10-03. Older entries must be backed by verifiable GitHub evidence; they must not be reconstructed from memory.

## DESIGN_UI

Use for layout, buttons, components, colors, typography, imagery, responsive UI and RTL presentation.

**Rule:** an annotated `checkpoint/design/...` tag is mandatory before the first edit.

_No verified entries yet._

## CONTENT_TRANSLATIONS

Use for editorial copy, French/Arabic wording and translations.

_No verified entries yet._

## DOCUMENTS_ASSETS

Use for repository documentation, PDFs, templates and static/downloadable assets.

### 2026-10-03 — Change-history and selective rollback governance

- Status: active
- Base branch: `main`
- Recovery SHA: `994086e1fd2ae7086152043c88f94e44028445cd`
- Checkpoint tag: N/A — no design surface is changed
- Issue: #769
- PR: pending
- Owned paths:
  - `AGENTS.md`
  - `.github/pull_request_template.md`
  - `docs/AI_TEAM_WORKFLOW.md`
  - `docs/CHANGE_CONTROL.md`
  - `docs/CHANGE_HISTORY.md`
- Before:
  - Git history existed, but there was no repository-wide category ledger or mandatory selective-recovery record.
- Change:
  - Add recovery categories, pre-change anchors, mandatory design checkpoint tags, PR fields and agent rules.
- Keep when rolling back:
  - All product/runtime code. This governance block intentionally changes no production behavior.
- Selective rollback:
  - Revert only this governance PR/commit or restore only the listed files from `994086e1fd2ae7086152043c88f94e44028445cd`.
- Validation:
  - Documentation consistency and GitHub diff/CI review.

## FEATURES_WORKFLOWS

Use for product features, journeys and state flows.

_No verified entries yet._

## ALGORITHMS_DOMAIN

Use for orientation logic, scoring, business/domain rules and deterministic behavior.

_No verified entries yet._

## AUTH_SECURITY_PRIVACY

Use for authentication, roles, permissions, privacy and security controls.

**Recovery warning:** never restore a state that weakens a known security control.

_No verified entries yet._

## DATA_DATABASE

Use for schema, migrations and data models.

**Recovery warning:** production database rollback normally uses a reviewed forward corrective migration, not deletion/restoration of old migration files.

_No verified entries yet._

## API_INTEGRATIONS

Use for APIs, provider integrations and external contracts.

_No verified entries yet._

## INFRA_DEPLOYMENT

Use for Render, Vercel, GitHub Actions and runtime configuration.

_No verified entries yet._

## TESTS_QUALITY

Use for tests, E2E, accessibility checks and quality gates.

_No verified entries yet._

## DEPENDENCIES_TOOLING

Use for packages, frameworks, build tools and lockfiles.

_No verified entries yet._

## SEO_ACCESSIBILITY_I18N

Use for metadata/SEO, accessibility, locales, translations infrastructure and RTL infrastructure.

_No verified entries yet._

## Entry template

```markdown
### YYYY-MM-DD — <short title>

- Status: planned | active | merged | rolled-back | superseded
- Base branch:
- Recovery SHA:
- Checkpoint tag:
- Issue:
- PR:
- Commits:
- Owned paths:
- Before:
- Change:
- Keep when rolling back:
- Selective rollback:
- Validation:
- Notes:
```
