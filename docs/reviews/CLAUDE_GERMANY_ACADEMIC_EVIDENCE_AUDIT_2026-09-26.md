# LOT 4 evidence hardening — deep integration audit

- **Issue:** almago-platform/AlmaGo#247 (BLOCK CLAUDE C — LOT 4 evidence hardening)
- **Scope:** LOT 4.1 (`src/lib/academic-evidence.ts` assessment contract) + LOT 4.2
  (`supabase/migrations/0016_germany_academic_evidence_persistence.sql`) treated as one
  boundary.
- **Base HEAD audited:** `3d3e7ec4f3a8eed4d8551906ed830f0486a3ca3a`
- **Mode:** static source review + Node test harness only. No live Postgres instance was
  executed; every claim about trigger/RLS/lock behavior below is derived from reading the
  SQL and cross-referencing it with Postgres's documented locking/RLS semantics, not from
  running the migration against a database.

## H1 — Findings by audit topic

### 1. RLS / privilege assumptions — sound
- `academic_evidence` RLS: `"academic evidence own or admin read"` (select, own row or
  `is_admin()`) and `"academic evidence admin manage"` (`for all`, `using`/`with check`
  both `is_admin()`). No policy lets a student `insert`/`update`/`delete`, and the table
  grants (`revoke all ... ; grant select, insert, update, delete ... to authenticated`)
  rely entirely on RLS to keep students read-only — verified.
- `private.enforce_academic_evidence()` is `security invoker`, so its internal
  `select ... from public.documents` and `select ... from public.user_roles` run under the
  RLS of the calling (admin) role, not a superuser. Both reads succeed for a legitimate
  admin: `"documents student or admin read"` allows `is_admin()`, and
  `"roles own read or admin"` allows `user_id = auth.uid()` — which is exactly the row the
  trigger needs, since acceptance requires `new.verified_by = auth.uid()`. No RLS deadlock.
- `private.invalidate_academic_evidence_for_document()` is `security definer`, which is
  required: it must be able to write `academic_evidence` regardless of who issued the
  `documents` update (e.g. `admin_review_document`, itself `security definer`).

### 2. Same-student document linkage — sound
- `documents_id_student_unique` (unique on `(id, student_id)`) plus the composite FK
  `foreign key (document_id, student_id) references public.documents(id, student_id)`
  makes cross-student linkage a schema-level impossibility, not just an application check.
  Locked in by the existing + hardened `academic-evidence-persistence.test.mjs` tests.

### 3. `accepted_for_pathway` fail-closed invariants — sound, with one non-obvious
   consequence worth documenting
- All required fields (`origin='official_document'`, `document_id`, `institution`,
  `evidence_date`, `verified_by`, `verified_at`) are enforced together, and the linked
  document must be re-read and confirmed `status = 'approved'` at write time (not just
  trusted from the payload).
- **Consequence (intentional but subtle):** the trigger fires
  `before insert or update` on **every** column, not just on
  `verification_status` changes. Combined with
  `new.verified_by <> auth.uid()` in the prerequisite check, this means **any** edit to an
  already-`accepted_for_pathway` row (e.g. an admin fixing a typo in `institution`) is
  re-validated as if it were a fresh acceptance, and fails unless the editing admin is the
  same `auth.uid()` as `verified_by`. This is a legitimate fail-closed property, but it is
  easy to accidentally weaken (e.g. by someone "optimizing" the trigger to
  `before update of verification_status`) without realizing it removes re-verification on
  incidental edits. Locked in with a new regression test (H2) asserting the trigger is
  **not** scoped to specific columns.

### 4. Document status invalidation/delete behavior — sound, asymmetric by design
- On `update of status` (approved → non-approved), only rows currently
  `accepted_for_pathway` are downgraded (to `needs_review` or `replace_required`).
- On `delete`, **every** evidence row pointing at the deleted document is reset
  (`verification_status = 'needs_review'`, `document_id/verified_by/verified_at = null`),
  regardless of its current status. This is broader than the update branch. It is a sound,
  intentional asymmetry (a deleted document can no longer back *any* classification, not
  only an accepted one) but was previously untested — the update branch's filter could
  have silently regressed onto the delete branch (or vice versa) without a test noticing.
  Closed by a new regression test (H2).

### 5. Trigger ordering/recursion — sound
- `documents_invalidate_academic_evidence` (on `documents`) only ever writes to
  `academic_evidence`; `academic_evidence_enforce_contract` (on `academic_evidence`) only
  ever reads `documents`/`user_roles`. There is no cycle: the invalidation trigger's own
  `update public.academic_evidence` will re-enter `enforce_academic_evidence`, but since it
  always sets `verification_status` away from `accepted_for_pathway`, the expensive
  prerequisite branch is skipped and no second write to `documents` is triggered. No
  infinite recursion or dual-trigger ordering hazard was found.

### 6. Concurrency / race conditions — **confirmed bug (not fixed, per writable-paths
   restriction)**
- `enforce_academic_evidence()` locks the referenced document with
  `select ... for key share`. Per Postgres's row-lock compatibility matrix, `FOR KEY SHARE`
  does **not** conflict with the implicit `FOR NO KEY UPDATE` lock that a plain
  `UPDATE ... SET status = ...` acquires (only `FOR UPDATE` conflicts with `FOR KEY SHARE`).
  `documents.status` is a plain column, not part of any key, so `admin_review_document`'s
  `update public.documents set status = ...` is **not blocked** by a concurrent
  acceptance transaction holding `FOR KEY SHARE` on the same row.
- **Race:** Transaction A reads the document as `approved` (via `FOR KEY SHARE`) inside the
  acceptance trigger and is about to commit an `accepted_for_pathway` row. Concurrently,
  transaction B (`admin_review_document`) updates the same document's `status` to
  `rejected`/`replace_required` and commits. If B commits before A, B's invalidation
  trigger runs an `update ... where document_id = new.id and verification_status =
  'accepted_for_pathway'` that finds **no rows yet** (A hasn't committed/inserted them at
  that point in most interleavings), and A subsequently commits an `accepted_for_pathway`
  row that references a document that is, by then, no longer `approved`. The classification
  is left in a "confirmed pathway evidence" state pointing at a document AlmaGo just
  rejected, until another status transition (or none) happens to re-trigger invalidation.
- **Classification:** confirmed bug (TOCTOU on the acceptance boundary), not a hypothesis —
  it follows directly from Postgres's documented lock-mode compatibility table and the fact
  that `documents.status` carries no key semantics.
- **Smallest bounded fix (not applied in this block — production code is read-only here):**
  in `private.enforce_academic_evidence()`, change the lock from
  `for key share` to `for update` (or at minimum `for no key update`) when validating
  `accepted_for_pathway`. That upgrade makes the acceptance check block/serialize against
  any concurrent `documents.status` change on the same row (and vice versa), closing the
  race in both interleavings. This one-line lock-mode change is the entire fix; no other
  logic needs to move. Left undone here per the block's "do not edit production code"
  and writable-paths constraints — flagged for the supervisor to authorize as a follow-up
  task.
- Not testable from this harness: this requires two concurrent live Postgres transactions
  and cannot be represented as a static regex assertion, so no test was added for it (per
  the block's instruction not to claim live-Postgres behavior the harness cannot execute).

### 7. `verified_by` / `auth.uid()` assumptions — sound
- Acceptance requires `new.verified_by = auth.uid()` **and** that user holds `role = 'admin'`
  in `user_roles`. An admin cannot accept evidence on behalf of another admin's identity,
  and cannot forge `verified_by` to an arbitrary user id. Already covered by existing tests;
  no gap found beyond the "any-column re-validation" consequence documented in §3.

### 8. TS contract vs migration mismatch — **confirmed test gap, closed in H2**
- `academic-evidence-persistence.test.mjs` asserted the SQL contained specific literal
  strings, but those literals were hand-copied into the test file rather than sourced from
  `src/lib/academic-evidence.ts`. A future rename/addition to the TS enums (e.g. adding a
  new `AcademicEvidenceOrigin`) would **not** be caught by this test, because the test's
  expectations were independent of the TS source of truth. Closed by importing
  `academicEvidenceTypes`, `academicEvidenceOrigins`, and
  `academicEvidenceVerificationStatuses` directly from the TS module and asserting exact,
  order-sensitive parity with the SQL `check (... in (...))` constraints.

## H2 — Regression hardening applied

All additions are test-only, scoped to the writable paths, and lock in **confirmed**
invariants/gaps only (no speculative behavior asserted):

- `tests/academic-evidence-persistence.test.mjs`
  - Enum parity test importing the TS contract arrays and diffing them against the SQL
    `check` constraints for `evidence_type`, `origin`, `verification_status` (closes §8).
  - FK `on delete set null (document_id)` clause assertion (extends §2 coverage).
  - Admin-manage policy assertion strengthened to require `is_admin()` in **both**
    `using` and `with check` (previously only checked once).
  - New test: deleting a document resets **every** linked evidence row (not filtered to
    `accepted_for_pathway`), and explicitly asserts the delete branch has no
    `and verification_status` filter, so the asymmetry from §4 can't silently regress
    either way.
  - New test: the enforcement trigger is declared
    `before insert or update on public.academic_evidence` (no column list), locking in the
    any-column re-validation property from §3.
- `tests/academic-evidence.test.mjs`
  - New test: a logically inconsistent `accepted_for_pathway` record (missing
    `document_id`, or a non-`approved`/`null` `document_status`) still fails closed at the
    TS assessment layer, as defense-in-depth independent of the DB trigger.

No production code (`src/lib/academic-evidence.ts`,
`supabase/migrations/0016_germany_academic_evidence_persistence.sql`, or any other file
outside the block's writable paths) was modified.

## H3 — Final classification of every item

| # | Item | Classification |
|---|------|-----------------|
| 1 | RLS / privilege assumptions on `academic_evidence`, `documents`, `user_roles` | Sound invariant |
| 2 | Same-student document linkage (composite unique index + FK) | Sound invariant |
| 3 | `accepted_for_pathway` fail-closed prerequisites | Sound invariant |
| 3b | Any-column re-validation forcing re-verification by the *same* admin on any edit of an accepted row | Sound invariant (subtle; now regression-locked) |
| 4 | Document status downgrade → evidence invalidation (accepted-only scope) | Sound invariant |
| 4b | Document delete → evidence invalidation (unconditional scope, all statuses) | Sound invariant (asymmetric by design; now regression-locked) |
| 5 | Trigger ordering / recursion between `documents` and `academic_evidence` triggers | Sound invariant, no recursion hazard |
| 6 | Acceptance check uses `for key share`, which does not block a concurrent plain `status` update | **Confirmed bug** (TOCTOU race); smallest fix documented above, not applied (writable paths / "no production edits" constraint) |
| 7 | `verified_by = auth.uid()` + admin-role pairing | Sound invariant |
| 8 | TS enum contract vs SQL `check` constraints could silently drift | **Test gap** — closed in H2 |
| 9 | FK `on delete set null (document_id)` clause was asserted only implicitly | **Test gap** — closed in H2 |
| 10 | Delete-branch unconditional reset scope vs update-branch accepted-only scope | **Test gap** — closed in H2 |
| 11 | Admin-manage policy `with check` clause was not independently asserted | **Test gap** — closed in H2 |
| 12 | TS-layer defense-in-depth against a logically inconsistent accepted record | **Test gap** — closed in H2 |

No item required a "hypothesis — needs live Postgres to confirm" classification: every
finding in this audit could be conclusively confirmed or ruled out from static source
review plus Postgres's documented lock/RLS semantics, except item 6's live interleaving
timing, which is stated as a confirmed structural bug (the lock modes are documented to be
non-conflicting) rather than a hypothesis, even though no live transaction was executed.

## Stop condition

H1 (audit) + H2 (regression hardening) + H3 (classification) are complete. No production
code was edited. No merge was performed.
