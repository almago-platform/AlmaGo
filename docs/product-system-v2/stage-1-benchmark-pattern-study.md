# AlmaGo Product System V2 — Benchmark Pattern Study

Status: **Stage 1 / Research complete — draft for design translation**

Purpose: identify proven product patterns from mature education, government, visa and transactional platforms. This is **pattern research**, not visual copying.

AlmaGo canonical lifecycle:

> Candidate → Free Orientation → Account / Prospect → Campus Proposal → Acceptance → Payment / Validation → Active Student

Admin/Advisor spans the whole lifecycle.

---

## 1. uni-assist — procedural clarity and account continuity

Sources:
- https://www.uni-assist.de/en/apply-in-6-steps
- https://www.uni-assist.de/en/how-to-apply/apply-online/
- https://www.uni-assist.de/bewerben/abschicken-verfolgen/dokumente-nachreichen/

Observed strengths:
- The service explains the application as a small, numbered process rather than exposing internal departments.
- My assist is one persistent account for multiple applications and semesters.
- Documents are uploaded once and reused.
- Payment is an explicit gate before processing starts.
- After submission, the user tracks status rather than guessing what staff are doing.
- Missing-document recovery is framed as a three-step task: read result → upload missing item → receive new result.

Transfer to AlmaGo:
- Keep the public/prospect lifecycle visibly finite and understandable.
- Use one dossier identity from orientation through active Student.
- Treat payment as an explicit lifecycle gate with clear consequence.
- Document replacement should always say what is missing, what to upload, and what happens next.
- Never expose the internal state machine as the main UX.

Do not copy:
- uni-assist's visual identity or page composition.
- Their exact six steps; AlmaGo has a different commercial and advisory model.

---

## 2. GOV.UK / UKVI — complex administrative service made simple

Sources:
- https://www.gov.uk/study-uk-student-visa
- https://www.gov.uk/student-visa/apply-online
- https://www.gov.uk/student-visa/documents-you-must-provide

Observed strengths:
- Strong step-by-step navigation across a complex regulated procedure.
- Each page answers one task and gives a clear next step.
- Requirements are separated into "must provide" and conditional requirements.
- Save-and-continue is explicit.
- Time-to-decision expectations are communicated.
- Success and post-submission behaviour are explained before the user reaches the end.

Transfer to AlmaGo:
- Orientation and prospect flows should use one task per screen/section where possible.
- Separate required starter documents from conditional/route-specific documents.
- Show "what Campus is doing" and expected next event, not only a generic status.
- Explain future consequences before payment/activation.
- Every blocking state should include a resolution path.

Do not copy:
- GOV.UK's intentionally austere visual style. AlmaGo can be warmer while retaining the service-design discipline.

---

## 3. My GUIDE / DAAD — profile-driven programme discovery with bounded claims

Sources:
- https://www.myguide.de/en/about-my-guide/
- https://www.myguide.de/en/check-the-eligibility/
- https://www.myguide.de/en/degree-programmes/

Observed strengths:
- The product begins with a small number of introductory questions and then narrows programmes using the user's profile.
- Eligibility information is explicitly described as preliminary/non-binding.
- Programme search offers many filters while keeping result cards focused on degree, location, language, duration and fees.
- Data provenance and the institutional source of programme/admission information are explained.

Transfer to AlmaGo:
- Free Orientation should ask only information needed to produce a useful first result.
- Programme recommendation cards should show the small set of decision-critical facts first.
- Distinguish "profile appears compatible" from any admission probability.
- Show source/freshness/provenance in a calm secondary layer.
- Catalogue filtering should progressively reveal advanced filters rather than overwhelm first-time users.

Do not copy:
- DAAD's page style or database presentation verbatim.

---

## 4. Common App — application preparation and requirement visibility

Source:
- https://www.commonapp.org/apply/first-year-students/

Observed strengths:
- The journey is framed around preparation and completion tasks: gather materials → create account → add colleges → understand requirements → submit.
- College-specific requirements are surfaced as an explicit concept rather than hidden in generic application forms.
- The user can explore institutions while also understanding what each one requires.

Transfer to AlmaGo:
- Prospect catalogue should connect each programme to its specific requirements and unresolved evidence.
- A recommendation is not merely a programme card; it should answer "why this fits" and "what is still required".
- Before application, show readiness gaps in a structured way.

---

## 5. ApplyBoard — discovery → application → acceptance continuum

Sources:
- https://www.applyboard.com/
- https://www.applyboard.com/register
- https://assist.applyboard.com/hc/en-us/articles/36072631496717-How-to-Create-an-Application-on-ApplyBoard-as-an-International-Student

Observed strengths:
- Profile information feeds programme discovery.
- Recommended/top programmes become the direct entry point into application.
- The platform explains a long study-abroad journey as a guided sequence.
- Programme discovery and application are not separate products.

Transfer to AlmaGo:
- The Orientation result should flow directly into the Prospect catalogue and saved recommendations.
- The Prospect home should keep top programmes/recommendations visible without pretending they are admissions.
- Once Student access is activated, recommendations should transition naturally into application/procedure objects.

Caution:
- AlmaGo's business boundary is different: free orientation/account creation must not grant the paid Student space.

---

## 6. UCAS — advisor operations and status/action semantics

Sources:
- https://www.ucas.com/advisers/help-and-training/guides-resources-and-training/application-overview/our-adviser-portal/tracking-your-students-applications-post-submission
- https://www.ucas.com/applying/after-you-apply/tracking-your-ucas-application
- https://www.ucas.com/applying/after-you-apply/clearing-and-results-day/results-day/what-your-application-status-means

Observed strengths:
- Advisor portal uses quick filters to find applicants who need support.
- Overall application status is separated from individual choice/programme status.
- "Last updated" is operationally important.
- Statuses are paired with what they mean and what the applicant should do next.
- Advisors can move from a cross-applicant queue into one applicant's details.

Transfer to AlmaGo Admin:
- Default queues should answer "who needs action now?"
- Show lifecycle status + last meaningful change + responsible side (Prospect/Student, Campus, university).
- Separate dossier lifecycle from individual programme/application statuses.
- Every important status should have a human explanation and next action.
- The 360° dossier must be the detail destination from every queue.

This is one of the strongest direct references for the future AlmaGo Admin.

---

## 7. TLScontact / VFS — external-process tracking and role boundaries

Sources:
- https://visas-de.tlscontact.com/en-us/country/i/vac/i/application-process
- https://visa.vfsglobal.com/fji/en/deu/apply-visa
- TLScontact user guide status timeline

Observed strengths:
- Clear sequence: document preparation → account/data → appointment/submission → external authority processing → passport/result.
- Tracking is persistent after submission.
- Responsibility boundary is explicit: TLScontact handles submission logistics; the diplomatic authority makes the decision.
- Application progress is represented as a timeline with completed/current/future stages.

Transfer to AlmaGo:
- Make the boundary explicit between AlmaGo guidance/processing and university/authority decisions.
- Procedure screens should distinguish "Campus action", "Student action", and "External authority/university action".
- Use a real progress timeline only when stages are causally meaningful.
- Never imply AlmaGo controls an external admission/visa decision.

---

## 8. Booking.com — high-density discovery without losing the decision

Sources:
- https://www.booking.com/city/de/dusseldorf.html
- https://developers.booking.com/demand/docs/accommodations/filter-pagination

Observed strengths:
- Search intent stays visible while results are browsed.
- Results can be sorted and filtered on the dimensions users actually decide with.
- Result cards prioritise a small number of high-value facts.
- More complex filtering is available without becoming the primary content.
- Map/list switching supports a different decision mode.

Transfer to AlmaGo catalogue:
- Keep the student's study intent/profile summary visible during programme browsing.
- Use high-value filters: degree, field, city/region, language, semester, admission mode, deadline, study mode, tuition/semester contribution.
- Result cards should be scannable and comparable.
- Advanced source/requirement information belongs in details, not in every result card.
- Saved/shortlisted programmes should be obvious.

Do not copy:
- Booking's urgency patterns, scarcity pressure, review-score treatment or commercial dark patterns.

---

## 9. FlixBus — transactional clarity and post-purchase self-service

Sources:
- https://support.flixbus.com/global/en/making-a-booking
- https://support.flixbus.com/de/de/eine-buchung-%C3%A4ndern-oder-stornieren

Observed strengths:
- Booking and post-booking management are treated as separate modes.
- "Manage my booking" consolidates changes, cancellation, extras and invoice actions around one transaction object.
- The transaction/reference remains the anchor after purchase.

Transfer to AlmaGo:
- Before payment: Proposal is the transaction object.
- After payment: Service/Student dossier becomes the management object.
- Receipt, payment status, included service and changes should remain discoverable from one place.
- Do not scatter commercial history across unrelated admin pages.

---

# 10. Pattern synthesis for AlmaGo

## A. Candidate Free Orientation
Use:
- GOV.UK task focus;
- My GUIDE minimal entry questions and bounded claims;
- ApplyBoard continuity into programme discovery.

Target pattern:
> One calm question group → visible progress → useful result → explicit next action → save by creating account.

## B. Prospect / pre-account
Use:
- uni-assist account continuity;
- Common App requirement visibility;
- Booking-style catalogue scanability;
- ApplyBoard recommendation-to-action continuity.

Target pattern:
> "Mon projet Allemagne" with current stage, next action, recommended programmes, starter documents, Campus review state and proposal — but no Student-only tools.

## C. Campus Proposal / Payment
Use:
- FlixBus transaction-object clarity;
- uni-assist payment gate;
- GOV.UK consequence/next-step clarity.

Target pattern:
> Route + service scope + included work + price + what happens after acceptance + discuss/accept + payment state + activation state.

## D. Active Student
Use:
- UCAS status/action semantics;
- TLS/VFS external-process timeline;
- GOV.UK next-step clarity.

Target pattern:
> Dossier status, next action, Campus action, external action, deadlines, documents, procedures and applications.

## E. Admin / Advisor
Use:
- UCAS advisor quick filters and per-applicant drill-down;
- TLS role boundaries;
- one dossier object spanning the complete AlmaGo lifecycle.

Target pattern:
> Priority queue → 360° dossier → evidence → proposal/decision → response → payment/activation → procedure/applications → history.

---

# 11. Design principles derived from the benchmark

1. **Lifecycle before modules.**
2. **One dominant next action.**
3. **Status must explain meaning + owner + next step.**
4. **Account does not equal Student access.**
5. **One person, one continuous dossier history.**
6. **Recommendation is not admission prediction.**
7. **External decisions must have explicit responsibility boundaries.**
8. **Programme discovery must be scannable before it is exhaustive.**
9. **Payment is a product-state transition, not just a finance event.**
10. **Technical evidence is available, but progressively disclosed.**
11. **Cross-user queues and individual dossier views must be tightly linked.**
12. **Post-transaction self-service/history should remain available from one object.**

---

# 12. What AlmaGo should NOT borrow

Avoid:
- Booking-style urgency/scarcity pressure;
- generic SaaS dashboard layouts with equal-weight cards everywhere;
- fake admission probability scores;
- giant marketing heroes inside authenticated workflows;
- visa-portal visual coldness where warmth would help;
- overly complex university catalogue filters shown all at once;
- raw technical lifecycle labels;
- decorative AI gradients as a substitute for information hierarchy.

Benchmark conclusion:

> AlmaGo should combine institutional service design, guided education discovery, transaction clarity and advisor-grade dossier operations — while keeping one distinctive AlmaGo visual identity.
