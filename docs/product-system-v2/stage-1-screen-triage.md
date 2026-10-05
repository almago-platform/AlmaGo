# AlmaGo Product System V2 — Stage 1 Screen Triage Matrix

Status: **Draft 1 — repository and visual baseline**

This matrix decides what happens to each product surface before implementation. Labels:

- **KEEP** — preserve structure and behaviour, only align to V2 system.
- **SIMPLIFY** — keep function but reduce complexity, density or navigation burden.
- **REBUILD** — retain business logic but redesign the presentation and interaction model.
- **MERGE** — consolidate overlapping surfaces into a clearer product concept.
- **DEFER** — not part of the first pilot migration.

## Candidate / Orientation

| Surface | Decision | Reason | V2 direction |
|---|---|---|---|
| Public homepage | SIMPLIFY | Current public experience has a distinct editorial system; it should stay public-facing but align to the shared tokens and clearer service proposition. | Keep strong brand entry, simplify competing sections, emphasise orientation/continuation. |
| Public orientation form | REBUILD | This is a critical conversion and trust surface. Complex engine behaviour should feel simple. | Guided service flow with clear progress, plain-language questions, autosave/continuation state and explicit privacy/trust cues. |
| Orientation loading | KEEP + ALIGN | Existing loading treatment already communicates background work. | Keep purposeful feedback, remove decorative excess, map to V2 loading/skeleton rules. |
| Orientation result/report | REBUILD | Current intelligence is rich but can expose too much analytical complexity. | Summary first: result, recommended routes/programmes, risks/unknowns, next action. Technical evidence behind progressive disclosure. |
| Orientation claim/continue | SIMPLIFY | Functional bridge is correct but must feel like continuation of one service. | Preserve state/context and use the same journey language as result and authenticated dossier. |
| Signup/login | KEEP + ALIGN | Auth function is stable and already has RTL-specific work. | Adopt V2 fields, validation, trust copy, error/loading states, token hierarchy. |

## Prospect / Pre-client

| Surface | Decision | Reason | V2 direction |
|---|---|---|---|
| Prospect dashboard | MERGE CONCEPTUALLY | Prospect is a valid technical lifecycle, but the user should not feel they entered a different product. | Present as "Mon projet Allemagne" continuation, not a separate product tier. |
| Prospect navigation | SIMPLIFY | Current sidebar contains journey + services with many permanent destinations. | Reduce persistent top-level choices; prioritise current stage and next action. |
| Prospect orientation | MERGE | Overlaps public orientation result/continuation and student recommendation concepts. | Reuse one recommendation/result language and components. |
| Prospect catalogue | KEEP + ALIGN | Useful capability. | Same ProgrammeCard / filters / evidence freshness system as student. |
| Prospect documents | KEEP + ALIGN | Correct workflow. | Migrate to universal document upload/review components. |
| Prospect proposal | REBUILD | Central transaction between Campus and user. | Make proposal a high-trust decision screen with scope, price, included service, status and discuss/accept actions. |
| Prospect offers | SIMPLIFY | Commercial data should be human-readable and not expose technical versions/minor units. | Clear offer comparison and TND display; internal details secondary. |
| Prospect payment | DEFER until orchestration review | UI alone cannot establish a professional payment flow if server orchestration is disabled. | Design states now; enable only after provider/server workflow is reviewed. |
| Prospect roadmap | MERGE | Roadmap overlaps journey/procedure concepts. | Consolidate into the canonical "Mon parcours" model. |

## Student

| Surface | Decision | Reason | V2 direction |
|---|---|---|---|
| Student dashboard | REBUILD — PILOT 1 | Current page already has useful next-action and progression logic, but it is visually assembled from many panels. | One dossier header, one dominant next action, compact progress, deadlines, current Campus state and recent activity. |
| Student navigation | REBUILD | Current horizontal scrolling primary navigation exposes too many permanent modules. | Stable shell with Home / Journey / Documents / Recommendations / Messages; secondary account/service links elsewhere. |
| Student onboarding/profile | KEEP + ALIGN | Functional forms are reusable. | New Field system, sectioning, validation and autosave feedback. |
| Student project/pathway/checklist | MERGE CONCEPTUALLY | Multiple pages describe different slices of one journey. | Unify into "Mon parcours" with contextual detail views. |
| Student orientation | REBUILD | Recommendations should read as decisions/options, not engine output. | Programme recommendation cards with compatibility, evidence, unresolved points and saved/selected state. |
| Student documents | KEEP + ALIGN | Core workflow is correct. | Universal DocumentRow / Upload / Review state components. |
| Student applications | KEEP + ALIGN | Good operational object. | Data rows/table on desktop, structured cards on mobile, consistent status/next-action model. |
| Student calendar | DEFER | Useful but not a first pilot dependency. | Revisit after core dossier/journey architecture is stable. |
| Language courses / finance-insurance | DEFER + ALIGN | Supporting catalogue services. | Migrate after primary journey surfaces. |

## Admin / Advisor

| Surface | Decision | Reason | V2 direction |
|---|---|---|---|
| Admin overview | KEEP PRINCIPLE + REBUILD PRESENTATION | Priority-first logic is correct. | More integrated operations cockpit; fewer equal-weight cards; clear queues and SLA-like attention states without artificial scoring. |
| Admin navigation | REBUILD | Current nav is module-centric and incomplete relative to actual admin routes. | Overview / Dossiers / To review / Catalogue / Finance / Administration. |
| Admin intake | MERGE INTO DOSSIER + QUEUE | State machine is central but should not be a standalone mental model. | Cross-dossier queue plus dossier-specific proposal/status panel. |
| Admin documents | KEEP AS QUEUE + MERGE INTO DOSSIER | Operators need a global queue and dossier context. | Global "To review" queue; same review panel embedded in student dossier. |
| Admin orientation | REBUILD — PILOT 2 SUBSYSTEM | Powerful engine, but technical audit material dominates. | Advisor summary first; recommended programmes, confidence/evidence, unresolved risks; technical audit collapsed. |
| Admin prospects | MERGE INTO DOSSIERS | Prospect lifecycle is technically distinct but operationally part of the case pipeline. | One dossiers search/list with lifecycle/status filters; erased/archived technical identities excluded from ordinary queues. |
| Admin applications | KEEP + ALIGN | Valid operational queue. | Shared table/filter/action model and dossier deep links. |
| Admin payments | DEFER FUNCTIONAL ENABLEMENT | Current UI reports orchestration disabled. | Design transaction states and audit trail; only enable after payment architecture review. |
| Admin offers | SIMPLIFY | Current editor exposes implementation details such as minor units/version. | Human TND values, publish status, scope, effective date; technical identifiers secondary. |
| Admin universities/programmes | REBUILD DATA MANAGEMENT PATTERN | Duplicate-looking entities and inconsistent states reduce trust. | Canonical university records, aliases, merge/review workflow, source/freshness status. |
| Language courses / finance-insurance | KEEP + ALIGN | Useful verified catalogues. | Shared catalogue data-grid, freshness and source verification patterns. |

## Cross-surface components to build before broad migration

Priority 0:
- Product shell / navigation primitives
- PageHeader
- DossierHeader
- Button family
- Field / validation
- Badge / Status
- Alert / Notice
- Panel / DataList / DataRow
- Empty / Loading / Error states

Priority 1:
- JourneyStepper
- DocumentRow + ReviewPanel
- ProgrammeRecommendationCard
- ProposalSummary
- Timeline / Activity
- FilterBar + DataTable

Priority 2:
- Modal / Drawer / Popover / Tooltip
- Notification centre
- PaymentSummary
- Catalogue management patterns

## Pilot acceptance sequence

1. **Student Dashboard / Dossier Home**
2. **Admin Student Dossier / Advisor Cockpit**
3. **Candidate Orientation Result / Next Action**

No large-scale migration begins until all three pilots demonstrate:
- coherent shared foundations;
- audience-appropriate density;
- 360–1440+ responsive quality;
- RTL behaviour;
- keyboard/focus behaviour;
- normal/loading/empty/error/success states;
- plain-language copy;
- no technical implementation leakage.
