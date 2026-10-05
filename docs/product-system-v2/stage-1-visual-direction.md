# AlmaGo Product System V2 — Visual Direction & Experience Language

Status: **Stage 1 visual contract**

This document defines the visual direction to prevent AlmaGo from becoming a generic AI/SaaS dashboard.

The design goal is not "more cards, more shadows, more gradients". It is a disciplined service-product identity that feels credible enough for a serious international education platform.

Canonical lifecycle:

> Candidate → Free Orientation → Prospect → Proposal → Payment/Validation → Active Student

Admin spans the entire lifecycle.

---

## 1. Brand personality

AlmaGo should feel:

- **institutional without being cold**;
- **professional without being corporate-heavy**;
- **clear before clever**;
- **human without looking informal**;
- **precise without exposing technical complexity**;
- **European / international** rather than generic startup SaaS;
- **reassuring for a first-time international student**;
- **efficient for an advisor who processes many dossiers**.

Avoid:
- fintech-style neon gradients;
- oversized startup hero copy inside authenticated areas;
- "AI assistant" visual clichés;
- excessive rounded cards;
- decorative dashboards where every block has equal weight;
- fake urgency or scarcity;
- admission-probability gimmicks;
- stock-photo-heavy admin/product UI.

---

## 2. Visual signature

AlmaGo's recognisable signature should come from a combination of:

1. warm ivory canvas;
2. charcoal primary text;
3. restrained AlmaGo red for action/identity;
4. gold as a controlled accent, not a second CTA colour;
5. structured editorial typography;
6. thin, calm borders;
7. compact dossier/status strips;
8. asymmetric page hierarchy rather than repetitive grids;
9. service-process language and meaningful timelines;
10. selective use of real educational/location imagery in public/catalogue surfaces only.

The UI should remain recognisable even if the logo is hidden.

---

## 3. Surface system

### Level 0 — Canvas
Warm ivory / neutral page background.

Purpose:
- visual calm;
- separates the application from generic white SaaS dashboards.

### Level 1 — Base surface
White/near-white.

Use for:
- core reading/work surfaces;
- forms;
- dossier content;
- tables/lists.

### Level 2 — Subtle surface
Light neutral/ivory.

Use for:
- metadata;
- grouped facts;
- secondary information;
- empty/waiting state context.

### Level 3 — Emphasis surface
Brand-soft / warning-soft / success-soft / charcoal.

Use only for:
- next action;
- critical state;
- activation/completion;
- strong transactional summary.

Rule:

> Not every section becomes a card.

Prefer:
- section separators;
- data lists;
- grouped rows;
- whitespace;
- typography.

---

## 4. Card discipline

A card is reserved for an actual object or task.

Good card objects:
- programme;
- proposal;
- payment summary;
- document requiring action;
- current next action;
- application;
- meaningful status event.

Bad card usage:
- wrapping every paragraph;
- wrapping a heading plus another set of nested cards;
- using a card solely to create spacing;
- showing six equal cards for unrelated concepts.

Rule:

> If a box has no independent object, action, status or boundary, it probably should not be a card.

---

## 5. Typography

Target tone:
- editorial clarity for public/candidate;
- operational clarity for Prospect/Student/Admin.

Semantic roles:

### Display
Use rarely:
- public landing;
- major Orientation result statement.

### H1
Primary page/task title.

### H2
Major section.

### H3
Object/action grouping.

### Body
Default explanatory text.

### Body Small
Operational supporting copy.

### Label
Field/table/status grouping.

### Metadata
Dates, source, secondary IDs.

### Numeric
Prices, counts, deadlines.

Rules:
- no tiny 10px body text for important content;
- uppercase only for small labels/eyebrows;
- no decorative serif unless a later brand decision explicitly introduces one;
- typography hierarchy must do more work so borders can do less.

---

## 6. Colour semantics

### Red
Use for:
- primary action;
- AlmaGo brand cue;
- active navigation;
- important user-side action.

Do not use red for:
- every heading;
- ordinary information;
- harmless badges.

### Gold
Use for:
- accent;
- transition/attention;
- pre-activation boundary;
- selected high-value highlight.

Do not use gold as a competing primary CTA.

### Green
Use for:
- verified;
- received;
- approved;
- activated;
- success.

### Amber
Use for:
- needs review;
- unresolved;
- warning;
- waiting when user attention may be needed.

### Blue / informational tone
Use sparingly for:
- Campus processing;
- informational waiting;
- neutral process state.

### Danger
Reserved for:
- rejection;
- destructive action;
- payment failure;
- irreversible risk.

Status must never rely on colour alone.

---

## 7. Iconography

Use one consistent outline icon family/style.

Rules:
- simple 1.5–2px stroke;
- no mixed filled/outline icon sets without purpose;
- no decorative 3D icons in operational UI;
- directional icons flip in RTL only when meaning is directional;
- status meaning must remain readable without icons.

Preferred icon use:
- navigation;
- compact action affordance;
- document type;
- status category;
- timeline.

Avoid:
- icon next to every sentence;
- random emoji;
- oversized decorative icons inside empty states.

---

## 8. Imagery strategy

Images should add trust or context, not fill space.

### Public / Candidate
Allowed:
- real student environments;
- German university/city context;
- authentic campus/study-life photography;
- restrained institutional illustrations if custom and useful.

### Catalogue
Programme/university imagery can help discovery if:
- sourced legally;
- current;
- not misleading;
- visually consistent.

If reliable imagery is unavailable:
- prefer typography/location/identity design over generic stock.

### Prospect
Use little or no photography.
The user is now completing a real process.

### Student
No decorative photography on dashboard/workflow screens.

### Admin
No decorative photography.

Rule:

> Operational confidence comes from hierarchy and information quality, not pictures.

---

## 9. Audience-specific density

### Candidate
Density: low to medium.

Characteristics:
- generous whitespace;
- guided steps;
- fewer decisions at once;
- visual explanation.

### Prospect
Density: medium.

Characteristics:
- project status;
- next action;
- Campus action;
- programme discovery;
- proposal boundary.

### Active Student
Density: medium-high.

Characteristics:
- next action;
- deadlines;
- applications;
- documents;
- messages;
- journey.

### Admin
Density: high but calm.

Characteristics:
- scan-first;
- rows/tables/data lists;
- fewer decorative blocks;
- persistent dossier context;
- shortcuts by priority.

One design system, four density modes.

---

## 10. Navigation language

### Candidate
Simple top navigation.
Do not expose product architecture.

### Prospect
Primary:
- Accueil
- Orientation
- Catalogue
- Documents
- Proposition
- Messages/Aide

Payment appears contextually.

### Active Student
Primary:
- Accueil
- Mon parcours
- Documents
- Candidatures & programmes
- Messages

### Admin
Primary:
- Vue d’ensemble
- Dossiers
- À traiter
- Catalogue
- Finance
- Administration

Navigation should reflect user mental models, not database tables.

---

## 11. Layout rhythm

Target desktop page frame:
- stable max-width;
- clear reading column;
- stronger content alignment;
- restrained full-width blocks.

Spacing rhythm:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64

Typical:
- inline gap: 8–12;
- control group: 12–16;
- card padding: 16–24;
- section gap: 32–48;
- major page separation: 48–64.

Avoid arbitrary 18/22/27px spacing unless component-specific and documented.

---

## 12. Corner radius discipline

Target:
- controls: 8px;
- cards/panels: 12px;
- major emphasis panel: 14–16px;
- pills/badges: full radius.

Avoid:
- 24–32px radii everywhere;
- mixing 6, 10, 13, 18, 22 without system meaning.

---

## 13. Shadows

Default:
- most operational surfaces: no shadow;
- small elevation only for floating/overlay elements;
- subtle shadow for selected public/premium emphasis.

Trust comes from:
- spacing;
- contrast;
- typography;
- borders;
not heavy elevation.

---

## 14. Form design

Forms are service interfaces.

Each field group must support:
- label;
- hint;
- input/control;
- validation;
- error;
- success when useful;
- optional/required language.

Rules:
- never use placeholder as label;
- explain why sensitive information is requested;
- preserve values after validation error;
- one meaningful task per page/section when possible;
- submit state must be explicit;
- avoid multi-column forms on narrow screens.

---

## 15. Status design

Every important status answers:

1. What happened?
2. Who acts next?
3. What should I do?
4. When does it matter?

Bad:
> In progress

Good:
> Campus Allemagne vérifie vos documents. Aucune action n’est requise pour le moment.

Bad:
> payment_pending

Good:
> Proposition acceptée · paiement à finaliser

---

## 16. Timeline design

Use only for causal processes.

Good:
- Orientation completed
- Documents validated
- Proposal sent
- Payment received
- Student activated
- Application sent
- University decision

Avoid:
- arbitrary decorative stepper;
- showing future steps as guaranteed outcomes;
- every backend mutation.

Completed/current/future states must be visually distinct.

---

## 17. Tables and operational lists

Admin and catalogue management should favour:
- compact rows;
- stable columns;
- filters above;
- sortable columns where useful;
- direct row action;
- meaningful status;
- last update;
- responsible side.

Avoid turning every table row into a large card on desktop.

Mobile can transform rows into structured stacked records.

---

## 18. Programme card standard

Default scan layer:
- programme name;
- university;
- city;
- degree;
- language;
- intake;
- one compatibility/status line;
- one primary action.

Secondary detail:
- application route;
- deadline;
- requirements;
- source;
- verification date;
- semester contribution/fees;
- notes.

Do not show all metadata in every card.

---

## 19. Dossier header standard

Used in Admin and Student variants.

Core:
- person/project identity;
- lifecycle/procedure stage;
- last meaningful update;
- next action owner;
- key action.

Admin adds:
- contact/reference;
- attention reason;
- operational actions.

Student adds:
- active service;
- project summary;
- next major milestone.

---

## 20. Proposal visual pattern

Proposal should visually read as a serious decision document.

Structure:
1. recommendation;
2. included service;
3. price;
4. boundaries/exclusions;
5. accept/discuss;
6. history/details.

Avoid:
- e-commerce pricing table aesthetic;
- "Bronze / Silver / Gold" language dominating a personalised proposal;
- oversized discount/urgency patterns.

---

## 21. Empty states

Professional empty state has:
- a meaningful heading;
- why it is empty;
- whether that is normal;
- one relevant action if any.

No giant illustration required.

Examples:

### No applications yet
> Aucune candidature n’est encore ouverte.
>
> Campus Allemagne prépare d’abord votre sélection de programmes.

### Campus review
> Rien à faire de votre côté pour le moment.
>
> Nous vérifions votre dossier et vous informerons dès que la proposition est prête.

---

## 22. Motion

Motion should explain state change.

Use:
- 120–200ms control transitions;
- subtle panel reveal;
- progress/state transitions;
- drawer/modal movement;
- skeleton fade.

Avoid:
- bouncing;
- floating decorative elements;
- continuous gradient animation;
- excessive page-transition effects.

Respect reduced-motion preferences.

---

## 23. Microcopy tone

French:
- simple;
- direct;
- respectful;
- concrete.

Prefer:
> Envoyez votre passeport

Over:
> Veuillez procéder au téléversement de votre document d’identité.

Prefer:
> Campus vérifie votre dossier

Over:
> Votre dossier est actuellement en cours de traitement.

Avoid jargon where a simple phrase exists.

---

## 24. Trust cues

Use:
- clear responsibility boundaries;
- official source links;
- verification dates;
- real status;
- human next action;
- price transparency;
- privacy explanation near sensitive tasks;
- consistent error handling.

Do not fake trust with:
- shields everywhere;
- "100% secure" marketing claims;
- unverified badges;
- admission success-rate claims.

---

## 25. Anti-generic-AI design checklist

A screen fails if it contains several of these:
- five equal rounded cards;
- gradient background with no information function;
- giant centered hero inside authenticated UI;
- random glassmorphism;
- abstract illustration that adds no meaning;
- every label in a pill;
- repeated "Learn more" links;
- symmetric three-column layout regardless of task priority;
- vague CTA ("Continue", "Explore") where a specific action exists;
- fake metrics/progress;
- excessive iconography;
- too much empty space in operational views.

A screen passes when:
- its primary task is obvious in 3–5 seconds;
- hierarchy follows lifecycle/task importance;
- data density suits the audience;
- fewer visual containers are used;
- statuses explain ownership and next action;
- the interface still looks coherent without the logo.

---

## 26. Reference pattern synthesis

Use as pattern references, not visual templates:

- **uni-assist:** finite application process, account continuity, payment as processing gate. citeturn576033search0turn576033search5
- **UCAS adviser portal:** quick filters, overall vs individual choice status, last-updated visibility, applicant drill-down. citeturn576033search1turn576033search4
- **GOV.UK / regulated service design:** one task and one next step at a time.
- **Booking:** scanability and progressive filters for catalogue/discovery.
- **TLS/VFS:** clear responsibility boundary and tracking.
- **FlixBus:** transaction object before purchase, management object after purchase.

AlmaGo combines these mechanisms under its own visual identity.

---

## 27. Visual acceptance standard

Every pilot must demonstrate:

- distinctive AlmaGo visual language;
- no generic SaaS-card look;
- one dominant task;
- meaningful object hierarchy;
- correct Prospect/Student lifecycle terminology;
- audience-appropriate density;
- desktop/mobile quality;
- RTL;
- loading/empty/error/success states;
- accessible focus/contrast;
- realistic long-content stress;
- no raw technical state leakage.

This visual contract is binding for all subsequent V2 implementation.
