-- P2.4: atomically attach an existing prospect/orientation to an authenticated account.
-- The caller must be a trusted backend using the Supabase secret/service role.
-- The function independently verifies the auth.users identity and prospect email.

create or replace function public.claim_phase2_orientation(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_orientation_id uuid;
  v_prospect_id uuid;
  v_linked_user_id uuid;
begin
  if p_token_hash is null
    or char_length(p_token_hash) <> 64
    or p_user_id is null
    or p_user_email is null
    or char_length(trim(p_user_email)) < 3
  then
    return null;
  end if;

  if not exists (
    select 1
    from auth.users u
    where u.id = p_user_id
      and u.email is not null
      and lower(u.email) = lower(trim(p_user_email))
  ) then
    return null;
  end if;

  select o.id, p.id, p.user_id
    into v_orientation_id, v_prospect_id, v_linked_user_id
  from public.orientations o
  join public.prospects p on p.id = o.prospect_id
  where o.resume_token_hash = p_token_hash
    and o.resume_token_expires_at is not null
    and o.resume_token_expires_at > now()
    and lower(p.email) = lower(trim(p_user_email))
  for update of p;

  if not found then
    return null;
  end if;

  if v_linked_user_id is not null and v_linked_user_id <> p_user_id then
    return null;
  end if;

  if exists (
    select 1
    from public.prospects other
    where other.user_id = p_user_id
      and other.id <> v_prospect_id
  ) then
    return null;
  end if;

  update public.prospects
  set user_id = p_user_id,
      updated_at = now()
  where id = v_prospect_id
    and (user_id is null or user_id = p_user_id);

  if not found then
    return null;
  end if;

  insert into public.customer_access (user_id, status)
  values (p_user_id, 'prospect_account')
  on conflict (user_id) do nothing;

  return v_orientation_id;
end;
$$;

revoke execute on function public.claim_phase2_orientation(text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_phase2_orientation(text, uuid, text)
  to service_role;
