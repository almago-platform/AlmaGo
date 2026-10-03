# READ FIRST — Campus Allemagne Procedure & Deadline Engine

**Status:** product/workflow research completed; implementation not started here.  
**Validated business decision date:** 2026-10-04  
**Repository:** `almago-platform/AlmaGo`  
**Audience:** the next developer / ChatGPT agent implementing the Campus Allemagne dossier workflow.

> **Do not restart the product research from zero. Do not invent a second workflow.**
>
> The business workflow, ownership rules, deadline model and source-of-truth principles below have already been defined with the Campus Allemagne operator. Implementation should extend the existing AlmaGo student/admin system.

---

## 1. Non-negotiable business rule: minimum burden on the student

At dossier opening, the student is asked for only:

1. **Passport** — readable identity page.
2. **Baccalaureate / official proof of the Bac**.
3. **Baccalaureate transcript / relevé de notes**.
4. **Existing language certificate, only if already available** — e.g. Goethe, telc, TestDaF, IELTS, TOEFL, DELF, etc. depending on the project.

The absence of a language certificate **must not block dossier creation**.

**Everything else is Campus Allemagne-managed by default.**

Campus Allemagne organises or coordinates:
- document review;
- Tunisian authentication/certification when required;
- German legalisation only when actually required;
- translation;
- academic eligibility review;
- programme selection;
- direct / uni-assist / VPD application preparation;
- CV, motivation and other agency-preparable documents;
- application follow-up and missing-document handling;
- financing preparation;
- insurance preparation;
- visa preparation;
- deadline monitoring and reminders;
- post-admission / arrival preparation.

### Exception: targeted student action

A student task is created **only** when a source document or a personal action can only come from the student.

Examples:
- Bachelor/Licence diploma and university transcripts for a Master;
- a missing original;
- replacement of an unreadable/rejected upload;
- personal signature;
- KYC / payment / bank transfer;
- sitting a language exam or attending a course;
- biometrics;
- personal attendance at a consular appointment;
- personal platform confirmation where legally/technically required.

Every exceptional student task must contain:
- a clear reason;
- what exactly the student must do;
- a deadline if applicable;
- what happens after it is done.

When no personal action is required, the student UI should say:

> **Aucune action requise pour le moment — Campus Allemagne s’occupe de cette étape.**

---

## 2. Product objective

AlmaGo must become the student's **live dossier**. At any moment it must answer:

1. Where are we?
2. What must the student do now?
3. What must Campus Allemagne do now?
4. What date matters?
5. Is that date official or an internal Campus Allemagne target?
6. What official source justifies the rule/date?
7. What is blocked and why?

The same truth must be visible in the admin cockpit, with more operational detail.

---

## 3. Four date types — never mix them

Use explicit kinds:

- `official_hard_deadline`  
  Example: university application deadline.

- `official_external_date`  
  Example: language-course start, appointment, externally fixed date.

- `internal_target`  
  Example: Campus Allemagne target to have translations ready before the official deadline.

- `source_review_date`  
  Example: when a visa/finance rule must be re-verified.

### Absolute rule

An internal target must **never** be displayed as an official deadline.

An official deadline should not be treated as verified unless it has:
- source URL;
- verified-at timestamp/date;
- intake/cycle context.

Unknown/unverified deadline => display **À vérifier**, not a fake countdown.

---

## 4. Canonical dossier workflow

### 0 — Project confirmed
Owner: joint / Campus Allemagne + student.

Resolve:
- route;
- target degree;
- field;
- target intake;
- preferred city/region;
- current language level.

Supported route families should include at minimum:
- `studies_bachelor`
- `studies_master`
- `study_preparation`
- `study_place_search`
- `standalone_language`
- `ausbildung`
- `ausbildung_search`
- `research_doctorate`
- `study_internship`

### 1 — Starter documents
Owner: student.

Default visible requirements only:
- passport;
- Bac/proof of Bac;
- Bac transcript;
- existing language certificate if available.

### 2 — Review starter documents
Owner: Campus Allemagne.

Check:
- readability;
- complete pages;
- identity/date consistency;
- seals/signatures/verification codes where relevant;
- missing pages.

If replacement is needed, create a targeted student task.

### 3 — Tunisian authentication / certification
Owner: Campus Allemagne + external authority/provider.

The system determines if/what is needed and tracks the operation.
Do not assign this to the student by default.

### 4 — German legalisation, only if required
Owner: Campus Allemagne + TLS/Embassy where applicable.

Possible states:
- `not_required`
- `to_verify`
- `required`
- `submitted_external`
- `completed`

The admin must record **why** it is required and the source/request supporting that decision.

Do not assume that every Bac or transcript needs German legalisation.

### 5 — Translation
Owner: Campus Allemagne + translator/provider.

Campus Allemagne organises and verifies the translation.
For uni-assist, use translation standards compatible with uni-assist requirements.

### 6 — Academic eligibility
Owner: Campus Allemagne.

Use official/authoritative sources and programme rules as guidance; the university remains the final admission authority.

If this analysis reveals a source document only the student can provide, create a targeted request.

### 7 — Language
Owner: Campus Allemagne, student only for personal actions.

Track:
- existing certificate;
- programme language requirements;
- missing level/certificate;
- proposed course/exam;
- relevant deadline/target.

No certificate at onboarding is not an error.

### 8 — Programme selection + application method
Owner: Campus Allemagne.

For each programme store the actual method:
- direct;
- uni-assist standard;
- VPD then direct;
- other documented procedure.

Application method belongs to the programme/case, not to a broad assumption about the whole university.

### 9 — Prepare application
Owner: Campus Allemagne.

Prepare only what is required for the programme:
- CV;
- motivation;
- forms;
- recommendations;
- portfolio;
- TestAS/GRE/GMAT;
- internship proof;
- other programme-specific requirements.

If personal confirmation/signature/payment is required, create one targeted student task.

### 10 — Submit application
Owner: Campus Allemagne.

Campus Allemagne prepares and follows the submission.
Student involvement is exception-based only.

### 11 — Post-submission follow-up
Owner: Campus Allemagne.

Track:
- confirmation;
- payment;
- uni-assist status;
- missing documents;
- university messages;
- VPD.

### 12 — Admission / preparatory basis
Owner: external institution; tracked by Campus Allemagne.

Examples:
- definitive admission;
- conditional admission;
- Bewerberbestätigung;
- other accepted preparatory basis.

### 13 — Financing
Owner: Campus Allemagne.

Prepare the applicable route:
- blocked account;
- Verpflichtungserklärung;
- scholarship;
- other valid route.

Student task only where personal KYC/payment/signature is mandatory.

### 14 — Insurance
Owner: Campus Allemagne.

Prepare/track the correct coverage for the case.
Student action only where provider requires personal validation/payment/signature.

### 15 — Visa
Owner: Campus Allemagne, with explicit personal student sub-actions.

Campus Allemagne:
- builds checklist;
- prepares files;
- verifies originals;
- tracks portal/procedure;
- tracks dates.

Student only for legally personal actions:
- signature;
- biometrics;
- physical attendance;
- original handover;
- personal payment/login/confirmation if required.

### 16 — After visa / arrival
Owner: Campus Allemagne, student for personal presence/actions where necessary.

Track:
- housing;
- travel;
- enrolment;
- Anmeldung;
- student insurance;
- bank account;
- residence permit.

---

## 5. Deadline engine

Given an official programme deadline `D`, current internal targets are:

- source documents ready: `D - 84 days`
- authentication/translation ready: `D - 70 days`
- uni-assist target submission: `D - 56 days`
- VPD request target: `D - 70 days`
- direct application target: `D - 21 days`
- final Campus Allemagne review: `D - 7 days`

These are **internal targets**, not official deadlines.

For Study Preparation, if the language-course start date is `C`, the local embassy guidance used in the researched workflow says the course should start no earlier than roughly two months after visa submission; model this as an external rule/source, not as a guaranteed processing time.

### Deadline urgency

For official deadlines:
- J-30 information;
- J-14 attention;
- J-7 urgent;
- J-3 critical;
- J-1 critical;
- overdue = block/escalate admin.

Internal targets may have reminders but must never be labelled “official deadline missed”.

---

## 6. Current AlmaGo code that must be reused

Do not create a parallel system without first reusing/extending current code.

Relevant existing files/tables confirmed on `main` at planning time:

- `src/app/student/page.tsx`
  - already shows next action;
  - already reads `student_checklist_items.due_date`;
  - already shows application deadlines.

- `src/app/student/checklist/page.tsx`
  - already has personalised Germany checklist logic;
  - uses `determineRegulatoryPath`;
  - uses `buildGermanyChecklist`;
  - reads academic evidence, project, language-course selection, recommendations and applications.

- `src/app/student/documents/page.tsx`
  - existing document/evidence/history surface.

- `src/app/admin/documents/page.tsx`
  - existing admin document review queue.

- `src/app/admin/applications/page.tsx`
  - existing application/deadline admin operations.

- `src/lib/orientation-engine/deadline.ts`
  - already validates deadline format;
  - considers source URL, verified-at date and cycle;
  - already has `open / closed / to_verify` concepts.
  - **Reuse/extend this principle.**

- `supabase/migrations/0006_phase3_documents_checklist.sql`
  - existing document categories;
  - existing checklist templates;
  - existing statuses;
  - existing document review → checklist sync;
  - existing `student_history`.

Current system therefore already contains important primitives. The implementation task is an extension, not a greenfield rewrite.

---

## 7. Data model direction

Recommended new/extended concepts:

### procedure_templates
Versioned route definition.

Suggested fields:
- `key`
- `version`
- `title`
- `route_key`
- `active_from`
- `active_to`
- `source_policy_version`
- `is_active`

### procedure_step_templates
Suggested fields:
- `key`
- `title`
- `owner`: student / almago / external / joint
- `student_required_by_default`
- `blocking`
- `applies_if jsonb`
- `depends_on_keys text[]`
- `deadline_rule jsonb`
- `student_help`
- `admin_help`
- `official_source_url`
- `source_verified_at`

### student_procedures
Versioned snapshot of the procedure assigned to a student.

### student_document_requirements
Separate “required document/requirement” from “uploaded file”.

Suggested fields:
- `student_id`
- `requirement_key`
- `label`
- `category`
- `status`
- `document_id`
- `required_for text[]`
- `requested_from_student`
- `student_request_reason`
- `student_request_due_date`
- `requires_tunisian_authentication`
- `requires_translation`
- `requires_german_legalisation`
- `legalisation_status`
- `due_date`
- `deadline_kind`
- `source_url`
- `source_verified_at`
- `admin_note`

### student_checklist_items extensions
Recommended:
- `owner`
- `requires_student_action`
- `student_action_reason`
- `student_action_kind`
- `deadline_kind`
- `official_source_url`
- `official_source_verified_at`
- `blocked_reason`
- `manual_due_date_override`

---

## 8. Normalised statuses

Procedure/step:
- `not_started`
- `ready`
- `waiting_student`
- `waiting_almago`
- `waiting_external`
- `in_progress`
- `blocked`
- `completed`
- `not_applicable`

Document requirement:
- `requested`
- `uploaded`
- `under_review`
- `replacement_required`
- `accepted_original`
- `authentication_required`
- `authentication_in_progress`
- `authenticated`
- `translation_required`
- `translation_in_progress`
- `translated`
- `legalisation_to_verify`
- `legalisation_required`
- `legalisation_in_progress`
- `ready`
- `not_applicable`

Do not use a percentage as legal/process truth. One blocking item can invalidate a “90% complete” dossier.

---

## 9. Admin UX to implement

Recommended consolidated page:

`/admin/students/[studentId]/procedure`

It should show:
- route;
- target intake;
- current stage;
- next action;
- owner of next action;
- student-visible action;
- Campus Allemagne internal action;
- external waiting state;
- starter documents;
- exceptional student requests;
- authentication;
- translation;
- legalisation status + why/source;
- applications;
- official deadlines;
- internal targets;
- financing;
- insurance;
- visa;
- source freshness;
- history/audit.

Admin dashboard should be able to surface:
- deadlines in < 30 / 14 / 7 / 3 days;
- overdue official deadlines;
- students waiting on Campus Allemagne;
- students waiting on a targeted student action;
- students waiting on external institutions;
- documents needing replacement;
- source/deadline rows needing re-verification;
- VPD/uni-assist cases at risk.

---

## 10. Student UX to implement

Student should see, in plain language:

### “Vos pièces de départ”
- Passeport
- Bac / preuve du Bac
- Relevé de notes du Bac
- Certificat de langue (facultatif s’il existe)

Then:
- “Ce que Campus Allemagne fait maintenant”
- “Ce que vous devez faire maintenant” only if there is a real personal action
- next official deadline
- next Campus Allemagne target, clearly labelled internal
- why an action is needed
- what happens next

Avoid dumping internal operations as a student checklist.

---

## 11. Implementation sequence

Recommended phases:

1. **P1 — Data model**
   - procedure templates;
   - student procedure snapshot;
   - document requirements;
   - deadline/source fields;
   - RLS.

2. **P2 — Procedure generator**
   - map `student_projects.path` to a versioned procedure;
   - dependencies / applies-if;
   - owner/action semantics.

3. **P3 — Smart documents**
   - only 3 default required uploads + optional existing language certificate;
   - internal Campus Allemagne requirements;
   - exceptional targeted student requests;
   - source-document lifecycle.

4. **P4 — Deadline engine**
   - official vs internal;
   - source verification;
   - target calculations;
   - unknown/to-verify state.

5. **P5 — Admin student procedure**
   - consolidated operational cockpit.

6. **P6 — Student procedure UX**
   - simple next-action and status view.

7. **P7 — Notifications**
   - deadline/reminder/escalation logic.

8. **P8 — Source freshness**
   - source registry / verified-at / revalidation.

9. **P9 — Tests**
   - unit tests;
   - RLS/integration;
   - E2E student/admin;
   - deadline edge cases;
   - route change;
   - VPD;
   - document replacement;
   - unknown source/date.

---

## 12. Acceptance criteria

Implementation is not complete unless:

- every student has an explicit route;
- every step has an owner;
- default student uploads are limited to passport + Bac + Bac transcript, plus optional existing language certificate;
- internal Campus Allemagne tasks never appear as student obligations;
- exceptional student requests have a reason;
- required document state is distinct from file-upload state;
- official deadlines require source + verification date + cycle/intake;
- internal targets are visually distinct;
- unknown deadline is shown as “À vérifier”;
- legalisation is never assumed by default;
- admin can see dossiers at risk before deadlines;
- student can see where the dossier is without having to call;
- route changes remain auditable;
- student/admin RLS remains correct;
- existing deadline/checklist primitives are reused where appropriate;
- all important status changes create auditable history.

---

## 13. Official research basis already reviewed

The product/workflow research used official sources including:
- German Embassy Tunis — national visas;
- German Embassy Tunis — studies;
- German Embassy Tunis — study preparation;
- German Embassy Tunis — legalisation / consular certification;
- German Embassy Tunis — translators;
- German Federal Foreign Office — Consular Services Portal;
- uni-assist — deadlines & processing time;
- uni-assist — VPD;
- uni-assist — uploading/missing documents;
- uni-assist — translations;
- uni-assist — Tunisia country guidance;
- uni-assist — educational certificates;
- DAAD — requirements overview.

Before production use, volatile rules/amounts must continue to be re-verified and stored with source + verified-at metadata.

---

## 14. Instructions for the next ChatGPT/developer

1. Read this file first.
2. Inspect the current `main` before editing.
3. Inspect open PRs/issues to avoid collision.
4. Do **not** redo the product discovery unless an official source has materially changed.
5. Do **not** replace the workflow with a generic checklist.
6. Preserve the minimum-student-burden rule.
7. Reuse existing student/admin/checklist/deadline code.
8. Implement in phases; do not land the entire schema/UI/engine in one risky patch.
9. Keep official dates and internal targets separate at the data-model level.
10. Keep source provenance auditable.
11. Do not claim admissions/visa outcomes.
12. Keep the admin as the operational source of truth and the student UI as the simplified view of that truth.

**This document is the implementation handoff/source of truth for the next work session.**
