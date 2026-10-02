# AlmaGo Orientation Engine V4

Status: MVP foundation
Parent issue: #734

## 1. Current architecture audit

The current Orientation stack is already much stronger than a blank-slate chatbot implementation and should be reused.

### Student/profile data already available

The public orientation session currently captures:

- Bac status: obtained / preparing / no Bac;
- Bac year and Tunisian Bac track when relevant;
- general average;
- previous diploma;
- target degree;
- target field;
- engineering specialty;
- German and English level;
- intended teaching language;
- monthly budget range;
- up to three preferred cities.

Authenticated student profiles already store additional data such as nationality, current city, current studies, university semesters, language certificates and target intake.

### Existing deterministic logic

The repository already contains:

- DAAD/ZAB-backed academic-access rules in `verified-academic-options.ts`;
- profile-priority logic in `smart-orientation.ts`;
- qualification logic and human-review fallbacks;
- V3.6 universal guidance for Bac, no-Bac and Master starting points;
- safe fallbacks when an exact programme is not verified.

These remain authoritative. V4 does not ask an LLM to replace them.

### Existing catalogue and operational data

Supabase already contains:

- `universities` with type, city, official/source URL and verification date;
- `programs` with degree, field, teaching language, language requirements, Studienkolleg, uni-assist, deadlines, application URL, source URL and verification date;
- `program_recommendations`;
- `applications`;
- `documents`;
- `language_courses`;
- `finance_insurance_catalog`;
- `student_projects`;
- prospect/orientation history.

The programme catalogue is useful but not nationally exhaustive. V4 must therefore distinguish verified catalogue coverage from general Germany-wide availability.

### Existing AI infrastructure

The repository has Gemini/Groq integrations for engineering automation, but product runtime Orientation currently has no LLM provider abstraction. Runtime Orientation must not call those GitHub automation scripts directly.

## 2. V4 architecture

```
Student Profile
   ↓
Profile normalisation / validation
   ↓
Deterministic Rules Engine
   ↓
Verified catalogue filtering
   ↓
Programme Evaluations
   ↓
Transparent ranking (relevance only, never admission probability)
   ↓
Structured Orientation Result
   ↓
Advisor layer
   ├─ deterministic formatter (default / zero LLM cost)
   └─ optional LLM provider later
   ↓
Student UI / conversation / PDF summary
```

The LLM never receives raw admission authority.

## 3. Core status model

Rule/programme statuses:

- `eligible`: all required conditions represented in the engine are known and satisfied;
- `likely_eligible`: strong compatibility, but not all final admission conditions are represented;
- `conditional`: relevant, but at least one known condition is not yet satisfied;
- `missing_information`: the student profile is missing information necessary for a decision;
- `not_eligible`: a known deterministic condition fails;
- `unknown`: catalogue/rule data are insufficient.

Unknown is never converted to eligible.

## 4. Source and confidence model

Every important catalogue fact can carry:

- source kind;
- source label;
- URL;
- verified-at date.

Information confidence is derived from evidence quality:

- `high`: official source URL plus verification date and sufficient structured fields;
- `medium`: official/source URL exists, but one or more important structured facts are incomplete;
- `incomplete`: important facts or traceability are missing.

This is data confidence, not model confidence and not admission probability.

## 5. Transparent relevance ranking

V4 uses ranking only to choose which compatible options to show first.

Current MVP weights:

- degree match: +40;
- field/specialty match: +30;
- known language condition already satisfied: +15;
- preferred city match: +10;
- source with verification date: +5.

The score is not displayed as an admission chance and must never be described as one.

A programme with a deterministic `not_eligible` result is excluded even if its relevance score would otherwise be high.

## 6. Advisor separation

The Advisor receives only:

- a minimised structured profile;
- deterministic rule outcomes;
- up to three already-selected programme evaluations;
- missing information;
- action-plan items.

It may:

- explain;
- simplify;
- compare;
- ask for missing information;
- summarise changes after a preference update.

It may not:

- change a deterministic rule status;
- add a programme not supplied by the engine;
- invent a source, price, deadline, language requirement or diploma equivalence.

The default V4 foundation is deterministic, so it costs zero LLM tokens. An optional runtime provider will be added behind the same interface.

## 7. Privacy / GDPR strategy

Do not send to an LLM unless needed:

- name;
- email;
- phone;
- home address;
- passport number;
- uploaded documents;
- raw document contents.

Use a pseudonymous/minimised orientation context containing only academic and preference fields needed for the current reasoning task.

Provider prompts/logs must not contain secrets or privileged Supabase credentials.

Before enabling a runtime LLM provider, define:

- explicit feature flag;
- data-retention policy;
- provider DPA/legal review;
- consent/notice where required;
- log redaction;
- deletion path.

## 8. Cost strategy

Deterministic tasks remain free of LLM calls:

- deadlines already stored;
- language-level comparison;
- city/degree/field filtering;
- rule evaluation;
- missing document detection;
- ranking;
- action-plan state transitions.

LLM calls should be reserved for natural-language explanation or conversation turns where language understanding materially helps.

Recommended runtime policy:

1. deterministic engine on every profile change;
2. cached structured engine result;
3. no LLM call for simple filter/profile updates;
4. small/cheap model for explanation when enabled;
5. stronger model only for explicitly escalated complex cases;
6. token/cost counters per orientation session;
7. hard per-session budget.

## 9. UX

The primary result should be scannable:

- what we know;
- what is still unknown;
- up to three relevant verified options;
- why each option appears;
- what condition is still missing;
- source and verification date;
- next actions.

Do not present the engine as a final decision-maker.

Preferred wording:

> This option matches several criteria you selected.

Avoid:

> You must choose this university.

## 10. Incremental implementation plan

### Increment A — foundation (this PR)

- V4 types;
- deterministic programme rules;
- source/confidence handling;
- transparent ranking;
- action-plan generation;
- server catalogue adapter using existing Supabase tables;
- public read-only Orientation Engine API;
- student-facing recommendation card;
- Advisor provider interface with deterministic default;
- tests.

### Increment B — richer profile

Add structured fields missing from the public form:

- diploma country/type;
- previous university studies and credits;
- language certificates and planned exams;
- target intake/departure;
- public/private and university/FH preferences;
- Studienkolleg willingness;
- geographic mobility;
- visa state;
- document state.

### Increment C — conversation

Conversation updates profile patches, never programme facts.

Example:

`"Je préfère NRW" → { preferredRegions: ["NRW"] } → rerun engine`

The engine recalculates before the Advisor explains the change.

### Increment D — optional runtime LLM

Add server-only provider implementation, schema validation, timeout, retry, rate limit, cache and cost telemetry.

### Increment E — verified data breadth

Expand official programme/source ingestion, ideally with an authorised Hochschulkompass/HRK data route when available.

## 11. Main files involved

Existing:

- `src/lib/orientation/public.ts`
- `src/lib/orientation/verified-academic-options.ts`
- `src/lib/orientation/universal-guidance.ts`
- `src/lib/orientation/diagnostic.ts`
- `src/lib/phase2/qualification.ts`
- `src/lib/phase2/smart-orientation.ts`
- `src/components/orientation/PublicOrientationForm.tsx`
- `src/components/orientation/OrientationRouteCard.tsx`
- `src/components/orientation/OrientationOnePagePrintReport.tsx`
- Supabase `profiles`, `programs`, `universities`, `documents`, `applications`, `program_recommendations`.

New V4 area:

- `src/lib/orientation-engine/*`
- `src/app/api/orientation/engine/route.ts`
- `src/components/orientation/PersonalizedOrientationEngineCard.tsx`

## 12. Risks / uncertainty

- current programme catalogue is not comprehensive;
- current public profile does not yet capture country-specific diploma metadata or target intake;
- city budget compatibility cannot be claimed until verified cost data exist;
- a programme source may be official while a particular structured field is still missing;
- deadlines are time-sensitive and require freshness handling;
- Master compatibility usually depends on curricular prerequisites that are not yet fully structured;
- no-Bac and unusual qualifications require human review unless an official rule is explicitly encoded;
- LLM runtime legal/privacy review remains a launch gate before sending personal orientation context to a provider.


## 13. Increment B/C — refinement + intake/deadlines

This increment deliberately stays deterministic and does not enable a runtime LLM.

### Structured intake added to the public Orientation profile

The public Orientation answer object now carries:

- `targetIntakeSeason`: `winter` or `summer`;
- `targetIntakeYear`: explicit calendar year.

Both fields are optional together. A partially filled intake is rejected by server validation.

This is stored inside the existing orientation JSON input, so no database migration is required.

### Missing-information engine

The engine now derives a structured refinement state:

- all currently useful missing profile facts;
- why each fact matters;
- which evaluated programme records could change;
- exactly one `nextQuestion`.

Current deterministic priority:

1. previous university qualification for Master projects;
2. engineering specialty when the student explicitly selected “undecided”;
3. target intake when programme timing data exist;
4. teaching-language preference when still undefined;
5. preferred city when several verified cities remain.

Budget is intentionally not asked by this refinement layer yet because the current Orientation Engine has no verified city-cost compatibility dataset. Asking it would create questionnaire friction without changing a verified recommendation.

### One-question recalculation loop

The student-facing V4 card can answer the single current question.

The answer patches the same `PublicOrientationAnswers` state already used by the Orientation flow. The existing deterministic engine API is then called again with that updated profile.

There is no independent chatbot state and no separate AI-owned profile.

### Intake and deadline model

Programme timing now uses existing Supabase fields:

- `intake_terms`;
- `winter_deadline`;
- `summer_deadline`;
- programme source URL;
- programme `verified_at`.

No date is generated when the catalogue does not contain one.

Possible deterministic rule outcomes now include:

- `intake_match`;
- `intake_unavailable`;
- `intake_unknown`;
- `deadline_open`;
- `deadline_closed`;
- `deadline_to_verify`;
- `deadline_unknown`.

A closed verified deadline or an unavailable intake can exclude that programme for the selected project.

A stored deadline is only called open/closed when:

- the date is structurally valid;
- its source and verification date are valid;
- the stored date can be aligned to the selected target cycle.

If a stored date belongs to a different target year, the engine returns `deadline_to_verify` instead of reusing or shifting the date.

For summer semester alignment, a late-year deadline can correspond to the following calendar year's summer semester. This is only a cycle-alignment rule for an already stored date; it does not create an institutional deadline.

### UX behavior

The V4 card now shows:

- the target intake once known;
- why a programme appears;
- what still needs verification;
- a verified stored deadline when safely usable;
- all surfaced sources rather than only the first source;
- one next refinement question.

The print/PDF component remains separate and unchanged by this increment.

### LLM boundary remains unchanged

The Rules Engine, refinement choice and deadline status remain deterministic and cost zero LLM tokens.

A future runtime Advisor provider may explain the structured result, but it must not alter:

- the selected next missing field;
- intake availability;
- deadline state;
- eligibility state;
- official-source values.

The deterministic Advisor fallback remains the default.
