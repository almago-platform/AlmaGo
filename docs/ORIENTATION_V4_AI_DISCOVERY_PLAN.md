# Orientation V4 — AI University Discovery & Personalized Writer Plan

Status: **validated product/architecture plan**  
Date: **2026-10-02**  
Base: `main@d4cb68ba80843bb3dc906fef922e124389e0f9b6`  
Master tracking issue: **#734**

## 1. Product decision

AlmaGo must not hand-write one orientation letter for every possible student profile.

Target architecture:

```text
Student profile
  -> A1. Discovery Contract
  -> A2. OpenAI Research Agent
  -> A3. Programme Knowledge Base & Discovery Cache
  -> B. Verification Engine
  -> C. Selection Engine
  -> D. Gemini Personalized Writer
  -> E. AlmaGo result UI
  -> F. Campus Allemagne human validation
```

Responsibilities:

- **OpenAI / research layer** discovers relevant university programmes and official pages.
- **AlmaGo deterministic layer** owns rules, verification status, filtering, ranking, caching and provider-independent facts.
- **Gemini** writes the human, simple, marketing-oriented personalized orientation from facts supplied by AlmaGo.
- **Campus Allemagne counselor** validates the final shortlist and works with the student.

No AI provider may invent admission rules, deadlines, diploma compatibility, language requirements, fees, or guarantees.

## 2. A — University Discovery Agent V1

### Goal

Given a normalized student profile, find a useful pool of real German university programmes that deserve verification.

A answers:

> Which German university programmes are worth investigating for this specific student?

A does **not** decide that the student will be admitted and does **not** produce the final 3–4 recommendations.

### Inputs

Use only the minimum profile data needed for discovery:

- school status: Bac obtained / Bac preparing / no Bac / other previous diploma;
- Bac track and average when available;
- target degree;
- target field;
- engineering specialty when applicable;
- German level;
- English level;
- preferred study language;
- budget range;
- preferred cities, when any;
- target intake, when known.

Avoid unnecessary personal identifiers. Discovery does not need name, email, phone, address, or uploaded document bytes.

### Search strategy builder

AlmaGo maps the student's target field to a controlled set of programme families and multilingual search aliases.

Example for Automotive:

- Automotive Engineering
- Vehicle Engineering
- Fahrzeugtechnik
- Mechanical Engineering with automotive focus
- Maschinenbau with Fahrzeugtechnik focus
- Mechatronics when relevant

Example for Computer Engineering:

- Computer Engineering
- Informatics / Informatik
- Computer Science
- Information Engineering
- Electrical Engineering + Information Technology when relevant

The synonym map is an AlmaGo asset. The research provider must not invent the product taxonomy on every request.

### Discovery

The research agent searches for a bounded pool, initially **up to 10–20 programme candidates**.

Preferred source order:

1. official university programme page;
2. official university study portal;
3. Hochschulkompass / DAAD for discovery and cross-checking;
4. other web sources only to discover a lead, never as the final authority for critical facts.

Every candidate returned by A should include:

```json
{
  "institution": "...",
  "programme": "...",
  "degree": "...",
  "city": "...",
  "teaching_language": "...",
  "official_programme_url": "...",
  "official_university_url": "...",
  "discovery_reason": "...",
  "source_urls": [],
  "status": "research_candidate"
}
```

If an official programme page cannot be found, the candidate may remain a weak research lead, but missing fields stay unknown.

### Obvious filtering inside A

A may remove results that are clearly incompatible:

- Master when the student asks for Bachelor;
- PhD / non-degree result;
- clearly unrelated discipline;
- programme known to be closed;
- duplicate programme;
- non-university result when the target is university study.

A should keep academically adjacent alternatives when they serve the student's goal. For Automotive, Mechanical Engineering or Mechatronics may be useful alternatives.

### No-Bac behavior

If `bac_status = no_bac`, A must **not** pretend that normal Bachelor discovery is automatically appropriate.

Flow:

```text
No Bac
  -> inspect last diploma/current studies
  -> determine whether an academic route is known
  -> only then search programmes
```

If there is not enough verified information:

```json
{
  "discovery_status": "route_requires_review",
  "candidates": []
}
```

A human review is then required before university discovery continues.

### Studienkolleg business rule

Campus Allemagne currently does **not** treat Studienkolleg as one of its offered service routes.

If verified rules show that a profile/programme requires Studienkolleg:

- do not hide the fact;
- do not sell Studienkolleg as a Campus Allemagne service;
- flag the route clearly;
- search for other legitimate routes only when the facts support them;
- escalate to human review where necessary.

## 3. B — Verification Engine

B takes `research_candidate` records from A and verifies critical facts against official sources.

Each fact is represented as one of:

- `verified`
- `needs_review`
- `unknown`

Critical facts include:

- programme exists and is currently offered;
- degree level;
- teaching language;
- German/English language requirement;
- accepted language certificates when available;
- intake availability;
- application deadline;
- direct application vs uni-assist;
- Studienkolleg requirement when documented;
- tuition/semester fees when documented;
- official source URL;
- verification date.

Unknown stays unknown. Generated copy must never upgrade an unknown fact to verified.

## 4. C — Selection Engine

C receives the verified pool and chooses **3–4 serious pistes**, not merely famous universities.

Ranking considers:

- degree match;
- field/specialty match;
- study-language preference;
- current language level vs verified requirement;
- preferred city;
- budget compatibility only when cost data is available;
- target intake;
- confidence/completeness of official data;
- programme relevance to the student's real goal.

The final shortlist should include useful alternatives when appropriate, e.g. Automotive + Mechanical Engineering + Mechatronics rather than four near-identical results.

C is deterministic/explainable. AI text generation must not silently change the ranking.

## 5. D — Gemini Personalized Writer

Gemini receives only structured, minimized inputs:

```text
PROFIL_ETUDIANT
FAITS_VERIFIES
OPTIONS_CAMPUS_ALLEMAGNE
ACTIONS_DISPONIBLES
SHORTLIST_PROGRAMMES
```

Gemini's job is copywriting and personalization, not academic truth.

### Editorial contract

The student is the hero.

The orientation should feel like a human mentor speaking to an 18–22 year old student:

- celebrate real achievements;
- turn obstacles into the next manageable step;
- use simple French/Arabic/English/German;
- be reassuring and commercially convincing without false guarantees;
- highlight the value proposition early: **while the student advances on language, the university project advances too**;
- explain only Campus Allemagne options that are really available;
- avoid administrative jargon;
- end with exactly one low-friction CTA.

Language guidance focuses on the next step:

- none -> A1;
- A1 -> A2;
- A2 -> B1;
- B1 -> B2;
- later requirements, including C1, are mentioned only when supported by verified programme facts.

### Structured output

Gemini returns a strict structured object controlled by AlmaGo, for example:

```json
{
  "opening": "...",
  "project": "...",
  "main_priority": {
    "title": "...",
    "text": "...",
    "next_step": "..."
  },
  "language": {
    "show": true,
    "current_level": "A2",
    "next_level": "B1",
    "text": "...",
    "available_paths": []
  },
  "campus_support": {
    "headline": "...",
    "text": "..."
  },
  "study_options": [],
  "roadmap": [],
  "reassurance": "...",
  "cta": {
    "action": "...",
    "label": "...",
    "text": "..."
  }
}
```

AlmaGo owns the layout and actions; Gemini writes the copy.

## 6. E — Result UI

Bachelor first contact remains letter-first and student-friendly.

Recommended order:

1. human opening;
2. current project;
3. one main priority;
4. language path if relevant;
5. key Campus Allemagne value: dossier progresses in parallel;
6. 3–4 programme pistes;
7. short roadmap;
8. one CTA;
9. expandable verified details and sources;
10. expandable profile answers.

Do not return to the old table-first / rule-dump UI.

## 7. F — Human validation

The counselor sees:

- student profile;
- discovered candidates;
- official sources;
- verification status per fact;
- selection rationale;
- generated orientation;
- unknowns / review flags.

The counselor can validate or correct the 3–4 pistes before they become part of the student's assisted application strategy.

Human validation is a core product feature, not a fallback for AI failure.

## 8. Progressive programme database

AlmaGo does not need a complete German-university database on day one.

Every discovery can enrich the internal catalogue:

```text
first discovery
  -> research_candidate
  -> official source found
  -> verified fields
  -> verified_at
  -> reusable programme record
```

Future similar profiles query the internal catalogue first, then use live web research only to:

- fill gaps;
- find new options;
- refresh stale facts;
- react to a new intake/programme.

This reduces latency and cost while improving quality over time.

## 9. Cost policy

The architecture keeps AI cost low without sacrificing factual safety.

### Verified pricing snapshot — 2026-10-02

- OpenAI Web Search: **USD 10 / 1,000 calls**, plus search-content tokens at the selected model's rates.
- Gemini 3.8 Flash paid tier through **2026-12-31**:
  - input: **USD 0.75 / 1M tokens**;
  - output, including thinking tokens: **USD 3.75 / 1M tokens**.
- Gemini Google Search grounding is not required for the normal writer path.

Pricing is time-sensitive and must be rechecked before changing production provider/model policy.

### Cost-control strategy

1. Use an economical OpenAI API model that meets A's search/extraction quality bar.
2. Escalate to a stronger reasoning model only when source conflict, ambiguity or low confidence requires it.
3. Gemini Flash is the default writer because it receives structured facts instead of doing expensive research.
4. Cache search results and verified programme records.
5. Avoid repeated live research within the current semester freshness window; major discovery refresh gates are 15 April and 15 October.
6. Cap candidate discovery and web calls per orientation.
7. Track provider cost per orientation.
8. Maintain deterministic fallbacks.

### Initial engineering budget targets

These are internal targets, not guaranteed provider prices:

- **new / uncached profile:** target average AI+search cost <= **USD 0.15**;
- **mostly cached profile:** target average AI+search cost <= **USD 0.03**;
- investigate if the rolling average materially exceeds target.

Do not hardcode a speculative per-student price in the UI.

## 10. Reliability / fallback

The student must never lose the orientation because OpenAI or Gemini is unavailable.

- A unavailable -> use fresh internal catalogue candidates where possible; otherwise flag research as incomplete.
- Gemini unavailable -> use the deterministic AlmaGo letter.
- invalid structured output -> reject, bounded retry, then deterministic fallback.
- timeout -> deterministic fallback.
- provider output contradicts verified facts -> reject the generated section.

## 11. Privacy

Send the minimum data necessary to each provider.

University discovery and copywriting do not require:

- name;
- email;
- phone;
- postal address;
- uploaded document bytes.

Use academic profile/preferences only unless a future feature explicitly requires more and has a privacy review.

## 12. Implementation sequence

### Phase A1 — Discovery contract ✅ implemented
- normalized discovery input;
- AlmaGo-owned programme-family/synonym map;
- research-candidate schema with unknown-safe nullable fields;
- bounded policy: max 8 search queries / 20 candidates;
- official-source priority;
- no-Bac route review before normal university discovery;
- Studienkolleg flagged for review and not marketed as a Campus Allemagne service route;
- executable contract tests.

Implementation files:
- `src/lib/orientation-engine/discovery/types.ts`;
- `src/lib/orientation-engine/discovery/contract.ts`;
- `tests/orientation-discovery-contract.test.mjs`.

### Phase A2 — OpenAI Research Agent ✅ implemented (provider path, activation pending)
- server-only OpenAI Responses API provider adapter;
- GPT-6 Luna default, configurable with `ALMAGO_ORIENTATION_DISCOVERY_MODEL`;
- live `web_search` integration with one bounded query plan from A1;
- strict JSON Schema output via Responses API `text.format`;
- candidate URLs retained only when grounded in URLs actually returned by web search;
- HTTPS source sanitization and exact-source grounding;
- deterministic deduplication before B;
- 12-second per-query timeout;
- one global retry budget beyond the A1 query cap;
- usage instrumentation: provider requests, web-search calls, input/output/total tokens, source URLs and wall-clock duration;
- fail-closed states for disabled flag, missing credentials, non-ready A1 plans, and provider failure;
- not exposed directly to the student UI before B verification.

Implementation files:
- `src/lib/orientation-engine/discovery/openai.ts`;
- `src/lib/orientation-engine/discovery/research.ts`;
- `tests/orientation-discovery-openai.test.mjs`;
- `.env.example`.

Activation requires server-only `OPENAI_API_KEY` and `ALMAGO_ORIENTATION_DISCOVERY_PROVIDER=openai`.

### Phase A3 — Programme Knowledge Base & Discovery Cache ✅ implemented

A3 makes discovery cumulative instead of disposable: every useful A2 result can enrich a reusable internal programme pool.

Behavior:
- query AlmaGo knowledge before OpenAI;
- keep discovered programme records durably instead of deleting them when a semester changes;
- reuse by programme family across different student profiles;
- discovery freshness is **calendar-based, not rolling**;
- the two major discovery refresh gates are **15 April** and **15 October** every year;
- a programme discovered or rediscovered remains discovery-fresh only until the next one of those two gates;
- crossing 15 April or 15 October makes the prior discovery cache stale for future cache-only decisions;
- the next relevant student/request after a gate triggers fresh A2 research for that programme family when the cache no longer qualifies;
- this is intentionally not `+180 days from the last search`: for example, a search on 2 October expires at the 15 October gate;
- if at least 8 fresh candidates are available and explicit preferences such as city are covered, skip OpenAI entirely;
- if 1–7 fresh candidates are available, reuse them and let A2 complete the pool;
- if A2 is unavailable, only still-fresh partial cache is eligible for normal reuse; stale rows remain stored for history and later refresh but do not satisfy freshness;
- save every new A2 candidate with a deterministic SHA-256 dedupe key;
- merge sources and programme-family tags across discoveries;
- never downgrade a future `promoted` / `rejected` review state during rediscovery;
- persist provider requests, web-search calls, tokens, duration and source-count metadata;
- persist `refresh_cycle` plus `next_major_refresh_at` for traceable semester freshness;
- persist only identity-minimised search context — no name, email, phone, passport or document bytes.

Semester refresh windows:
- **15 April -> 15 October:** `summer_<year>`;
- **15 October -> 15 April:** `winter_<year>`;
- programme knowledge remains in AlmaGo across cycles; only its discovery-freshness status expires;
- B still re-verifies critical facts such as deadlines, intake, language requirements, fees and application route before a student-facing recommendation.

Operationally, the dates are refresh **gates**. AlmaGo does not need to launch a wasteful blanket crawl at midnight for every stored programme. The first relevant discovery after a gate refreshes the affected family, and a later scheduled sweep can be added if operations require proactive refresh without student traffic.

Database:
- `orientation_research_programs`: global reusable research-programme pool;
- `orientation_discovery_runs`: identity-minimised run/cost history;
- `orientation_discovery_run_candidates`: run-to-programme provenance.

Security:
- all three tables use RLS;
- `anon` and `authenticated` receive no privileges;
- only server-side `service_role` receives CRUD;
- research rows never enter `orientation_program_catalog` automatically;
- B must verify/promote facts before they can become verified student-facing catalogue data.

Implementation files:
- `src/lib/orientation-engine/discovery/knowledge-core.ts`;
- `src/lib/orientation-engine/discovery/knowledge.ts`;
- `src/lib/orientation-engine/discovery/service.ts`;
- `tests/orientation-discovery-knowledge-cache.test.mjs`;
- `supabase/migrations/20261002194920_orientation_discovery_knowledge_cache.sql`;
- `supabase/migrations/20261002200738_orientation_discovery_semester_refresh_calendar.sql`.

### Phase B — Verification Engine ✅ implemented (provider activation pending)

B converts A's `research_candidate` records into source-gated programme facts. It does **not** decide admission eligibility and it does not auto-promote programmes into the student-facing verified catalogue.

Behavior:
- verify at most **8 candidates** per B run to keep search/provider cost bounded before C selects 3–4 final pistes;
- prioritize candidates that already have an official programme/university source;
- revisit one programme at a time with one bounded web-search call;
- extract facts with strict structured output;
- keep a separate status per fact: `verified`, `needs_review`, or `unknown`;
- a fact becomes `verified` only when its evidence URL was actually seen in the verification web research **and** belongs to the official programme/university domain;
- DAAD, Hochschulkompass and uni-assist are accepted as useful secondary registries, but their programme-specific claims remain `needs_review` until primary university evidence confirms them;
- an AI value whose source URL was not actually seen is discarded back to `unknown`;
- deterministic fallback may preserve useful A discovery values as `needs_review`, but it never upgrades them to `verified`;
- programme-level `verified` means the programme core (current existence, degree level and teaching language) has primary-source support. It does **not** mean admission is guaranteed and it does not imply every deadline/language/application fact is known;
- critical missing facts remain individually `unknown` even when the programme core is verified.

Field-level facts tracked by B:
- programme existence;
- degree level;
- city;
- teaching language;
- German language requirement;
- English language requirement;
- accepted language certificates;
- available intake terms;
- winter deadline;
- summer deadline;
- application route;
- application URL;
- Studienkolleg requirement only when explicitly documented;
- tuition / semester fees when explicitly documented.

Persistence:
- `orientation_research_programs.verification_status` + `last_verification_at` summarize the latest B result;
- `orientation_verification_runs` stores provider/model/status and cost observability;
- `orientation_programme_verifications` stores historical field-level facts and provenance;
- verification history is identity-minimised and server-only;
- no B code writes to `orientation_program_catalog`.

Security:
- B verification tables have RLS enabled;
- `anon` and `authenticated` receive no privileges;
- only server-side `service_role` receives CRUD.

Provider activation:
- `ALMAGO_ORIENTATION_VERIFICATION_PROVIDER=openai`;
- server-only `OPENAI_API_KEY`;
- optional `ALMAGO_ORIENTATION_VERIFICATION_MODEL`.

Implementation files:
- `src/lib/orientation-engine/verification/types.ts`;
- `src/lib/orientation-engine/verification/core.ts`;
- `src/lib/orientation-engine/verification/openai.ts`;
- `src/lib/orientation-engine/verification/store.ts`;
- `src/lib/orientation-engine/verification/service.ts`;
- `tests/orientation-verification-engine.test.mjs`;
- `supabase/migrations/20261002202819_orientation_programme_verification_engine.sql`.

B remains server-side infrastructure until C chooses the final shortlist and later UI/human-review work decides which verified facts become student-facing.

### Phase C — Selection Engine ✅ implemented

C consumes B's field-level verification output and produces the shortlist that later goes to the writer/UI.

Behavior:
- fully deterministic and zero-LLM-cost;
- target shortlist size is **3 to 4 programmes**;
- never force a third/fourth programme when evidence is insufficient;
- completely `unknown` B records are not inserted merely to fill the shortlist;
- hard exclusion happens only on a **verified conflict**:
  - programme officially not current;
  - verified degree-level mismatch;
  - verified target intake unavailable;
- unknown information remains a warning/missing fact, never implicit rejection;
- current language below a verified requirement is a condition to complete, not an exclusion;
- Studienkolleg / fees / application-route gaps remain explicit warnings instead of hidden ranking assumptions.

Explainable score inputs:
- B core verification strength;
- verified degree match;
- deterministic programme-title match for target field / engineering specialty;
- preferred study-language match;
- preferred city match;
- verified target-intake match;
- current language level versus an explicitly sourced CEFR requirement;
- known application route and target-semester deadline.

Diversity:
- after base relevance scoring, C adds small deterministic bonuses for a new institution and a new city;
- diversity bonuses are intentionally smaller than the core relevance weights;
- university fame, brand prestige, sponsored placement and LLM opinion are **not** ranking inputs.

Output for every selected item includes:
- base score + final score;
- score breakdown;
- reasons;
- warnings;
- missing B facts;
- deterministic shortlist position.

Persistence/cost:
- C does not call OpenAI or Gemini;
- C does not create a second copy of A/B programme knowledge;
- unselected programmes remain in the reusable A/B database;
- the shortlist is cheap to recompute whenever the student's preferences change.

Implementation files:
- `src/lib/orientation-engine/selection/types.ts`;
- `src/lib/orientation-engine/selection/core.ts`;
- `src/lib/orientation-engine/selection/service.ts`;
- `tests/orientation-selection-engine.test.mjs`.

C remains server-side infrastructure until D/E consume the shortlist for personalized writing and student-facing presentation.

### Phase D — Gemini Personalized Writer ✅ implemented (provider activation pending)

D is the editorial layer only. AlmaGo remains the source of truth.

Architecture:
- input = C shortlist + B field-level verification + minimized student profile;
- optional explicit Campus Allemagne services + explicit available CTA actions;
- no discovery, no web search, no re-ranking and no admission decision inside the writer;
- default model: `gemini-3.8-flash`;
- provider remains disabled unless `ALMAGO_ORIENTATION_WRITER_PROVIDER=gemini` and a server-only `GEMINI_API_KEY` are configured.

Stable writer context:
- `PROFIL_ETUDIANT`;
- `FAITS_VERIFIES`;
- `OPTIONS_CAMPUS_ALLEMAGNE`;
- `ACTIONS_DISPONIBLES`;
- `LANGUAGE_FOCUS`.

Privacy/minimisation:
- no name, email, phone, passport or uploaded document content;
- no source URLs;
- no internal C score/breakdown;
- only the selected 3–4 programme identities and their bounded verified/review/missing facts are sent.

Editorial principles:
- student is the hero; Campus Allemagne is the guide;
- warm, persuasive, human copy in FR/AR/EN/DE;
- celebrate only achievements present in the profile;
- focus on the next immediate language step instead of exposing the whole language ladder;
- explain parallel progress of language + university project without inventing Campus Allemagne services;
- one clear CTA from the backend-provided action allow-list;
- no engine jargon in student copy.

Strict structured output:
- opening;
- project status;
- main priority;
- language plan;
- Campus Allemagne value;
- study options;
- roadmap;
- reassurance;
- one CTA.

Backend ownership:
- Gemini returns only `option_id` + narrative for each study option;
- institution/programme/city names are injected from C by AlmaGo;
- the writer must return every selected option exactly once;
- Gemini cannot add, remove or reorder the shortlist.

Post-generation grounding checks:
- unsupported CEFR levels cause fallback;
- unsupported numeric claims cause fallback;
- admission guarantees cause fallback;
- invented Studienkolleg / uni-assist claims cause fallback;
- unknown CTA ids cause fallback;
- malformed/incomplete JSON causes fallback;
- source URLs in student copy cause fallback.

Reliability/cost:
- 10-second request timeout;
- 30-minute bounded in-memory cache for identical writer context;
- usage tokens and request duration returned for observability;
- deterministic localized fallback always remains available;
- D adds no new database copy and does not mutate B/C truth.

Implementation:
- `src/lib/orientation-engine/writer/types.ts`;
- `src/lib/orientation-engine/writer/core.ts`;
- `src/lib/orientation-engine/writer/gemini.ts`;
- `src/lib/orientation-engine/writer/service.ts`;
- `tests/orientation-personalized-writer.test.mjs`.

D is server-side infrastructure. E will integrate this structured result into the student-facing orientation UI and human-review flow.

### Phase E — UI + human review 🚧 student integration implemented

Implemented in the result pipeline:
- one server-side A -> B -> C -> D orchestration path behind the existing Orientation API;
- A1 remains authoritative: incomplete / no-Bac review routes do not silently enter normal university discovery;
- the existing deterministic Orientation Engine remains the public fallback if the new pipeline is unavailable or produces no usable shortlist;
- the browser receives only the writer content plus bounded selected facts/sources — no C score breakdown, provider/model metadata or usage telemetry;
- when C has a real shortlist, the D structured writer becomes the primary letter-first result;
- 3–4 programme pistes, short roadmap and the single writer CTA stay in the main reading flow;
- the writer CTA reuses the existing consented prospect-capture flow instead of creating a second acquisition path;
- verified/review facts and their sources remain expandable below the simple letter;
- every personalized shortlist is visibly marked for mandatory Campus Allemagne counselor validation before it becomes an assisted application strategy.

Human-review boundary:
- AlmaGo already has a protected admin Orientation workflow where a counselor chooses the student, checks the stored profile, selects a programme, documents the factual justification, publishes the recommendation and can archive it later;
- E reuses that protected manual publication boundary rather than auto-publishing AI output;
- the new A/B/C/D draft is **not** automatically copied into `program_recommendations` and is never treated as counselor-approved;
- a richer counselor review bundle (showing the exact discovered candidates, B fact statuses, C rationale and generated D copy together) remains part of the Phase F production/human-validation work.

### Phase F — production validation

Test profiles include at least:

- Bac obtained + A2;
- Bac preparing + no German;
- B2 profile ready for application work;
- no Bac;
- very limited budget;
- fixed city;
- undecided field;
- Automotive;
- Computer Engineering;
- Architecture;
- no reliable programme found;
- only routes requiring Studienkolleg;
- provider outage / timeout / invalid JSON.

## 13. Definition of success

The system succeeds when:

- materially different profiles receive materially different orientations;
- every critical academic claim is traceable to a verified fact/source;
- the student sees only 3–4 understandable pistes, not a search dump;
- the UI stays simple and human;
- unknown information is never presented as fact;
- the counselor can see why each piste was chosen;
- cached programme knowledge grows over time;
- provider failure does not break orientation;
- AI/search cost is observable and bounded.

## 14. Decision log

Validated on 2026-10-02:

- OpenAI/research layer for discovery and source analysis.
- AlmaGo deterministic verification/ranking as source of truth.
- Gemini for personalized marketing-oriented writing.
- Human Campus Allemagne validation remains mandatory for assisted selection.
- Programme database grows progressively from verified discoveries.
- No attempt to pre-build every German university before launch.
- Campus Allemagne does not market Studienkolleg as a current service route.
