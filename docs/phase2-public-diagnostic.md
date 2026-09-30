# Phase 2 — Public orientation diagnostic

Issue: #590  
Parent: #574

## Boundary

The public diagnostic is a deterministic pre-dossier helper. It does not decide admission, visa eligibility or official academic access.

Input is only the browser-side P2.1 questionnaire. No database, account or network lookup is used in P2.2.

## Why the existing engines are not called directly yet

The existing engines were inspected before implementation:

- `regulatory-path-engine.ts` needs accepted admission/preparatory evidence and other dossier facts that an anonymous visitor does not have.
- `academic-match.ts` compares a student project with a concrete programme that has source URLs, verification dates and structured requirements.
- `master-requirements.ts` is intentionally source-evidence-driven and should not be fed guessed requirements.
- `student/project.ts` validates the authenticated dossier project shape, which is broader than the public questionnaire.

Calling these engines with invented facts would make the public result look more certain than the evidence supports. P2.2 therefore adds a narrower pure engine. Later LOTs can map the public answers into the authenticated project and use the existing verified programme engines.

## Output contract

Statuses:

- `explore`: a route worth exploring;
- `needs_information`: the visitor needs to add a key fact;
- `needs_verification`: the answer depends on a programme/source;
- `known_gap`: the visitor has explicitly declared something still in progress.

The engine returns:

- one headline code;
- at most three path codes;
- priority codes;
- verification codes;
- rule trace IDs for tests/debugging.

Copy is kept outside the engine in `orientation-diagnostic-copy.ts`.

## Safety

The engine never returns:

- admission probability;
- acceptance score;
- guaranteed eligibility;
- a university decision;
- a visa decision;
- fabricated programme requirements.

Precise programme matching remains a source-backed later step.
