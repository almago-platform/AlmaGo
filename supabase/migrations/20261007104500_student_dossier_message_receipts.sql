-- Admin V10 hardening: read receipts use RLS + column grants instead of exposed SECURITY DEFINER RPCs.

drop function if exists public.student_mark_dossier_messages_read();
drop function if exists public.admin_mark_dossier_messages_read(uuid);

drop policy if exists "student dossier messages student read receipt"
  on public.student_dossier_messages;
create policy "student dossier messages student read receipt"
  on public.student_dossier_messages
  for update to authenticated
  using (
    student_id = (select auth.uid())
    and sender_role = 'admin'
  )
  with check (
    student_id = (select auth.uid())
    and sender_role = 'admin'
  );

drop policy if exists "student dossier messages admin read receipt"
  on public.student_dossier_messages;
create policy "student dossier messages admin read receipt"
  on public.student_dossier_messages
  for update to authenticated
  using (
    (select public.is_admin())
    and sender_role = 'student'
  )
  with check (
    (select public.is_admin())
    and sender_role = 'student'
  );

revoke update on table public.student_dossier_messages from authenticated;
grant update (student_read_at, admin_read_at)
  on table public.student_dossier_messages
  to authenticated;

create or replace function private.validate_student_dossier_message_receipt()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if public.is_admin() then
    if old.sender_role <> 'student'
      or new.student_read_at is distinct from old.student_read_at
      or new.admin_read_at is null
      or (old.admin_read_at is not null and new.admin_read_at is distinct from old.admin_read_at)
    then
      raise exception 'invalid_admin_read_receipt';
    end if;
  else
    if old.student_id <> auth.uid()
      or old.sender_role <> 'admin'
      or new.admin_read_at is distinct from old.admin_read_at
      or new.student_read_at is null
      or (old.student_read_at is not null and new.student_read_at is distinct from old.student_read_at)
    then
      raise exception 'invalid_student_read_receipt';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists student_dossier_messages_validate_receipt
  on public.student_dossier_messages;
create trigger student_dossier_messages_validate_receipt
  before update on public.student_dossier_messages
  for each row execute procedure private.validate_student_dossier_message_receipt();

revoke all on function private.validate_student_dossier_message_receipt()
  from public, anon, authenticated;
