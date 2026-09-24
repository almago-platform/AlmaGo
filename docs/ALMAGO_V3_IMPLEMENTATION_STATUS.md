# AlmaGo V3 — Implementation Status

**Date:** 24 September 2026  
**Plan source:** `docs/ALMAGO_V3_TRUST_GUIDANCE_PLAN.md`  
**Purpose:** track implementation separately from the original 45-task Master Plan.

## V3 execution status

| Phase | Status | Main PR | Notes |
| --- | --- | ---: | --- |
| V3-1 Language & trust audit | Implemented / PR ready | #142 | Public, student and admin wording humanised; “piste d’orientation” terminology introduced. |
| V3-2 Trust & transparency layer | Implemented / PR ready | #143 | “Notre rôle” section; clear boundary with official decisions. |
| V3-3 Homepage trust additions | Implemented with V3-2 | #143 | Trust/navigation improvements without rebuilding Homepage V2. |
| V3-4 Student dossier service layer | Implemented / PR ready | #144 | “À faire par vous” / “En cours chez AlmaGo”; clearer dossier state. |
| V3-5 Programme information quality | Implemented / PR ready | #145 | Official-source visibility for students and completeness flag for admin. |
| V3-6 Programme comparison | Implemented / PR ready | #146 | Compare up to 3 programmes; factual comparison only; no ranking or score. |
| V3-7 Country guidance | Implemented / PR ready | #148 | Country-of-qualification gateway with official tools; no nationality shortcut. |
| V3-8 Understand the process | Implemented / PR ready | #147 | Plain-language guidance for VPD, NC, HZB, Studienkolleg, TestAS, uni-assist, DoSV and translations. |
| V3-9 Help & support | Implemented / PR ready | #149 / #152 | Public Help Center + direct student-space help entry; no fake support channel. |
| V3-10 Admin information quality | Implemented / PR ready | #150 | Missing-source and missing-deadline indicators/filters. |
| V3-11 Multilingual quality | Architecture ready | #153 | FR ready; EN/DE/AR planned; no partial-language selector; RTL readiness for Arabic. |
| V3-12 Professional QA | Implemented / PR ready | #151 | Automated public-language quality guard. |
| Public navigation hardening | Implemented | #155 | Cross-page-safe anchors and Help Center in main navigation. |
| Public discoverability | Implemented | #156 | Canonical URL, sitemap, robots, noindex private/auth surfaces. |
| Public trust destination | Implemented | #157 | Dedicated “Confiance et transparence” page. |

## What is intentionally not activated yet

### Public legal identity / legal footer
Blocked by Master Plan A38.

Do not publish:
- legal operator identity;
- public legal address;
- legal contact email;
- legal-form claims;
- privacy/terms final links presented as validated;
until A38 is actually reviewed and approved.

### Authenticated production evidence
Blocked by A43 until the dedicated student/admin E2E credentials are configured and the authenticated journey passes.

### Production analytics / observability
Blocked by A44 until A38/A43 are complete and a real provider configuration is reviewed.

### Final release gate
A45 remains after A44.

### Multilingual public activation
EN / DE / AR remain planned until complete translation and human review. Do not expose them as available yet.

## V3 guardrails preserved

- no AI/technology marketing jargon in public copy;
- no admission probability score;
- no “best programme” winner;
- no fake testimonials;
- no fake staff;
- no fake partners;
- no fake official affiliation;
- no invented verification date;
- no fake help/chat availability;
- no public secrets;
- official institutions remain authoritative.

## Current operational principle

V3 adds professionalism without changing the original Master Plan completion rules.

The original Master Plan still controls release readiness:
**A38 → A43 → A44 → A45**.

V3 PRs should be reviewed/merged in dependency order because they are intentionally stacked.
