-- Admin receipts for student-side intake actions.
-- The intake row remains the source of truth; notifications make the response
-- visible to every admin without copying student PII into notification text.

create or replace function private.notify_admins_on_intake_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_title text;
  v_body text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'student_question' then
    v_type := 'admin_student_question';
    v_title := 'Réponse étudiant reçue';
    v_body := 'Un étudiant souhaite discuter de la proposition Campus Allemagne.';
  elsif new.status = 'payment_pending' then
    v_type := 'admin_route_accepted';
    v_title := 'Proposition acceptée';
    v_body := 'Un étudiant a accepté la proposition. Le paiement est maintenant attendu.';
  elsif new.status = 'paid_pending_validation' then
    v_type := 'admin_payment_validation_required';
    v_title := 'Paiement à valider';
    v_body := 'Un paiement étudiant a été reçu et attend la validation Campus Allemagne.';
  else
    return new;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    metadata
  )
  select
    roles.user_id,
    v_type,
    v_title,
    v_body,
    jsonb_build_object(
      'student_id', new.student_id,
      'intake_status', new.status
    )
  from public.user_roles roles
  where roles.role = 'admin';

  return new;
end;
$$;

drop trigger if exists student_intake_notify_admins_on_response
  on public.student_intake_cases;

create trigger student_intake_notify_admins_on_response
  after update of status on public.student_intake_cases
  for each row execute procedure private.notify_admins_on_intake_response();

revoke all on function private.notify_admins_on_intake_response()
  from public, anon, authenticated;
