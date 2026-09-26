-- Dated official-source review for the Germany/Tunisia student pathway.
-- Facts were rechecked against the named official sources on 2026-09-26.
-- review_due_at is an AlmaGo operational freshness gate, not a statement by the authority.

update public.regulatory_sources
set
  jurisdiction = 'DE',
  authority = 'Auswärtiges Amt',
  title = 'Studying in Germany',
  source_url = 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606850-606850',
  topic = 'study_visa',
  category = 'study_visa',
  origin_country = null,
  destination_country = 'DE',
  amount = null,
  currency = null,
  periodicity = null,
  checked_on = date '2026-09-26',
  summary = 'Official federal guidance explains that study-visa applications require evidence of university admission and secure financing, and notes that a student-applicant visa may be possible before the university is finally fixed.',
  rule_text = 'Use the competent German mission for the current document checklist. Admission and financing evidence are central study-visa documents; a student-applicant route may exist before final university placement.',
  requirements = '["admission_or_student_applicant_basis","proof_of_financing","mission_specific_documents"]'::jsonb,
  verification_status = 'verified',
  verified_at = timestamptz '2026-09-26T18:30:00Z',
  review_due_at = timestamptz '2026-10-26T18:30:00Z',
  updated_at = now()
where topic = 'study_visa';

update public.regulatory_sources
set
  jurisdiction = 'DE-TN',
  authority = 'Ambassade d’Allemagne à Tunis',
  title = 'Préparation aux études',
  source_url = 'https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573166-2573166',
  topic = 'study_preparation_tunisia',
  category = 'study_preparation',
  origin_country = 'TN',
  destination_country = 'DE',
  amount = 11904,
  currency = 'EUR',
  periodicity = 'yearly',
  checked_on = date '2026-09-26',
  summary = 'The Tunis mission checklist for study preparation lists a preparatory German course of at least 20 hours per week, at least A2 from an ALTE-certified institution, an academic preparatory basis such as conditional admission or Bewerberbestätigung, financing evidence and health-insurance evidence.',
  rule_text = 'For the Tunisia filing checklist, study preparation is documented with the mission-specific academic basis, language-course, language-level, financing and insurance evidence. The mission may request additional documents.',
  requirements = '["preparatory_course_20_hours_week","german_level_at_least_A2_ALTE","conditional_admission_or_bewerberbestaetigung_or_equivalent","proof_of_financing","health_insurance"]'::jsonb,
  verification_status = 'verified',
  verified_at = timestamptz '2026-09-26T18:30:00Z',
  review_due_at = timestamptz '2026-10-26T18:30:00Z',
  updated_at = now()
where topic = 'study_visa_tunisia';

update public.regulatory_sources
set
  jurisdiction = 'DE',
  authority = 'uni-assist e.V.',
  title = 'Get information in advance',
  source_url = 'https://www.uni-assist.de/en/how-to-apply/get-information/',
  topic = 'university_admission',
  category = 'university_admission',
  origin_country = null,
  destination_country = 'DE',
  amount = null,
  currency = null,
  periodicity = null,
  checked_on = date '2026-09-26',
  summary = 'uni-assist explains how applicants check educational prerequisites and university-specific admission criteria for Bachelor, Master, Studienkolleg and preparatory German-language routes.',
  rule_text = 'The chosen university sets programme-specific admission criteria and decides on admission. uni-assist evaluates applications only where the university uses its procedure.',
  requirements = '["education_certificates","programme_specific_criteria","university_application_route"]'::jsonb,
  verification_status = 'verified',
  verified_at = timestamptz '2026-09-26T18:30:00Z',
  review_due_at = timestamptz '2026-10-26T18:30:00Z',
  updated_at = now()
where topic = 'university_admission';

insert into public.regulatory_sources
  (jurisdiction, authority, title, source_url, topic, category, origin_country, destination_country,
   published_on, checked_on, amount, currency, periodicity, summary, rule_text, requirements,
   verification_status, verified_at, review_due_at, is_active)
select
  'DE', 'Auswärtiges Amt',
  'When applying for a student visa, how can I prove that my financing is secure?',
  'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-finanzierung/606696',
  'study_visa_financing', 'financing', null, 'DE',
  null, date '2026-09-26', null, null, null,
  'Official federal guidance lists several ways to demonstrate secure financing, including parental means, a declaration of commitment, a blocked account, a German bank guarantee and certain scholarships.',
  'Accepted financing evidence depends on the competent authority and current filing context; use the official mission checklist for the concrete case.',
  '["parental_means","declaration_of_commitment","blocked_account","bank_guarantee","qualifying_scholarship"]'::jsonb,
  'verified', timestamptz '2026-09-26T18:30:00Z', timestamptz '2026-10-26T18:30:00Z', true
where not exists (
  select 1 from public.regulatory_sources where topic = 'study_visa_financing'
);

insert into public.regulatory_sources
  (jurisdiction, authority, title, source_url, topic, category, origin_country, destination_country,
   published_on, checked_on, amount, currency, periodicity, summary, rule_text, requirements,
   verification_status, verified_at, review_due_at, is_active)
select
  'DE-TN', 'Ambassade d’Allemagne à Tunis',
  'Cours de langue allemande isolée',
  'https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2585068-2585068',
  'standalone_language_tunisia', 'standalone_language', 'TN', 'DE',
  date '2023-11-15', date '2026-09-26', 1027, 'EUR', 'monthly',
  'The Tunis mission page for a standalone German-language course lists a German course of at least 18 hours per week, financing evidence and health-insurance evidence, and states that this visa purpose is separate from university studies.',
  'For the Tunisia standalone-language filing route, use the current mission checklist and do not treat the language-course visa as a study-admission decision.',
  '["language_course_18_hours_week","proof_of_financing","health_insurance","standalone_language_purpose"]'::jsonb,
  'verified', timestamptz '2026-09-26T18:30:00Z', timestamptz '2026-10-26T18:30:00Z', true
where not exists (
  select 1 from public.regulatory_sources where topic = 'standalone_language_tunisia'
);

insert into public.regulatory_sources
  (jurisdiction, authority, title, source_url, topic, category, origin_country, destination_country,
   published_on, checked_on, summary, rule_text, requirements,
   verification_status, verified_at, review_due_at, is_active)
select
  'DE', 'Auswärtiges Amt',
  'Studying in Germany',
  'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606850-606850',
  'study_place_search', 'study_place_search', null, 'DE',
  null, date '2026-09-26',
  'Official federal guidance notes that in many cases a student-applicant visa can be requested when the applicant has not yet finally decided which university to attend.',
  'This source supports presenting study-place search as a route to examine, not as an automatic visa entitlement.',
  '["student_applicant_route_may_be_possible","competent_mission_documents"]'::jsonb,
  'verified', timestamptz '2026-09-26T18:30:00Z', timestamptz '2026-10-26T18:30:00Z', true
where not exists (
  select 1 from public.regulatory_sources where topic = 'study_place_search'
);
