# Claude Deep Engineering Audit — Germany Application Workflow (PRs #227–#233)

- Agent profile: `almago-claude-engineering`
- Task contract: issue #227-#233 review requested in #237
- Scope: review-only, no reviewed branch modified, no merge performed
- Review targets: #227, #228, #229, #230, #231, #232, #233 (stacked, none merged to `main` at review time)

## Method

Each PR's diff and full changed-file contents were read directly from GitHub (not from a local
checkout, since none of these branches are merged to `main`). The stacked chain was reviewed both
PR-by-PR and as an integrated whole, tracing every business rule that is implemented more than
once across layers (TypeScript preflight, React UI, Postgres RLS/trigger).

## Summary of findings

| # | Kind | Severity | One-line summary |
|---|------|----------|-------------------|
| 1 | Confirmed bug | Medium | Metadata-only admin update path (#228) is not covered by the DB error-mapping added in #232, so clearing a decision note on an `admission`/`rejection` application returns a raw 500 instead of the intended 400 |
| 2 | Confirmed bug | Medium | The TypeScript intake-family classifier (#229) and the SQL intake-family classifier (#232) disagree on which raw `intake_terms` strings mean "winter"/"summer", so some intakes accepted by the Student preflight are rejected by RLS with an opaque error |
| 3 | Test gap | Low | Duplicate `applicationStatusLabels` dictionaries (`src/lib/phase4.ts` vs `src/lib/application-workflow.ts`) have no equivalence test, unlike `applicationStatuses`/`isActiveApplication` |
| 4 | Sound invariant | — | The canonical transition graph is identical, byte-for-byte in structure, between the TypeScript contract (#227) and the SQL trigger (#232) |
| 5 | Sound invariant | — | DB-level `FOR UPDATE` locking + trigger re-evaluation of `old.status` closes the TOCTOU gap intentionally left open by the API-only preflight in #228 |
| 6 | Hypothesis / minor | Low | `assessAcademicEvidence` (#233) compares "is evidence date in the future" using a UTC day boundary while the rest of the Germany chain (#229, #232) uses an Europe/Berlin day boundary for deadlines |

---

## Finding 1 — Confirmed bug: decision-note trigger error is not translated on the metadata-only path

**Expected invariant:** Every Admin-facing failure caused by the DB layer's business rules
(`application_no_status_change`, `application_transition_not_allowed`,
`application_decision_note_required`, `application_not_found`) should be translated by
`src/app/api/admin/applications/[id]/status/route.ts` into the same clear, actionable HTTP
response, regardless of which code path triggered the underlying `UPDATE`.

**Reproducible scenario:**
1. An application is already in status `admission` (or `rejection`) with a non-empty
   `student_notes` (satisfies the DB invariant added in #232).
2. An Admin opens the same application in `AdminApplicationsPanel` and clears the note field only,
   leaving `edit.status === application.status` (no status change requested).
3. `needsDecisionNote` in the panel is computed as
   `["admission","rejection"].includes(edit.status) && edit.status !== application.status && !edit.note.trim()`
   — since `edit.status === application.status`, this guard is `false`, so the Save button stays
   enabled and no client-side warning appears.
4. The request reaches the `!statusChanged` branch of `route.ts` (added in #228) and calls
   `supabase.from("applications").update({ next_action, student_notes: null, reviewed_at })`
   directly — **not** through the `admin_update_application` RPC.
5. The BEFORE UPDATE OF `status, student_notes, submitted_at` trigger
   (`private.enforce_application_status_transition`, added in #232) still fires because
   `student_notes` is part of the `SET` list. It evaluates
   `new.status::text in ('admission','rejection') and nullif(btrim(new.student_notes), '') is null`
   → true, and raises `application_decision_note_required`.
6. `route.ts`'s `!statusChanged` branch only has this generic handler:
   ```
   if (updateError) {
     return NextResponse.json({ error: "Impossible de mettre à jour le suivi de la candidature." }, { status: 500 });
   }
   ```
   The Admin sees a generic 500 "impossible de mettre à jour" instead of the specific 400 message
   ("Ajoutez une note visible indiquant la décision communiquée par l'université.") that #232 wired
   up for the transition path just a few lines below in the same file.

**Root cause:** #232's error-code translation (`application_no_status_change`,
`application_transition_not_allowed`, `application_decision_note_required`,
`application_not_found` → clean 4xx responses) was added only to the `if (error)` block that
follows the `admin_update_application` RPC call. The `!statusChanged` metadata-only branch — added
earlier in #228, before the trigger existed — still uses its original, generic 500 handler and was
never revisited once the trigger could reject that same `UPDATE`.

**Confirmed bug**, not a hypothesis: the code paths are unambiguous and the DB trigger unconditionally
applies to any UPDATE touching `student_notes`, independent of whether `status` also changes.

**Smallest safe fix:** extract the existing error-message mapping (`application_no_status_change` →
409, `application_transition_not_allowed` → 409, `application_decision_note_required` → 400,
`application_not_found` → 404, fallback → 500) into a small shared helper, and call it from both the
`!statusChanged` update's `updateError` handling and the post-RPC `error` handling.

**Smallest regression test:** a static test (matching the existing style in
`tests/application-transition-preflight.test.mjs`, which asserts on `route.ts` source via regex)
asserting that the same `application_decision_note_required` (and the other three) message tokens
are matched/handled in **both** the metadata-only branch and the RPC branch of `route.ts` — e.g.
assert there is exactly one shared error-mapping function referenced from both branches, or that the
metadata branch's error handling also contains the `application_decision_note_required` token.

---

## Finding 2 — Confirmed bug: TS/SQL intake-family classifiers disagree on real-world formats

**Expected invariant:** the intake "winter"/"summer" family classification used to pick a deadline
and validate an application must be a single source of truth. Anything the Student route (#229)
resolves and is willing to insert should be accepted by the RLS policy that re-validates the same
insert (#232) — the RLS layer is meant to be a stricter *re-check* of the same rule, not a
*different* rule.

**Evidence — two independent, divergent implementations of the same predicate:**

- TypeScript, `src/lib/application-intake.ts` (`applicationIntakeFamily`, #229):
  ```ts
  const normalized = (value) => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  // ...
  if (text.includes("winter") || text.includes("hiver") || /(^|\s)ws(\s|$)/.test(text)) return "winter";
  if (text.includes("summer") || text.includes("sommer") || text.includes("ete") || /(^|\s)ss(\s|$)/.test(text)) return "summer";
  ```
  This strips diacritics and matches `ws`/`ss` as a *token* anywhere in the string (word-boundary
  regex), so `"WS 2027"`, `"Programme WS"`, and `"Ete 2027"` (no accent) all classify correctly.

- SQL, `supabase/migrations/0015_germany_application_workflow_hardening.sql`
  (`private.application_intake_family`, #232):
  ```sql
  when lower(value) like '%winter%' or lower(value) like '%hiver%' or lower(btrim(value)) = 'ws' then 'winter'
  when lower(value) like '%summer%' or lower(value) like '%sommer%' or lower(value) like '%été%' or lower(btrim(value)) = 'ss' then 'summer'
  ```
  This requires `ws`/`ss` to be the **entire trimmed string** (strict equality, not substring/token
  match), and matches `été` only with the accent present (no diacritic normalization).

**Reproducible scenario:**
1. A program's `intake_terms` contains `"WS 2027"` (a realistic, structured value —
   consistent with how deadlines are named, e.g. `winter_deadline`).
2. Student route (#229) via `resolveApplicationIntake` classifies `"WS 2027"` as `family: "winter"`,
   finds `winter_deadline` non-null and not passed, returns `status: "resolved"` and the API inserts
   `applications.intake = "WS 2027"`.
3. The INSERT reaches the RLS policy from #232, which computes
   `private.application_intake_family(applications.intake)` on the same string `"WS 2027"`. Because
   the SQL function requires an exact `"ws"` match after trimming, it returns `NULL`. The policy
   clause `private.application_intake_family(applications.intake) is not null` fails, and the
   `WITH CHECK` fails.
4. The student never sees the friendly `application_deadline_passed` / `intake_confirmation_required`
   messages from the Student route — they see a generic Postgres RLS violation, since the Student
   route's own preflight considered this input entirely valid.

The same divergence applies to `"Ete 2027"` (French for "summer" without the accent): accepted as
`"summer"` by the TS classifier, rejected (`NULL` family) by the SQL classifier because of the
literal `'%été%'` pattern with no diacritic folding.

**Confirmed bug**, not a hypothesis: both functions were read directly, and the divergent behavior
follows deterministically from the literal patterns shown above — this is not merely a hypothetical
edge case, it is the direct, mechanical consequence of two independently-written implementations of
the same predicate.

**Root cause:** LOT 3.3A (#229) and LOT 3.2B/3.3B (#232) each re-implement
`applicationIntakeFamily`/`application_intake_family` from scratch instead of sharing one contract
(e.g. generating the SQL `CASE` from the same list of patterns, or having the SQL function only
special-case what the TS module already validated). This is a general pattern worth flagging:
**every rule duplicated across TypeScript and SQL in this chain is a latent drift risk** (see also
the deadline day-boundary comparison, which is duplicated but currently consistent — see Finding 6).

**Smallest safe fix:** align the SQL function to also match `ws`/`ss` as a token (not exact-equality)
and to strip diacritics before comparing (e.g. using `unaccent()` if the extension is available, or
an explicit `translate()` fallback), so it matches the TS module's substring/diacritic-insensitive
semantics exactly. Do not attempt to loosen the TS module instead — the DB layer should mirror the
already-tested preflight, not the other way around, since the preflight is closer to the actual data
being seen by the Student route.

**Smallest regression test:** add a static assertion (in the style of
`tests/application-database-hardening.test.mjs`) enumerating the same fixture terms used in
`tests/application-intake.test.mjs` (`"WS"`, `"Wintersemester"`, `"Hiver 2027"`, `"Sommersemester"`,
`"Été 2027"`, `"SS"`) and asserting the migration's SQL source contains matching patterns for each —
or, better, a small integration test that runs both classifiers (TS directly, SQL via a local
Postgres/pglite instance if one becomes available) against a shared fixture list and asserts
identical output. Given the current test harness has no live Postgres execution (see "Test
infrastructure" below), a source-pattern assertion is the smallest safe addition today.

---

## Finding 3 — Test gap: duplicate status-label dictionaries have no equivalence test

**Observation:** `src/lib/phase4.ts` (already on `main`) and `src/lib/application-workflow.ts`
(#227) both define a full `applicationStatusLabels: Record<string, string>` covering the same nine
canonical + five historical statuses. `#227`'s own test file
(`tests/application-workflow.test.mjs`) explicitly guards against drift for `applicationStatuses`
(array equality) and `isActiveApplication` (behavioral equality across every status), but does
**not** assert anything about label-string parity between the two modules.

`AdminApplicationsPanel.tsx` (per the diff in #228) continues to import `applicationStatusLabels`
from `@/lib/phase4` for rendering the status `<select>` options, while
`StudentApplicationsPanel.tsx` (#230) switches to `application-workflow`'s
`studentApplicationStatusLabel` (a different, Student-specific dictionary) — so there are, in total,
three label dictionaries for the same nine statuses (`phase4.applicationStatusLabels`,
`application-workflow.applicationStatusLabels`, `application-workflow.studentApplicationStatusLabels`),
with only the first two currently identical in content by inspection.

**This is not currently a confirmed bug** — the two general-purpose dictionaries currently hold
identical French strings for every key I compared them on. It is a **test gap**: a future edit to
either `phase4.applicationStatusLabels` or `application-workflow.applicationStatusLabels` (e.g. a
copy fix requested only for the Admin surface) would silently desynchronize Admin vs. any other
consumer of the other dictionary, and nothing in the test suite would fail.

**Smallest regression test:** extend the existing "stays aligned with phase4" test block in
`tests/application-workflow.test.mjs` to also assert
`assert.deepEqual(applicationStatusLabels, phase4ApplicationStatusLabels)` for every shared key, the
same way the array/behavioral checks are already done for `applicationStatuses` and
`isActiveApplication`.

---

## Finding 4 — Sound invariant: canonical transition graph is identical in TS and SQL

Explicitly confirmed as sound: `transitions` in `src/lib/application-workflow.ts` (#227) and the
`case` expression in `private.application_transition_allowed` (#232) enumerate exactly the same
edges for every one of the six non-terminal statuses (`interested`, `preparing`,
`documents_missing`, `ready_to_submit`, `submitted`, `waiting_university`), and the same
historical→canonical remapping (`draft→interested`, `planned→preparing`, `in_review→waiting_university`,
`accepted→admission`, `rejected→rejection`) is used on both sides before the graph lookup. Unlike
the intake-family classifiers (Finding 2), this rule was kept in sync across the stack.

## Finding 5 — Sound invariant: DB-level locking closes the API preflight's own admitted gap

#228's PR description explicitly states "cette PR est une défense applicative, pas encore
l'autorité transactionnelle finale." Reviewing #232's `admin_update_application` confirms this gap
is closed correctly: the RPC does `select * from public.applications where id = target_application_id for update`
before evaluating `application_no_status_change`, and the `UPDATE` that follows re-triggers
`private.enforce_application_status_transition`, which re-evaluates `old.status` from the *actual*,
lock-serialized row — not from whatever the API's earlier `SELECT` (used only to produce a friendly
error message) observed. Two concurrent Admin requests against the same application cannot both
succeed in applying an invalid transition; the second one is correctly rejected by the trigger using
the post-lock row state, and the route maps that rejection to a 409 via the mapping described in
Finding 1 (for the RPC path only).

## Finding 6 — Hypothesis / minor: mixed UTC vs Europe/Berlin day boundaries for "future date" checks

`assessAcademicEvidence` (#233, `src/lib/academic-evidence.ts`) rejects an `evidence_date` that is
"in the future" using:
```ts
evidence.evidence_date > now.toISOString().slice(0, 10)
```
i.e. a UTC calendar day. Elsewhere in the same chain, `resolveApplicationIntake` (#229) and the RLS
policy (#232) both compare deadlines using an explicit Europe/Berlin calendar day
(`Intl.DateTimeFormat(..., { timeZone: "Europe/Berlin" })` in TS, `timezone('Europe/Berlin', now())::date`
in SQL). Since Berlin is UTC+1/UTC+2, there is a window near midnight (Berlin time) where a date that
is "today" in Berlin is still "yesterday" in UTC or vice versa, so `assessAcademicEvidence` could
classify an evidence date as valid/invalid one day differently than the rest of the Germany chain
would if the same rule were applied. This is a **hypothesis**, not a confirmed bug: I did not find a
concrete scenario where this crosses into an unsafe decision (`accepted` when it should not be), only
a minor inconsistency in "which calendar" is authoritative for "future" checks. No regression test
exists for this specific boundary in `tests/academic-evidence.test.mjs`; if evidence dates are ever
sourced from Admin input near midnight, adding a Europe/Berlin day boundary (matching the rest of the
chain) would remove the inconsistency without changing any currently-tested behavior.

---

## Test infrastructure note (context, not a finding)

All tests introduced across #227–#233 (`tests/application-workflow.test.mjs`,
`tests/application-transition-preflight.test.mjs`, `tests/application-intake.test.mjs`,
`tests/admin-application-observability.test.mjs`, `tests/application-database-hardening.test.mjs`,
`tests/academic-evidence.test.mjs`) run under Node's built-in test runner
(`node --experimental-strip-types --test`, per `package.json`). The SQL-touching tests
(`application-database-hardening.test.mjs`) only assert on the **migration's source text** via
regex — there is no live Postgres/pglite execution in this repository's test suite. This is the
structural reason Finding 2 (TS/SQL classifier drift) is invisible to CI today: nothing in the
suite ever executes the SQL function's actual logic, only its presence in the source.

## Explicitly out of scope for this review

Per the task contract, no production code, Supabase migrations, RLS/Auth policies, or GitHub
Actions were modified. No PR under review (#227–#233) was modified. Nothing was merged.
