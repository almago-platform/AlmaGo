-- P2.8A: provider-neutral, versioned commercial offers.
-- Stable Bronze/Silver/Gold identities are seeded, but no commercial version is published automatically.

do $$
begin
  create type public.commercial_offer_code as enum (
    'bronze',
    'silver',
    'gold'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.commercial_offer_version_status as enum (
    'draft',
    'published',
    'retired'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.commercial_offers (
  id uuid primary key default gen_random_uuid(),
  code public.commercial_offer_code not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.commercial_offer_versions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.commercial_offers(id) on delete restrict,
  version integer not null check (version >= 1),
  status public.commercial_offer_version_status not null default 'draft',
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  summary text not null check (char_length(btrim(summary)) between 1 and 500),
  service_items jsonb not null default '[]'::jsonb,
  price_minor bigint,
  currency text,
  published_at timestamptz,
  created_at timestamptz not null default now(),

  constraint commercial_offer_versions_unique_version
    unique (offer_id, version),
  constraint commercial_offer_versions_service_items_array
    check (
      jsonb_typeof(service_items) = 'array'
      and jsonb_array_length(service_items) between 1 and 20
    ),
  constraint commercial_offer_versions_service_items_bounded
    check (octet_length(service_items::text) <= 12000),
  constraint commercial_offer_versions_price_nonnegative
    check (price_minor is null or price_minor >= 0),
  constraint commercial_offer_versions_currency_iso
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint commercial_offer_versions_publication_complete
    check (
      status <> 'published'::public.commercial_offer_version_status
      or (
        price_minor is not null
        and currency is not null
        and published_at is not null
        and jsonb_array_length(service_items) >= 1
      )
    ),
  constraint commercial_offer_versions_publish_time_consistent
    check (
      (status = 'published'::public.commercial_offer_version_status and published_at is not null)
      or (status <> 'published'::public.commercial_offer_version_status)
    )
);

create unique index if not exists commercial_offer_versions_one_published_idx
  on public.commercial_offer_versions (offer_id)
  where status = 'published'::public.commercial_offer_version_status;

create index if not exists commercial_offer_versions_offer_history_idx
  on public.commercial_offer_versions (offer_id, version desc);

alter table public.commercial_offers enable row level security;
alter table public.commercial_offer_versions enable row level security;

revoke all on table public.commercial_offers from anon;
revoke all on table public.commercial_offer_versions from anon;

grant select on table public.commercial_offers to authenticated;
grant select on table public.commercial_offer_versions to authenticated;

revoke insert, update, delete, truncate
  on table public.commercial_offers
  from authenticated;
revoke insert, update, delete, truncate
  on table public.commercial_offer_versions
  from authenticated;

grant select, insert, update on table public.commercial_offers to service_role;
grant select, insert, update on table public.commercial_offer_versions to service_role;
revoke delete, truncate on table public.commercial_offers from service_role;
revoke delete, truncate on table public.commercial_offer_versions from service_role;

create policy "published commercial offers authenticated read"
  on public.commercial_offers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.commercial_offer_versions v
      where v.offer_id = id
        and v.status = 'published'::public.commercial_offer_version_status
    )
    or (select public.is_admin())
  );

create policy "published commercial offer versions authenticated read"
  on public.commercial_offer_versions
  for select
  to authenticated
  using (
    status = 'published'::public.commercial_offer_version_status
    or (select public.is_admin())
  );

insert into public.commercial_offers (code)
values
  ('bronze'::public.commercial_offer_code),
  ('silver'::public.commercial_offer_code),
  ('gold'::public.commercial_offer_code)
on conflict (code) do nothing;
