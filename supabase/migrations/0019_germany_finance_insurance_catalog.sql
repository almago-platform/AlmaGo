-- LOT 8: verified factual catalogue for financing and insurance options.
create type public.finance_insurance_kind as enum (
  'blocked_account_provider',
  'health_insurance_provider',
  'student_financing_option'
);

create table public.finance_insurance_catalog (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null check (
    provider_name = btrim(provider_name)
    and char_length(provider_name) between 1 and 180
  ),
  product_name text check (
    product_name is null
    or (product_name = btrim(product_name) and char_length(product_name) between 1 and 180)
  ),
  kind public.finance_insurance_kind not null,
  description text check (
    description is null
    or (description = btrim(description) and char_length(description) between 1 and 4000)
  ),
  official_source_url text not null check (
    char_length(official_source_url) between 8 and 2048
    and official_source_url ~* '^https?://[^[:space:]]+$'
  ),
  application_url text check (
    application_url is null
    or (
      char_length(application_url) between 8 and 2048
      and application_url ~* '^https?://[^[:space:]]+$'
    )
  ),
  price_notes text check (
    price_notes is null
    or (price_notes = btrim(price_notes) and char_length(price_notes) between 1 and 2000)
  ),
  eligibility_notes text check (
    eligibility_notes is null
    or (eligibility_notes = btrim(eligibility_notes) and char_length(eligibility_notes) between 1 and 2000)
  ),
  verified_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index finance_insurance_catalog_published_kind_provider_idx
  on public.finance_insurance_catalog (kind, provider_name)
  where is_active and verified_at is not null;

alter table public.finance_insurance_catalog enable row level security;

create policy "finance insurance published or admin read"
  on public.finance_insurance_catalog
  for select to authenticated
  using (
    public.is_admin()
    or (
      is_active = true
      and verified_at is not null
      and verified_at <= now()
      and official_source_url ~* '^https?://[^[:space:]]+$'
      and (
        application_url is null
        or application_url ~* '^https?://[^[:space:]]+$'
      )
    )
  );

create policy "finance insurance admin insert"
  on public.finance_insurance_catalog
  for insert to authenticated
  with check (public.is_admin());

create policy "finance insurance admin update"
  on public.finance_insurance_catalog
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "finance insurance admin delete"
  on public.finance_insurance_catalog
  for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on table public.finance_insurance_catalog to authenticated;

drop trigger if exists finance_insurance_catalog_set_updated_at on public.finance_insurance_catalog;
create trigger finance_insurance_catalog_set_updated_at
  before update on public.finance_insurance_catalog
  for each row execute procedure public.set_updated_at();
