-- Germany LOT 3.2B + 3.3B: enforce application workflow and Student insert integrity in PostgreSQL.
-- This migration is additive/hardening only: it does not rewrite or delete existing application data.

create or replace function private.application_intake_family(value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    when value is null or btrim(value) = '' then null
    when lower(value) like '%winter%'
      or lower(value) like '%hiver%'
      or lower(btrim(value)) = 'ws'
      then 'winter'
    when lower(value) like '%summer%'
      or lower(value) like '%sommer%'
      or lower(value) like '%été%'
      or lower(btrim(value)) = 'ss'
      then 'summer'
    else null
  end;
$$;

revoke execute on function private.application_intake_family(text) from public, anon;
grant execute on function private.application_intake_family(text) to authenticated;

drop policy if exists "applications student from recommendation" on public.applications;
create policy "applications student from recommendation" on public.applications
  for insert
  to authenticated
  with check (
    applications.student_id = (select auth.uid())
    and applications.status::text = 'interested'
    and applications.intake is not null
    and applications.submitted_at is null
    and applications.result is null
    and applications.reviewed_at is null
    and applications.student_notes is null
    and coalesce(cardinality(applications.required_documents), 0) = 0
    and (
      applications.deadline is null
      or applications.deadline >= (timezone('Europe/Berlin', now()))::date
    )
    and exists (
      select 1
      from public.program_recommendations recommendation
      join public.programs program
        on program.id = recommendation.program_id
      left join public.student_projects project
        on project.student_id = applications.student_id
      where recommendation.student_id = (select auth.uid())
        and recommendation.program_id = applications.program_id
        and not recommendation.is_archived
        and recommendation.status <> 'not_recommended'
        and program.is_active
        and program.source_url ~* '^https?://'
        and program.application_url ~* '^https?://'
        and program.verified_at is not null
        and program.verified_at <= now()
        and applications.intake = any(program.intake_terms)
        and private.application_intake_family(applications.intake) is not null
        and applications.deadline is not distinct from (
          case private.application_intake_family(applications.intake)
            when 'winter' then program.winter_deadline
            when 'summer' then program.summer_deadline
            else null
          end
        )
        and (
          (
            private.application_intake_family(project.target_intake) is null
            and cardinality(program.intake_terms) = 1
          )
          or (
            private.application_intake_family(project.target_intake)
              = private.application_intake_family(applications.intake)
            and (
              cardinality(program.intake_terms) = 1
              or (
                select count(*)
                from unnest(program.intake_terms) as candidate(term)
                where private.application_intake_family(candidate.term)
                  = private.application_intake_family(applications.intake)
              ) = 1
              or lower(btrim(project.target_intake)) = lower(btrim(applications.intake))
            )
          )
        )
    )
  );

create or replace function public.admin_update_application(
  target_application_id uuid,
  target_status public.application_status,
  target_next_action text default null,
  target_student_note text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_application public.applications%rowtype;
  source_status text;
  target_status_text text;
  transition_allowed boolean;
  status_title text;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  select *
  into target_application
  from public.applications
  where id = target_application_id
  for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  target_status_text := target_status::text;
  source_status := case target_application.status::text
    when 'draft' then 'interested'
    when 'planned' then 'preparing'
    when 'in_review' then 'waiting_university'
    when 'accepted' then 'admission'
    when 'rejected' then 'rejection'
    else target_application.status::text
  end;

  if source_status = target_status_text then
    raise exception 'application_no_status_change';
  end if;

  transition_allowed := case source_status
    when 'interested' then target_status_text in ('preparing', 'documents_missing', 'withdrawn')
    when 'preparing' then target_status_text in ('documents_missing', 'ready_to_submit', 'withdrawn')
    when 'documents_missing' then target_status_text in ('preparing', 'ready_to_submit', 'withdrawn')
    when 'ready_to_submit' then target_status_text in ('preparing', 'documents_missing', 'submitted', 'withdrawn')
    when 'submitted' then target_status_text in ('waiting_university', 'withdrawn')
    when 'waiting_university' then target_status_text in ('admission', 'rejection', 'withdrawn')
    else false
  end;

  if not transition_allowed then
    raise exception 'application_transition_not_allowed';
  end if;

  if target_status_text in ('admission', 'rejection')
    and nullif(btrim(target_student_note), '') is null
  then
    raise exception 'application_decision_note_required';
  end if;

  update public.applications
  set status = target_status,
      next_action = nullif(btrim(target_next_action), ''),
      student_notes = nullif(btrim(target_student_note), ''),
      reviewed_at = now(),
      submitted_at = case
        when target_status_text = 'submitted' and target_application.submitted_at is null then now()
        else target_application.submitted_at
      end
  where id = target_application_id;

  status_title := case target_status_text
    when 'admission' then 'Admission reçue'
    when 'rejection' then 'Décision de candidature'
    when 'submitted' then 'Candidature envoyée'
    when 'waiting_university' then 'Réponse de l’université attendue'
    else 'Candidature mise à jour'
  end;

  insert into public.application_events (
    application_id,
    actor_id,
    event_type,
    message,
    visible_to_student
  )
  values (
    target_application_id,
    auth.uid(),
    'application_status_changed',
    status_title || ' : ' || target_status_text,
    true
  );

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    metadata
  )
  values (
    target_application.student_id,
    'application_status_changed',
    status_title,
    nullif(btrim(target_student_note), ''),
    jsonb_build_object(
      'application_id', target_application_id,
      'status', target_status_text
    )
  );
end;
$$;

revoke execute on function public.admin_update_application(uuid, public.application_status, text, text)
  from public, anon;
grant execute on function public.admin_update_application(uuid, public.application_status, text, text)
  to authenticated;
