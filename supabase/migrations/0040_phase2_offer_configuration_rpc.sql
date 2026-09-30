-- P2.8B: audited, append-oriented offer configuration and publication.
-- All application writes go through this service-role-only RPC.

create or replace function public.configure_phase2_commercial_offer(
  p_admin_user_id uuid,
  p_offer_code public.commercial_offer_code,
  p_publish boolean,
  p_display_name text,
  p_summary text,
  p_service_items text[],
  p_price_minor bigint,
  p_currency text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offer_id uuid;
  v_next_version integer;
  v_new_version_id uuid;
  v_status public.commercial_offer_version_status;
  v_text text;
  v_joined text;
begin
  if p_admin_user_id is null
    or p_offer_code is null
    or p_publish is null
    or p_display_name is null
    or char_length(btrim(p_display_name)) not between 1 and 80
    or p_summary is null
    or char_length(btrim(p_summary)) not between 1 and 500
    or p_service_items is null
    or cardinality(p_service_items) not between 1 and 20
  then
    return null;
  end if;

  if p_publish and (
    p_price_minor is null
    or p_price_minor < 0
    or p_currency is null
    or p_currency !~ '^[A-Z]{3}$'
  ) then
    return null;
  end if;

  if not p_publish and (
    (p_price_minor is not null and p_price_minor < 0)
    or (p_currency is not null and p_currency !~ '^[A-Z]{3}$')
  ) then
    return null;
  end if;

  foreach v_text in array p_service_items loop
    if v_text is null or char_length(btrim(v_text)) not between 1 and 200 then
      return null;
    end if;
  end loop;

  v_joined := lower(
    btrim(p_display_name) || ' ' ||
    btrim(p_summary) || ' ' ||
    array_to_string(p_service_items, ' ')
  );

  -- Fail closed on obvious prohibited commercial guarantees.
  if v_joined ~ '(admission|visa|zulassung|visum|قبول|تأشيرة).{0,40}(garant|guarante|مضمون)'
    or v_joined ~ '(garant|guarante|مضمون).{0,40}(admission|visa|zulassung|visum|قبول|تأشيرة)'
  then
    return null;
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_admin_user_id
      and ur.role = 'admin'
  ) then
    return null;
  end if;

  select o.id
    into v_offer_id
  from public.commercial_offers o
  where o.code = p_offer_code
  for update;

  if not found then
    return null;
  end if;

  select coalesce(max(v.version), 0) + 1
    into v_next_version
  from public.commercial_offer_versions v
  where v.offer_id = v_offer_id;

  v_status := case
    when p_publish then 'published'::public.commercial_offer_version_status
    else 'draft'::public.commercial_offer_version_status
  end;

  if p_publish then
    update public.commercial_offer_versions
      set status = 'retired'::public.commercial_offer_version_status
    where offer_id = v_offer_id
      and status = 'published'::public.commercial_offer_version_status;
  end if;

  insert into public.commercial_offer_versions (
    offer_id,
    version,
    status,
    display_name,
    summary,
    service_items,
    price_minor,
    currency,
    published_at
  )
  values (
    v_offer_id,
    v_next_version,
    v_status,
    btrim(p_display_name),
    btrim(p_summary),
    to_jsonb(p_service_items),
    p_price_minor,
    case when p_currency is null then null else upper(p_currency) end,
    case when p_publish then now() else null end
  )
  returning id into v_new_version_id;

  return v_new_version_id;
end;
$$;

-- Application code must use the audited function rather than direct mutations.
revoke insert, update, delete, truncate
  on table public.commercial_offers
  from service_role;
revoke insert, update, delete, truncate
  on table public.commercial_offer_versions
  from service_role;
grant select on table public.commercial_offers to service_role;
grant select on table public.commercial_offer_versions to service_role;

revoke execute on function public.configure_phase2_commercial_offer(
  uuid,
  public.commercial_offer_code,
  boolean,
  text,
  text,
  text[],
  bigint,
  text
) from public, anon, authenticated;

grant execute on function public.configure_phase2_commercial_offer(
  uuid,
  public.commercial_offer_code,
  boolean,
  text,
  text,
  text[],
  bigint,
  text
) to service_role;
