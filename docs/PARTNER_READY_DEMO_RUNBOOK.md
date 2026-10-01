# Partner-Ready Demonstration Runbook

This runbook is for a controlled professional demonstration using **synthetic data only**.

## Before the meeting

1. Confirm that Render serves the current approved `main` SHA.
2. Confirm `/api/health` reports `partner_prelaunch`.
3. Use only the dedicated synthetic demo identities.
4. Share credentials out-of-band with the presenter only. Never store passwords in this repository, meeting notes, screenshots or partner documents.
5. Do not enable production email, payment, analytics or indexing for the meeting.

## Suggested demonstration

### 1. Public orientation

Open `https://almago-dev.onrender.com`.

Demonstrate:

- homepage → orientation;
- complete French flow and immediate result;
- switch to Arabic and show RTL rendering;
- desktop and mobile responsive behavior;
- factual wording: no admission, visa or success guarantee.

### 2. Student space

Sign in with the dedicated synthetic student identity.

Show representative Phase 1 surfaces:

- dashboard;
- profile;
- documents;
- orientation;
- checklist;
- applications;
- project/pathway;
- language courses;
- finance & insurance.

Do not upload a real passport, diploma or personal document.

### 3. Partner email/payment demonstration

Sign in with the dedicated synthetic admin identity and open:

`/admin/partner-demo`

Show:

- French email preview;
- Arabic/RTL email preview;
- reserved `.invalid` links;
- no-send boundary;
- the 0 € payment lifecycle;
- refund simulation and access-revocation state.

Explain explicitly that this surface has no provider checkout, webhook, bank movement or Supabase payment write.

### 4. Admin space

Show representative administrative surfaces:

- prospects/qualification;
- students/documents;
- applications;
- orientation;
- offers;
- payments;
- universities/programs;
- language courses;
- finance & insurance.

The demo should emphasize server-side role checks and separation from the student role.

## End-of-demo safety check

Before ending the meeting, confirm:

- no real student data was entered;
- no real message was sent;
- no payment was collected;
- no production integration was enabled;
- no credential was shown or copied into a partner-facing document.

## Evidence

The repository contains an explicit Partner-Ready rehearsal workflow that validates the exact Render SHA, FR/AR responsive/accessibility coverage, role isolation, student/admin matrices and the partner-demo sandbox.

A successful rehearsal is Partner-Ready evidence only. It does **not** replace the final A38/post-legal exact-SHA release proof required before Public Live.
