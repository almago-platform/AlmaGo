# AlmaGo — Change Control & Selective Rollback Policy

**Adopted:** 2026-10-03  
**Initial recovery baseline:** `994086e1fd2ae7086152043c88f94e44028445cd`  
**Tracking issue:** #769

## Goal

AlmaGo must be able to restore one category of work without unnecessarily rolling back unrelated accepted work.

Example: if a future homepage design is rejected, restore only the design/UI files from a known checkpoint while keeping newer algorithms, documents, authentication changes, database work, and other accepted features.

Git commits and tags are the source of truth. `docs/CHANGE_HISTORY.md` is the human-readable recovery ledger.

## Mandatory pre-change record

Before a material change block starts, record in `docs/CHANGE_HISTORY.md`:

1. category;
2. date;
3. exact base branch;
4. exact pre-change commit SHA;
5. owned paths;
6. what exists before the change;
7. planned change;
8. selective rollback method;
9. unrelated work that must remain if this block is rolled back.

The checkpoint is per coherent block/PR, not per edited line.

## Mandatory design checkpoint

Every `DESIGN_UI` block requires an immutable annotated tag **before the first edit**. This includes a button, header, footer, component style, colors, spacing, typography, imagery, responsive layout, RTL visual behavior, or page composition.

Naming:

```text
checkpoint/design/YYYY-MM-DD-<short-slug>
```

Example:

```bash
git fetch origin main
git tag -a checkpoint/design/2026-10-03-homepage-before-redesign \
  <PRE_CHANGE_SHA> \
  -m "AlmaGo design checkpoint before homepage redesign"
git push origin checkpoint/design/2026-10-03-homepage-before-redesign
```

Never move, force-update, or reuse a checkpoint tag.

For other categories, the exact immutable recovery SHA is always mandatory. Add a checkpoint tag when the block is broad, high-risk, destructive, difficult to reproduce, or explicitly requested by the owner.

## Change categories

| Category | Examples |
|---|---|
| `DESIGN_UI` | layout, buttons, visual tokens, components, responsive UI |
| `CONTENT_TRANSLATIONS` | French/Arabic copy, editorial text, translations |
| `DOCUMENTS_ASSETS` | PDFs, templates, downloadable/static assets |
| `FEATURES_WORKFLOWS` | product features, journeys, state flows |
| `ALGORITHMS_DOMAIN` | orientation logic, scoring, rules, domain behavior |
| `AUTH_SECURITY_PRIVACY` | auth, roles, permissions, security/privacy controls |
| `DATA_DATABASE` | schema, migrations, data model |
| `API_INTEGRATIONS` | APIs, external services, contracts |
| `INFRA_DEPLOYMENT` | Render, Vercel, GitHub Actions, runtime config |
| `TESTS_QUALITY` | unit/E2E/a11y tests, quality gates |
| `DEPENDENCIES_TOOLING` | packages, framework/build tooling |
| `SEO_ACCESSIBILITY_I18N` | SEO, metadata, accessibility, locales, RTL infrastructure |

A PR may have multiple categories only when the work is genuinely inseparable. Prefer category-pure commits and separate PRs when possible.

## Selective rollback

Never rewind shared `main` as the normal recovery method. Create a recovery branch from current `main`, then restore only the target category.

Example — restore an older design while preserving current backend/domain work:

```bash
git fetch origin
git switch -c recovery/design-homepage origin/main

git restore \
  --source checkpoint/design/2026-10-03-homepage-before-redesign \
  -- src/app/page.tsx src/components/... src/styles/...

git diff
npm test
npm run lint
npm run build

git add <restored-design-paths>
git commit -m "design: restore approved homepage checkpoint"
git push -u origin recovery/design-homepage
```

Open a PR to `main` and explicitly state which newer non-design work is preserved.

If a category-pure commit is safe to reverse, `git revert <commit>` may be cleaner. Do not use force-push/reset on shared `main` for routine rollback.

## Special recovery rules

### Database / migrations

Do not restore an old migration directory or delete a production migration as rollback. Prefer a new reviewed forward corrective migration and verify data/RLS safety.

### Auth / security / privacy

Do not restore a state that reopens a known vulnerability or weakens student/admin isolation. Run security regressions.

### Infrastructure / deployment

Verify current environment variables, runtime compatibility, provider state, and deployed revision before restoring config.

### Content / documents

File-level restore is usually appropriate, but preserve later legal/factual corrections unless the owner explicitly chooses otherwise.

## Required history entry

Each material change adds or updates one row in the summary table and a detailed entry under the matching category in `docs/CHANGE_HISTORY.md`.

Minimum fields:

```text
Date
Category
Status
Base branch
Recovery SHA
Checkpoint tag
Issue / PR
Owned paths
Before
Change
Keep when rolling back
Selective rollback
Validation
```

Do not invent retroactive history from memory. Older history can be added only from verifiable GitHub commits/PRs.
