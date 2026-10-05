# Pilot 2 — Prospect Home State Matrix

Status: **Stage 1 interaction specification**

This matrix maps the existing Prospect intake states to the V2 Prospect Home experience.

The existing backend/state machine remains authoritative:

`starter_documents → campus_review → route_proposed → student_question / payment_pending → paid_pending_validation → procedure_created`

V2 changes the **presentation and terminology**, not the state machine.

## Global rules

- Account created = **Prospect**, not Student.
- Prospect space remains available until Student activation.
- Student space remains visibly locked before activation.
- Exactly one primary next action dominates the dashboard.
- "What you do" and "What Campus does" are always separated.
- Proposal and payment appear contextually only when relevant.
- The user never sees raw state keys.
- `procedure_created` is the activation boundary: the Prospect experience should transition/redirect into the active Student experience when access is granted.

---

## State 0 — Orientation missing / recovery

Internal condition:
- no current Orientation; or
- recoverable Orientation state.

Prospect-facing status:
> Orientation à compléter

Primary action:
> Faire / reprendre mon orientation

Campus action:
> En attente de votre orientation.

Proposal:
> Pas encore disponible

Documents:
> Not prioritised until project basis exists.

Student access:
> Non activé

Navigation emphasis:
- Accueil
- Orientation

---

## State 1 — Orientation exists but not confirmed

Internal condition:
- `state.current` exists;
- `orientationConfirmed === false`.

Prospect-facing status:
> Projet à confirmer

Primary action:
> Confirmer ou mettre à jour mon projet

Campus action:
> En attente de votre confirmation avant d’analyser le dossier.

Proposal:
> Pas encore disponible

Student access:
> Non activé

Important copy:
> Votre orientation est enregistrée, mais Campus Allemagne ne prépare pas encore de proposition tant que votre projet n’est pas confirmé.

---

## State 2 — starter_documents

Prospect-facing status:
> Documents de départ à compléter

Primary action:
> Envoyer mes documents

Campus action:
> Nous attendons vos pièces de départ avant l’analyse.

Dashboard emphasis:
1. dominant document next action;
2. compact starter-document list;
3. recommended programmes;
4. Orientation summary;
5. proposal placeholder.

Proposal:
> En attente de l’analyse Campus

Student access:
> Non activé

### Post-Bac document readiness

Required before an academic proposal:
- passport approved;
- Baccalauréat approved;
- transcripts approved.

Language certificate may remain conditional/optional depending on route.

### Pre-Bac exception

For a candidate preparing the Bac:
- final Bac and transcript are not required;
- route choices are restricted to preparation/language paths according to existing business rules;
- dashboard wording should focus on preparation, language and project development rather than "missing academic file".

Primary action may become:
> Continuer ma préparation

---

## State 3 — campus_review

Prospect-facing status:
> Analyse Campus en cours

Primary action:
> No artificial action if nothing is needed from the Prospect.

Instead show:
> Aucun document n’est demandé pour le moment.

Campus action:
> Nous vérifions votre orientation et vos documents pour préparer votre proposition.

Dashboard emphasis:
1. Campus review status;
2. expected next event;
3. programme suggestions;
4. document readiness;
5. Orientation/project summary.

Proposal:
> En préparation

Student access:
> Non activé

Professional rule:
Do not invent a fake "Continue" CTA when the user genuinely needs to wait.

---

## State 4 — route_proposed

Prospect-facing status:
> Proposition prête

Primary action:
> Voir ma proposition

Campus action:
> Campus Allemagne attend votre décision ou vos questions.

Proposal:
> Ready

Dashboard emphasis:
1. proposal ready alert;
2. route/service summary;
3. price summary when applicable;
4. discuss/accept choices;
5. programmes/project context secondary.

Student access:
> Non activé

Important wording:
> Cette proposition ne garantit pas une admission universitaire. Elle définit le parcours et l’accompagnement proposés par Campus Allemagne.

---

## State 5 — student_question

UI terminology:
> Discussion sur la proposition

The current backend key remains `student_question`, but the Prospect UI should not call the user "student".

Prospect-facing status:
> Votre demande a été envoyée

Primary action:
> Voir la discussion / proposition

Campus action:
> Campus Allemagne examine votre question ou votre demande de modification.

Proposal:
> En discussion

Student access:
> Non activé

Admin queue:
> Réponse Prospect reçue · action requise

Not:
> Réponse étudiant reçue

---

## State 6 — payment_pending

Trigger:
- Prospect accepted the proposal.

Prospect-facing status:
> Proposition acceptée · paiement à finaliser

Primary action:
> Finaliser mon paiement

Campus action:
> La proposition est acceptée. L’activation de l’espace étudiant reste en attente du paiement puis de sa validation.

Proposal:
> Acceptée

Payment:
> À payer

Student access:
> Non activé

Important boundary:
> Accepter la proposition ne suffit pas à activer l’espace étudiant.

---

## State 7 — paid_pending_validation

Prospect-facing status:
> Paiement reçu · validation Campus en cours

Primary action:
> Voir le statut du paiement

Campus action:
> Votre paiement est enregistré. Campus Allemagne doit encore le valider avant l’activation de l’espace étudiant.

Proposal:
> Acceptée

Payment:
> Reçu / à valider

Student access:
> En attente d’activation

UI treatment:
- positive receipt confirmation;
- no pressure to repay;
- transaction reference/receipt when available;
- explain the next event.

---

## State 8 — procedure_created

Business meaning:
> Student / Client access activated.

Prospect UI:
- should no longer behave as an ordinary Prospect dashboard;
- redirect or transition into the active Student workspace according to access logic.

Activation confirmation:
> Votre espace étudiant est maintenant actif.

Primary action:
> Accéder à mon espace étudiant

The first Student visit should preserve continuity:
- project;
- proposal/service;
- documents;
- history;
- active procedure.

---

# Dashboard modules by state

| Module | Early Prospect | Campus Review | Proposal Ready | Payment | Activated |
|---|---|---|---|---|---|
| Lifecycle rail | Yes | Yes | Yes | Yes | Transition |
| One next action | Yes | Only if real | Yes | Yes | Student dashboard |
| Campus work | Yes | Primary | Yes | Yes | Student responsibility model |
| Orientation summary | Yes | Yes | Secondary | Secondary | Historical/context |
| Programmes | Yes | Yes | Secondary | Secondary | Recommendations/applications |
| Starter documents | Primary | Status only | Secondary | Secondary | Student documents |
| Proposal | Placeholder | Preparing | Primary | Confirmed | Commercial history |
| Payment | Hidden | Hidden | Contextual after accept | Primary | History |
| Student-access lock | Visible | Visible | Visible | Visible/pending | Removed |

---

# Prospect navigation rules

Persistent:
- Accueil
- Orientation
- Catalogue
- Documents
- Proposition
- Messages / Aide

Contextual:
- Payment appears only after proposal acceptance / payment initiation.
- Offers should not compete as a permanent navigation destination when the user already has a personalised Campus proposal.
- Roadmap should be absorbed into the lifecycle/journey presentation rather than remain a separate mental model.

Do not expose as Prospect navigation:
- Student procedure;
- Student applications workspace;
- Student checklist/calendar intended for activated service;
- internal Admin workflow concepts.

---

# Empty / error states

## No recommendations
Do not show a dead empty card.

Show:
> Nous n’avons pas encore assez d’informations pour afficher des programmes pertinents.

Action:
> Compléter mon projet

## Catalogue temporarily unavailable
Show project and lifecycle normally; isolate catalogue failure.

## Document service unavailable
Keep existing statuses readable and show retry.

## Proposal service unavailable
Do not imply proposal does not exist. Say:
> Impossible de charger votre proposition pour le moment.

## Payment service unavailable
Never lose accepted proposal state.
Show:
> Votre proposition reste acceptée. Le paiement est temporairement indisponible.

---

# Mobile hierarchy

At 390px:

1. Prospect identity/stage
2. one primary next action
3. Campus action
4. compact lifecycle
5. proposal state if relevant
6. documents
7. recommended programmes
8. orientation/project details
9. Student access boundary

No horizontally scrolling primary task navigation is required for core completion.

---

# Terminology map

| Current/internal concept | V2 user-facing term |
|---|---|
| `student_question` | Discussion / demande envoyée |
| `route_proposed` | Proposition prête |
| `payment_pending` | Paiement à finaliser |
| `paid_pending_validation` | Paiement reçu · validation en cours |
| `procedure_created` | Espace étudiant activé |
| pre-dossier étudiant | Dossier Prospect |
| réponse étudiant (before activation) | Réponse Prospect |
| client access | Espace étudiant / accompagnement actif |

The underlying database/API names may remain unchanged during V2 unless a separate technical refactor is justified.
