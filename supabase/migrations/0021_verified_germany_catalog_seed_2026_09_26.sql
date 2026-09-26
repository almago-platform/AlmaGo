-- Seed a small, dated, factual Germany catalogue from provider-owned official sources.
-- Verified on 2026-09-26. Inclusion is not a ranking, recommendation, visa decision, or endorsement.
-- Keep unknown/time-sensitive fields null rather than estimating them.

insert into public.language_courses
  (title, provider_name, city, language, purpose, level_from, level_to,
   hours_per_week, starts_on, ends_on, price_cents, currency,
   source_url, application_url, verified_at, is_active)
select
  'Intensivkurse Deutsch für Studium und Beruf',
  'Sprachenakademie Aachen',
  'Aachen',
  'Deutsch',
  'study_preparation',
  'A1',
  'C1',
  null,
  null,
  null,
  null,
  null,
  'https://www.spraachen.org/de/deutschkurse/intensivkurse/',
  'https://www.spraachen.org/de/deutschkurse/intensivkurse/',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.language_courses
  where provider_name = 'Sprachenakademie Aachen'
    and title = 'Intensivkurse Deutsch für Studium und Beruf'
);

insert into public.language_courses
  (title, provider_name, city, language, purpose, level_from, level_to,
   hours_per_week, starts_on, ends_on, price_cents, currency,
   source_url, application_url, verified_at, is_active)
select
  'University Pathway',
  'did deutsch-institut',
  null,
  'Deutsch',
  'study_preparation',
  'A1',
  'C2',
  null,
  null,
  null,
  null,
  null,
  'https://www.did.de/deutschkurse/erwachsene/deutsch-fuer-das-studium',
  'https://www.did.de/deutschkurse/erwachsene/deutsch-fuer-das-studium',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.language_courses
  where provider_name = 'did deutsch-institut'
    and title = 'University Pathway'
);

insert into public.language_courses
  (title, provider_name, city, language, purpose, level_from, level_to,
   hours_per_week, starts_on, ends_on, price_cents, currency,
   source_url, application_url, verified_at, is_active)
select
  'Deutsch Intensiv',
  'Goethe-Institut Deutschland',
  null,
  'Deutsch',
  'standalone_language',
  'A1',
  'C2',
  null,
  null,
  null,
  114900,
  'EUR',
  'https://www.goethe.de/ins/de/de/kur/ang/dik.html',
  'https://www.goethe.de/ins/de/de/kur/ang/dik.html',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.language_courses
  where provider_name = 'Goethe-Institut Deutschland'
    and title = 'Deutsch Intensiv'
);

insert into public.finance_insurance_catalog
  (provider_name, product_name, kind, description, official_source_url,
   application_url, price_notes, eligibility_notes, verified_at, is_active)
select
  'Fintiba',
  'Blocked Account',
  'blocked_account_provider'::public.finance_insurance_kind,
  'Digital blocked-account service for proof of financing. The provider states that the account is opened in the customer''s name and issues the blocking confirmation after funding.',
  'https://www.fintiba.com/blocked-account-germany',
  'https://www.fintiba.com/blocked-account-germany',
  'Checked 26 Sep 2026: provider publishes a €159 one-time setup fee and €9.90 monthly administration fee. The blocked funds themselves are separate and depend on the competent authority''s required amount.',
  'A blocked account is only one possible method of proving financing. Confirm the amount and accepted proof with the competent German mission or immigration authority for the concrete case.',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.finance_insurance_catalog
  where provider_name = 'Fintiba' and product_name = 'Blocked Account'
);

insert into public.finance_insurance_catalog
  (provider_name, product_name, kind, description, official_source_url,
   application_url, price_notes, eligibility_notes, verified_at, is_active)
select
  'Expatrio',
  'Blocked Account',
  'blocked_account_provider'::public.finance_insurance_kind,
  'Digital blocked-account service for German visa and residence procedures. The provider publishes setup and monthly administration fees on its official product page.',
  'https://www.expatrio.com/blocked-account',
  'https://www.expatrio.com/blocked-account',
  'Checked 26 Sep 2026: provider publishes a €119 setup fee and €9 monthly fee. The blocked funds themselves remain the customer''s funds and are separate from service fees.',
  'Confirm the required blocked amount and whether a blocked account is the appropriate financing proof with the competent authority for the concrete case.',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.finance_insurance_catalog
  where provider_name = 'Expatrio' and product_name = 'Blocked Account'
);

insert into public.finance_insurance_catalog
  (provider_name, product_name, kind, description, official_source_url,
   application_url, price_notes, eligibility_notes, verified_at, is_active)
select
  'Techniker Krankenkasse (TK)',
  'Student health insurance',
  'health_insurance_provider'::public.finance_insurance_kind,
  'German statutory student health insurance. TK explains that enrolled students generally need electronic proof of insurance and that the student tariff depends on the individual insurance situation.',
  'https://www.tk.de/en/i-am-tk/students-health-insurance-germany/health-insurance-studying-2169844',
  'https://www.tk.de/en/i-am-tk/students-health-insurance-germany/health-insurance-studying-2169844',
  '2026 contribution depends on age and child status. TK''s official 2026 information lists health insurance plus long-term care contributions; verify the current individual total before joining.',
  'Student tariff eligibility depends on enrolment and insurance status. TK states that language-course, Studienkolleg and certain preparatory participants are not insured under the regular student tariff solely on that basis.',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.finance_insurance_catalog
  where provider_name = 'Techniker Krankenkasse (TK)' and product_name = 'Student health insurance'
);

insert into public.finance_insurance_catalog
  (provider_name, product_name, kind, description, official_source_url,
   application_url, price_notes, eligibility_notes, verified_at, is_active)
select
  'AOK',
  'Student health insurance / international students',
  'health_insurance_provider'::public.finance_insurance_kind,
  'German statutory health-insurance information for international students, including electronic university insurance confirmation and country-specific social-security coordination.',
  'https://www.aok.de/pk/leistungen/studium-beruf/information-for-international-students/',
  'https://www.aok.de/pk/formulare-antraege/studentische-krankenversicherung/',
  'Contribution varies by regional AOK and personal situation; use the official AOK postcode flow for the current contribution.',
  'AOK states that Tunisia is covered by a bilateral social-security agreement. Tunisian students should obtain the applicable entitlement document from their home insurer and have their concrete status checked by a German statutory insurer.',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.finance_insurance_catalog
  where provider_name = 'AOK' and product_name = 'Student health insurance / international students'
);

insert into public.finance_insurance_catalog
  (provider_name, product_name, kind, description, official_source_url,
   application_url, price_notes, eligibility_notes, verified_at, is_active)
select
  'KfW',
  'KfW-Studienkredit (174)',
  'student_financing_option'::public.finance_insurance_kind,
  'Student loan for living costs during eligible study or doctoral programmes at state or state-recognised higher-education institutions in Germany.',
  'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Studieren-Qualifizieren/F%C3%B6rderprodukte/KfW-Studienkredit-%28174%29/',
  'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Studieren-Qualifizieren/KfW-Studienkredit/Antrag/',
  'KfW publishes flexible monthly disbursements between €100 and €650. The interest rate is variable and changes every six months; check the current rate on the official page before applying.',
  'Eligibility is limited to the applicant groups listed by KfW (for example German nationals, certain EU nationals/family members and Bildungsinländer). A non-EU international student is not automatically eligible.',
  timestamptz '2026-09-26T19:10:00Z',
  true
where not exists (
  select 1 from public.finance_insurance_catalog
  where provider_name = 'KfW' and product_name = 'KfW-Studienkredit (174)'
);
