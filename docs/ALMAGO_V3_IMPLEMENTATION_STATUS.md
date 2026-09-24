# AlmaGo V3 — Implementation Status

**Date:** 24 September 2026  
**Plan source:** `docs/ALMAGO_V3_TRUST_GUIDANCE_PLAN.md`  
**Purpose:** track V3 implementation separately from the original 45-task Master Plan.

## V3 execution status

| Phase / layer | Status | Main PR | Notes |
| --- | --- | ---: | --- |
| V3-1 Language & trust audit | Implemented | #142 | Public, student and admin wording humanised; “piste d’orientation” terminology introduced. |
| V3-2 Trust & transparency layer | Implemented | #143 | “Notre rôle” section; clear boundary with official decisions. |
| V3-3 Homepage trust additions | Implemented with V3-2 | #143 | Trust/navigation improvements without rebuilding Homepage V2. |
| V3-4 Student dossier service layer | Implemented | #144 | “À faire par vous” / “En cours chez AlmaGo”; clearer dossier state. |
| V3-5 Programme information quality | Implemented | #145 | Official-source visibility for students and completeness flag for admin. |
| V3-6 Programme comparison | Implemented | #146 | Compare up to 3 programmes; factual comparison only; no ranking or score. |
| V3-7 Country guidance | Implemented | #148 | Country-of-qualification gateway with official tools; no nationality shortcut. |
| V3-8 Understand the process | Implemented | #147 | Plain-language guidance for VPD, NC, HZB, Studienkolleg, TestAS, uni-assist, DoSV and translations. |
| V3-9 Help & support | Implemented | #149 / #152 | Public Help Center + direct student-space help entry; no fake support channel. |
| V3-10 Admin information quality | Implemented | #150 | Missing-source and missing-deadline indicators/filters. |
| V3-11 Multilingual quality | Architecture ready | #153 | FR ready; EN/DE/AR planned; no partial-language selector; RTL readiness for Arabic. |
| V3-12 Professional QA | Implemented | #151 | Automated public-language quality guard. |
| Public navigation hardening | Implemented | #155 | Cross-page-safe navigation and Help Center access. |
| Public discoverability | Implemented | #156 | Canonical URL, sitemap, robots, noindex private/auth surfaces. |
| Public trust destination | Implemented | #157 | Dedicated “Confiance et transparence” page. |
| Institutional About page | Implemented | #159 | Mission and service standards without invented staff, partners or marketing numbers. |
| Public breadcrumbs | Implemented | #160 | Accessible breadcrumb navigation on deep public guidance pages. |
| Student dossier history | Implemented | #161 | Real document-review and student-visible application events combined on “Mon dossier”. |
| Programme verification evidence | Implemented | #162 | Explicit source + human verification confirmation; real `verified_at` shown only when present. |
| University verification evidence | Implemented | #163 | Same explicit source/date discipline for university records. |
| Admin catalogue maintenance priority | Implemented | #165 | Catalogue quality becomes an operational queue after document/application priorities. |
| Admin quality deep links | Implemented | #166 | Admin overview opens the exact catalogue queue/filter that needs attention. |
| Student notification inbox | Implemented | #167 | Uses the existing `notifications` table; no new push/email engine. |
| Official sources reference | Implemented | #170 | Public institutional-source page; no affiliation/partnership implied. |
| Accessibility + professional 404 integration | Implemented; checks rerunning | #172 | Replays the useful public changes from #168/#169 onto the retained V3 chain. |

## Superseded V3 branches

The following PRs should not be treated as the retained implementation path:

- **#158** — older V3 status document branch. This document supersedes it.
- **#164** — earlier admin catalogue-quality overview. Its intent is covered more completely by **#165** and **#166**.
- **#168** — accessibility page on the #164 branch.
- **#169** — public 404 page on top of #168.

The public changes from #168/#169 are replayed on the retained chain in **#172**.

## Retained dependency chain

The complete retained V3 merge order is:

`#142 → #143 → #144 → #145 → #146 → #147 → #148 → #149 → #150 → #151 → #152 → #153 → #155 → #156 → #157 → #159 → #160 → #161 → #162 → #163 → #165 → #166 → #167 → #170 → #172 → #173`

All of these retained PRs were checked as mergeable on 24 September 2026.

After #163, the retained path is specifically:

`#163 → #165 → #166 → #167 → #170 → #172 → #173`

This avoids reintroducing #164 while preserving all later student/public improvements.

Because the PRs are stacked, merge them in dependency order and let each child PR rebase/update naturally against the merged parent. Do not merge superseded #164/#168/#169 into this path.

## Live operational snapshot

Read-only checks against the connected AlmaGo Supabase project on 24 September 2026 showed:

### Programmes
- **7 active programmes**
- **6 / 7** without an official source currently recorded
- **7 / 7** without a verification date currently recorded

### Universities
- **8 active universities**
- **8 / 8** without an official source currently recorded
- **8 / 8** without a verification date currently recorded

### Notifications
- **0 notifications** currently recorded at the time of the check

These are point-in-time operational counts and can change.

They are not filled automatically. Sources and verification dates require a real human verification action. The notification inbox remains empty until AlmaGo creates a real notification from an actual dossier event.

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
- no unverified legal identity;
- official institutions remain authoritative.

## Current operational principle

V3 adds professionalism without changing the original Master Plan completion rules.

The original Master Plan remains **41 / 45 complete** and still controls release readiness:

**A38 → A43 → A44 → A45**

V3 PRs should be reviewed/merged in dependency order because they are intentionally stacked.
