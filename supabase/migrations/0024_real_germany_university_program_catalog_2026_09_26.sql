-- Seed the first real, verified Germany university/programme catalogue.
-- Official university sources rechecked on 2026-09-26.
-- Unknown or institution-dependent values remain NULL rather than being estimated.
-- Inclusion is factual catalogue coverage, not an AlmaGo recommendation or admission prediction.

do $$
declare
  rwth_id uuid;
  tub_id uuid;
  tum_id uuid;
  uds_id uuid;
begin
  select id into rwth_id from public.universities where name = 'RWTH Aachen University' limit 1;
  if rwth_id is null then
    insert into public.universities
      (name, city, country, website_url, source_url, verified_at, bundesland, university_type, is_public, is_active)
    values
      ('RWTH Aachen University', 'Aachen', 'DE', 'https://www.rwth-aachen.de/',
       'https://www.rwth-aachen.de/', timestamptz '2026-09-26T19:45:00Z',
       'Nordrhein-Westfalen', 'TU', true, true)
    returning id into rwth_id;
  else
    update public.universities
    set city='Aachen', country='DE', website_url='https://www.rwth-aachen.de/',
        source_url='https://www.rwth-aachen.de/', verified_at=timestamptz '2026-09-26T19:45:00Z',
        bundesland='Nordrhein-Westfalen', university_type='TU', is_public=true, is_active=true,
        updated_at=now()
    where id=rwth_id;
  end if;

  select id into tub_id from public.universities where name = 'Technische Universität Berlin' limit 1;
  if tub_id is null then
    insert into public.universities
      (name, city, country, website_url, source_url, verified_at, bundesland, university_type, is_public, is_active)
    values
      ('Technische Universität Berlin', 'Berlin', 'DE', 'https://www.tu.berlin/',
       'https://www.tu.berlin/', timestamptz '2026-09-26T19:45:00Z',
       'Berlin', 'TU', true, true)
    returning id into tub_id;
  else
    update public.universities
    set city='Berlin', country='DE', website_url='https://www.tu.berlin/',
        source_url='https://www.tu.berlin/', verified_at=timestamptz '2026-09-26T19:45:00Z',
        bundesland='Berlin', university_type='TU', is_public=true, is_active=true,
        updated_at=now()
    where id=tub_id;
  end if;

  select id into tum_id from public.universities where name = 'Technical University of Munich' limit 1;
  if tum_id is null then
    insert into public.universities
      (name, city, country, website_url, source_url, verified_at, bundesland, university_type, is_public, is_active)
    values
      ('Technical University of Munich', 'Munich', 'DE', 'https://www.tum.de/',
       'https://www.tum.de/', timestamptz '2026-09-26T19:45:00Z',
       'Bayern', 'TU', true, true)
    returning id into tum_id;
  else
    update public.universities
    set city='Munich', country='DE', website_url='https://www.tum.de/',
        source_url='https://www.tum.de/', verified_at=timestamptz '2026-09-26T19:45:00Z',
        bundesland='Bayern', university_type='TU', is_public=true, is_active=true,
        updated_at=now()
    where id=tum_id;
  end if;

  select id into uds_id from public.universities where name = 'Saarland University' limit 1;
  if uds_id is null then
    insert into public.universities
      (name, city, country, website_url, source_url, verified_at, bundesland, university_type, is_public, is_active)
    values
      ('Saarland University', 'Saarbrücken', 'DE', 'https://www.uni-saarland.de/en/home.html',
       'https://www.uni-saarland.de/en/home.html', timestamptz '2026-09-26T19:45:00Z',
       'Saarland', 'Universität', true, true)
    returning id into uds_id;
  else
    update public.universities
    set city='Saarbrücken', country='DE', website_url='https://www.uni-saarland.de/en/home.html',
        source_url='https://www.uni-saarland.de/en/home.html', verified_at=timestamptz '2026-09-26T19:45:00Z',
        bundesland='Saarland', university_type='Universität', is_public=true, is_active=true,
        updated_at=now()
    where id=uds_id;
  end if;

  if not exists (select 1 from public.programs where university_id=rwth_id and name='Computer Engineering') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,application_url,source_url,verified_at,
       is_active,duration,diploma_required,almago_notes,requirements)
    values
      (rwth_id,'Computer Engineering','Master','Computer Engineering','Predominantly English',
       'https://online.rwth-aachen.de/',
       'https://www.rwth-aachen.de/global/show_document.asp?id=aaaaaaaadaejmkn',
       timestamptz '2026-09-26T19:45:00Z',true,null,
       'Recognized first university degree with subject-specific academic background',
       'Official 2024 examination regulations list subject-credit prerequisites; equivalence is decided by the responsible university bodies.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'academic_prerequisites',jsonb_build_object(
           'advanced_mathematics_ects',25,
           'physics_electrical_foundations_ects',5,
           'electrical_engineering_foundations_ects',23,
           'informatics_programming_ects',16,
           'systems_theory_ects',10,
           'theoretical_electrical_or_information_technology_ects',10,
           'application_oriented_ects',20
         )
       ));
  end if;

  if not exists (select 1 from public.programs where university_id=tub_id and name='Computer Science (Informatik)') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,intake_terms,duration,
       english_level_required,diploma_required,application_url,source_url,verified_at,is_active,almago_notes,requirements)
    values
      (tub_id,'Computer Science (Informatik)','Master','Computer Science','English',
       array['Summer','Winter'],'4 semesters','B2',
       'First professionally qualifying degree in computer science or a closely related programme',
       'https://www.tu.berlin/en/eecs/academics-teaching/organizing-your-studies/during-your-studies/msc-computer-science-informatik/msc-cs-in-application-admission',
       'https://www.tu.berlin/en/studying/study-programs/all-programs-offered/study-course/computer-science-informatik-m-sc',
       timestamptz '2026-09-26T19:45:00Z',true,
       'Foreign first-degree applicants need a VPD for TU Berlin applications from summer semester 2026 onward. The examination board decides subject equivalence.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'credits',120,
         'open_admission',true,
         'foreign_degree_route','VPD from uni-assist',
         'academic_prerequisites',jsonb_build_object(
           'computer_science_fundamentals_ects',36,
           'theoretical_computer_science_ects',12,
           'computer_engineering_or_it_ects',12,
           'methodological_practical_cs_ects',12,
           'mathematics_ects',18,
           'additional_computer_science_ects',30
         )
       ));
  end if;

  if not exists (select 1 from public.programs where university_id=tum_id and name='Informatics') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,intake_terms,duration,
       diploma_required,application_url,source_url,verified_at,is_active,winter_deadline,summer_deadline,almago_notes,requirements)
    values
      (tum_id,'Informatics','Master','Computer Science','English',
       array['Summer','Winter'],'4 semesters',
       'Relevant undergraduate degree assessed through the TUM aptitude assessment',
       'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc',
       'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc',
       timestamptz '2026-09-26T19:45:00Z',true,'2027-05-31','2026-11-30',
       'TUM lists a two-stage aptitude assessment. Tuition fees apply to many international students from third countries; applicants must verify current fee rules and exemptions.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'credits',120,
         'admission_category','Aptitude Assessment for Master',
         'winter_application_period','01.02-31.05',
         'summer_application_period','01.10-30.11'
       ));
  end if;

  if not exists (select 1 from public.programs where university_id=uds_id and name='Computer Science') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,intake_terms,duration,
       english_level_required,diploma_required,application_url,source_url,verified_at,is_active,
       winter_deadline,summer_deadline,almago_notes,requirements)
    values
      (uds_id,'Computer Science','Master','Computer Science','English',
       array['Summer','Winter'],'4 semesters','C1',
       'Relevant qualifying first university degree and programme-specific application evidence',
       'https://www.uni-saarland.de/en/study/programmes/master/informatics.html',
       'https://www.uni-saarland.de/en/study/programmes/master/informatics.html',
       timestamptz '2026-09-26T19:45:00Z',true,'2027-05-15','2026-11-15',
       'The programme is not admission-restricted. The department publishes early and late application deadlines; the current programme page remains the authoritative source.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'open_admission',true,
         'winter_deadlines',jsonb_build_array('15 November early','15 May late'),
         'summer_deadlines',jsonb_build_array('15 May early','15 November late')
       ));
  end if;

  if not exists (select 1 from public.programs where university_id=tum_id and name='Informatics' and degree_level='Bachelor') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,intake_terms,duration,
       german_level_required,diploma_required,uni_assist_required,application_url,source_url,verified_at,is_active,
       winter_deadline,almago_notes,requirements)
    values
      (tum_id,'Informatics','Bachelor','Computer Science','German',
       array['Winter'],'6 semesters',null,
       'Higher education entrance qualification; international qualifications are assessed under the applicable TUM procedure',
       true,
       'https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc',
       'https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc',
       timestamptz '2026-09-26T19:45:00Z',true,'2027-07-15',
       'TUM requires German proficiency and an aptitude assessment. International higher education entrance qualifications generally require a VPD from uni-assist.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'credits',180,
         'admission_category','Aptitude Assessment for Bachelor',
         'application_period','15.05-15.07'
       ));
  end if;

  if not exists (select 1 from public.programs where university_id=uds_id and name='Computer Science (English)' and degree_level='Bachelor') then
    insert into public.programs
      (university_id,name,degree_level,field,teaching_language,intake_terms,duration,
       english_level_required,diploma_required,application_url,source_url,verified_at,is_active,
       winter_deadline,almago_notes,requirements)
    values
      (uds_id,'Computer Science (English)','Bachelor','Computer Science','English',
       array['Winter'],'6 semesters','B2',
       'University entrance qualification allowing direct access to undergraduate study in Germany plus programme-specific selection evidence',
       'https://www.uni-saarland.de/en/study/programmes/bachelor/computer-science.html',
       'https://www.uni-saarland.de/en/study/programmes/bachelor/computer-science.html',
       timestamptz '2026-09-26T19:45:00Z',true,'2027-07-15',
       'The programme is admission-restricted and offers several application tracks. B2 English is published as the recommended level; accepted evidence depends on the selected track.',
       jsonb_build_object(
         'source_checked_on','2026-09-26',
         'restricted_entry',true,
         'regular_winter_deadline','15 July',
         'interview_track_deadline','15 June',
         'early_application_dates',jsonb_build_array('15 January','15 June')
       ));
  end if;
end $$;
