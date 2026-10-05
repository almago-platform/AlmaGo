-- Campus Allemagne P7: idempotent notification/reminder logic.
-- No scheduler is introduced here; this function is safe to invoke repeatedly.

create unique index if not exists notifications_campus_dedupe_idx
  on public.notifications ((metadata ->> 'dedupe_key'))
  where metadata ? 'dedupe_key';

create or replace function public.admin_enqueue_campus_notifications(
  p_today date default (timezone('Europe/Berlin', now()))::date
)
returns integer
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  inserted_count integer := 0;
  inserted_now integer := 0;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  -- Targeted student document actions only.
  insert into public.notifications (user_id, type, title, body, metadata)
  select
    requirement.student_id,
    'campus_student_action',
    'Action requise pour votre dossier',
    requirement.label || case
      when requirement.student_request_reason is not null
        then ' — ' || requirement.student_request_reason
      else ''
    end,
    jsonb_build_object(
      'student_document_requirement_id', requirement.id,
      'student_procedure_id', requirement.student_procedure_id,
      'due_date', requirement.student_request_due_date,
      'dedupe_key', 'campus:student-document:' || requirement.id::text || ':' || coalesce(requirement.student_request_due_date::text, 'no-date')
    )
  from public.student_document_requirements requirement
  join public.student_procedures procedure
    on procedure.id = requirement.student_procedure_id
   and procedure.is_current
  where requirement.requested_from_student
    and requirement.status in ('requested', 'replacement_required')
    and requirement.student_request_reason is not null
    and char_length(btrim(requirement.student_request_reason)) > 0
  on conflict ((metadata ->> 'dedupe_key')) where metadata ? 'dedupe_key' do nothing;

  get diagnostics inserted_now = row_count;
  inserted_count := inserted_count + inserted_now;

  -- Targeted checklist actions only. Internal Campus Allemagne work is excluded.
  insert into public.notifications (user_id, type, title, body, metadata)
  select
    item.student_id,
    'campus_student_action',
    'Action requise pour votre dossier',
    item.title || ' — ' || item.student_action_reason,
    jsonb_build_object(
      'student_checklist_item_id', item.id,
      'student_procedure_id', item.student_procedure_id,
      'due_date', item.due_date,
      'dedupe_key', 'campus:student-checklist:' || item.id::text || ':' || coalesce(item.due_date::text, 'no-date')
    )
  from public.student_checklist_items item
  join public.student_procedures procedure
    on procedure.id = item.student_procedure_id
   and procedure.is_current
  where item.requires_student_action
    and item.owner in ('student', 'joint')
    and item.status not in ('completed', 'not_applicable')
    and item.student_action_reason is not null
    and char_length(btrim(item.student_action_reason)) > 0
  on conflict ((metadata ->> 'dedupe_key')) where metadata ? 'dedupe_key' do nothing;

  get diagnostics inserted_now = row_count;
  inserted_count := inserted_count + inserted_now;

  -- Verified official application deadlines only.
  insert into public.notifications (user_id, type, title, body, metadata)
  select
    application.student_id,
    'campus_official_deadline',
    case remaining.days
      when 0 then 'Deadline officielle aujourd’hui'
      when 1 then 'Deadline officielle demain'
      else 'Deadline officielle dans ' || remaining.days::text || ' jours'
    end,
    'Échéance officielle vérifiée pour votre candidature.',
    jsonb_build_object(
      'application_id', application.id,
      'deadline', application.deadline,
      'deadline_kind', application.deadline_kind,
      'deadline_cycle', application.deadline_cycle,
      'source_url', application.deadline_source_url,
      'verified_at', application.deadline_verified_at,
      'days_remaining', remaining.days,
      'dedupe_key', 'campus:official-deadline:' || application.id::text || ':' || application.deadline::text || ':' || remaining.days::text
    )
  from public.applications application
  cross join lateral (
    select (application.deadline - p_today)::integer as days
  ) remaining
  where application.deadline is not null
    and application.deadline_kind = 'official_hard_deadline'
    and application.deadline_source_url ~* '^https?://'
    and application.deadline_verified_at is not null
    and application.deadline_verified_at <= now()
    and application.deadline_cycle is not null
    and char_length(btrim(application.deadline_cycle)) > 0
    and application.status::text in (
      'interested',
      'preparing',
      'documents_missing',
      'ready_to_submit',
      'submitted',
      'waiting_university',
      'draft',
      'planned',
      'in_review'
    )
    and remaining.days in (30, 14, 7, 3, 1, 0)
  on conflict ((metadata ->> 'dedupe_key')) where metadata ? 'dedupe_key' do nothing;

  get diagnostics inserted_now = row_count;
  inserted_count := inserted_count + inserted_now;

  return inserted_count;
end;
$$;

revoke all on function public.admin_enqueue_campus_notifications(date) from public, anon;
grant execute on function public.admin_enqueue_campus_notifications(date) to authenticated;
