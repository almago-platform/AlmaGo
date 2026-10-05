# Pilot 2 — Prospect / Pre-account Home

Status: **Architecture defined — Figma visual pending**

## Role in lifecycle

Shown after the candidate creates an account from the free Orientation result.

The user is now a **Prospect**, not an active Student.

Allowed Prospect capabilities:
- preserve/update Orientation;
- complete project/profile;
- browse catalogue;
- see personalised programme suggestions;
- upload starter documents;
- see what Campus is reviewing;
- receive/discuss/accept a Campus proposal;
- pay when a proposal is accepted.

Not yet available:
- full Student dashboard;
- active procedure/candidature workspace;
- post-payment service tools reserved for activated Students.

## Primary product question

> What is happening with my Germany project, and what should I do next?

## Target hierarchy

1. **Prospect lifecycle header**
   - "Mon projet Allemagne"
   - lifecycle stage
   - explicit label: "Espace Prospect"
   - clear Student-access boundary

2. **One dominant next action**
   Examples based on actual current intake state:
   - confirm/update orientation;
   - upload starter documents;
   - review Campus proposal;
   - complete payment;
   - wait for Campus validation.

3. **What Campus is doing**
   Separate the responsible side:
   - "À vous"
   - "Campus Allemagne"
   - "En attente d'une validation externe" when applicable.

4. **Journey rail**
   - Orientation
   - Starter documents
   - Campus review
   - Proposal
   - Acceptance/payment
   - Activation Student

5. **Recommended programmes**
   Maximum 3 priority cards + "Voir le catalogue".
   Explain why each appears and what remains to verify.

6. **Starter documents**
   Compact status list, not another full page embedded in the dashboard.

7. **Proposal slot**
   Empty/waiting/ready/discussion/accepted/payment states.

8. **Project details**
   Secondary/collapsible information.

## Important correction to current UX

Current code already has strong lifecycle logic in `nextAction()` and `campusWork()`. V2 should preserve this logic.

However:
- the interface currently uses multiple equal-weight cards;
- Prospect navigation exposes many destinations permanently;
- some copy uses "étudiant" or "client" before activation;
- the paid Student boundary should be more explicit.

V2 rule:
> Prospect is a legitimate product space, not a reduced Student dashboard.

## Acceptance criteria

- [ ] Prospect status is visible without sounding negative.
- [ ] One next action dominates.
- [ ] Campus work is visible separately from Prospect work.
- [ ] Proposal/payment state is clear.
- [ ] Student access boundary is explicit.
- [ ] Recommended programmes remain useful without overwhelming the dashboard.
- [ ] Desktop and mobile hierarchy approved.
- [ ] RTL reviewed.
