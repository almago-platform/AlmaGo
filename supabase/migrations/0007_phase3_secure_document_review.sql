-- Keep review, notification, and student-visible history in one database transaction.
create or replace function public.admin_review_document(
  target_document_id uuid,
  target_status public.document_status,
  target_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_document public.documents;
  notification_title text;
  history_message text;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  if target_status not in ('approved', 'rejected', 'replace_required') then
    raise exception 'invalid_document_status';
  end if;

  if target_status in ('rejected', 'replace_required') and coalesce(trim(target_comment), '') = '' then
    raise exception 'review_comment_required';
  end if;

  select * into target_document
  from public.documents
  where id = target_document_id
  for update;

  if not found then
    raise exception 'document_not_found';
  end if;

  update public.documents
  set status = target_status,
      admin_comment = nullif(trim(target_comment), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = target_document_id;

  notification_title := case target_status
    when 'approved' then 'Document approuvé'
    when 'rejected' then 'Document rejeté'
    else 'Remplacement de document demandé'
  end;
  history_message := case target_status
    when 'approved' then 'AlmaGo a approuvé ton document : ' || target_document.original_filename || '.'
    when 'rejected' then 'AlmaGo a rejeté ton document : ' || target_document.original_filename || '.'
    else 'AlmaGo te demande de remplacer ton document : ' || target_document.original_filename || '.'
  end;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    target_document.student_id,
    'document_' || target_status::text,
    notification_title,
    nullif(trim(target_comment), ''),
    jsonb_build_object('document_id', target_document.id, 'category', target_document.category)
  );

  insert into public.student_history (student_id, actor_id, event_type, message, metadata)
  values (
    target_document.student_id,
    auth.uid(),
    'document_' || target_status::text,
    history_message,
    jsonb_build_object('document_id', target_document.id, 'category', target_document.category, 'comment', nullif(trim(target_comment), ''))
  );
end;
$$;

grant execute on function public.admin_review_document(uuid, public.document_status, text) to authenticated;
