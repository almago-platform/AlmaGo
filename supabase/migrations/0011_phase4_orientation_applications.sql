-- Phase 4: catalogue, orientation manuelle et suivi des candidatures.

alter table public.universities
  add column if not exists bundesland text,
  add column if not exists university_type text not null default 'Universität'
    check (university_type in ('Universität', 'TU', 'Hochschule', 'FH')),
  add column if not exists logo_url text,
  add column if not exists description text,
  add column if not exists is_public boolean not null default true,
  add column if not exists tuition_notes text,
  add column if not exists is_active boolean not null default true;

alter table public.programs
  add column if not exists intake_terms text[] not null default '{}',
  add column if not exists duration text,
  add column if not exists nc_requirement text,
  add column if not exists german_level_required text,
  add column if not exists english_level_required text,
  add column if not exists diploma_required text,
  add column if not exists indicative_average numeric(4,2),
  add column if not exists studienkolleg_required boolean not null default false,
  add column if not exists testas_required boolean not null default false,
  add column if not exists uni_assist_required boolean not null default false,
  add column if not exists application_fee_notes text,
  add column if not exists winter_deadline date,
  add column if not exists summer_deadline date,
  add column if not exists almago_notes text;

alter table public.program_recommendations
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz,
  add column if not exists student_interest_at timestamptz;

alter table public.program_recommendations
  drop constraint if exists program_recommendations_status_check;
alter table public.program_recommendations
  add constraint program_recommendations_status_check check (status in (
    'recommended', 'possible', 'ambitious', 'missing_requirements',
    'not_recommended', 'accepted', 'dismissed'
  ));

alter type public.application_status add value if not exists 'interested';
alter type public.application_status add value if not exists 'preparing';
alter type public.application_status add value if not exists 'documents_missing';
alter type public.application_status add value if not exists 'ready_to_submit';
alter type public.application_status add value if not exists 'waiting_university';
alter type public.application_status add value if not exists 'admission';
alter type public.application_status add value if not exists 'rejection';

alter table public.applications
  add column if not exists next_action text,
  add column if not exists required_documents text[] not null default '{}',
  add column if not exists student_notes text,
  add column if not exists result text,
  add column if not exists reviewed_at timestamptz;

create index if not exists universities_active_name_idx
  on public.universities (is_active, name);
create index if not exists programs_active_degree_idx
  on public.programs (is_active, degree_level);
create index if not exists recommendations_student_active_idx
  on public.program_recommendations (student_id, is_archived, created_at desc);
create index if not exists applications_status_deadline_idx
  on public.applications (status, deadline);

drop trigger if exists universities_set_updated_at on public.universities;
create trigger universities_set_updated_at
  before update on public.universities
  for each row execute procedure public.set_updated_at();

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
  before update on public.programs
  for each row execute procedure public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

drop policy if exists "recommendations student or admin read" on public.program_recommendations;
create policy "recommendations student active or admin read" on public.program_recommendations
  for select to authenticated
  using ((student_id = auth.uid() and not is_archived) or public.is_admin());

drop policy if exists "applications student insert" on public.applications;
create policy "applications student from recommendation" on public.applications
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and status::text = 'interested'
    and exists (
      select 1 from public.program_recommendations recommendation
      where recommendation.student_id = auth.uid()
        and recommendation.program_id = applications.program_id
        and not recommendation.is_archived
        and recommendation.status <> 'not_recommended'
    )
  );

drop policy if exists "applications student update" on public.applications;

create or replace function public.admin_update_application(
  target_application_id uuid,
  target_status public.application_status,
  target_next_action text default null,
  target_student_note text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_application public.applications;
  status_title text;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  select * into target_application
  from public.applications
  where id = target_application_id
  for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  update public.applications
  set status = target_status,
      next_action = nullif(trim(target_next_action), ''),
      student_notes = nullif(trim(target_student_note), ''),
      reviewed_at = now()
  where id = target_application_id;

  status_title := case target_status
    when 'admission' then 'Admission reçue'
    when 'rejection' then 'Décision de candidature'
    when 'submitted' then 'Candidature envoyée'
    when 'waiting_university' then 'Réponse de l’université attendue'
    else 'Candidature mise à jour'
  end;

  insert into public.application_events (application_id, actor_id, event_type, message, visible_to_student)
  values (
    target_application_id,
    auth.uid(),
    'application_status_changed',
    status_title || ' : ' || target_status::text,
    true
  );

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    target_application.student_id,
    'application_status_changed',
    status_title,
    nullif(trim(target_student_note), ''),
    jsonb_build_object('application_id', target_application_id, 'status', target_status::text)
  );
end;
$$;

grant execute on function public.admin_update_application(uuid, public.application_status, text, text) to authenticated;
