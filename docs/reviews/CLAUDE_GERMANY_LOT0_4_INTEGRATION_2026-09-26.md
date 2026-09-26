# Claude / Supervisor review — Germany LOT 0–4 integration

**Date:** 2026-09-26  
**Base reviewed:** `18d5b306f1dde83438f20387e30c2ab7b565259a`  
**Scope:** LOT 0 through LOT 4 cross-layer invariants only.

## Purpose

This review protects the already-built Germany chain before the integration checkpoint. It does not add product behavior and it does not claim live Supabase/Postgres execution.

The executable regression file added by this block is:

- `tests/germany-lot0-4-integration.test.mjs`

## H1 — Integration invariant map

The current code supports the following bounded invariants:

1. A programme must remain active, have valid HTTP(S) source/application URLs, and carry non-future verification before it can pass the publication boundary into academic matching.
2. Missing deadline data remains unknown. The intake resolver can resolve the intake while preserving `deadline: null`, and academic matching escalates the missing deadline to manual review rather than fabricating a date.
3. Application workflow status is not academic evidence. An `admission` application state is a university-decision status, but accepted pathway evidence still requires a separate academic-evidence record.
4. Definitive-admission evidence supports a pathway only when the existing fail-closed prerequisites all pass: institution, valid non-future evidence date, official-document origin, linked approved document, explicit `accepted_for_pathway`, and valid dated Admin verification.
5. Conditional admission, Bewerberbestätigung, and admissible university correspondence remain `preparatory_academic_basis_candidate` evidence. Pending review does not become accepted proof.
6. Replacement-required or pending evidence remains non-supporting.
7. LOT 0–4 modules do not emit one of the four later regulatory route identifiers and do not state visa guarantees/probabilities.

## H2 — Executable regression coverage

The new Node regression file exercises real TypeScript behavior for:

- catalogue publication boundary → academic match exposure;
- intake/deadline preservation when deadline is unknown;
- application decision state vs academic-evidence separation;
- definitive-admission fail-closed prerequisites;
- preparatory evidence candidate behavior;
- pending/replacement evidence rejection;
- absence of automatic LOT 6 route or visa-guarantee output from LOT 0–4 source modules.

Static source reading is used only for the last invariant, because the absence of later LOT 6 route emission is a source-boundary property.

## H3 — Findings

### Confirmed bug

The previously documented academic-evidence concurrency race remains a confirmed production issue until the dedicated operational LOT 4 fix lands: the current evidence trigger/document-status locking can allow a TOCTOU window between evidence acceptance and document downgrade. This block intentionally does not edit production code.

### Regression gaps closed

- Cross-layer catalogue → matching publication boundary.
- Unknown deadline preservation across intake and matching.
- Explicit separation of application admission status from academic evidence.
- Cross-layer evidence fail-closed prerequisites.
- Guard that LOT 0–4 does not become the regulatory-path engine by accident.

### Sound invariants

The seven H1 invariants above are supported by the current TypeScript contracts and existing migration design, subject to the live-DB limitation below.

### Requires live DB / E2E confirmation

This block does **not** prove runtime PostgreSQL lock behavior, RLS enforcement under concurrent sessions, or trigger ordering. Those require a live Postgres/Supabase integration environment. The existing source-level persistence tests remain useful regression guards but are not a substitute for live concurrency tests.

## Integration recommendation

The LOT 0–4 chain is suitable for the next integration checkpoint once:

1. the LOT 3 reliability recovery is green;
2. the known academic-evidence TOCTOU issue is fixed in the dedicated LOT 4 operational block;
3. canonical CI runs the new regression file successfully.

No new regulatory or visa decision logic should be added inside LOT 0–4. That belongs to the deterministic LOT 6 engine.
