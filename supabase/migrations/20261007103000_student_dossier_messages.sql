-- Admin V10: in-app student <-> Campus Allemagne dossier messages.
-- Message content is student-visible; internal staff notes remain in student_case_notes.

create table if not exists public.student_dossier_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('student', 'admin')),
  body text not null check (char_length(btrim(body)) between 2 and 4000),
  student_read_at timestamptz,
  admin_read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists student_dossier_messages_student_created_idx
  on public.student_dossier_messages(student_id, created_at desc);

create index if not exists student_dossier_messages_student_unread_idx
  on public.student_dossier_messages(student_id, created_at desc)
  where sender_role = 'admin' and student_read_at is null;

create index if not exists student_dossier_messages_admin_unread_idx
  on public.student_dossier_messages(student_id, created_at desc)
  where sender_role = 'student' and admin_read_at is null;

alter table public.student_dossier_messages enable row level security;

drop policy if exists "student dossier messages own or admin read"
  on public.student_dossier_messages;
create policy "student dossier messages own or admin read"
  on public.student_dossier_messages
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "student dossier messages student insert"
  on public.student_dossier_messages;
create policy "student dossier messages student insert"
  on public.student_dossier_messages
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and sender_id = (select auth.uid())
    and sender_role = 'student'
  );

drop policy if exists "student dossier messages admin insert"
  on public.student_dossier_messages;
create policy "student dossier messages admin insert"
  on public.student_dossier_messages
  for insert to authenticated
  with check (
    (select public.is_admin())
    and sender_id = (select auth.uid())
    and sender_role = 'admin'
  );

grant select, insert on table public.student_dossier_messages to authenticated;

create or replace function private.validate_student_dossier_message()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  new.body := btrim(new.body);

  if new.sender_role = 'student' then
    if new.student_id <> auth.uid() or new.sender_id <> auth.uid() then
      raise exception 'invalid_student_sender';
    end if;
    new.student_read_at := coalesce(new.student_read_at, now());
    new.admin_read_at := null;
  elsif new.sender_role = 'admin' then
    if not public.is_admin() or new.sender_id <> auth.uid() then
      raise exception 'invalid_admin_sender';
    end if;
    new.admin_read_at := coalesce(new.admin_read_at, now());
    new.student_read_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists student_dossier_messages_validate
  on public.student_dossier_messages;
create trigger student_dossier_messages_validate
  before insert on public.student_dossier_messages
  for each row execute procedure private.validate_student_dossier_message();

revoke all on function private.validate_student_dossier_message()
  from public, anon, authenticated;

create or replace function public.student_mark_dossier_messages_read()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  changed integer;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  update public.student_dossier_messages
     set student_read_at = now()
   where student_id = auth.uid()
     and sender_role = 'admin'
     and student_read_at is null;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.student_mark_dossier_messages_read() from public, anon;
grant execute on function public.student_mark_dossier_messages_read() to authenticated;

create or replace function public.admin_mark_dossier_messages_read(p_student_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  changed integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin_required';
  end if;

  update public.student_dossier_messages
     set admin_read_at = now()
   where student_id = p_student_id
     and sender_role = 'student'
     and admin_read_at is null;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.admin_mark_dossier_messages_read(uuid) from public, anon;
grant execute on function public.admin_mark_dossier_messages_read(uuid) to authenticated;

create or replace function private.notify_student_dossier_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_admin uuid;
begin
  if new.sender_role = 'admin' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.student_id,
      'student_dossier_message',
      'Nouveau message Campus Allemagne',
      'Votre conseiller vous a envoyé un nouveau message dans votre dossier.',
      jsonb_build_object(
        'student_id', new.student_id,
        'message_id', new.id,
        'dedupe_key', 'student-dossier-message:' || new.id::text
      )
    )
    on conflict do nothing;
  else
    select assigned_admin_id
      into assigned_admin
      from public.student_case_assignments
     where student_id = new.student_id;

    if assigned_admin is not null then
      insert into public.notifications (user_id, type, title, body, metadata)
      values (
        assigned_admin,
        'admin_student_message',
        'Nouvelle réponse étudiant',
        'Un étudiant vous a répondu dans son dossier.',
        jsonb_build_object(
          'student_id', new.student_id,
          'message_id', new.id,
          'dedupe_key', 'admin-student-message:' || new.id::text || ':' || assigned_admin::text
        )
      )
      on conflict do nothing;
    else
      insert into public.notifications (user_id, type, title, body, metadata)
      select
        roles.user_id,
        'admin_student_message',
        'Nouvelle réponse étudiant',
        'Un étudiant sans conseiller attribué a répondu dans son dossier.',
        jsonb_build_object(
          'student_id', new.student_id,
          'message_id', new.id,
          'dedupe_key', 'admin-student-message:' || new.id::text || ':' || roles.user_id::text
        )
      from public.user_roles roles
      where roles.role = 'admin'
      on conflict do nothing;
    end if;
  end if;

  insert into public.technical_logs (
    actor_id,
    event_name,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'student_dossier_message_created',
    'student',
    new.student_id,
    jsonb_build_object(
      'message_id', new.id,
      'sender_role', new.sender_role
    )
  );

  return new;
end;
$$;

drop trigger if exists student_dossier_messages_notify
  on public.student_dossier_messages;
create trigger student_dossier_messages_notify
  after insert on public.student_dossier_messages
  for each row execute procedure private.notify_student_dossier_message();

revoke all on function private.notify_student_dossier_message()
  from public, anon, authenticated;
