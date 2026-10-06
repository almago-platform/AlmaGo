# AlmaGo V3.2 — Final Premium Composition Foundation

Issue: #929

## Baseline

V3.2 builds on the approved V3.1 production direction. It does not replace it.

Locked:
- approved Campus Allemagne logo assets stay unchanged;
- red, black and yellow remain the brand identity;
- white top navigation stays;
- dark hero surfaces stay a signature;
- Auth, RLS, database, payment state and business workflow are not redesigned here.

## Composition principles

### 1. Fewer one-off visual values

Shared product surfaces use semantic premium tokens before hardcoded colors, radii and shadows.

Core neutral tokens:
- `--premium-ink`
- `--premium-cream`
- `--premium-paper`
- `--premium-border`

Core radius tokens:
- `--premium-radius-control`
- `--premium-radius-card`
- `--premium-radius-panel`
- `--premium-radius-hero`

Core elevation tokens:
- `--premium-shadow-card`
- `--premium-shadow-card-hover`
- `--premium-shadow-panel`
- `--premium-shadow-hero`
- `--premium-shadow-action`
- `--premium-shadow-brand`

### 2. Hierarchy before decoration

A screen should answer, in this order:
1. where am I;
2. what is my current state;
3. what is the single most important next action;
4. what can I inspect next;
5. what is secondary history/context.

Dark surfaces are reserved for strong orientation, next-action or transactional moments. They should not be used merely to fill space.

### 3. Intentional empty states

A sparse page must not look unfinished.

Use `PremiumEmptyState` for waiting/unavailable states when there is enough context to explain:
- what is happening;
- what happens next;
- what the user can do now.

The optional dark visual rail creates structure on wide screens without inventing business data.

### 4. Consistent section entry

Use `PremiumSectionHeader` when a page section needs eyebrow + title + description + action hierarchy.

### 5. Motion is restrained

Premium motion is limited to:
- 1–2 px lift on hover;
- short state transitions;
- clearly perceivable action feedback.

All shared primitives must preserve `prefers-reduced-motion`.

### 6. RTL is structural

Use logical directions (`start`, `end`, inline borders/padding) in shared components. Decorative direction that communicates no meaning may stay symmetric.

### 7. Density is deliberate

V3.1 already removed major white-space waste. V3.2 must not re-introduce oversized panels or vertically stretched grids. Use content-driven height and align sparse grids to start.

## Shared primitives introduced in Foundation

- `pc-card`
- `pc-card-interactive`
- `pc-panel`
- `pc-hero`
- `pc-kicker`
- `pc-empty-state`
- `pc-soft-strip`
- `pc-waiting-strip`
- `pc-button`
- `PremiumEmptyState`
- `PremiumSectionHeader`

## Shared product components reconciled

Foundation binds these existing components to the premium token layer:
- `DossierHeader`
- `ProspectPageHero`
- `NextActionPanel`
- `JourneyRail`
- `ResponsibilityStrip`
- `ProgrammeCard`
- `ProposalSummary`
- `DocumentRow`
- `Button`

## External implementation references

The future visual-QA stage should use deterministic screenshot baselines and component stories:
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Storybook visual testing: https://storybook.js.org/docs/writing-tests/visual-testing/
- Figma variables/design tokens: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma

Figma file remains the intended design source of truth, but the current Figma Starter MCP quota is exhausted. Code-side token consolidation continues without blocking the programme; Figma reconciliation resumes when tool access is available.
