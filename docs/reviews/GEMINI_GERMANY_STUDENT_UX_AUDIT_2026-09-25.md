# [GEMINI] Germany student matching UX audit — PR #225

- Reviewed PR: `almago-platform/AlmaGo#225`
- Reviewed HEAD: `b1396d151824521824d0469109938c4f87ca6491`
- Scope: student-facing Master matching presentation (clarity, accessibility semantics, responsive/i18n/copy, loading/error/empty states)

## Reviewed implementation surfaces

- `src/app/student/orientation/page.tsx`
- `src/components/student/StudentOrientationPanel.tsx`

## Confirmed issues (user-impacting)

1. **Per-program “unknown/unavailable comparison” state is not shown when verified profile data is missing.**
   - Evidence: `page.tsx` sets `requirement_match: null` when `readMasterRequirementProfile(program.requirements)` returns no profile, and `StudentOrientationPanel` only renders the comparison block through `<RequirementAssessment ... />` when a match object exists.
   - UX impact: for affected programs, students see no comparison section at all, which can be read as “nothing to compare” rather than “verified criteria unavailable/unknown.” This weakens the explicit communication of unknown/unverified information.

2. **Some criterion labels expose internal tokens instead of student-friendly wording.**
   - Evidence: in `StudentOrientationPanel.tsx`, `criterionLabel()` maps `language:*` and `subject_credits:*` by slicing raw suffixes directly (e.g., `Langue · de`, `Crédits · math`).
   - UX/i18n impact: raw codes/keys can be unclear to students and are not reliably localized, creating multilingual clarity risk.

## Suggestions (non-blocking)

1. **Accessibility semantics:** render criteria as a semantic list (`<ul><li>`) inside `RequirementAssessment` so screen-reader users can navigate criterion-by-criterion more predictably.
2. **Keyboard/focus feedback:** after "Cette piste m’intéresse" succeeds/fails, move focus to the feedback region (or make it focusable and programmatically focus it) to improve non-visual confirmation.
3. **Loading-state clarity:** add an explicit lightweight loading state for the comparison subsection to avoid abrupt state changes on slow networks.
4. **Copy consistency:** standardize terminology between summary labels ("À comparer", "À décider") and per-card actions to reduce interpretation ambiguity.

## Loading / error / empty-state check

- Global unavailable state exists (`OrientationUnavailable`) and is explicit.
- Empty state exists and is actionable.
- Application-state error and criteria-state error banners exist and preserve visibility of recommendations.
- Gap noted above: no **per-card** fallback when comparison cannot be computed for a specific program.

## Overclaiming / verified-vs-unknown communication check

- Positive: copy repeatedly avoids admission guarantees and distinguishes recommendation vs decision.
- Risk: when comparison data is absent per program, the UI currently hides the comparison block rather than explicitly marking that program as "comparison unavailable/unknown".

## Safe next changes (no implementation in this audit)

- `src/app/student/orientation/page.tsx`
  - Pass an explicit per-program comparison availability flag/reason when profile parsing fails.
- `src/components/student/StudentOrientationPanel.tsx`
  - Render a per-card fallback state when comparison is unavailable.
  - Replace raw token suffix labels with normalized, localized display labels.
  - Improve criteria container semantics (`ul/li`) and post-action focus handling.
- `tests/student-orientation-master-match-ui.test.mjs`
  - Add/adjust assertions for the explicit per-card unavailable state and normalized criterion labels.
