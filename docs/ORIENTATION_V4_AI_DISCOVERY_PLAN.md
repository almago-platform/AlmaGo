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

### Phase B — Verification Engine
- field-level source provenance;
- freshness dates;
- verified / needs_review / unknown states;
- official-source checks.

### Phase C — Selection Engine
- deterministic 3–4 programme shortlist;
- explainable scoring;
- diversity of useful alternatives;
- no hidden LLM ranking.

### Phase D — Gemini Writer
- master prompt;
- strict JSON schema;
- factual guardrails;
- multilingual marketing copy;
- deterministic fallback.

### Phase E — UI + human review
- letter-first result;
- programme pistes;
- roadmap;
- one CTA;
- verified-detail drawer;
- counselor validation workflow.

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
