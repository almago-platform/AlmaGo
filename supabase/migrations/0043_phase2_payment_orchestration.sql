-- P2.9B: provider-neutral payment orchestration and audited client activation.
-- No production payment provider, checkout URL, webhook route or API credential is selected here.

create unique index if not exists commercial_purchases_one_live_per_user_idx
  on public.commercial_purchases (user_id)
  where status in (
    'payment_pending'::public.commercial_purchase_status,
    'paid_pending_validation'::public.commercial_purchase_status,
    'client_active'::public.commercial_purchase_status
  );

create or replace function public.begin_phase2_commercial_purchase(
  p_user_id uuid,
  p_offer_version_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_access_status public.customer_lifecycle_status;
  v_existing_purchase_id uuid;
  v_existing_offer_version_id uuid;
  v_offer_id uuid;
  v_offer_code public.commercial_offer_code;
  v_offer_version integer;
  v_display_name text;
  v_summary text;
  v_service_items jsonb;
  v_amount_minor bigint;
  v_currency text;
  v_published_at timestamptz;
  v_purchase_id uuid;
begin
  if p_user_id is null or p_offer_version_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_user_id
      and ur.role = 'student'
  ) then
    return null;
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = p_user_id
  for update;

  if not found then
    return null;
  end if;

  if v_access_status = 'payment_pending'::public.customer_lifecycle_status then
    select p.id, p.offer_version_id
      into v_existing_purchase_id, v_existing_offer_version_id
    from public.commercial_purchases p
    where p.user_id = p_user_id
      and p.status = 'payment_pending'::public.commercial_purchase_status
    order by p.created_at desc
    limit 1
    for update;

    if v_existing_purchase_id is not null
      and v_existing_offer_version_id = p_offer_version_id
    then
      return v_existing_purchase_id;
    end if;

    return null;
  end if;

  if v_access_status <> 'qualified_prospect'::public.customer_lifecycle_status then
    return null;
  end if;

  select
    v.offer_id,
    o.code,
    v.version,
    v.display_name,
    v.summary,
    v.service_items,
    v.price_minor,
    v.currency,
    v.published_at
  into
    v_offer_id,
    v_offer_code,
    v_offer_version,
    v_display_name,
    v_summary,
    v_service_items,
    v_amount_minor,
    v_currency,
    v_published_at
  from public.commercial_offer_versions v
  join public.commercial_offers o on o.id = v.offer_id
  where v.id = p_offer_version_id
    and v.status = 'published'::public.commercial_offer_version_status
    and v.price_minor is not null
    and v.price_minor >= 0
    and v.currency ~ '^[A-Z]{3}$'
  for share of v, o;

  if not found then
    return null;
  end if;

  insert into public.commercial_purchases (
    user_id,
    offer_version_id,
    offer_snapshot,
    amount_minor,
    currency,
    status
  )
  values (
    p_user_id,
    p_offer_version_id,
    jsonb_build_object(
      'offer_id', v_offer_id,
      'offer_code', v_offer_code,
      'offer_version_id', p_offer_version_id,
      'version', v_offer_version,
      'display_name', v_display_name,
      'summary', v_summary,
      'service_items', v_service_items,
      'price_minor', v_amount_minor,
      'currency', v_currency,
      'published_at', v_published_at
    ),
    v_amount_minor,
    v_currency,
    'payment_pending'::public.commercial_purchase_status
  )
  returning id into v_purchase_id;

  update public.customer_access
    set
      status = 'payment_pending'::public.customer_lifecycle_status,
      status_changed_at = now(),
      updated_at = now()
  where user_id = p_user_id
    and status = 'qualified_prospect'::public.customer_lifecycle_status;

  if not found then
    raise exception 'phase2_customer_access_transition_conflict';
  end if;

  insert into public.customer_access_events (
    user_id,
    previous_status,
    next_status,
    source,
    purchase_id
  )
  values (
    p_user_id,
    'qualified_prospect'::public.customer_lifecycle_status,
    'payment_pending'::public.customer_lifecycle_status,
    'purchase_created',
    v_purchase_id
  );

  return v_purchase_id;
exception
  when unique_violation then
    select p.id
      into v_existing_purchase_id
    from public.commercial_purchases p
    where p.user_id = p_user_id
      and p.offer_version_id = p_offer_version_id
      and p.status = 'payment_pending'::public.commercial_purchase_status
    order by p.created_at desc
    limit 1;

    return v_existing_purchase_id;
end;
$$;

create or replace function public.begin_phase2_payment_attempt(
  p_user_id uuid,
  p_purchase_id uuid,
  p_provider text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider text;
  v_purchase_status public.commercial_purchase_status;
  v_existing_id uuid;
  v_existing_purchase_id uuid;
  v_existing_provider text;
  v_attempt_id uuid;
begin
  v_provider := lower(btrim(coalesce(p_provider, '')));

  if p_user_id is null
    or p_purchase_id is null
    or v_provider !~ '^[a-z0-9][a-z0-9_-]{0,39}$'
    or p_idempotency_key is null
    or char_length(p_idempotency_key) not between 16 and 160
  then
    return null;
  end if;

  select p.status
    into v_purchase_status
  from public.commercial_purchases p
  where p.id = p_purchase_id
    and p.user_id = p_user_id
  for update;

  if not found or v_purchase_status <> 'payment_pending'::public.commercial_purchase_status then
    return null;
  end if;

  select a.id, a.purchase_id, a.provider
    into v_existing_id, v_existing_purchase_id, v_existing_provider
  from public.payment_attempts a
  where a.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_purchase_id = p_purchase_id
      and v_existing_provider = v_provider
    then
      return v_existing_id;
    end if;

    return null;
  end if;

  insert into public.payment_attempts (
    purchase_id,
    provider,
    idempotency_key,
    status
  )
  values (
    p_purchase_id,
    v_provider,
    p_idempotency_key,
    'pending'::public.payment_attempt_status
  )
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;

create or replace function public.bind_phase2_payment_attempt_session(
  p_attempt_id uuid,
  p_provider text,
  p_provider_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider text;
  v_current_provider text;
  v_current_session text;
begin
  v_provider := lower(btrim(coalesce(p_provider, '')));

  if p_attempt_id is null
    or v_provider !~ '^[a-z0-9][a-z0-9_-]{0,39}$'
    or p_provider_session_id is null
    or char_length(p_provider_session_id) not between 1 and 240
  then
    return false;
  end if;

  select a.provider, a.provider_session_id
    into v_current_provider, v_current_session
  from public.payment_attempts a
  where a.id = p_attempt_id
  for update;

  if not found or v_current_provider <> v_provider then
    return false;
  end if;

  if v_current_session is not null then
    return v_current_session = p_provider_session_id;
  end if;

  update public.payment_attempts
    set provider_session_id = p_provider_session_id,
        updated_at = now()
  where id = p_attempt_id
    and provider_session_id is null;

  return found;
exception
  when unique_violation then
    return false;
end;
$$;

create or replace function public.process_phase2_normalized_payment_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_payload_sha256 text,
  p_attempt_id uuid,
  p_purchase_id uuid,
  p_amount_minor bigint,
  p_currency text,
  p_provider_transaction_id text,
  p_occurred_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider text;
  v_currency text;
  v_event_id uuid;
  v_existing_hash text;
  v_existing_event_status public.payment_provider_event_status;
  v_attempt_provider text;
  v_attempt_status public.payment_attempt_status;
  v_user_id uuid;
  v_purchase_status public.commercial_purchase_status;
  v_purchase_amount bigint;
  v_purchase_currency text;
  v_access_status public.customer_lifecycle_status;
  v_transaction_id uuid;
  v_existing_tx_attempt uuid;
  v_existing_tx_kind public.payment_transaction_kind;
  v_existing_tx_status public.payment_transaction_status;
  v_existing_tx_amount bigint;
  v_existing_tx_currency text;
  v_target_purchase_status public.commercial_purchase_status;
  v_target_access_status public.customer_lifecycle_status;
  v_audit_source text;
begin
  v_provider := lower(btrim(coalesce(p_provider, '')));
  v_currency := upper(btrim(coalesce(p_currency, '')));

  if v_provider !~ '^[a-z0-9][a-z0-9_-]{0,39}$'
    or p_provider_event_id is null
    or char_length(p_provider_event_id) not between 1 and 240
    or p_event_type not in (
      'charge_succeeded',
      'charge_failed',
      'payment_cancelled',
      'refund_succeeded',
      'dispute_opened'
    )
    or p_payload_sha256 !~ '^[0-9a-f]{64}$'
    or p_attempt_id is null
    or p_purchase_id is null
    or p_amount_minor is null
    or p_amount_minor < 0
    or v_currency !~ '^[A-Z]{3}$'
    or p_occurred_at is null
    or (
      p_provider_transaction_id is not null
      and char_length(p_provider_transaction_id) not between 1 and 240
    )
  then
    return null;
  end if;

  if p_event_type in ('charge_succeeded', 'refund_succeeded', 'dispute_opened')
    and p_provider_transaction_id is null
  then
    return null;
  end if;

  select e.id, e.payload_sha256, e.status
    into v_event_id, v_existing_hash, v_existing_event_status
  from public.payment_provider_events e
  where e.provider = v_provider
    and e.provider_event_id = p_provider_event_id
  for update;

  if found then
    if v_existing_hash <> p_payload_sha256 then
      return null;
    end if;

    if v_existing_event_status in (
      'processed'::public.payment_provider_event_status,
      'ignored'::public.payment_provider_event_status
    ) then
      select p.status::text
        into v_audit_source
      from public.commercial_purchases p
      where p.id = p_purchase_id;
      return v_audit_source;
    end if;

    if v_existing_event_status = 'failed'::public.payment_provider_event_status then
      return null;
    end if;
  else
    insert into public.payment_provider_events (
      provider,
      provider_event_id,
      event_type,
      payload_sha256,
      status
    )
    values (
      v_provider,
      p_provider_event_id,
      p_event_type,
      p_payload_sha256,
      'received'::public.payment_provider_event_status
    )
    returning id into v_event_id;
  end if;

  select
    a.provider,
    a.status,
    p.user_id,
    p.status,
    p.amount_minor,
    p.currency
  into
    v_attempt_provider,
    v_attempt_status,
    v_user_id,
    v_purchase_status,
    v_purchase_amount,
    v_purchase_currency
  from public.payment_attempts a
  join public.commercial_purchases p on p.id = a.purchase_id
  where a.id = p_attempt_id
    and p.id = p_purchase_id
  for update of a, p;

  if not found
    or v_attempt_provider <> v_provider
    or v_purchase_amount <> p_amount_minor
    or v_purchase_currency <> v_currency
  then
    update public.payment_provider_events
      set status = 'failed'::public.payment_provider_event_status,
          processing_error_code = 'payment_context_mismatch',
          processed_at = now()
    where id = v_event_id;
    return null;
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = v_user_id
  for update;

  if not found then
    update public.payment_provider_events
      set status = 'failed'::public.payment_provider_event_status,
          processing_error_code = 'customer_access_missing',
          processed_at = now()
    where id = v_event_id;
    return null;
  end if;

  if p_provider_transaction_id is not null then
    select
      t.id,
      t.attempt_id,
      t.kind,
      t.status,
      t.amount_minor,
      t.currency
    into
      v_transaction_id,
      v_existing_tx_attempt,
      v_existing_tx_kind,
      v_existing_tx_status,
      v_existing_tx_amount,
      v_existing_tx_currency
    from public.payment_transactions t
    where t.provider_transaction_id = p_provider_transaction_id;

    if found and (
      v_existing_tx_attempt <> p_attempt_id
      or v_existing_tx_amount <> p_amount_minor
      or v_existing_tx_currency <> v_currency
    ) then
      update public.payment_provider_events
        set status = 'failed'::public.payment_provider_event_status,
            processing_error_code = 'transaction_context_mismatch',
            processed_at = now()
      where id = v_event_id;
      return null;
    end if;
  end if;

  if p_event_type = 'charge_succeeded' then
    if v_transaction_id is not null and (
      v_existing_tx_kind <> 'charge'::public.payment_transaction_kind
      or v_existing_tx_status <> 'succeeded'::public.payment_transaction_status
    ) then
      update public.payment_provider_events
        set status = 'failed'::public.payment_provider_event_status,
            processing_error_code = 'transaction_kind_mismatch',
            processed_at = now()
      where id = v_event_id;
      return null;
    end if;

    if v_purchase_status in (
      'paid_pending_validation'::public.commercial_purchase_status,
      'client_active'::public.commercial_purchase_status
    ) and v_transaction_id is not null then
      update public.payment_provider_events
        set status = 'ignored'::public.payment_provider_event_status,
            processing_error_code = null,
            processed_at = now()
      where id = v_event_id;
      return v_purchase_status::text;
    end if;

    if v_purchase_status <> 'payment_pending'::public.commercial_purchase_status
      or v_access_status <> 'payment_pending'::public.customer_lifecycle_status
    then
      update public.payment_provider_events
        set status = 'failed'::public.payment_provider_event_status,
            processing_error_code = 'invalid_charge_transition',
            processed_at = now()
      where id = v_event_id;
      return null;
    end if;

    if v_transaction_id is null then
      insert into public.payment_transactions (
        attempt_id,
        provider_transaction_id,
        kind,
        status,
        amount_minor,
        currency,
        occurred_at
      )
      values (
        p_attempt_id,
        p_provider_transaction_id,
        'charge'::public.payment_transaction_kind,
        'succeeded'::public.payment_transaction_status,
        p_amount_minor,
        v_currency,
        p_occurred_at
      )
      returning id into v_transaction_id;
    end if;

    update public.payment_attempts
      set status = 'succeeded'::public.payment_attempt_status,
          failure_code = null,
          updated_at = now()
    where id = p_attempt_id;

    update public.commercial_purchases
      set status = 'paid_pending_validation'::public.commercial_purchase_status,
          updated_at = now()
    where id = p_purchase_id;

    update public.customer_access
      set status = 'paid_pending_validation'::public.customer_lifecycle_status,
          status_changed_at = now(),
          updated_at = now()
    where user_id = v_user_id;

    insert into public.customer_access_events (
      user_id,
      previous_status,
      next_status,
      source,
      purchase_id,
      payment_transaction_id
    )
    values (
      v_user_id,
      'payment_pending'::public.customer_lifecycle_status,
      'paid_pending_validation'::public.customer_lifecycle_status,
      'payment_charge_confirmed',
      p_purchase_id,
      v_transaction_id
    );

    v_target_purchase_status := 'paid_pending_validation'::public.commercial_purchase_status;

  elsif p_event_type = 'charge_failed' then
    if v_purchase_status <> 'payment_pending'::public.commercial_purchase_status then
      update public.payment_provider_events
        set status = 'ignored'::public.payment_provider_event_status,
            processing_error_code = null,
            processed_at = now()
      where id = v_event_id;
      return v_purchase_status::text;
    end if;

    if v_transaction_id is null then
      insert into public.payment_transactions (
        attempt_id,
        provider_transaction_id,
        kind,
        status,
        amount_minor,
        currency,
        occurred_at
      )
      values (
        p_attempt_id,
        p_provider_transaction_id,
        'charge'::public.payment_transaction_kind,
        'failed'::public.payment_transaction_status,
        p_amount_minor,
        v_currency,
        p_occurred_at
      )
      returning id into v_transaction_id;
    end if;

    update public.payment_attempts
      set status = 'failed'::public.payment_attempt_status,
          failure_code = 'provider_charge_failed',
          updated_at = now()
    where id = p_attempt_id;

    v_target_purchase_status := 'payment_pending'::public.commercial_purchase_status;

  elsif p_event_type = 'payment_cancelled' then
    if v_purchase_status = 'cancelled'::public.commercial_purchase_status then
      update public.payment_provider_events
        set status = 'ignored'::public.payment_provider_event_status,
            processing_error_code = null,
            processed_at = now()
      where id = v_event_id;
      return v_purchase_status::text;
    end if;

    if v_purchase_status <> 'payment_pending'::public.commercial_purchase_status
      or v_access_status <> 'payment_pending'::public.customer_lifecycle_status
    then
      update public.payment_provider_events
        set status = 'failed'::public.payment_provider_event_status,
            processing_error_code = 'invalid_cancel_transition',
            processed_at = now()
      where id = v_event_id;
      return null;
    end if;

    update public.payment_attempts
      set status = 'cancelled'::public.payment_attempt_status,
          updated_at = now()
    where id = p_attempt_id;

    update public.commercial_purchases
      set status = 'cancelled'::public.commercial_purchase_status,
          updated_at = now()
    where id = p_purchase_id;

    update public.customer_access
      set status = 'qualified_prospect'::public.customer_lifecycle_status,
          status_changed_at = now(),
          updated_at = now()
    where user_id = v_user_id;

    insert into public.customer_access_events (
      user_id,
      previous_status,
      next_status,
      source,
      purchase_id
    )
    values (
      v_user_id,
      'payment_pending'::public.customer_lifecycle_status,
      'qualified_prospect'::public.customer_lifecycle_status,
      'payment_cancelled',
      p_purchase_id
    );

    v_target_purchase_status := 'cancelled'::public.commercial_purchase_status;

  elsif p_event_type in ('refund_succeeded', 'dispute_opened') then
    if p_event_type = 'refund_succeeded' then
      v_target_purchase_status := 'refunded'::public.commercial_purchase_status;
      v_audit_source := 'payment_refund';
    else
      v_target_purchase_status := 'cancelled'::public.commercial_purchase_status;
      v_audit_source := 'payment_dispute';
    end if;

    if v_purchase_status = v_target_purchase_status and v_transaction_id is not null then
      update public.payment_provider_events
        set status = 'ignored'::public.payment_provider_event_status,
            processing_error_code = null,
            processed_at = now()
      where id = v_event_id;
      return v_purchase_status::text;
    end if;

    if v_purchase_status not in (
      'paid_pending_validation'::public.commercial_purchase_status,
      'client_active'::public.commercial_purchase_status
    )
      or v_access_status not in (
        'paid_pending_validation'::public.customer_lifecycle_status,
        'client_active'::public.customer_lifecycle_status,
        'client_completed'::public.customer_lifecycle_status
      )
    then
      update public.payment_provider_events
        set status = 'failed'::public.payment_provider_event_status,
            processing_error_code = 'invalid_reversal_transition',
            processed_at = now()
      where id = v_event_id;
      return null;
    end if;

    if v_transaction_id is null then
      insert into public.payment_transactions (
        attempt_id,
        provider_transaction_id,
        kind,
        status,
        amount_minor,
        currency,
        occurred_at
      )
      values (
        p_attempt_id,
        p_provider_transaction_id,
        case
          when p_event_type = 'refund_succeeded'
            then 'refund'::public.payment_transaction_kind
          else 'dispute'::public.payment_transaction_kind
        end,
        'succeeded'::public.payment_transaction_status,
        p_amount_minor,
        v_currency,
        p_occurred_at
      )
      returning id into v_transaction_id;
    end if;

    update public.commercial_purchases
      set status = v_target_purchase_status,
          updated_at = now()
    where id = p_purchase_id;

    v_target_access_status := 'qualified_prospect'::public.customer_lifecycle_status;

    update public.customer_access
      set status = v_target_access_status,
          status_changed_at = now(),
          updated_at = now()
    where user_id = v_user_id;

    insert into public.customer_access_events (
      user_id,
      previous_status,
      next_status,
      source,
      purchase_id,
      payment_transaction_id
    )
    values (
      v_user_id,
      v_access_status,
      v_target_access_status,
      v_audit_source,
      p_purchase_id,
      v_transaction_id
    );
  end if;

  update public.payment_provider_events
    set status = 'processed'::public.payment_provider_event_status,
        processing_error_code = null,
        processed_at = now()
  where id = v_event_id;

  return v_target_purchase_status::text;
end;
$$;

create or replace function public.activate_phase2_paid_purchase(
  p_admin_user_id uuid,
  p_purchase_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_purchase_status public.commercial_purchase_status;
  v_amount_minor bigint;
  v_currency text;
  v_access_status public.customer_lifecycle_status;
begin
  if p_admin_user_id is null or p_purchase_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_admin_user_id
      and ur.role = 'admin'
  ) then
    return false;
  end if;

  select p.user_id, p.status, p.amount_minor, p.currency
    into v_user_id, v_purchase_status, v_amount_minor, v_currency
  from public.commercial_purchases p
  where p.id = p_purchase_id
  for update;

  if not found then
    return false;
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = v_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_purchase_status = 'client_active'::public.commercial_purchase_status
    and v_access_status in (
      'client_active'::public.customer_lifecycle_status,
      'client_completed'::public.customer_lifecycle_status
    )
  then
    return true;
  end if;

  if v_purchase_status <> 'paid_pending_validation'::public.commercial_purchase_status
    or v_access_status <> 'paid_pending_validation'::public.customer_lifecycle_status
  then
    return false;
  end if;

  if not exists (
    select 1
    from public.payment_transactions t
    join public.payment_attempts a on a.id = t.attempt_id
    where a.purchase_id = p_purchase_id
      and t.kind = 'charge'::public.payment_transaction_kind
      and t.status = 'succeeded'::public.payment_transaction_status
      and t.amount_minor = v_amount_minor
      and t.currency = v_currency
  ) then
    return false;
  end if;

  update public.commercial_purchases
    set status = 'client_active'::public.commercial_purchase_status,
        updated_at = now()
  where id = p_purchase_id;

  update public.customer_access
    set status = 'client_active'::public.customer_lifecycle_status,
        status_changed_at = now(),
        updated_at = now()
  where user_id = v_user_id;

  insert into public.customer_access_events (
    user_id,
    previous_status,
    next_status,
    source,
    purchase_id
  )
  values (
    v_user_id,
    'paid_pending_validation'::public.customer_lifecycle_status,
    'client_active'::public.customer_lifecycle_status,
    'admin_payment_validation',
    p_purchase_id
  );

  return true;
end;
$$;

-- Application writes must flow through the state-machine RPCs.
revoke insert, update, delete, truncate
  on table public.commercial_purchases
  from service_role;
revoke insert, update, delete, truncate
  on table public.payment_attempts
  from service_role;
revoke insert, update, delete, truncate
  on table public.payment_transactions
  from service_role;
revoke insert, update, delete, truncate
  on table public.payment_provider_events
  from service_role;
revoke insert, update, delete, truncate
  on table public.customer_access_events
  from service_role;

grant select on table public.commercial_purchases to service_role;
grant select on table public.payment_attempts to service_role;
grant select on table public.payment_transactions to service_role;
grant select on table public.payment_provider_events to service_role;
grant select on table public.customer_access_events to service_role;
grant select on table public.commercial_offers to service_role;
grant select on table public.commercial_offer_versions to service_role;
grant select on table public.customer_access to service_role;
grant select on table public.user_roles to service_role;

revoke execute on function public.begin_phase2_commercial_purchase(uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.begin_phase2_payment_attempt(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke execute on function public.bind_phase2_payment_attempt_session(uuid, text, text)
  from public, anon, authenticated;
revoke execute on function public.process_phase2_normalized_payment_event(
  text, text, text, text, uuid, uuid, bigint, text, text, timestamptz
)
  from public, anon, authenticated;
revoke execute on function public.activate_phase2_paid_purchase(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.begin_phase2_commercial_purchase(uuid, uuid)
  to service_role;
grant execute on function public.begin_phase2_payment_attempt(uuid, uuid, text, text)
  to service_role;
grant execute on function public.bind_phase2_payment_attempt_session(uuid, text, text)
  to service_role;
grant execute on function public.process_phase2_normalized_payment_event(
  text, text, text, text, uuid, uuid, bigint, text, text, timestamptz
)
  to service_role;
grant execute on function public.activate_phase2_paid_purchase(uuid, uuid)
  to service_role;
