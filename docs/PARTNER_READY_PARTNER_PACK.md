# Campus Allemagne — Partner-Ready Brief

Status: **pre-launch partner demonstration**. This document is not a public-launch announcement and does not represent an active commercial offer.

## What Campus Allemagne demonstrates today

Campus Allemagne is a bilingual FR/AR product for students preparing a study project in Germany. The current Partner-Ready environment demonstrates:

- public orientation in French and Arabic/RTL;
- an immediate orientation result without presenting an admission or visa guarantee;
- synthetic student and admin spaces;
- document, application, checklist, pathway, language-course and finance/insurance surfaces;
- prospect qualification and versioned Bronze/Silver/Gold offer infrastructure;
- local previews of the real FR/AR transactional-email templates without sending an email;
- a browser-only **0 €** payment lifecycle simulation;
- strict role separation between student and administrator accounts.

The canonical partner demonstration environment is:

`https://almago-dev.onrender.com`

Only synthetic/test identities are used for the Partner-Ready demonstration.

## Current operating boundary

The product is intentionally **not Public Live**.

Partner-Ready mode keeps the following production effects fail-closed:

- public indexing;
- real prospect collection/onboarding;
- real transactional-email delivery;
- production payment/checkout/webhooks;
- production marketing/analytics attribution.

The current environment exists so that banks, insurers, payment partners and other professional partners can review a functioning product without creating a real student service before the final legal and operational gates.

## Product journey shown to a partner

1. Visitor opens Campus Allemagne and completes orientation.
2. The result explains the student's next steps in factual language.
3. The partner can inspect the FR/AR transactional-email rendering without any delivery.
4. Synthetic accounts demonstrate authenticated student and admin workflows.
5. Qualification and offer infrastructure demonstrate the future conversion model.
6. The 0 € sandbox demonstrates the lifecycle:
   `offer_selected → payment_pending → paid_pending_validation → client_active → refunded`.
7. No bank transaction, provider checkout, Supabase payment write or real access activation occurs in that sandbox.

## Future commercial model

The codebase defines stable **Bronze / Silver / Gold** offer identities, but no commercial version is automatically published and no package should be presented as an active sale before owner and legal validation.

Before Public Live, the owner must define for each package:

- included services;
- service limits;
- human-support level;
- application/dossier limits where relevant;
- final price and currency;
- cancellation/refund terms;
- contractual wording.

The Partner-Ready demo is therefore evidence of product capability, not an invitation to purchase.

## Architecture summary

- Web application: Next.js 16.3.8.
- Authentication, PostgreSQL and private document storage: Supabase.
- Canonical Partner-Ready runtime: Render, Frankfurt region.
- Source control and canonical CI: GitHub.
- Heavy E2E/browser evidence is milestone-driven under Partner-Ready Calm Mode.

## What we want from partners

Depending on the discussion, Campus Allemagne can present requirements for:

- professional banking and settlement infrastructure;
- payment-provider integration for the future legal entity;
- student-relevant insurance/banking partnerships;
- operational or distribution partnerships.

No partner integration in this brief is represented as already contracted.

## Legal status boundary

Development and Partner-Ready testing currently happen before the final public opening. The intended real operating establishment is planned in Tunisia; the final registration, tax/banking setup and any applicable legal review remain Public-Live prerequisites.

Real student data, real payment collection and production outreach remain outside the Partner-Ready demonstration boundary.
