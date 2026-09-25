# GEMINI audit — Germany student matching UX (PR #225)

- Target PR: `almago-platform/AlmaGo#225`
- Reviewed head: `b1396d151824521824d0469109938c4f87ca6491`
- Scope: student-facing Master matching presentation only

## Surfaces reviewed

- `src/app/student/orientation/page.tsx` (`StudentOrientationPage`)
- `src/components/student/StudentOrientationPanel.tsx` (`RequirementAssessment`, criterion labels/statuses, error banners)
- `src/lib/master-requirements.ts` (status generation semantics used by UI)

## Confirmed user-impacting issues

1. **Unknown application route is not communicated to students**
   - Evidence: `RequirementAssessment` renders route only when `match.application_route !== "unknown"`.
   - File/component: `src/components/student/StudentOrientationPanel.tsx` (`RequirementAssessment`).
   - Impact: when route is unverified/unknown, students get no route block at all, which hides uncertainty instead of explicitly communicating it.

2. **Raw language/subject tokens can leak into student copy**
   - Evidence: `criterionLabel()` prints suffixes from keys (`language:*`, `subject_credits:*`) directly.
   - File/component: `src/components/student/StudentOrientationPanel.tsx` (`criterionLabel`).
   - Impact: multilingual consistency risk (mixed casing/technical wording), and potentially unclear labels for non-technical students.

## Suggestions (non-blocking)

1. **A11y semantics for criterion groups**
   - Current criterion rows are visual cards in plain `div`s.
   - Consider a semantic list (`ul/li`) for better screen-reader navigation in long result sets.
   - File/component: `src/components/student/StudentOrientationPanel.tsx` (`RequirementAssessment`).

2. **Clarify irreversible deadline state**
   - Deadline uses `not_satisfied` + warning tone; this shares visual logic with “À compléter”.
   - Consider distinct explanatory copy for expired deadline to reduce false hope.
   - Files/components: `src/lib/master-requirements.ts` (`deadline` matching), `src/components/student/StudentOrientationPanel.tsx` (`criterionStatusLabel`, `criterionExplanation`).

3. **Project-unavailable messaging could be even more explicit**
   - `criteriaStateError` correctly keeps programs visible and states comparison unavailability.
   - Consider adding a short “what to do next” CTA (e.g., profile completion link) in same banner.
   - File/component: `src/components/student/StudentOrientationPanel.tsx` (`criteriaStateError` alert block).

## What is working well

- Match states are mapped to human labels without admission overclaim (`Critère rempli`, `À compléter`, `Information manquante`, `À vérifier`).
- Explicit non-admission disclaimer is present in both card warning and comparison intro.
- Personalized comparison gracefully degrades when project read fails (`criteriaStateError`) while keeping recommendations visible.

## Safe next changes (no production edits in this audit)

1. `src/components/student/StudentOrientationPanel.tsx`
   - Always render application route line; show explicit unknown label when route is `unknown`.
   - Normalize `criterionLabel` display values for language/subject (student-friendly formatting).
   - Optionally switch criteria container to semantic list markup.

2. `src/lib/master-requirements.ts`
   - Keep matching logic unchanged; only adjust user-facing explanation text where needed (deadline clarity).
