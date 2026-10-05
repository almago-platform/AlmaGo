# Pilot 3 — Admin 360° Dossier: State, Action & Layout Specification

Status: **Stage 1 interaction architecture**

Goal: replace the current need to mentally reconstruct one person across Orientation, Prospects, Documents, Intake, Payments and Applications with one lifecycle-aware dossier.

Canonical lifecycle:

> Candidate → Free Orientation → Prospect → Campus Review → Proposal → Discussion/Acceptance → Payment → Validation → Active Student → Procedure / Applications

The same person keeps one continuous dossier history.

---

## 1. Operating model

### Cross-dossier views
The Admin still needs work queues:
- Dossiers requiring attention
- Documents to review
- Orientation reviews
- Prospect responses / discussions
- Payments to validate
- Active applications
- Catalogue maintenance

### Individual detail
Every person-centric queue must drill into the same **360° dossier**.

Target route concept:

`/admin/dossiers/[personId]`

Exact implementation route can be decided later after data-model review. The product concept is stable regardless of route naming.

### Rule
Queues answer:

> Who needs attention?

The 360° dossier answers:

> Why, what evidence exists, what should I do, and what happened before?

---

# 2. Persistent dossier header

The header is always visible near the top of the dossier.

## Identity
- full name;
- primary email;
- dossier reference / internal ID secondary;
- lifecycle label.

## Lifecycle labels

Human-facing values:
- Candidate · Orientation
- Prospect · Project not confirmed
- Prospect · Starter documents
- Prospect · Campus review
- Prospect · Proposal ready
- Prospect · Discussion
- Prospect · Payment pending
- Prospect · Payment received
- Active Student
- Student · Procedure in progress
- Student · Applications in progress

Do **not** show raw keys such as:
- `student_question`
- `route_proposed`
- `paid_pending_validation`

## Operational context
- last meaningful activity;
- current responsible side;
- next expected event;
- attention reason when applicable.

Responsible side:
- Prospect
- Student
- Campus Allemagne
- University / authority
- Payment provider / external system, only when relevant

## Primary contextual action
Only one dominant action.

Examples:
- Review starter documents
- Prepare proposal
- Respond to Prospect
- Validate payment
- Open active procedure

Secondary actions stay in a menu or contextual links.

---

# 3. Lifecycle state → Admin action model

| Internal state / condition | Human dossier status | Action owner | Primary Admin action |
|---|---|---|---|
| Public Orientation only | Candidate · Orientation | Candidate / Campus review if flagged | Review only when audit requires |
| Account created, Orientation unconfirmed | Prospect · Project to confirm | Prospect | No forced Admin action |
| `starter_documents` | Prospect · Starter documents | Prospect / Admin for pending uploads | Review submitted starter documents |
| `campus_review` | Prospect · Campus review | Campus | Analyse dossier and prepare route/proposal |
| `route_proposed` | Prospect · Proposal ready | Prospect | Wait / respond if contacted |
| `student_question` | Prospect · Discussion | Campus | Respond or update proposal |
| `payment_pending` | Prospect · Payment pending | Prospect / payment process | Verify only if manual process requires |
| `paid_pending_validation` | Prospect · Payment received | Campus | Validate payment and activate |
| `procedure_created` | Active Student | Student / Campus depending step | Open active Student procedure |
| Active applications | Student · Applications in progress | Student / Campus / university | Resolve next application action |

Important terminology correction:

Before `procedure_created`, Admin copy should say **Prospect**, not Student.

---

# 4. Dossier navigation

## Before Student activation

Recommended tabs:
1. Overview
2. Orientation
3. Prospect profile
4. Starter documents
5. Proposal
6. Messages
7. Payment & activation
8. History

## After Student activation

Recommended tabs:
1. Overview
2. Profile
3. Documents
4. Orientation history
5. Proposal / commercial history
6. Messages
7. Payment
8. Procedure
9. Applications
10. History

The navigation may collapse less-used tabs into "More" at narrower desktop widths.

---

# 5. Overview screen — target desktop hierarchy

The overview is not a wall of cards. It is a decision cockpit.

## Zone A — Attention / next decision

Largest operational block.

Shows:
- attention reason;
- who owns the action;
- what is blocking progress;
- one primary CTA;
- small timestamp / "last update".

Examples:

### Campus review
> **Décision Campus requise**
>
> Orientation confirmed and starter documents ready.
>
> Primary CTA: **Préparer la proposition**

### Prospect discussion
> **Réponse Prospect reçue**
>
> The Prospect asked to adjust the proposal.
>
> Primary CTA: **Répondre / modifier la proposition**

### Payment validation
> **Paiement reçu**
>
> Payment is recorded and awaits Campus validation.
>
> Primary CTA: **Vérifier et activer**

## Zone B — Dossier facts

Compact data list, not chips everywhere.

Show only decision-critical facts:
- academic situation;
- current/last diploma;
- target degree;
- target field/specialisation;
- German / English level;
- intended study language;
- target intake;
- preferred geography;
- relevant pre-Bac/post-Bac state.

Link:
> Voir le profil complet

## Zone C — Evidence readiness

Summary rows:
- Passport
- Bac / diploma
- Transcripts
- Language proof
- other route-specific evidence

Statuses:
- Validé
- À vérifier
- À remplacer
- Manquant
- Facultatif

Each row drills into the corresponding document.

### Critical rule

Document file approval and "accepted as academic pathway evidence" are distinct decisions.

The UI should make this distinction understandable without exposing the underlying technical implementation.

## Zone D — Advisor analysis

Default layer:
- recommended route;
- top 3 programmes / routes;
- compatibility evidence;
- unresolved issues;
- freshness/source warning when relevant.

Secondary details:
- technical Orientation audit stages;
- reason codes;
- raw engine output;
- source provenance/debug.

Technical audit is available through:
> Voir l’audit technique

It is not the default reading experience.

## Zone E — Proposal

When not yet sent:
- route selector;
- published offer selector;
- rationale;
- preview summary;
- send action.

When sent:
- route;
- service/offer;
- price;
- status;
- sent/updated date;
- Prospect response;
- update/discuss action.

When accepted:
- acceptance timestamp;
- payment state;
- next activation step.

## Zone F — Timeline

Human-readable chronological history.

Examples:
- Orientation completed
- Account created
- Orientation confirmed
- Passport uploaded
- Passport approved
- Campus review started
- Proposal sent
- Prospect requested discussion
- Proposal updated
- Proposal accepted
- Payment received
- Payment validated
- Student space activated
- Procedure created
- Application status changed

Do not show raw database mutations.

---

# 6. Queue → dossier relationship

## Admin Overview

Current good principle to preserve:
- priority-first;
- documents before catalogue enrichment;
- no artificial score.

V2 improvement:
- every priority row links to a specific dossier when person-specific;
- labels use Prospect/Student according to lifecycle.

Current copy examples requiring correction before implementation:
- "Réponse étudiant reçue" can refer to a pre-activation Prospect.
- "dossier étudiant" can refer to Prospect intake.

Target:
- "Réponse Prospect reçue"
- "Dossier Prospect à analyser"
- "Paiement Prospect à valider"
- "Étudiant actif" only after activation.

## Dossiers queue

Recommended columns:
- Person
- Lifecycle stage
- Attention reason
- Action owner
- Last update
- Next action
- Open dossier

Filters:
- Candidate
- Prospect
- Active Student
- Needs Campus action
- Waiting on Prospect/Student
- Waiting external
- Payment validation
- Documents
- Procedure
- Applications

Search:
- name
- email
- dossier/reference

No technical erased/anonymised rows in ordinary operational search.

---

# 7. Orientation inside the dossier

The Orientation module becomes a dossier subsystem.

Default advisor view:
- project summary;
- result / route recommendation;
- top programmes;
- verified facts;
- unresolved risks;
- source freshness;
- human review status.

Technical disclosure:
- A/B/C/D or internal stage details;
- reason codes;
- unknowns;
- debug/provenance.

Copy rule:
Avoid:
> fortes chances d’admission

Prefer:
> profil compatible avec les critères actuellement vérifiés

Never present AlmaGo's analysis as a university admission decision.

---

# 8. Documents inside the dossier

Global document queue remains useful.

Inside dossier:
- same review actions;
- filtered to the current person;
- grouped by purpose;
- clear relationship to route readiness.

Recommended categories:
### Identity
- Passport

### Academic
- Bac/diploma
- Transcripts
- university evidence

### Language
- certificates

### Procedure-specific
- dynamic by pathway

Each document shows:
- file name;
- category;
- upload date;
- review status;
- user-visible review note;
- evidence classification if applicable;
- view action;
- approve / replacement / reject actions.

Deletion remains destructive and visually separated.

---

# 9. Proposal composer inside dossier

Current business rules to preserve:
- pre-Bac routes limited to preparation/language choices;
- post-Bac academic proposal requires approved core documents;
- offer must be a published offer;
- rationale required;
- commercial state locks after acceptance/payment stages.

V2 presentation:

### Step 1
**Parcours recommandé**

### Step 2
**Offre / accompagnement**
Human price display.

### Step 3
**Pourquoi cette proposition**
Advisor rationale in plain language.

### Step 4
**Preview Prospect**
Show exactly what the Prospect will see.

### Primary action
> Envoyer la proposition

After sending:
> Mettre à jour la proposition

If Prospect has responded:
show the response above the composer as the main attention event.

---

# 10. Payment & activation inside dossier

States:

## Proposal accepted / payment pending
Admin sees:
- accepted proposal;
- expected amount;
- payment state;
- no Student activation yet.

## Payment recorded
Admin sees:
- payment reference;
- amount;
- received date;
- source/method when available;
- validation CTA.

Primary action:
> Valider le paiement et activer l’espace étudiant

Confirmation copy should state the consequence before action:
- creates/opens the next procedure stage;
- enables Student access.

## Activated
Show:
- activation timestamp;
- active service / route;
- procedure link;
- payment history.

Avoid generic label:
> client activated

Prefer:
> Espace étudiant activé

---

# 11. Responsive behaviour

Admin is desktop-first but not desktop-only.

## 1440+
- persistent dossier header;
- tab navigation;
- two-column overview:
  - main decision/work column;
  - secondary context/history column.

## 1024
- two columns remain where practical;
- long tables simplify;
- side context may move below primary decision.

## 768
- single-column decision flow;
- tabs become horizontally scrollable or menu-based;
- no critical action hidden behind hover.

## 390
Admin mobile is for triage/emergency use, not full high-density workflow.
Must still allow:
- identify dossier;
- understand status;
- read Prospect response;
- approve/request replacement on a document;
- validate critical payment only if safe;
- open timeline.

Complex catalogue/admin maintenance can remain desktop-optimised.

---

# 12. Accessibility / safety

- keyboard path through tabs and primary actions;
- focus remains visible;
- status never colour-only;
- destructive actions require strong distinction and confirmation where appropriate;
- payment activation action includes consequence text;
- technical/audit details use semantic disclosure patterns;
- long names/emails/doc filenames wrap safely;
- timestamps have readable formats;
- activity events are semantically ordered.

---

# 13. Data mapping from current AlmaGo

Existing useful sources:
- `student_intake_cases` for lifecycle/proposal/payment transition;
- `prospects` / profile information;
- `orientations` and `orientation_human_reviews`;
- `documents` and academic evidence;
- published offers;
- purchases/payment records;
- applications;
- future/merged procedure records.

V2 should aggregate these at the server/load layer for the dossier instead of forcing the browser/operator to stitch multiple modules together.

No database migration is required merely to prove the UI architecture.

---

# 14. Pilot 3 visual acceptance criteria

- [ ] Dossier lifecycle stage is immediately visible.
- [ ] Prospect vs Student terminology is always correct.
- [ ] One dominant Admin action exists per state.
- [ ] Responsible side is explicit.
- [ ] Documents, Orientation and Proposal read as parts of one dossier.
- [ ] Technical Orientation audit is secondary.
- [ ] Proposal response is impossible to miss.
- [ ] Payment validation consequence is explicit.
- [ ] Timeline preserves continuity across Prospect → Student activation.
- [ ] Queue drill-down lands in the same dossier.
- [ ] Desktop density feels professional, not like a generic card dashboard.
- [ ] 1024/768/mobile triage behaviour is specified.
- [ ] No production implementation begins until open procedure/document collisions are refreshed.
