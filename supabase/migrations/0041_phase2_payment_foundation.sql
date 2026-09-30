-- P2.9A: provider-neutral purchase/payment persistence.
-- No provider is selected and no checkout/webhook/client activation is implemented here.

do $$
begin
  create type public.commercial_purchase_status as enum (
    'payment_pending',
    'paid_pending_validation',
    'client_active',
    'cancelled',
    'refunded'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_attempt_status as enum (
    'created',
    'pending',
    'succeeded',
    'failed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_transaction_kind as enum (
    'charge',
    'refund',
    'dispute'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_transaction_status as enum (
    'pending',
    'succeeded',
    'failed'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_provider_event_status as enum (
    'received',
    'processed',
    'ignored',
    'failed'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.commercial_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  offer_version_id uuid not null references public.commercial_offer_versions(id) on delete restrict,
  offer_snapshot jsonb not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status public.commercial_purchase_status not null default 'payment_pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commercial_purchases_offer_snapshot_object
    check (jsonb_typeof(offer_snapshot) = 'object'),
  constraint commercial_purchases_offer_snapshot_bounded
    check (octet_length(offer_snapshot::text) <= 16000)
);

create index if not exists commercial_purchases_user_history_idx
  on public.commercial_purchases (user_id, created_at desc);
create index if not exists commercial_purchases_offer_version_idx
  on public.commercial_purchases (offer_version_id, created_at desc);

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.commercial_purchases(id) on delete restrict,
  provider text not null check (char_length(btrim(provider)) between 1 and 80),
  idempotency_key text not null unique
    check (char_length(idempotency_key) between 16 and 160),
  provider_session_id text
    check (provider_session_id is null or char_length(provider_session_id) between 1 and 240),
  status public.payment_attempt_status not null default 'created',
  failure_code text
    check (failure_code is null or char_length(failure_code) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_attempts_purchase_history_idx
  on public.payment_attempts (purchase_id, created_at desc);
create unique index if not exists payment_attempts_provider_session_unique_idx
  on public.payment_attempts (provider, provider_session_id)
  where provider_session_id is not null;

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.payment_attempts(id) on delete restrict,
  provider_transaction_id text
    check (
      provider_transaction_id is null
      or char_length(provider_transaction_id) between 1 and 240
    ),
  kind public.payment_transaction_kind not null,
  status public.payment_transaction_status not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists payment_transactions_attempt_history_idx
  on public.payment_transactions (attempt_id, occurred_at desc);
create unique index if not exists payment_transactions_provider_id_unique_idx
  on public.payment_transactions (provider_transaction_id)
  where provider_transaction_id is not null;

create table if not exists public.payment_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (char_length(btrim(provider)) between 1 and 80),
  provider_event_id text not null
    check (char_length(provider_event_id) between 1 and 240),
  event_type text not null
    check (char_length(event_type) between 1 and 160),
  payload_sha256 text not null
    check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  status public.payment_provider_event_status not null default 'received',
  processing_error_code text
    check (
      processing_error_code is null
      or char_length(processing_error_code) between 1 and 120
    ),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint payment_provider_events_provider_event_unique
    unique (provider, provider_event_id)
);

create index if not exists payment_provider_events_status_idx
  on public.payment_provider_events (status, received_at);

create table if not exists public.customer_access_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  previous_status public.customer_lifecycle_status,
  next_status public.customer_lifecycle_status not null,
  source text not null check (char_length(source) between 1 and 80),
  purchase_id uuid references public.commercial_purchases(id) on delete restrict,
  payment_transaction_id uuid references public.payment_transactions(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists customer_access_events_user_history_idx
  on public.customer_access_events (user_id, created_at desc);

alter table public.commercial_purchases enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_provider_events enable row level security;
alter table public.customer_access_events enable row level security;

revoke all on table public.commercial_purchases from anon;
revoke all on table public.payment_attempts from anon;
revoke all on table public.payment_transactions from anon;
revoke all on table public.payment_provider_events from anon;
revoke all on table public.customer_access_events from anon;

grant select on table public.commercial_purchases to authenticated;
grant select on table public.payment_attempts to authenticated;
grant select on table public.payment_transactions to authenticated;
grant select on table public.customer_access_events to authenticated;
revoke all on table public.payment_provider_events from authenticated;

revoke insert, update, delete, truncate
  on table public.commercial_purchases
  from authenticated;
revoke insert, update, delete, truncate
  on table public.payment_attempts
  from authenticated;
revoke insert, update, delete, truncate
  on table public.payment_transactions
  from authenticated;
revoke insert, update, delete, truncate
  on table public.customer_access_events
  from authenticated;

grant select, insert, update on table public.commercial_purchases to service_role;
grant select, insert, update on table public.payment_attempts to service_role;
grant select, insert on table public.payment_transactions to service_role;
grant select, insert, update on table public.payment_provider_events to service_role;
grant select, insert on table public.customer_access_events to service_role;

revoke delete, truncate on table public.commercial_purchases from service_role;
revoke delete, truncate on table public.payment_attempts from service_role;
revoke update, delete, truncate on table public.payment_transactions from service_role;
revoke delete, truncate on table public.payment_provider_events from service_role;
revoke update, delete, truncate on table public.customer_access_events from service_role;

create policy "purchase owner or admin read"
  on public.commercial_purchases
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );

create policy "payment attempt owner or admin read"
  on public.payment_attempts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.commercial_purchases p
      where p.id = purchase_id
        and p.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

create policy "payment transaction owner or admin read"
  on public.payment_transactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.payment_attempts a
      join public.commercial_purchases p on p.id = a.purchase_id
      where a.id = attempt_id
        and p.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

create policy "customer access event owner or admin read"
  on public.customer_access_events
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );
