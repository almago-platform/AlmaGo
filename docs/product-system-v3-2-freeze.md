# AlmaGo Product System V3.2 — Design Freeze

Status: **freeze candidate** until the final reconciliation PR for #949 is merged, canonical CI is green, and Render serves the exact merge commit.

This document is the canonical visual/product-system baseline produced by #929. It freezes the approved V3.2 composition before pre-launch hardening. It does **not** mean that AlmaGo is publicly launched, that A45 is complete, or that real payment processing is enabled.

## 1. Canonical V3.2 delivery chain

V3.2 was shipped as a sequence of scoped, reviewable pull requests:

| Workstream | PR | Merge commit |
| --- | --- | --- |
| Premium foundation | #931 | `dd1a554f59c82c8d5db061fd3c31076f5834c7e9` |
| Prospect | #933 | `2395e8f6117de307ed1f395046de38b3b8b4e60b` |
| Student | #940 | `78c5bbef88a2c5f04ddcd356ea24315196673d4e` |
| Admin | #942 | `0089f2a46745c83b4d5542d6654a1b8c213a6eb9` |
| Public / candidate | #944 | `23ed4f118c2fec7403f6ca59078f1df6b02b78d1` |
| Responsive / RTL / motion | #946 | `a3ef277892b23b7fe764b2aa8874aa814a7573c5` |
| Automated visual QA | #948 | `c80a074ebd0a3225ef99a42f2128790cd4d9401b` |

The final reconciliation PR for #949 closes the programme. Its merge SHA is runtime evidence and must be recorded in the issue/PR trail after Render serves it; this document intentionally does not hard-code a future SHA.

## 2. Locked brand invariants

The following are frozen until an explicit reviewed design-system change:

- the approved Campus Allemagne master assets remain:
  - `/brand/campus-allemagne-logo-approved.png`
  - `/brand/campus-allemagne-symbol-approved.png`;
- red / black / yellow remain the primary identity;
- the public top header stays light/white;
- dark hero surfaces remain the authenticated-product signature and a recurring public trust signature;
- V3.1 density remains the baseline: V3.2 adds hierarchy and polish, not empty decorative space;
- visual treatment must never override lifecycle, responsibility, deadline, status, or official-source truth.

Do not redraw, recolour, simplify, replace, or regenerate the approved logo inside normal product work.

## 3. Canonical premium composition primitives

The shared V3.2 layer lives in `src/app/design-system.css`.

Preferred primitives:

- `.pc-card`
- `.pc-card-interactive`
- `.pc-panel`
- `.pc-hero`
- `.pc-kicker`
- `.pc-empty-state`
- `.pc-soft-strip`
- `.pc-waiting-strip`
- `.pc-button`
- `PremiumSectionHeader`
- `PremiumEmptyState`
- `DossierHeader`
- `JourneyRail`
- `ResponsibilityStrip`

Product-specific composition may stay local where it carries genuine product meaning. New one-off shadows, radii, spacing systems, dark-hero variants, or empty-state patterns should not be introduced when a shared V3.2 primitive already fits.

## 4. Surface contracts

### Public / candidate

- The validated homepage composition remains the public editorial baseline.
- The white/light top header and approved logo remain.
- Login, signup, password recovery, orientation and public recovery states use the V3.2 premium composition layer.
- The public route must remain readable at compact widths without horizontal overflow.
- A visual change must not silently change Phase 2 routing, Auth behaviour, orientation scoring, prospect capture or legal/official boundaries.

### Prospect

- Prospect remains a lifecycle cockpit, not a generic SaaS dashboard.
- The dark premium hero, one next-action hierarchy, intentional waiting/empty states and consistent section rhythm are frozen patterns.
- Proposal/payment presentation may explain state, price and responsibility but must not imply admission guarantees or activate payment state from presentation logic.

### Student

- The Student space remains lifecycle-first.
- Procedure, documents and applications preserve official-vs-Campus responsibility and verified-source/deadline boundaries.
- The canonical Student page system and navigation remain localized.
- Arabic Student surfaces remain real RTL, with mixed-direction technical values isolated.

### Admin

- Admin remains an operational cockpit optimized for dense scanning.
- Dossier 360° stays contextual/read-oriented; sensitive mutations remain in their dedicated workflow surfaces.
- Admin is intentionally LTR while the Admin product itself is not localized. Do not fake RTL by mirroring an untranslated French workspace.
- Status, urgency, ownership and next action must come from product truth rather than decorative scoring.

## 5. Responsive, RTL and motion freeze

The guarded browser matrix is:

`320 / 360 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920`

Shared premium surfaces must remain safe inside narrow grids:

- `min-width: 0`
- `max-width: 100%`
- long content can wrap;
- controls remain touch-friendly;
- horizontal overflow is a release defect, not something to hide globally.

RTL rules:

- localized Public, Prospect and Student surfaces may use RTL;
- logical CSS properties are preferred;
- technical LTR values must be isolated;
- premium directional accents mirror under `html[dir="rtl"]`;
- Admin stays LTR until genuinely localized.

Motion rules:

- interaction motion is restrained and short;
- motion may support hierarchy but cannot carry meaning by itself;
- `prefers-reduced-motion: reduce` disables non-essential transforms/transitions/animations.

## 6. Quality ownership

### Canonical PR CI

Every PR must continue to pass the canonical AlmaGo PR CI:

- tests;
- workflow YAML validation;
- TypeScript;
- lint;
- production build;
- diff check.

### Public Browser Quality

For UI-facing PRs, **AlmaGo Browser Quality** is the bounded automatic public/candidate regression gate.

Automatic PR coverage:

- 320px;
- 390px;
- 1280px;
- 1440px.

It checks representative public/candidate routes, horizontal overflow, real Arabic RTL and reduced-motion behaviour. Screenshot/failure evidence is retained as artifacts.

The full browser suite, Gemini visual review and Lighthouse remain manual/milestone tools; paid AI is not triggered on ordinary PRs.

### Authenticated Student/Admin quality

Authenticated Student/Admin quality remains owned by **A43 Authenticated E2E** using dedicated test-only identities and secrets. Do not move authenticated credentials into the public Browser Quality gate.

## 7. Change-control after freeze

After #949 closes:

1. Do not start another broad visual rewrite during pre-launch hardening.
2. Fix objective defects with the smallest shared change possible.
3. Prefer shared tokens/primitives over new one-off styling.
4. Any intentional change to a locked brand/system invariant must state the invariant being changed and why.
5. UI-facing PRs must leave Browser Quality green.
6. Authenticated Student/Admin changes must preserve the A43 quality/isolation contract.
7. A design freeze does not authorize production payment activation, public launch, legal sign-off, analytics activation, or release-gate completion.

## 8. Handoff

When the final reconciliation PR is merged and its exact SHA is live on Render without 5xx regressions:

- close #949;
- close #929 as the completed V3.2 visual programme;
- move to pre-launch hardening/security/operational release gates;
- keep this file as the visual change-control baseline until an explicitly approved successor replaces it.
