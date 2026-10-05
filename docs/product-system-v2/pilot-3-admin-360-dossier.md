# Pilot 3 — Admin 360° Dossier / Advisor Cockpit

Status: **Architecture defined — Figma visual pending**

## Role in lifecycle

The Admin/Advisor must manage one person across the complete lifecycle:

> Candidate Orientation → Prospect → Proposal → Payment/Activation → Active Student → Procedure / Applications

The admin must not mentally reconstruct the person from separate Orientation, Prospects, Documents, Intake, Payments and Applications modules.

## Primary operator questions

1. Who is this person?
2. What lifecycle stage are they in?
3. Why is the dossier open / needing attention?
4. Who owns the next action?
5. What evidence supports the recommendation?
6. What did Campus already communicate?
7. What happened previously?

## Target dossier shell

### Persistent dossier header
- name;
- lifecycle stage;
- dossier/reference ID;
- last meaningful update;
- next required action;
- responsible side: Prospect / Student / Campus / External;
- contextual primary action.

### Dossier tabs / sections

**Before Student activation**
- Overview
- Orientation
- Prospect profile
- Starter documents
- Proposal
- Messages
- Payment / activation
- History

**After Student activation**
- Overview
- Profile
- Documents
- Orientation history
- Proposal/commercial history
- Messages
- Payment
- Procedure
- Applications
- History

## Overview layout

### A. Attention panel
One dominant operational reason:
- student/prospect response received;
- missing document;
- decision needed;
- payment to validate;
- external deadline.

### B. Dossier summary
Key facts only:
- academic situation;
- target degree/field;
- language;
- intake;
- geography.

### C. Evidence readiness
Documents grouped by:
- approved;
- pending;
- replacement required;
- missing.

### D. Advisor analysis
Default:
- route recommendation;
- top programmes;
- compatibility evidence;
- unresolved risks.

Secondary disclosure:
- technical Orientation A/B/C/D stages;
- reason codes;
- raw engine diagnostics;
- provenance/debug.

### E. Proposal
Route + offer + rationale + send/update action.

### F. Timeline
Human-readable events:
- Orientation completed;
- account created;
- document uploaded/reviewed;
- proposal sent;
- Prospect asked question;
- proposal accepted;
- payment received/validated;
- Student activated;
- procedure/application change.

## Cross-dossier queue pattern

Inspired by advisor/case-management systems:
- quick filters;
- lifecycle stage;
- action owner;
- last update;
- attention reason;
- direct drill-down to 360° dossier.

Global queues remain, but the dossier is the detail source of truth.

## Terminology correction

Before activation, admin UI should say:
- Candidate
- Prospect
- Prospect dossier

Not:
- Student
- Client active

After activation:
- Student / Client AlmaGo

The database can retain technical identifiers as needed; the UI must express the real business state.

## Acceptance criteria

- [ ] One dossier spans the full lifecycle.
- [ ] Admin can identify next action in under a few seconds.
- [ ] Cross-dossier queue and dossier detail use the same status semantics.
- [ ] Technical audit is secondary, not deleted.
- [ ] Proposal/payment/activation history is traceable.
- [ ] Prospect vs Student terminology is correct.
- [ ] Dense desktop layout remains readable.
- [ ] Tablet/mobile admin behaviour defined.
