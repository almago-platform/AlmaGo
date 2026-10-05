# Pilot 1 — Candidate Free Orientation Result / Next Action

Status: **Wire architecture created in Figma — awaiting visual review**

Figma frames:
- Desktop: `Pilot 1 — Candidate Orientation Result — Desktop`
- Mobile 390: `Pilot 1 — Candidate Orientation Result — Mobile 390`

## Product context

This screen is shown after the free public Orientation. At this point:
- the candidate has **not** necessarily created an AlmaGo account;
- the result must be useful on its own;
- creating an account creates a **Prospect / pre-account**, not an active Student;
- the conversion CTA must preserve the orientation and continue the dossier without implying paid Student access.

## Primary user questions

1. What does AlmaGo currently understand about my project?
2. Which routes/programmes are worth exploring?
3. What is still uncertain or needs verification?
4. What should I do next?
5. What happens if I create an account?

## Information hierarchy

### 1. Completion context
Small status line:
- Orientation gratuite terminée
- Résultat personnalisé

Purpose:
- reassure the user that the analysis is complete;
- avoid a giant marketing-style hero.

### 2. Result summary
Primary result statement:
- a plain-language orientation conclusion;
- a short explanation of why;
- explicit non-binding status.

Profile summary facts:
- target degree/field;
- current language level;
- target intake;
- geography.

Purpose:
- let the candidate verify that AlmaGo analysed the intended project.

### 3. Recommended programmes / routes
Show a maximum of three priority options initially.

Each card shows:
- programme;
- institution;
- location;
- teaching language;
- intake;
- one human compatibility status;
- link to "why this appears".

Do **not** show:
- admission probability;
- internal confidence codes;
- engine stages;
- long source lists.

### 4. What still needs verification
Separate uncertainty from positive fit.

Examples:
- accepted language certificate;
- exact intake deadline;
- direct vs uni-assist application route;
- programme-specific academic prerequisite.

Purpose:
- make the result trustworthy instead of overconfident.

### 5. Why these options appear
Short evidence summary:
- academic level;
- field alignment;
- geography;
- language or preference match when known.

### 6. Technical/source detail
Collapsed by default:
- verified facts;
- sources;
- verification dates;
- assumptions;
- engine diagnostics only where staff/debug needs justify it.

Candidate-facing default view stays simple.

### 7. Conversion / next action
High-trust continuation panel:

Primary CTA:
> Créer mon espace gratuit

Secondary:
> Modifier mon profil

Explicit promise:
- save the orientation;
- explore the catalogue;
- complete the project;
- upload starter documents;
- receive/discuss a Campus proposal.

Explicit boundary:
> Creating a Prospect account does not yet activate the Student space.

## Mobile behaviour

At 390px:
- programme cards stack vertically;
- "to verify" remains visible before the CTA;
- technical details stay collapsed;
- continuation CTA becomes full-width;
- no horizontal scrolling is required;
- the account/Student boundary remains visible near the primary CTA.

## Benchmark rationale

- **My GUIDE:** profile-driven, non-binding eligibility framing.
- **GOV.UK:** one clear next action and explicit uncertainty/requirements.
- **uni-assist:** account continuity and process gates.
- **ApplyBoard:** result/recommendation continuity into account and programme discovery.
- **Booking:** scannable result cards and progressive detail.

## Acceptance criteria before implementation

- [ ] Visual hierarchy approved.
- [ ] Wording clearly distinguishes orientation from admission decision.
- [ ] Account creation clearly maps to Prospect, not Student.
- [ ] Three programme cards remain scannable at 1440 and 390.
- [ ] Uncertainty is visible without dominating the result.
- [ ] Technical evidence is accessible but secondary.
- [ ] CTA explains what the user gains and what they do **not** gain yet.
- [ ] FR copy approved.
- [ ] AR/RTL wire reviewed.
- [ ] Loading, no-result, partial-result and error states designed.
