# Pilot 4 — Proposal → Acceptance → Payment → Student Activation

Status: **Stage 1 interaction architecture**

This pilot defines the most important commercial transition in AlmaGo.

Canonical lifecycle:

> Prospect → Campus Proposal → Discussion / Acceptance → Payment → Campus Validation → Active Student

This transition must feel trustworthy, explicit and reversible where appropriate. It must never blur the distinction between:
- a recommendation;
- a commercial service proposal;
- payment;
- Student access activation;
- university/authority decisions.

---

# 1. Product principle

The Proposal is not a generic pricing page.

It is a personalised Campus Allemagne decision object that combines:

1. the route Campus recommends;
2. the service scope Campus offers;
3. the commercial offer/price;
4. why the route is being proposed;
5. what the Prospect still needs to know;
6. what accepting the proposal actually changes.

The user should never need to compare an abstract generic offer page against a separate route recommendation and guess how they relate.

---

# 2. Lifecycle states

The V2 flow must explicitly support:

1. **Proposal preparing**
2. **Proposal ready**
3. **Prospect reviewing**
4. **Prospect requests discussion**
5. **Campus updates proposal**
6. **Prospect accepts**
7. **Purchase/payment record created**
8. **Payment pending**
9. **Payment failed / cancelled / interrupted**
10. **Payment received**
11. **Campus validation pending**
12. **Student activation succeeds**
13. **Activation fails / requires recovery**
14. **Refunded / cancelled after payment when supported**

The visible UI uses human language; internal state keys remain implementation details.

---

# 3. Proposal ready — Prospect view

## Page header

Eyebrow:
> Proposition Campus Allemagne

Title:
> Votre parcours et votre accompagnement proposés

Status:
> Proposition prête

Secondary metadata:
- sent/updated date;
- "prepared from your Orientation + verified documents";
- last Campus update when useful.

Avoid:
- internal offer version;
- technical IDs;
- raw state names.

---

# 4. Section A — Recommended route

This is the first content block.

Example structure:

> **Études — Bachelor**
>
> Campus Allemagne vous propose ce parcours parce que votre objectif actuel est un Bachelor en informatique, avec une préparation en allemand et une recherche de programmes adaptés à votre rentrée cible.

Show:
- route name;
- short rationale;
- important assumptions;
- key unresolved condition if material.

Link:
> Voir les éléments utilisés pour cette proposition

That opens secondary evidence:
- Orientation summary;
- approved starter documents;
- verified programme facts;
- outstanding uncertainty.

Do not expose engine debug by default.

---

# 5. Section B — Included Campus service

Show the actual published offer selected by Admin.

Structure:

### Offer name
Human marketing/service name only.

### Summary
One short paragraph.

### Included services
Grouped into understandable categories instead of one undifferentiated list when possible.

Example:
**Orientation & stratégie**
- analysis / route refinement
- programme shortlist

**Dossier**
- document review
- application preparation

**Suivi**
- deadlines / status follow-up
- Campus messages/support

Only display services actually included in the offer snapshot/version.

### Exclusions / boundaries
When relevant:
- university application fees not included;
- visa decision not controlled by AlmaGo;
- admission not guaranteed;
- external provider costs separate.

Do not hide material exclusions in a generic legal footer.

---

# 6. Section C — Price and payment consequence

Price must be visually obvious but not dominant over service scope.

Show:
- total price;
- currency;
- any instalment/deposit structure if the commercial model later supports it;
- tax/fee wording only when applicable;
- payment method only once available.

Critical explanation:

> Le paiement n’achète pas une admission. Il active l’accompagnement AlmaGo prévu dans cette proposition après validation du paiement.

Current V2 business transition:

> Proposal accepted → payment required → payment received → Campus validation → Student space activated.

---

# 7. Section D — Before-you-accept summary

Before the Prospect commits, provide a concise review panel:

### You are accepting
- route;
- service offer;
- amount.

### You understand
- AlmaGo gives guidance/support, not an admission guarantee;
- external university/visa decisions remain external;
- Student space activates only after payment and required validation;
- proposal details remain in history.

This is not a legal wall of text. It is a product comprehension layer.

---

# 8. Primary and secondary actions

## Primary action
> Accepter la proposition

Do **not** immediately jump from a single click to an irreversible payment state without a review step.

### Acceptance confirmation dialog/page

Title:
> Confirmer cette proposition

Summary:
- route;
- offer;
- total amount;
- next step after confirmation.

Primary:
> Confirmer et continuer vers le paiement

Secondary:
> Retour à la proposition

No pre-checked consent boxes.

Any legally required acceptance must be explicit and separately identified.

## Secondary action
> Poser une question / demander une modification

This opens a discussion form.

The current backend supports a note. V2 improves presentation:

Prompt:
> Qu’aimeriez-vous revoir ?

Optional guided reasons:
- route proposé;
- services inclus;
- prix;
- calendrier;
- programme / objectif;
- autre.

Free text remains available.

Submitting discussion:
- does not cancel the proposal;
- changes visible state to "Discussion en cours";
- surfaces the response prominently in Admin.

---

# 9. Discussion state

Prospect:

Status:
> Discussion en cours

Body:
> Votre message a été transmis à Campus Allemagne. Vous serez informé lorsque la proposition sera mise à jour ou qu’une réponse sera disponible.

Show:
- Prospect’s submitted message;
- date;
- current proposal snapshot read-only;
- no payment CTA while proposal is under active revision if business rules lock it.

Admin:

Attention reason:
> Réponse Prospect reçue

Primary action:
> Répondre / mettre à jour la proposition

Admin sees:
- Prospect note;
- previous proposal;
- editable route/offer/rationale;
- preview before sending.

History must retain:
- old proposal;
- Prospect message;
- updated proposal.

---

# 10. Proposal update / version behaviour

The product must distinguish:
- current proposal;
- previous proposal history.

Prospect default:
> Current proposal only.

Secondary:
> Voir les versions précédentes

Admin:
- visible current version;
- audit/history of prior versions.

Do not show raw `v2`, UUIDs or internal version identifiers unless in diagnostic/admin metadata.

When Campus updates a proposal after discussion:
- clearly mark **Proposition mise à jour**;
- show what changed when feasible:
  - route;
  - services;
  - price;
  - rationale.

---

# 11. Acceptance → payment creation

Current implementation:
- Prospect confirmation endpoint invokes server-side purchase creation through `service_confirm_proposed_route`;
- acceptance only works when payment orchestration is enabled;
- resulting state becomes `payment_pending`;
- user is redirected to the payment page.

V2 rule:

Acceptance and purchase creation must remain server-authoritative.

The browser must never be able to:
- self-activate Student access;
- mark a payment successful;
- skip payment validation;
- manufacture an accepted offer.

If orchestration is disabled:
- do not expose an enabled acceptance CTA that simply fails with a generic 503;
- show a deliberate product state such as:

> **Acceptation temporairement indisponible**
>
> Votre proposition reste disponible. Campus Allemagne finalise actuellement le module de paiement.

Admin remains able to see the proposal but cannot falsely activate it through disabled orchestration.

---

# 12. Payment page — target V2

The current page is mainly a server-status viewer. V2 separates:

## A. Payment summary

Show:
- offer name;
- accepted route;
- amount;
- payment reference;
- purchase created date.

## B. Payment action

When an actual provider is integrated:
- secure payment CTA;
- provider name/logo only when approved;
- external redirect explanation;
- retry state;
- return-state explanation.

If manual transfer/payment is supported:
- exact instructions;
- amount;
- beneficiary/reference;
- upload/reference workflow only if actually implemented;
- never simulate provider success.

## C. Current state

Human statuses:
- À payer
- Paiement en cours
- Paiement refusé
- Paiement annulé
- Paiement reçu
- Validation Campus en cours
- Espace étudiant activé
- Paiement remboursé

Never display:
> charge · succeeded

That belongs in technical/admin details.

## D. Last meaningful event

Prospect-facing events:
- Payment initiated
- Payment received
- Campus validation started
- Student access activated

Raw transaction events stay internal.

---

# 13. Payment failure and recovery

## Failed payment

Message:
> Le paiement n’a pas abouti. Votre proposition reste acceptée.

Primary:
> Réessayer le paiement

Secondary:
> Contacter Campus Allemagne

Do not:
- create a second duplicate purchase when a retry should reuse/reconcile the same purchase;
- imply the proposal was lost.

## Cancelled payment

Message:
> Paiement annulé

Explain:
- no Student activation occurred;
- proposal remains accepted unless business rules say otherwise.

## Provider timeout / unknown state

Critical safe state:

> Nous vérifions le statut de votre paiement.

Do not tell the Prospect to pay again until server reconciliation confirms that no successful payment exists.

---

# 14. Payment received → validation pending

This state is separate from activation.

Prospect view:

> **Paiement reçu**
>
> Nous avons enregistré votre paiement. Campus Allemagne effectue maintenant la validation finale avant l’activation de votre espace étudiant.

Show:
- amount;
- date/time;
- reference/receipt if available;
- no additional payment CTA.

Primary action:
- none required.

Secondary:
> Télécharger / voir le reçu
only if implemented.

Explicit:
> Aucune autre action n’est requise pour le moment.

---

# 15. Admin payment verification

The current Admin flow supports:
- manual payment confirmation from `payment_pending`;
- final activation from `paid_pending_validation`;
- payment orchestration feature flag.

V2 separates two decisions clearly.

## Decision 1 — Has the payment actually been received?

Only used when manual payment process requires Admin confirmation.

Show:
- Prospect;
- proposal / offer;
- expected amount;
- purchase reference;
- payment evidence/reference;
- current status.

Primary:
> Confirmer le paiement reçu

Consequence:
> Moves the purchase to "payment received / validation pending".

## Decision 2 — Activate Student access

Show:
- payment received status;
- amount;
- transaction/reference;
- proposal accepted;
- any activation prerequisites.

Primary:
> Valider et activer l’espace étudiant

Consequence preview:
- activates Student access;
- creates/opens procedure according to backend logic;
- closes Prospect-only flow;
- writes activation history.

This action is materially important and should use a confirmation dialog:

> **Activer l’espace étudiant ?**
>
> Le paiement a été reçu. Cette action active l’accès étudiant et crée la phase suivante du dossier.

Primary:
> Confirmer l’activation

Secondary:
> Annuler

---

# 16. Student activation success

Prospect view transitions to success state:

> **Votre espace étudiant est actif**

Explain:
- proposal accepted;
- payment validated;
- active route;
- next action.

Primary:
> Accéder à mon espace étudiant

The first Student dashboard must preserve:
- project;
- route;
- proposal/service;
- documents;
- payment receipt/history;
- timeline.

Do not make activation feel like a new unrelated account.

---

# 17. Activation failure / recovery

If payment is received but activation fails technically:

Prospect:
> Votre paiement est bien enregistré. L’activation de votre espace étudiant est en cours de résolution.

Never:
- ask for repayment;
- roll back visible payment receipt unless backend proves payment invalid.

Admin:
- clear operational error;
- purchase remains `paid_pending_validation` or a dedicated recoverable state if future backend adds one;
- retry activation;
- audit the failure.

Monitoring should alert engineering for repeated activation failures once observability is installed.

---

# 18. Refund / cancellation

Current purchase model includes:
- cancelled;
- refunded.

V2 must define the user-facing impact before enabling these workflows broadly.

Refund page/status should state:
- amount refunded;
- date;
- service/access consequence;
- expected banking delay if known from provider;
- support contact.

Admin history retains:
- who initiated;
- reason;
- transaction/refund reference;
- access change.

No destructive financial action without explicit confirmation and audit trail.

---

# 19. Commercial history

Prospect/Student:
Secondary screen:
> Offre & paiement

Shows:
- accepted proposal;
- included service;
- original price;
- payment status;
- receipt/reference;
- activation date.

Admin:
Full history:
- proposal sent;
- discussion;
- proposal updated;
- accepted;
- purchase created;
- payment attempt(s);
- payment received;
- validation;
- activation;
- refund/dispute when applicable.

Raw provider events belong behind technical detail.

---

# 20. Terminology V2

| Current / technical | V2 Prospect-facing |
|---|---|
| route_proposed | Proposition prête |
| student_question | Discussion en cours / demande envoyée |
| payment_pending | Paiement à finaliser |
| paid_pending_validation | Paiement reçu · validation Campus |
| client_active | Espace étudiant activé |
| client access | Espace étudiant |
| purchase | Paiement / commande only where useful |
| charge_succeeded | Paiement reçu |
| transaction event | Événement de paiement only in Admin details |

Admin may use:
- Achat / purchase as a finance object where appropriate;
- provider transaction;
- attempt;
- event;
but these stay in the Finance/technical layer, not the Prospect UX.

---

# 21. Security and integrity contract

Mandatory:
- offer amount comes from the server snapshot;
- accepted offer version is immutable for that purchase;
- client cannot submit its own price;
- payment success comes from server/provider verification;
- provider return URL is never trusted as proof of payment;
- idempotency prevents duplicate payment attempts/purchases where intended;
- webhook/event processing is deduplicated;
- Admin activation requires Admin role;
- activation only succeeds from allowed payment state;
- sensitive payment data is never stored unless necessary and compliant;
- analytics must not capture financial secrets or full payment references unnecessarily.

---

# 22. Analytics contract

Future PostHog events, privacy-safe:

- `proposal_viewed`
- `proposal_discussion_started`
- `proposal_discussion_sent`
- `proposal_accepted`
- `payment_page_viewed`
- `payment_attempt_started`
- `payment_failed`
- `payment_received`
- `activation_pending`
- `student_access_activated`

Properties:
- route category;
- offer category/id surrogate if non-sensitive;
- lifecycle state;
- locale.

Avoid:
- name;
- email;
- document details;
- free-text discussion note;
- raw payment reference.

---

# 23. Responsive design

## Desktop
Two-column proposal review:
- main: route + service + rationale;
- side: price + status + acceptance action.

Discussion stays below primary review, visually secondary.

## Mobile
Order:
1. proposal status;
2. route;
3. included service;
4. price;
5. key boundaries;
6. accept CTA;
7. discussion option;
8. evidence/details.

Payment mobile:
1. amount/state;
2. action/retry;
3. next-step explanation;
4. receipt/reference;
5. history.

No critical action depends on hover.

---

# 24. Pilot 4 acceptance criteria

- [ ] Prospect can explain what is being proposed after one screen.
- [ ] Route recommendation and paid service are clearly related but conceptually distinct.
- [ ] Included services and exclusions are understandable.
- [ ] Price is human-readable and server-derived.
- [ ] Admission/visa outcomes are never implied as guaranteed.
- [ ] Discuss and Accept are distinct actions.
- [ ] Acceptance has a confirmation/review step.
- [ ] Account remains Prospect until payment + validation activate Student access.
- [ ] Payment failure cannot cause duplicate/unsafe re-payment behaviour.
- [ ] Payment received is clearly separate from Student activation.
- [ ] Admin manual confirmation and final activation are separate decisions.
- [ ] Activation consequence is explicit before Admin confirms.
- [ ] Commercial/payment history remains traceable after Student activation.
- [ ] Raw transaction/provider events remain hidden from ordinary Prospect UI.
- [ ] Current disabled payment orchestration is represented deliberately, not as a broken CTA.
- [ ] Desktop/mobile/RTL states are designed before production implementation.
