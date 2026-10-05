# AlmaGo Product System V2 — Stage 1 Foundation Audit

Status: **In progress**

Programme issue: #910

Figma source of truth: `AlmaGo Product System V2 — Professional Redesign`

## 1. Mission

Stage 1 defines the product architecture, visual system and quality contract before broad UI implementation.

The redesign covers three coordinated experiences:

1. **Candidate / Orientation** — public visitor or prospect discovering eligibility, programmes and next steps.
2. **Student** — authenticated user managing documents, recommendations, proposal, payment and procedure.
3. **Admin / Advisor** — staff handling dossiers, reviews, proposals, payments, catalogue and procedures.

The objective is not cosmetic similarity with another site. The objective is comparable product discipline: clear hierarchy, predictable service flows, institutional trust, excellent state handling, strong accessibility and consistent behaviour across desktop/mobile/RTL.

---

## 2. Current repository baseline

Current main inspected at the start of Stage 1:

- `bdb7aa6d7b2efd2988b6a1ead2aa6ae5dab54e9f`
- Next.js 16 / React 19 / Tailwind CSS 4.
- Existing reusable UI primitives are limited to:
  - Badge
  - Button / ButtonLink
  - Card
  - EmptyState
  - PageHeader
  - ProgressBar
  - Skeleton
  - StatusState
- 85 component files exist across admin, student, prospect, orientation, public and auth surfaces.
- Current global styling already contains many route-specific exceptions, especially for Orientation, Prospect, Student and Arabic/RTL.
- Storybook, Playwright visual regression, axe CI and Lighthouse CI are not yet part of the package baseline.

### Architectural observation

The application has evolved feature-by-feature. This has produced a strong functional surface but several presentation systems now coexist:

- public/home editorial styling;
- orientation-specific visual language;
- prospect portal styling;
- student portal styling;
- admin operational styling;
- auth styling;
- Arabic-specific overrides.

The next system should not erase legitimate context differences, but all of them need to derive from one common AlmaGo foundation.

---

## 3. Route inventory by audience

### Candidate / Orientation

Primary user-facing routes currently include:

- `/`
- `/orientation`
- `/orientation/claim/[token]`
- `/orientation/continue/[token]`
- `/orientation/report/[token]`
- `/signup`
- `/login`
- `/reset-password`
- `/contact`
- legal routes

### Prospect / pre-client

Current routes include:

- `/prospect`
- `/prospect/orientation`
- `/prospect/catalogue`
- `/prospect/documents`
- `/prospect/proposal`
- `/prospect/offers`
- `/prospect/payment`
- `/prospect/roadmap`
- `/prospect/solutions`

### Student

Current routes include:

- `/student`
- `/student/onboarding`
- `/student/profile`
- `/student/project`
- `/student/pathway`
- `/student/orientation`
- `/student/documents`
- `/student/applications`
- `/student/calendar`
- `/student/checklist`
- `/student/language-courses`
- `/student/finance-insurance`
- dynamic student sections

### Admin / Advisor

Current routes include:

- `/admin`
- `/admin/intake`
- `/admin/documents`
- `/admin/orientation`
- `/admin/prospects`
- `/admin/applications`
- `/admin/payments`
- `/admin/offers`
- `/admin/universities`
- `/admin/programs`
- `/admin/language-courses`
- `/admin/finance-insurance`
- partner/demo surfaces

---

## 4. Initial product findings

### 4.1 The product is module-centric where the user mental model is journey-centric

Admin currently navigates primarily by system modules: Documents, Orientation, Prospects, Payments, Universities, Programmes, etc.

The professional target should make the **student dossier** the primary operational object:

> Dossier → Profile → Documents → Orientation → Proposal → Messages → Payment → Procedure → Applications → History

Cross-dossier queues still exist for operational work, but they become supporting views rather than the only mental model.

### 4.2 Candidate, prospect and student continuity is not visually obvious enough

The repository contains separate public orientation, prospect and student surfaces. This is technically useful, but the product must feel like one continuous service.

The target experience must preserve context when a user moves:

> Orientation result → account/prospect → authenticated student dossier

The visual language, terminology and progress state must communicate continuity instead of a platform change.

### 4.3 Global CSS has accumulated product-specific exceptions

The current `globals.css` includes broad application tokens and many feature-specific rules:
- Orientation colours and loading treatment.
- Prospect shell treatment.
- Student shell and journey rules.
- Auth RTL rules.
- Student RTL rules.
- Print-specific Orientation rules.

This indicates the need for:
- a stronger semantic token layer;
- reusable layout primitives;
- logical-property-first RTL implementation;
- less feature-specific CSS in the global stylesheet.

### 4.4 The current token system is useful but too shallow

Current shared variables include:
- background / foreground;
- surface variants;
- brand/accent;
- border;
- muted;
- warning/danger;
- shadows;
- two radii;
- a small spacing/page-title layer.

The professional target needs a complete semantic system:
- primitive palette;
- semantic colours;
- typography roles;
- spacing scale;
- radii scale;
- elevation;
- layout widths;
- interactive states;
- focus;
- motion;
- data-visualisation/status semantics.

### 4.5 Reusable UI inventory is too small relative to product complexity

The codebase has strong feature components but too few foundation components.

Critical missing product primitives include:
- form field wrapper / validation message;
- Select and combobox patterns;
- Tabs / segmented controls;
- modal and drawer patterns;
- timeline/activity;
- dossier header;
- data table/data row;
- search/filter toolbar;
- document row/review row;
- notification surface;
- stepper/status rail;
- alert/notice system with consistent semantics;
- skeleton families per content type.

Without these, feature pages keep inventing local patterns.

### 4.6 Visual density lacks a single contract

Current surfaces alternate between:
- large editorial cards;
- operational cards;
- repeated bordered panels;
- dense technical audit output;
- large empty regions.

Target density must be intentional:
- **public/candidate:** calm, guided, low cognitive load;
- **student:** medium density, task-oriented;
- **admin:** higher density, scan-first, action-first.

Density should differ by audience while sharing the same visual grammar.

### 4.7 Technical implementation terminology leaks into product UI

Terms and values intended for data/debug contexts sometimes appear in operator-facing UI.

Stage 1 establishes the rule:

> internal states may remain in database and diagnostic views; normal user/operator UI must use human language.

Examples of categories to translate:
- raw lifecycle/state values;
- qualification engine labels;
- version numbers not needed operationally;
- minor-unit monetary representations;
- technical identity/anonymisation strings;
- algorithmic reason codes.

### 4.8 Orientation contains valuable intelligence but exposes too much of the engine

The Orientation engine includes discovery, verification, selection, writer and audit phases. That is an asset.

Professional presentation should apply progressive disclosure:

**Default advisor layer**
- profile summary;
- recommended programmes;
- fit explanation;
- unresolved risks;
- evidence confidence;
- next action.

**Technical layer**
- A/B/C/D stages;
- raw reason codes;
- unknown fields;
- provenance/debug;
- engine diagnostics.

The technical layer remains available to staff but no longer dominates the default reading path.

### 4.9 Admin dashboard has the correct emerging direction

The current admin overview already prioritises operational work:
- student responses;
- documents;
- Campus dossiers;
- applications;
- catalogue freshness.

This is the right behavioural model.

Stage 4 should preserve this principle while moving from a collection of summary cards to an integrated operations cockpit.

### 4.10 RTL is actively supported but implemented with significant per-feature overrides

This is better than ignoring RTL, but the target design system needs RTL as a first-class layout property.

Rules:
- use logical CSS properties by default;
- avoid manual mirroring unless semantically required;
- directional icons must flip only when their meaning is directional;
- typography roles should explicitly define Arabic behaviour;
- every pilot screen is designed and QA'd in RTL, not patched afterward.

---

## 5. Target canonical journeys

### 5.1 Candidate / Orientation

`Landing → Orientation → Analysis → Result → Recommended options → Next action → Continue/save → Authenticated space`

Primary candidate question on every screen:

> What should I do next?

The candidate must never need to understand the internal Orientation pipeline.

### 5.2 Student

`Dashboard → Required actions → Documents/profile → Campus review → Proposal → Discuss or accept → Payment → Procedure/applications → Status & notifications`

Primary student questions:

> Where is my dossier now?
> What do I need to do?
> What is Campus Allemagne doing?
> What happens next?

### 5.3 Admin / Advisor

`Priority queue → Open dossier → Verify evidence → Analyse → Prepare proposal → Receive student response → Validate payment → Follow procedure/applications`

Primary advisor questions:

> Who needs attention?
> Why?
> What decision is required?
> What evidence supports the decision?
> What happened previously?

---

## 6. Target information architecture

### Candidate / public

Global primary:
- Study in Germany / Orientation
- How it works
- Programmes or resources when useful
- Help
- Sign in / Continue dossier

Do not expose internal product modules.

### Student

Recommended primary navigation:
- Home
- My journey
- Documents
- Programmes / Recommendations
- Messages

Secondary/account:
- Profile
- Settings
- Help
- Logout

Workflow-specific steps remain contextual rather than all being permanent top-level navigation.

### Admin

Recommended primary navigation:
- Overview
- Dossiers
- To review
- Catalogue
- Finance
- Administration

Within a dossier:
- Overview
- Profile
- Documents
- Orientation
- Proposal
- Messages
- Payment
- Procedure
- Applications
- History

Cross-dossier work queues remain available under "To review".

---

## 7. Visual system direction

### 7.1 Desired qualities

AlmaGo V2 should feel:
- institutional;
- calm;
- precise;
- human;
- trustworthy;
- contemporary;
- efficient rather than decorative.

Avoid:
- excessive card nesting;
- repeated giant page heroes in authenticated areas;
- decorative gradients without information purpose;
- oversized typography in dense operator surfaces;
- excessive borders;
- inconsistent radii;
- arbitrary colour variation;
- raw debug information.

### 7.2 Surface hierarchy

Define four clear surface levels:
1. page canvas;
2. base surface;
3. elevated/interactive surface;
4. contextual/status surface.

Not every group of text becomes a card.

### 7.3 Typography

Define stable roles:
- Display
- H1
- H2
- H3
- Body
- Body small
- Label
- Metadata
- Numeric / tabular

Arabic receives equivalent semantic roles rather than CSS exceptions.

### 7.4 Spacing

Proposed initial rhythm:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64

No arbitrary spacing unless a documented component requires it.

### 7.5 Interaction hierarchy

Each screen should have:
- one obvious primary action;
- a restrained number of secondary actions;
- tertiary actions in menus/links where appropriate;
- consistent destructive styling;
- explicit loading and success feedback.

---

## 8. Target component inventory

### Foundations
- AppShell
- PublicShell
- StudentShell
- AdminShell
- PageContainer
- PageHeader
- DossierHeader
- SectionHeader

### Actions
- Button
- IconButton
- ButtonLink
- ActionMenu

### Forms
- Field
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- FileUpload
- DateInput
- SearchInput
- ValidationMessage

### Navigation
- PrimaryNav
- SecondaryNav
- Breadcrumb
- Tabs
- SegmentedControl
- Pagination

### Status & feedback
- Badge
- Status
- Alert
- Notice
- Toast
- Progress
- Stepper
- Skeleton
- EmptyState
- ErrorState

### Data & dossier
- Card
- Panel
- Metric
- DataList
- DataRow
- DataTable
- FilterBar
- Timeline
- ActivityItem
- DocumentRow
- ProgrammeCard
- RecommendationCard
- ProposalCard
- PaymentSummary

### Overlays
- Modal
- Drawer
- Popover
- Tooltip

---

## 9. Pilot screens

The system will be proven first on three screens.

### Pilot 1 — Student Dashboard / Dossier Home

Must prove:
- authenticated shell;
- journey/status hierarchy;
- one primary next action;
- documents/recommendation/proposal summary;
- responsive behaviour;
- RTL.

### Pilot 2 — Admin Student Dossier / Advisor Cockpit

Must prove:
- professional data density;
- dossier-centric architecture;
- action prioritisation;
- timeline/history;
- evidence/document review;
- proposal workflow;
- technical-detail progressive disclosure.

### Pilot 3 — Candidate Orientation Result / Next Action

Must prove:
- public trust;
- simple explanation of complex analysis;
- programme recommendations;
- risk/unknown handling;
- conversion into saved/authenticated journey;
- mobile readability.

---

## 10. Responsive contract

Every pilot is validated at:
- 360px
- 390px
- 768px
- 1024px
- 1280px
- 1440px+

Acceptance is not merely "no overflow".

Each breakpoint must preserve:
- priority hierarchy;
- touch targets;
- readable measure;
- sensible navigation;
- task completion without hidden critical actions.

---

## 11. Accessibility contract

Baseline requirements:
- complete keyboard path for critical flows;
- visible focus;
- semantic headings;
- labelled controls;
- accessible validation/error messaging;
- status not conveyed by colour alone;
- WCAG contrast targets;
- reduced-motion support;
- usable zoom;
- screen-reader meaningful labels;
- minimum practical touch target.

Automated checks will later use axe and Lighthouse, but Stage 1 defines the product contract first.

---

## 12. Content contract

Product copy must:
- use plain French by default;
- avoid unexplained administrative jargon;
- avoid raw technical labels;
- distinguish AlmaGo recommendation from university decision;
- state uncertainty clearly;
- provide next-action wording;
- stay consistent across candidate/student/admin.

German and Arabic follow the same semantic terminology, not literal word-for-word translation.

---

## 13. State contract

Critical components/screens must define:
- loading;
- normal;
- empty;
- warning;
- error;
- blocked;
- success;
- long content;
- permission/authorization failure when applicable;
- slow/retry state where applicable.

This is mandatory before a workflow is considered production-ready.

---

## 14. Implementation sequence after Stage 1

1. Figma foundations and tokens.
2. Component library V2.
3. Student pilot.
4. Admin dossier pilot.
5. Candidate Orientation pilot.
6. Validate all three together.
7. Migrate remaining Student surfaces.
8. Migrate Admin.
9. Migrate Candidate/Public.
10. Standardise forms/documents/catalogue/offers/payment.
11. Add Storybook / Playwright / axe / Lighthouse gates.
12. Instrument analytics and observability.
13. Full cross-browser, RTL, accessibility and launch QA.

---

## 15. Stage 1 quality gate

Stage 1 is complete only when:

- [x] Current route inventory recorded.
- [x] Current UI/component baseline recorded.
- [x] Current CSS/token maturity assessed.
- [x] Three canonical audience journeys defined.
- [x] Target information architecture drafted.
- [x] Visual principles drafted.
- [x] Component inventory drafted.
- [x] Pilot screens locked.
- [x] Responsive contract drafted.
- [x] Accessibility contract drafted.
- [x] Content contract drafted.
- [ ] Benchmark pattern study completed.
- [ ] Current-screen keep/simplify/rebuild/merge matrix completed.
- [ ] Figma Stage 1 structure created.
- [ ] Figma foundations proposal created.
- [ ] Candidate pilot wire architecture approved.
- [ ] Student pilot wire architecture approved.
- [ ] Admin pilot wire architecture approved.
- [ ] Open feature PR collision map reconciled with migration sequence.
- [ ] Final Stage 1 review accepted.

No broad production redesign begins before this gate closes.
