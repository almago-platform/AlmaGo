# AlmaGo — Admin Space V2 Professional Plan

**Status:** SAVED DESIGN SOURCE OF TRUTH  
**Date:** 24 September 2026  
**Scope:** authenticated admin space only (`/admin/**`)  
**Relation to Master Plan:** UX/UI refinement only. No new business capability. Existing Auth/RLS/Supabase truth and permissions remain unchanged.

---

## 1. Objective

The admin space must feel like a calm operational workspace, not like a technical back office.

Within seconds, an AlmaGo team member should understand:

1. what requires attention now;
2. which student dossiers are blocked;
3. which documents need review;
4. which applications need an update;
5. what catalogue data needs maintenance;
6. where the next operational action should happen.

Target feeling:

> “Je vois immédiatement les priorités, je sais quoi traiter, et je peux agir sans chercher.”

---

## 2. Reference direction

Admin Space V2 continues the approved AlmaGo design direction:

### From TLScontact
Keep:
- operational clarity;
- serious institutional tone;
- obvious next action;
- low visual noise;
- clear status communication;
- confidence and consistency.

### From uni-assist
Keep:
- procedural clarity;
- step-by-step handling;
- clear separation of dossier stages;
- strong information hierarchy;
- user-centred wording.

### AlmaGo admin result
The admin area must feel:
- professional;
- operational;
- fast to scan;
- trustworthy;
- consistent;
- low-friction;
- clearly separated from the student-facing experience.

No proprietary TLScontact or uni-assist visual design is copied.

---

## 3. Global principles

### Every admin page should answer

- What needs attention?
- How many items are waiting?
- Which item should be treated first?
- What will the student see?
- What is internal only?
- What changes when I save this action?

### Avoid

- raw technical statuses when a clear operational label exists;
- equal visual weight for every card;
- dark dashboard blocks that dominate the page;
- huge forms without structure;
- destructive actions mixed with routine actions;
- mobile tables or horizontal overflow;
- hidden consequences of an action;
- fake productivity scores;
- unnecessary analytics or charts.

### Prefer

- one operational priority at the top;
- compact summary counts;
- structured review queues;
- explicit student-visible vs internal wording;
- sticky or obvious save actions where useful;
- filters close to the list they affect;
- calm AlmaGo blue/white visual system;
- orange only for attention.

---

## 4. Admin shell

### Desktop sidebar

- AlmaGo
- “Espace administration”
- Vue d’ensemble
- Documents
- Candidatures
- Orientation
- Universités
- Programmes

Recommended order prioritises dossier operations before catalogue maintenance.

### Header

Show current section and concise operational context.

Example:

> Documents  
> Traitez les pièces en attente avant de poursuivre les dossiers concernés.

### Mobile

Replace the current horizontal scrolling admin nav with the same high-quality compact menu pattern used for Student Space V2.

Requirements:
- 44 px touch targets;
- scrollable menu when needed;
- no clipped labels;
- clear active page;
- logout separate from operational navigation.

---

## 5. Admin dashboard

The dashboard must prioritise work, not catalogue volume.

### Block A — Operational priority

Primary card should answer:

> Que traiter maintenant ?

Priority order based on existing data:
1. documents pending / replacement;
2. applications with active next action or overdue deadline;
3. orientation work;
4. catalogue maintenance.

No invented priority score.

### Block B — Four operational summaries

- Documents à traiter
- Candidatures actives
- Orientations publiées / à préparer when backed by data
- Catalogue actif

Each card links directly to the relevant workspace.

### Block C — Daily operating sequence

Keep a small three-step operational guide:
1. traiter les blocages dossier;
2. mettre à jour candidatures/orientation;
3. maintenir catalogue.

### Block D — Error state

If counts fail:
- explain nothing was modified;
- give retry action;
- avoid raw database errors.

---

## 6. Document review queue

This page should feel like a real review queue.

### Summary

Show:
- pending;
- replacement requested;
- total visible queue.

### Each document card

Show:
- student name;
- document category;
- filename;
- current status;
- upload date;
- current comment if relevant;
- open document action.

### Review action area

Clearly label:

> Message visible par l’étudiant

For review actions:
- Approuver
- Demander un remplacement
- Rejeter

Destructive/negative actions must remain visually secondary and clearly separated.

Before save, make the consequence clear:
- approval updates status;
- replacement/rejection message is visible to the student.

Do not change existing review API or validation rules.

---

## 7. Applications operations

Each application card should immediately show:

- student;
- university;
- programme;
- intake;
- deadline;
- current status;
- next action;
- student-visible note.

### Priority treatment

Applications with:
- overdue deadline;
- next action;
- documents missing;
must be visually prioritised using existing real states.

### Edit area

Separate:
- status;
- next action;
- student-visible note.

Show a clear dirty-state indicator:
- modifications not saved;
- saved.

Do not alter status transition logic.

---

## 8. Orientation operations

The current two-column form + list concept is retained but refined.

### Left / creation side

Structure clearly:
1. choose student;
2. review real profile summary;
3. choose programme;
4. choose recommendation status;
5. justify;
6. publish.

Add explicit reminder:

> La justification publiée est visible in the student orientation context and must be factual.

### Right / review side

Recommendation cards should show:
- student;
- programme;
- university/city;
- status;
- published justification;
- archive action.

Archive remains secondary.

No recommendation algorithm is added.

---

## 9. Universities catalogue

The page should become a structured catalogue workspace.

### Form

Group fields into:
- identity/location;
- institutional type;
- official links;
- description;
- financial notes;
- publication state.

### List

Each university card:
- name;
- city / Bundesland;
- type;
- public/private;
- active/inactive;
- concise description;
- edit action;
- activate/deactivate action.

### Search/filter

Keep search and type filtering close to list.

Do not add scraping or automatic enrichment.

---

## 10. Programs catalogue

This page currently has the densest form and needs the strongest visual restructuring.

Group fields:

### Programme identity
- university;
- name;
- degree level;
- field.

### Study structure
- teaching language;
- intake;
- duration.

### Admission criteria
- NC;
- diploma;
- indicative average;
- language requirements;
- Studienkolleg;
- TestAS;
- uni-assist.

### Deadlines / application
- winter;
- summer;
- official URL;
- fee notes.

### Internal maintenance
- AlmaGo notes;
- active/inactive.

No admission logic is invented.

---

## 11. Human operational wording

Use concise team-facing microcopy.

Examples:

### Priority
`À traiter maintenant`

### Student-visible boundary
`Visible par l’étudiant`

### Internal boundary
`Interne à AlmaGo`

### Save success
`Les modifications ont bien été enregistrées.`

### Error
`Nous n’arrivons pas à enregistrer cette modification pour le moment. Rien d’autre n’a été modifié.`

### Empty queue
`Aucun document n’attend de revue actuellement.`

---

## 12. Visual system

Use the same AlmaGo family as Homepage V2 and Student Space V2.

### Palette
- AlmaGo blue;
- white;
- warm off-white;
- orange for attention;
- semantic success/warning/error with accessible contrast.

### Admin-specific density
Admin may be denser than student pages, but should remain readable.

Use:
- compact cards;
- stronger section labels;
- clear form grouping;
- sticky actions where appropriate;
- consistent badges;
- whitespace around major operational decisions.

Avoid:
- decorative photography;
- marketing visuals;
- dashboards full of charts;
- overly dark panels.

---

## 13. Mobile requirements

Admin must remain usable on mobile, not merely viewable.

Target widths:
- 320 px
- 375 px
- 390 px
- 768 px
- 1024 px
- 1440 px

Requirements:
- compact menu;
- no wide tables;
- forms become single-column;
- action groups stack;
- long filenames and programme names wrap safely;
- sticky actions respect safe areas;
- search/filter controls remain usable;
- no hidden critical status.

---

## 14. Accessibility requirements

Before merge:
- WCAG AA contrast;
- correct heading hierarchy;
- visible focus;
- form labels;
- clear alert/status semantics;
- no serious/critical axe violations;
- no keyboard trap;
- practical touch targets.

---

## 15. Performance requirements

- no heavy animation library;
- no new dashboard charting library;
- preserve server-side data loading;
- avoid unnecessary client state;
- keep Lighthouse advisory budgets;
- do not add analytics as part of Admin Space V2.

---

## 16. Implementation sequence

### M1 — Admin shell + navigation
- reorder navigation by operational priority;
- professional desktop sidebar;
- compact mobile menu;
- section context header;
- active states;
- logout placement.

### M2 — Admin dashboard
- operational priority;
- four useful summaries;
- calm visual hierarchy;
- error/empty states.

### M3 — Documents review
- review queue summary;
- structured document cards;
- student-visible message boundary;
- safer review actions.

### M4 — Applications operations
- recognisable dossier cards;
- priority states;
- clearer edit grouping;
- dirty/save feedback.

### M5 — Orientation operations
- six-step publication structure;
- student profile summary;
- factual justification;
- published recommendation review list.

### M6 — Universities catalogue
- structured form sections;
- clearer catalogue cards;
- filters;
- activation state.

### M7 — Programs catalogue
- grouped dense form;
- readable programme cards;
- criteria/deadline separation.

### M8 — Microcopy + empty/error states
- unify admin wording;
- remove technical/cold messages;
- reinforce student-visible/internal boundaries.

### M9 — Mobile/responsive polish
- 320 / 375 / 390 / 768 / 1024 / 1440;
- menus;
- forms;
- action groups;
- long content;
- safe areas.

### M10 — Final quality pass
- tests;
- TypeScript;
- lint;
- build;
- Playwright;
- responsive screenshots;
- axe;
- Lighthouse;
- authenticated admin E2E when A43 credentials are available;
- manual visual review.

---

## 17. Governance

Same discipline as Homepage V2 and Student Space V2:

- one active phase at a time;
- one dedicated branch;
- one PR;
- canonical CI;
- Browser Quality;
- screenshot review when available;
- merge only after green evidence;
- no Auth/RLS/schema/permission changes unless separately required and reviewed;
- no new business capability outside the Master Plan.

---

## 18. Acceptance criteria

Admin Space V2 is accepted only when:

- priorities are obvious;
- document/application work is faster to scan;
- student-visible content is clearly identified;
- catalogue forms are structured and usable;
- raw technical presentation is reduced;
- desktop and mobile are intentional;
- long content cannot break layouts;
- errors and empty states are helpful;
- accessibility passes;
- tests pass;
- TypeScript passes;
- lint passes;
- build passes;
- browser quality passes;
- final screenshots are manually reviewed.

---

## 19. Approved direction

> TLScontact operational trust + uni-assist procedural clarity + AlmaGo modern team workspace.

Admin Space V2 should feel like a professional operations console for student dossier management, not a generic SaaS admin template.
