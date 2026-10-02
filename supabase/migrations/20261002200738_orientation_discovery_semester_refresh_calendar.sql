-- Orientation V4 A3 — fixed semester refresh calendar.
-- Major discovery refresh gates are 15 April and 15 October (UTC calendar days).
-- Programme records remain durable; only their discovery freshness expires at the next gate.

alter table public.orientation_research_programs
  add column refresh_cycle text,
  add column next_major_refresh_at timestamptz;

with base as (
  select
    id,
    last_seen_at,
    extract(year from last_seen_at at time zone 'UTC')::int as y
  from public.orientation_research_programs
)
update public.orientation_research_programs p
set
  refresh_cycle = case
    when b.last_seen_at < make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
      then 'winter_' || (b.y - 1)::text
    when b.last_seen_at < make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
      then 'summer_' || b.y::text
    else 'winter_' || b.y::text
  end,
  next_major_refresh_at = case
    when b.last_seen_at < make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
      then make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
    when b.last_seen_at < make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
      then make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
    else make_timestamptz(b.y + 1, 4, 15, 0, 0, 0, 'UTC')
  end
from base b
where p.id = b.id;

alter table public.orientation_research_programs
  alter column refresh_cycle set not null,
  alter column next_major_refresh_at set not null,
  add constraint orientation_research_programs_refresh_cycle_check
    check (refresh_cycle ~ '^(summer|winter)_[0-9]{4}$');

create index orientation_research_programs_next_major_refresh_idx
  on public.orientation_research_programs (next_major_refresh_at);

drop index if exists public.orientation_discovery_runs_fresh_idx;

alter table public.orientation_discovery_runs
  rename column fresh_until to next_major_refresh_at;

alter table public.orientation_discovery_runs
  alter column next_major_refresh_at drop default,
  add column refresh_cycle text;

with base as (
  select
    id,
    created_at,
    extract(year from created_at at time zone 'UTC')::int as y
  from public.orientation_discovery_runs
)
update public.orientation_discovery_runs r
set
  refresh_cycle = case
    when b.created_at < make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
      then 'winter_' || (b.y - 1)::text
    when b.created_at < make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
      then 'summer_' || b.y::text
    else 'winter_' || b.y::text
  end,
  next_major_refresh_at = case
    when b.created_at < make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
      then make_timestamptz(b.y, 4, 15, 0, 0, 0, 'UTC')
    when b.created_at < make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
      then make_timestamptz(b.y, 10, 15, 0, 0, 0, 'UTC')
    else make_timestamptz(b.y + 1, 4, 15, 0, 0, 0, 'UTC')
  end
from base b
where r.id = b.id;

alter table public.orientation_discovery_runs
  alter column refresh_cycle set not null,
  add constraint orientation_discovery_runs_refresh_cycle_check
    check (refresh_cycle ~ '^(summer|winter)_[0-9]{4}$');

create index orientation_discovery_runs_next_major_refresh_idx
  on public.orientation_discovery_runs (next_major_refresh_at)
  where status = 'ready';
