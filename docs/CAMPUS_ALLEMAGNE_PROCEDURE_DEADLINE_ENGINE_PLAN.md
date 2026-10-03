# Campus Allemagne — Procedure & Deadline Engine Plan

**Version:** 1.1  
**Validated:** 2026-10-04  
**Status:** implementation plan / source material, not production schema  
**Primary handoff:** [CAMPUS_ALLEMAGNE_IMPLEMENTATION_HANDOFF.md](./CAMPUS_ALLEMAGNE_IMPLEMENTATION_HANDOFF.md)  
**Template prototype:** [campus-allemagne-procedure-templates.v1.json](./campus-allemagne-procedure-templates.v1.json)

## Purpose

This plan defines the future Campus Allemagne dossier workflow inside AlmaGo so that:

- the student always knows where the dossier stands;
- the student only receives actions that truly require their personal intervention;
- Campus Allemagne owns the administrative preparation by default;
- each step has an owner;
- each official deadline has a source and verification date;
- internal safety targets are not confused with official deadlines;
- the admin dashboard shows operational risk before a deadline is missed;
- the workflow can vary by project route without duplicating product logic.

## Core business decision

### Student provides at intake

Mandatory:
1. Passport.
2. Baccalaureate / official proof of Bac.
3. Baccalaureate transcript.

Optional if already available:
4. Existing language certificate.

No other requirement should automatically appear as a student obligation.

### Campus Allemagne manages by default

- document control;
- Tunisian authentication/certification;
- German legalisation when truly required;
- translation;
- academic eligibility analysis;
- programme research/selection;
- direct / uni-assist / VPD preparation;
- CV/motivation and agency-preparable supporting material;
- application follow-up;
- financing;
- insurance;
- visa preparation;
- deadline monitoring;
- arrival preparation.

### Student is asked again only when indispensable

Create a targeted student task only when the item/action cannot be completed by Campus Allemagne, for example:
- additional source diploma/transcripts for a Master;
- missing original;
- replacement of unreadable/rejected upload;
- personal signature;
- KYC/payment/bank transfer;
- taking a language course/exam;
- biometrics;
- required personal attendance;
- personal confirmation in an external portal.

The targeted request must include: reason, exact action, deadline when applicable, and what happens next.

## Date model

### official_hard_deadline
A true application/legal deadline.

Requirements:
- official source URL;
- verified_at;
- cycle/intake context.

### official_external_date
An external fixed date, e.g. course start or appointment.

### internal_target
Campus Allemagne safety target derived from a true deadline.

### source_review_date
Date when a volatile rule/source must be rechecked.

### Display rules

- Official deadline => "Date limite officielle".
- Internal target => "Objectif Campus Allemagne".
- Missing/unreliable official source => "À vérifier".
- Never use an internal target as a legal/official deadline.
- Never show a critical countdown against an unverified date.

## Canonical route workflow

1. Project confirmed.
2. Starter documents received.
3. Campus Allemagne reviews starter documents.
4. Tunisian authentication/certification when needed.
5. German legalisation only if needed.
6. Translation.
7. Academic eligibility review.
8. Language path.
9. Programme selection and application method.
10. Application preparation.
11. Application submission.
12. Post-submission follow-up.
13. Admission/preparatory basis.
14. Financing.
15. Insurance.
16. Visa.
17. Arrival/post-visa preparation.

Every stage must expose:
- owner;
- status;
- blocking/non-blocking;
- student-visible action, if any;
- admin/internal action;
- dependencies;
- deadline kind/date;
- source URL and verified_at when official;
- history/audit event.

## Route families

At minimum:
- studies_bachelor
- studies_master
- study_preparation
- study_place_search
- standalone_language
- ausbildung
- ausbildung_search
- research_doctorate
- study_internship

Route-specific requirements must be data-driven and versioned.

## Document lifecycle

Do not model "document required" as the same thing as "file uploaded".

Recommended requirement lifecycle:
- requested
- uploaded
- under_review
- replacement_required
- accepted_original
- authentication_required
- authentication_in_progress
- authenticated
- translation_required
- translation_in_progress
- translated
- legalisation_to_verify
- legalisation_required
- legalisation_in_progress
- ready
- not_applicable

Important:
- upload != approval;
- translation is normally Campus Allemagne-owned;
- German legalisation is never assumed by default;
- a legalisation requirement should record why/source;
- a route change should not silently delete history.

## Deadline calculations

Given official application deadline D:

- source documents ready: D - 84 days
- authentication/translation ready: D - 70 days
- uni-assist target: D - 56 days
- VPD request target: D - 70 days
- direct application target: D - 21 days
- final Campus Allemagne review: D - 7 days

These are internal targets and may be moved earlier.

For official application deadlines:
- J-30 information
- J-14 attention
- J-7 urgent
- J-3 critical
- J-1 critical
- overdue => admin escalation/blocking state

For unknown/unverified deadlines:
- no red countdown;
- create admin verification task;
- student sees "À vérifier".

## Why the deadline model is conservative

uni-assist commonly references 15 July / 15 January for many courses, but these are not universal. Programme/university deadlines prevail.

uni-assist recommends applying well before the deadline (commonly at least eight weeks) so incomplete submissions can still be corrected before closing.

VPD has its own processing time and still requires a later direct university application, so VPD must not be treated as the final application itself.

## Student dashboard target experience

Always show:
- project/route;
- starter-document status;
- "what Campus Allemagne is doing now";
- "what you must do now" only when a personal action exists;
- next verified official deadline;
- next internal Campus target, clearly labelled;
- what comes next.

When no student action exists:

> Aucune action requise pour le moment — Campus Allemagne s’occupe de cette étape.

Avoid exposing internal administrative work as a long student to-do list.

## Admin cockpit target experience

Recommended consolidated page:

`/admin/students/[studentId]/procedure`

Show:
- route/intake;
- current stage;
- next action + owner;
- starter documents;
- exceptional student requests;
- authentication;
- translation;
- legalisation status/reason/source;
- applications;
- official deadlines;
- internal targets;
- financing;
- insurance;
- visa;
- source freshness;
- audit/history.

Global admin dashboard should surface:
- official deadlines within 30/14/7/3 days;
- overdue official deadlines;
- waiting_student;
- waiting_almago;
- waiting_external;
- replacement-required documents;
- VPD/uni-assist cases at risk;
- source/deadline records requiring re-verification.

## Existing AlmaGo primitives to reuse

Do not build a second parallel system.

Current main already contains:
- `student_checklist_items` with statuses and due dates;
- `checklist_templates`;
- document categories/review;
- `student_history`;
- application deadlines/next actions/required documents;
- academic evidence;
- regulatory-path logic;
- student Germany checklist;
- student dashboard "next action" + important deadlines;
- admin document queue;
- admin application operations;
- `src/lib/orientation-engine/deadline.ts` with date validation, source URL, verified_at, cycle and `open/closed/to_verify`.

Implementation should extend/reuse these foundations.

## Recommended schema direction

### procedure_templates
Versioned procedure definitions.

### procedure_step_templates
Fields should cover:
- key/title;
- owner;
- default student requirement;
- blocking;
- applies_if;
- dependencies;
- deadline rule;
- student/admin help;
- source URL/verified_at.

### student_procedures
Versioned snapshot applied to one student.

### student_document_requirements
Track requirement independently from file:
- requirement key;
- label/category;
- status;
- linked document;
- required_for;
- requested_from_student;
- request reason/due date;
- auth/translation/legalisation flags/status;
- due date/kind;
- source/verified_at;
- admin note.

### student_checklist_items extensions
Consider:
- owner;
- requires_student_action;
- student_action_reason;
- student_action_kind;
- deadline_kind;
- official_source_url;
- official_source_verified_at;
- blocked_reason;
- manual_due_date_override.

## Normalised step statuses

- not_started
- ready
- waiting_student
- waiting_almago
- waiting_external
- in_progress
- blocked
- completed
- not_applicable

A percentage is presentation only, never legal/process truth.

## Implementation phases

### P1 — Data model
Versioned templates, student procedure snapshots, document requirements, deadline/source fields, RLS.

### P2 — Procedure generator
Generate a route snapshot from `student_projects.path`; implement dependencies and applies-if.

### P3 — Smart documents
Limit default student upload requests to the three starter documents + optional existing language certificate. Add internal requirements and targeted exceptions.

### P4 — Deadline engine
Official vs internal dates, source verification, internal target calculation, unknown/to_verify behavior.

### P5 — Admin student procedure cockpit
Single operational view.

### P6 — Student procedure UX
Simple next action, Campus action, deadlines, status and what happens next.

### P7 — Notifications
Deadline and blocked-action reminders/escalation.

### P8 — Source freshness
Source registry and re-verification workflow.

### P9 — Tests
Unit/integration/RLS/E2E; include route changes, VPD, unknown deadline, overdue deadline, replacement document and role isolation.

## Acceptance criteria

- explicit route per student;
- owner per step;
- only three default student uploads + optional existing language certificate;
- Campus internal work never appears as a student obligation;
- exceptional student action has a reason;
- document requirement != uploaded file;
- official deadline requires source + verified_at + cycle;
- internal target visibly distinct;
- unknown dates show "À vérifier";
- legalisation not assumed;
- admin can see at-risk dossiers;
- student can understand status without calling;
- route changes auditable;
- RLS correct;
- history recorded;
- no admission/visa guarantee language.

## Official source register used for the research

- German Embassy Tunis — National visas: https://tunis.diplo.de/tn-de/service/05-visaeinreise/1672716-1672716
- German Embassy Tunis — Studies: https://tunis.diplo.de/tn-de/service/05-visaeinreise/2573172-2573172
- German Embassy Tunis — Study preparation: https://tunis.diplo.de/tn-de/service/05-visaeinreise/2573166-2573166
- German Embassy Tunis — Legalisation / consular certification: https://tunis.diplo.de/tn-de/service/2519432-2519432
- German Embassy Tunis — Translators: https://tunis.diplo.de/tn-de/service/1515196-1515196
- Federal Foreign Office — Consular Services Portal: https://www.auswaertiges-amt.de/en/visa-service/consular-services-portal
- uni-assist — Deadlines and processing time: https://www.uni-assist.de/en/how-to-apply/plan-your-application/deadlines-processing-time/
- uni-assist — VPD: https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/
- uni-assist — Uploading documents: https://www.uni-assist.de/en/how-to-apply/send-track/uploading-documents/
- uni-assist — Missing documents: https://www.uni-assist.de/en/how-to-apply/send-track/submitting-missing-documents/
- uni-assist — Translations: https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/translations/
- uni-assist — Tunisia guidance: https://www.uni-assist.de/en/tools/info-country-by-country/details-country/country/tn/
- uni-assist — Educational certificates: https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/educational-certificates/
- DAAD — Requirements overview: https://www.daad.de/en/studying-in-germany/requirements/overview/

## Governance

Visa, financing, deadline and document rules can change.

Production implementation must store official source provenance and verification date as business data. Before a high-impact submission, the active rule for that dossier should be revalidated.

This plan is intentionally product/technical guidance. It does not itself change production schema or workflow.
