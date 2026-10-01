-- Smart Orientation SO-5: append-only, auditable priority history.
-- Priority is supplied by the bounded server-side Smart Orientation engine and
-- persisted atomically with each new orientation through an AFTER INSERT trigger.

do $$
begin
  create type public.smart_orientation_priority_state as enum (
    'priority_ready',
    'priority_prepare_now',
    'priority_standard',
    'priority_follow_up'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.smart_orientation_priority_history (
  id uuid primary key default gen_random_uuid(),
  orientation_id uuid not null unique
    references public.orientations(id) on delete cascade,
  engine_version text not null
    check (char_length(engine_version) between 1 and 80),
  state public.smart_orientation_priority_state not null,
  reason_codes text[] not null default '{}'::text[],
  requires_human_review boolean not null default false,
  created_at timestamptz not null default now(),

  constraint smart_orientation_priority_reason_codes_bounded
    check (cardinality(reason_codes) <= 32),
  constraint smart_orientation_priority_reason_codes_known
    check (
      reason_codes <@ array[
        'bac_obtained',
        'bac_preparing',
        'average_above_12',
        'average_12_or_below',
        'average_missing',
        'target_degree_defined',
        'target_field_defined',
        'project_information_missing',
        'sensitive_field_human_review',
        'language_preparation_needed',
        'ready_for_priority_review',
        'prepare_now_before_bac'
      ]::text[]
    )
);

create index if not exists smart_orientation_priority_state_created_idx
  on public.smart_orientation_priority_history (state, created_at desc);

alter table public.smart_orientation_priority_history enable row level security;

revoke all on table public.smart_orientation_priority_history from anon;
grant select on table public.smart_orientation_priority_history to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.smart_orientation_priority_history
  from authenticated;

grant select on table public.smart_orientation_priority_history to service_role;
revoke insert, update, delete, truncate
  on table public.smart_orientation_priority_history
  from service_role;

create policy "smart priority linked user or admin read"
  on public.smart_orientation_priority_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orientations o
      join public.prospects p on p.id = o.prospect_id
      where o.id = orientation_id
        and p.user_id is not null
        and p.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

create or replace function public.record_smart_orientation_priority()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_priority jsonb;
  v_reason_codes text[];
  v_engine_version text;
  v_state text;
  v_requires_human_review boolean;
begin
  v_priority := new.input -> 'smart_priority';

  -- Legacy/internal orientation writes may not yet carry Smart Priority.
  if v_priority is null then
    return new;
  end if;

  if jsonb_typeof(v_priority) <> 'object'
    or jsonb_typeof(v_priority -> 'reasonCodes') <> 'array'
    or jsonb_typeof(v_priority -> 'requiresHumanReview') <> 'boolean'
  then
    raise exception 'Invalid Smart Orientation priority payload';
  end if;

  v_engine_version := v_priority ->> 'engineVersion';
  v_state := v_priority ->> 'state';
  v_requires_human_review := (v_priority ->> 'requiresHumanReview')::boolean;

  select coalesce(array_agg(value), '{}'::text[])
    into v_reason_codes
  from jsonb_array_elements_text(v_priority -> 'reasonCodes') as reasons(value);

  insert into public.smart_orientation_priority_history (
    orientation_id,
    engine_version,
    state,
    reason_codes,
    requires_human_review
  )
  values (
    new.id,
    v_engine_version,
    v_state::public.smart_orientation_priority_state,
    v_reason_codes,
    v_requires_human_review
  )
  on conflict (orientation_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.record_smart_orientation_priority()
  from public, anon, authenticated, service_role;

drop trigger if exists orientations_record_smart_priority
  on public.orientations;

create trigger orientations_record_smart_priority
after insert on public.orientations
for each row
execute function public.record_smart_orientation_priority();
