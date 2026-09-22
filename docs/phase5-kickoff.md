# Phase 5 Kickoff

This file starts the automated AlmaGo Phase 5 workflow.

## Objective

Move AlmaGo from a functionally complete student platform to a polished, modern, professional SaaS experience without changing working business logic unnecessarily.

## Scope

- Design system
- Global student/admin navigation
- UX refinement of existing pages
- Public marketing site
- Responsive validation
- Accessibility
- Reasonable performance cleanup

## Constraints

- Preserve Auth, RLS, private Storage, signed URLs, student/admin isolation, documents, orientation, applications, notifications, history and checklists.
- Do not start payments, WhatsApp, autonomous AI, massive scraping or a native mobile app.
- No destructive database changes without explicit approval.
- No real data deletion.

## Review protocol

At the end of each important block:
- run tests;
- run `npm run lint`;
- run `npm run build`;
- update the pull request with `ALMAGO REVIEW REQUEST`;
- wait for a `SUPERVISOR:` decision.
