-- Germany LOT 3.2B + 3.3B: database-level workflow and Student insert integrity.
-- Hardening only: no existing application rows are rewritten or deleted.

create or replace function private.application_intake_family(value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    when value is null or btrim(value) = '' then null
    when lower(value) like '%winter%' or lower(value) like '%hiver%' or lower(btrim(value)) = 'ws' then 'winter'
    when lower(value) like '%summer%' or lower(value) like '%sommer%' or lower(value) like '%été%' or lower(btrim(value)) = 'ss' then 'summer'
    else null
  end;
$$;

revoke execute on function private.application_intake_family(text) from public, anon;
grant execute on function private.application_intake_family(text) to authenticated;

drop policy if exists "applications student from recommendation" on public.applications;
create policy "applications student from recommendation" on public.applications
for insert to authenticated
with check (
  applications.student_id = (select auth.uid())
  and applications.status::text = 'interested'
  and applications.intake is not null
  and applications.submitted_at is null
  and applications.result is null
  and applications.reviewed_at is null
  and applications.student_notes is null
  and coalesce(cardinality(applications.required_documents), 0) = 0
  and (applications.deadline is null or applications.deadline >= (timezone('Europe/Berlin', now()))::date)
  and exists (
    select 1
    from public.program_recommendations recommendation
    join public.programs program on program.id = recommendation.program_id
    left join public.student_projects project on project.student_id = applications.student_id
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
          and (
            select count(*) from unnest(program.intake_terms) candidate(term)
            where private.application_intake_family(candidate.term) is not null
          ) = 1
        )
        or (
          private.application_intake_family(project.target_intake)
            = private.application_intake_family(applications.intake)
          and (
            (
              select count(*) from unnest(program.intake_terms) candidate(term)
              where private.application_intake_family(candidate.term)
                = private.application_intake_family(applications.intake)
            ) = 1
            or lower(btrim(project.target_intake)) = lower(btrim(applications.intake))
          )
        )
      )
  )
);

create or replace function private.application_transition_allowed(source_status text, target_status text)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select case (
    case source_status
      when 'draft' then 'interested'
      when 'planned' then 'preparing'
      when 'in_review' then 'waiting_university'
      when 'accepted' then 'admission'
      when 'rejected' then 'rejection'
      else source_status
    end
  )
    when 'interested' then target_status in ('preparing', 'documents_missing', 'withdrawn')
    when 'preparing' then target_status in ('documents_missing', 'ready_to_submit', 'withdrawn')
    when 'documents_missing' then target_status in ('preparing', 'ready_to_submit', 'withdrawn')
    when 'ready_to_submit' then target_status in ('preparing', 'documents_missing', 'submitted', 'withdrawn')
    when 'submitted' then target_status in ('waiting_university', 'withdrawn')
    when 'waiting_university' then target_status in ('admission', 'rejection', 'withdrawn')
    else false
  end;
$$;

revoke execute on function private.application_transition_allowed(text, text) from public, anon;
grant execute on function private.application_transition_allowed(text, text) to authenticated;

create or replace function private.enforce_application_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status::text in ('admission', 'rejection')
    and nullif(btrim(new.student_notes), '') is null
  then
    raise exception 'application_decision_note_required';
  end if;

  if new.status is distinct from old.status
    and not private.application_transition_allowed(old.status::text, new.status::text)
  then
    raise exception 'application_transition_not_allowed';
  end if;

  if new.submitted_at is distinct from old.submitted_at
    and not (new.status::text = 'submitted' and old.submitted_at is null)
  then
    raise exception 'application_submitted_at_managed';
  end if;

  if new.status::text = 'submitted' and new.status is distinct from old.status then
    new.submitted_at := coalesce(old.submitted_at, now());
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_application_status_transition() from public, anon;
grant execute on function private.enforce_application_status_transition() to authenticated;

drop trigger if exists applications_enforce_status_transition on public.applications;
create trigger applications_enforce_status_transition
before update of status, student_notes, submitted_at on public.applications
for each row execute function private.enforce_application_status_transition();

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
  status_title text;
begin
  if not public.is_admin() then raise exception 'admin_required'; end if;

  select * into target_application
  from public.applications
  where id = target_application_id
  for update;

  if not found then raise exception 'application_not_found'; end if;
  if target_application.status = target_status then raise exception 'application_no_status_change'; end if;

  update public.applications
  set status = target_status,
      next_action = nullif(btrim(target_next_action), ''),
      student_notes = nullif(btrim(target_student_note), ''),
      reviewed_at = now()
  where id = target_application_id;

  status_title := case target_status::text
    when 'admission' then 'Admission reçue'
    when 'rejection' then 'Décision de candidature'
    when 'submitted' then 'Candidature envoyée'
    when 'waiting_university' then 'Réponse de l’université attendue'
    else 'Candidature mise à jour'
  end;

  insert into public.application_events (application_id, actor_id, event_type, message, visible_to_student)
  values (
    target_application_id, auth.uid(), 'application_status_changed',
    status_title || ' : ' || target_status::text, true
  );

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    target_application.student_id, 'application_status_changed', status_title,
    nullif(btrim(target_student_note), ''),
    jsonb_build_object('application_id', target_application_id, 'status', target_status::text)
  );
end;
$$;

revoke execute on function public.admin_update_application(uuid, public.application_status, text, text)
from public, anon;
grant execute on function public.admin_update_application(uuid, public.application_status, text, text)
to authenticated;
