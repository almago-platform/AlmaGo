# Pilot 5 — Active Student Dashboard / Dossier Home

Status: **Stage 1 detailed interaction architecture**

This pilot begins only after AlmaGo has activated Student access.

Canonical entry:

> Prospect proposal accepted → payment received → Campus validation → Student access activated → Active Student Dashboard

The Student Dashboard is therefore **not** a continuation of the free Prospect dashboard with extra links. It is a different service phase with a different operational purpose.

The Student asks:

> Where is my dossier now?
> What do I need to do?
> What is Campus Allemagne doing?
> What external party are we waiting for?
> Which deadline matters next?

---

# 1. Access boundary

The current server-side access model is correct and must be preserved.

Current logic:
- pre-activation customer lifecycle statuses cannot use Student features;
- Student layout redirects those users back to `/prospect`;
- only `client_active` / `client_completed` can use full Student features when Phase 2 access is enabled.

V2 rule:

> Student UI is rendered only after server-authoritative activation.

No visual redesign may weaken this boundary.

---

# 2. Activation handoff — first Student visit

The first visit after activation should acknowledge the transition once, without turning the dashboard into a marketing page.

Suggested success banner:

> **Votre espace étudiant est actif**
>
> Votre proposition a été confirmée et votre paiement validé. Votre accompagnement AlmaGo continue maintenant depuis ce dossier.

Primary:
> Voir ma prochaine étape

Secondary:
> Voir mon offre & paiement

The banner can disappear after acknowledgement or after the first meaningful Student action.

Continuity must be visible:
- same project;
- same route;
- same documents;
- same proposal/service;
- same dossier history.

The Student must not feel they have entered a completely unrelated account.

---

# 3. Dashboard product model

The dashboard is a **dossier cockpit**, not a collection of shortcuts.

It must prioritise:

1. lifecycle/procedure context;
2. one dominant next action;
3. responsibility;
4. deadlines;
5. blockers;
6. recent meaningful activity;
7. secondary resources.

The page should not try to preview every Student module equally.

---

# 4. Persistent Student dossier header

## Identity/context

Show:
- first name;
- active route/service;
- target degree/field;
- target intake when known.

Example:

> **Votre dossier Allemagne**
>
> Bachelor · Informatique · Rentrée hiver 2027

Secondary:
> Accompagnement · Études

Do not repeat the entire profile.

## Status

Human lifecycle/procedure status, e.g.:
- Préparation du dossier
- Documents en cours
- Candidatures en préparation
- Candidatures envoyées
- En attente des universités
- Admission reçue
- Préparation du départ

These statuses must derive from meaningful procedure/application state, not arbitrary percentages.

---

# 5. One dominant next action

The existing dashboard already computes a useful next action from:
- documents requiring replacement/action;
- application next actions;
- checklist actions;
- no-action/waiting state.

V2 preserves and strengthens this logic.

## Priority hierarchy

Recommended initial order:

1. safety/blocking payment/account issue if one exists;
2. overdue application action;
3. document replacement/rejection blocking progress;
4. external/application deadline requiring Student action;
5. current procedure task assigned to Student;
6. general checklist task;
7. no Student action / Campus or external side is working.

The exact order should later be reconciled with the merged procedure/deadline PR logic.

## Next action card

Shows:
- action label;
- plain-language reason;
- deadline / urgency if applicable;
- expected effort only when reliable;
- one CTA.

Example:

> **Remplacez votre relevé de notes**
>
> Campus Allemagne ne peut pas finaliser cette candidature tant que le nouveau document n’est pas reçu.
>
> Échéance : 12 octobre
>
> **Remplacer le document**

Avoid generic:
> Continuer

when a more specific action exists.

---

# 6. Responsibility model

Directly below or beside the next action:

### À vous
What the Student must do.

### Campus Allemagne
What the team is currently doing.

### Université / autorité
What is outside both parties' immediate control.

Only show relevant owners.

Example:

> **À vous**
> Aucun élément demandé aujourd’hui.

> **Campus Allemagne**
> Vérification finale de votre candidature FH Aachen.

> **FH Aachen**
> En attente de la décision de l’établissement.

This is stronger than a generic progress percentage.

---

# 7. Journey / procedure summary

The existing product currently has several overlapping concepts:
- project;
- pathway;
- checklist;
- AlmaGo journey;
- applications.

V2 consolidates them visually into **Mon parcours**.

The dashboard shows a compact journey summary, not the complete workflow.

Suggested high-level milestones:

1. Projet confirmé
2. Dossier préparé
3. Programmes sélectionnés
4. Candidatures préparées
5. Candidatures envoyées
6. Décisions
7. Départ / installation

Actual milestone set may vary by active service route.

Critical rule:
- do not map every database state into a visible step;
- do not show a percentage unless it has a defensible meaning.

The current checklist completion percentage is useful as a local measure but should not be presented as "Germany project 72% complete".

---

# 8. Deadlines

The current dashboard already aggregates:
- application deadlines;
- checklist due dates.

V2 keeps this but prioritises them better.

## Deadline bands

### En retard
Strong but calm alert.

### Dans les 7 prochains jours
High priority.

### Plus tard
Secondary.

Each row:
- date;
- action/object;
- owner;
- status;
- link.

Examples:
- 12 Oct · Remplacer document · À vous
- 19 Oct · Deadline FH Aachen · Campus
- 31 Oct · Réponse université attendue · Externe

Do not mix:
- official university deadline;
- internal Campus target;
- user reminder

without labelling the type.

---

# 9. Documents panel

Dashboard shows only actionable or recently changed document information.

## If action required
Show:
> 1 document à remplacer

Rows:
- file/category;
- status;
- Admin note;
- CTA.

## If pending review
Show:
> 2 documents en vérification par Campus

No unnecessary CTA.

## If all good
Keep compact:
> Documents à jour

Link:
> Voir mes documents

Do not embed the full document manager in the dashboard.

---

# 10. Applications panel

The current dashboard already has application next actions and deadlines.

V2 summary:

For each active application:
- programme;
- university;
- human status;
- next action owner;
- deadline if relevant.

Max 3 items on dashboard.

Human statuses:
- À préparer
- Documents à compléter
- Prête à envoyer
- Envoyée
- En attente de l’université
- Admission reçue
- Refus
- Retirée

No raw workflow keys.

If no applications exist:
do not show a giant empty panel unless creating/selecting applications is currently the next relevant phase.

---

# 11. Programmes / recommendations

Post-activation recommendations should no longer look like generic catalogue marketing.

They become one of:
- selected programmes;
- programmes under review;
- programmes ready for application;
- saved alternatives.

Dashboard shows only relevant shortlist items.

Each card/row:
- programme;
- university;
- current role in dossier;
- requirement issue if blocking;
- application status if already created.

General catalogue browsing remains available but secondary.

---

# 12. Messages / Campus communication

The current product does not yet make communication a first-class Student navigation item everywhere.

V2 target:
- important Campus message count/status;
- latest meaningful message;
- open conversation.

The dashboard may show:
> Nouveau message de Campus Allemagne

Primary only if the message contains a required action.

Do not create a separate notification card when there are no messages.

---

# 13. Recent activity

Current dashboard already aggregates:
- application events;
- document uploads;
- recommendation creation.

V2 timeline should include only meaningful events:

Examples:
- Campus approved your passport
- Application created for FH Aachen
- Application sent
- University requested another document
- New programme added to your shortlist
- Campus updated your dossier
- Payment validated / Student space activated

Avoid raw logs:
- row updated;
- status changed from X to Y;
- recommendation record inserted.

Max 5 recent events on dashboard.

Full history lives under:
> Historique du dossier

---

# 14. Navigation V2

The current AppShell exposes ten Student destinations:
- dossier
- project
- pathway
- profile
- documents
- programmes
- language courses
- finance & insurance
- checklist
- applications

This is too much permanent primary navigation for the target product.

## Recommended primary navigation

1. **Accueil**
2. **Mon parcours**
3. **Documents**
4. **Candidatures & programmes**
5. **Messages**

## Secondary / account navigation

- Profil
- Offre & paiement
- Cours de langue
- Financement & assurance
- Aide
- Paramètres / langue
- Déconnexion

## Conceptual merges

### Mon projet + Mon parcours + checklist
Become:
> **Mon parcours**

Project/profile data remains editable in context.

### Orientation + programme recommendations + applications
Can share one parent concept:
> **Candidatures & programmes**

Subsections:
- Recommandations
- Sélection
- Candidatures

General catalogue may remain an exploration subview.

This reduces navigation without deleting capabilities.

---

# 15. Desktop layout

Target 1440+:

## Header
- dossier/project identity;
- active service;
- current high-level status.

## Main grid
Approximately:
- 2/3 main operational column;
- 1/3 secondary context column.

### Main
1. next action
2. deadlines/blockers
3. active applications / current procedure
4. relevant documents

### Side
1. responsibility
2. compact journey status
3. recent activity
4. Campus message

Avoid:
- three equal-width generic cards across the whole page;
- a very large decorative hero;
- multiple "View all" CTAs competing.

---

# 16. Mobile 390 hierarchy

1. Current dossier status
2. Dominant next action
3. Responsibility
4. urgent deadline
5. journey summary
6. documents/applications only when relevant
7. recent Campus message
8. activity

Navigation:
- sticky top app bar;
- concise menu/drawer;
- no horizontal-scroll strip of ten modules;
- primary actions full-width when helpful.

Touch targets:
- minimum practical size;
- no hover-only information.

---

# 17. RTL / Arabic

Student space is a first-class RTL experience.

Requirements:
- sidebar/drawer direction adapts;
- directional arrows flip where semantically directional;
- dates/numbers use intentional bidi handling;
- programme/university names can preserve Latin-script LTR inside Arabic UI;
- status + metadata alignment remains readable;
- deadline table/list does not rely on left/right-only meaning;
- journey flow mirrors only when sequence semantics require it.

Avoid per-page RTL patches when a logical-property component can solve it globally.

---

# 18. Loading / empty / error states

## Dashboard loading
Use content-shaped skeletons:
- header;
- next action;
- responsibility;
- 2–3 work rows.

Avoid fake progress animations.

## No immediate Student action
This is a valid state.

Show:
> **Rien à faire de votre côté pour le moment**

Then:
- what Campus is doing;
- what happens next;
- expected next event if known.

Do not invent a CTA.

## No applications yet
Explain if this is expected based on current journey.

## Partial service failure
If applications fail to load:
- keep documents/next action available;
- isolate the error;
- offer retry.

## Dashboard unavailable
Current global unavailable screen remains valid as fallback.

---

# 19. First-week Student experience

The activated Student should immediately understand the new phase.

For first few visits, optional small context:
> Votre dossier a été activé après validation de votre proposition.

Then transition into ordinary operations.

Do not keep repeating the Prospect sales funnel.

---

# 20. Commercial continuity

Student account should retain a secondary record of:
- accepted proposal;
- active service;
- price paid;
- payment receipt/reference;
- activation date.

Path:
> Profil / Offre & paiement

This is history, not the main dashboard content.

---

# 21. Admin ↔ Student coordination

Every Student-facing state that requires Campus work should map to an Admin dossier/queue state.

Examples:

Student:
> Campus vérifie votre document.

Admin:
> Document à vérifier.

Student:
> Campus prépare votre candidature.

Admin:
> Candidature à préparer.

Student:
> Paiement validé · espace actif.

Admin:
> Student active / procedure created.

No contradictory labels between portals.

---

# 22. Current implementation strengths to preserve

From current `src/app/student/page.tsx`:

Preserve:
- server-side authentication;
- onboarding guard;
- data loading in parallel;
- document action detection;
- application action detection;
- checklist action detection;
- deadline aggregation;
- recommendation/activity aggregation;
- "no action required" state;
- i18n / stored-text localisation;
- accessible badges/links semantics.

The redesign should not throw away these mature behaviours.

---

# 23. Current implementation weaknesses to address

## A. Navigation overload
AppShell currently presents around ten Student destinations.

V2:
reduce primary navigation to five concepts.

## B. Multiple overlapping journey models
Project, pathway, checklist and journey all explain progress differently.

V2:
one visible "Mon parcours" mental model.

## C. Progress percentage ambiguity
Checklist percentage can be mistaken for overall Germany-project completion.

V2:
use milestone/status semantics; percentage only for a well-defined local set.

## D. Equal-weight dashboard panels
Programmes, documents, activity and other panels can appear structurally equivalent even when only one matters.

V2:
relevance-driven visibility and hierarchy.

## E. Dashboard can become long
The current page aggregates many useful blocks.

V2:
show only current/actionable summaries; full detail remains in dedicated views.

---

# 24. Open PR collision constraints

As of the refreshed Stage 1 check, open PRs still include:
- #852 Student document next-action navigation
- #833 smart documents
- #834 deadline engine
- #836 Student procedure UX
- #837 notifications
- #838 source freshness
- #839 final procedure coverage
- plus procedure data/generator PRs #830 / #831

Therefore:

> Do not implement the broad Student Dashboard V2 on production code until those overlapping logic PRs are reconciled.

Design/specification can continue safely.

Before implementation:
1. refresh main;
2. inspect which PRs merged;
3. re-read Student procedure/deadline/document behaviours;
4. update V2 action priority;
5. rebase the implementation branch;
6. preserve all newly merged business logic.

---

# 25. Analytics contract

Privacy-safe future events:

- `student_dashboard_viewed`
- `student_next_action_opened`
- `student_document_action_opened`
- `student_application_opened`
- `student_deadline_opened`
- `student_message_opened`
- `student_journey_opened`

Properties:
- lifecycle/procedure stage;
- action category;
- locale;
- screen breakpoint category if useful.

Do not capture:
- names;
- email;
- document names/content;
- application free-text notes;
- sensitive academic data in event properties.

---

# 26. Pilot 5 acceptance criteria

- [ ] Student access is strictly post-activation.
- [ ] First activated visit clearly preserves Prospect→Student continuity.
- [ ] One dominant next action is obvious.
- [ ] "Who is responsible now?" is immediately visible.
- [ ] Deadlines distinguish official/internal/reminder semantics.
- [ ] One visible journey model replaces overlapping progress concepts.
- [ ] Primary navigation is reduced to ~5 durable concepts.
- [ ] Documents/apps/programmes appear according to relevance, not as equal cards.
- [ ] No-action waiting state is useful without fake CTA.
- [ ] Commercial proposal/payment remains accessible as history but not dominant.
- [ ] Current server-side action logic is preserved.
- [ ] Open Student PR collisions are resolved before code implementation.
- [ ] Desktop 1440 / 1024 / 768 / 390 behaviour is approved.
- [ ] Arabic RTL is approved.
- [ ] Loading / partial-error / no-action / long-content states are designed.
