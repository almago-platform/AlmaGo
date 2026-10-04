-- Campus Allemagne: canonical procedure templates and explicit-route snapshot generator.
-- The focused intake flow chooses the route only after Campus Allemagne has reviewed
-- the student's orientation and starter evidence.

insert into public.procedure_templates
  (key, version, title, route_key, active_from, source_policy_version, is_active)
values
  ('studies_bachelor', 1, 'Études - Bachelor', 'studies_bachelor', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('studies_master', 1, 'Études - Master', 'studies_master', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('study_preparation', 1, 'Préparation aux études', 'study_preparation', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('study_place_search', 1, 'Recherche d''une place d''études', 'study_place_search', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('standalone_language', 1, 'Cours de langue autonome', 'standalone_language', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('ausbildung', 1, 'Formation professionnelle / Ausbildung', 'ausbildung', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('ausbildung_search', 1, 'Recherche d''une place d''Ausbildung', 'ausbildung_search', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('research_doctorate', 1, 'Doctorat / recherche', 'research_doctorate', '2026-10-04', 'campus-allemagne-v1.1', true),
  ('study_internship', 1, 'Stage lié aux études', 'study_internship', '2026-10-04', 'campus-allemagne-v1.1', true)
on conflict (key, version) do update set
  title = excluded.title,
  route_key = excluded.route_key,
  active_from = excluded.active_from,
  source_policy_version = excluded.source_policy_version,
  is_active = excluded.is_active,
  updated_at = now();

with common_steps (
  key,
  title,
  owner,
  student_required_by_default,
  blocking,
  applies_if,
  depends_on_keys,
  student_help,
  admin_help,
  sort_order
) as (
  values
    ('project_confirmed', 'Projet confirmé', 'joint', false, true, '{}'::jsonb, '{}'::text[],
      'Votre projet Allemagne est enregistré.',
      'La route a été proposée par Campus Allemagne puis confirmée par l’étudiant.', 10),
    ('starter_documents', 'Pièces de départ', 'student', true, true, '{}'::jsonb, array['project_confirmed']::text[],
      'Vos pièces de départ ont servi à valider le parcours proposé.',
      'Passeport, Bac et relevé du Bac sont les pièces de départ. Le certificat de langue reste facultatif s’il existe.', 20),
    ('academic_review', 'Vérification académique des pièces', 'almago', false, true, '{}'::jsonb, array['starter_documents']::text[],
      'Campus Allemagne vérifie les pièces reçues.',
      'Vérifier lisibilité, cohérence et complétude avant toute qualification du parcours.', 30),
    ('tunisian_authentication', 'Authentification / certification tunisienne', 'almago', false, true, '{}'::jsonb, array['academic_review']::text[],
      'Campus Allemagne organise cette étape lorsqu’elle est nécessaire.',
      'Déterminer plus tard l’authentification ou certification réellement applicable.', 40),
    ('german_legalisation', 'Légalisation allemande', 'almago', false, true,
      '{"document_requirement":{"requires_german_legalisation":true}}'::jsonb,
      array['tunisian_authentication']::text[],
      'Cette étape n’est utilisée que lorsqu’une légalisation allemande est réellement requise.',
      'Ne jamais supposer la légalisation par défaut.', 50),
    ('certified_translation', 'Traduction certifiée', 'almago', false, true, '{}'::jsonb,
      array['tunisian_authentication']::text[],
      'Campus Allemagne organise les traductions nécessaires.',
      'Les règles détaillées de traduction seront traitées dans une phase ultérieure.', 60),
    ('academic_eligibility', 'Éligibilité académique', 'almago', false, true, '{}'::jsonb,
      array['academic_review']::text[],
      'Campus Allemagne vérifie la base académique du projet.',
      'Utiliser les preuves académiques sans promettre une admission.', 70),
    ('language_path', 'Parcours langue', 'almago', false, true, '{}'::jsonb,
      array['project_confirmed']::text[],
      'Campus Allemagne vérifie le besoin linguistique du projet.',
      'Le certificat existant est facultatif au démarrage et sert de preuve s’il est disponible.', 80),
    ('program_selection', 'Sélection des programmes', 'almago', false, true, '{}'::jsonb,
      array['academic_eligibility','language_path']::text[],
      'Campus Allemagne prépare la sélection adaptée au projet.',
      'Phase ultérieure.', 90),
    ('application_ready', 'Préparation des candidatures', 'almago', false, true, '{}'::jsonb,
      array['program_selection']::text[],
      'Campus Allemagne prépare les dossiers de candidature.',
      'Phase ultérieure.', 100),
    ('application_submitted', 'Dépôt des candidatures', 'almago', false, true, '{}'::jsonb,
      array['application_ready']::text[],
      'Campus Allemagne suit la préparation et le dépôt selon la voie applicable.',
      'Phase ultérieure.', 110),
    ('application_followup', 'Suivi après dépôt', 'almago', false, false, '{}'::jsonb,
      array['application_submitted']::text[],
      'Campus Allemagne suit les retours et demandes complémentaires.',
      'Phase ultérieure.', 120),
    ('admission_basis', 'Admission / base préparatoire', 'external', false, true, '{}'::jsonb,
      array['application_submitted']::text[],
      'La décision provient de l’institution compétente.',
      'Phase ultérieure.', 130),
    ('financing', 'Financement', 'almago', false, true, '{}'::jsonb,
      array['admission_basis']::text[],
      'Campus Allemagne préparera la voie de financement applicable.',
      'Phase ultérieure.', 140),
    ('insurance', 'Assurance', 'almago', false, true, '{}'::jsonb,
      array['admission_basis']::text[],
      'Campus Allemagne préparera la couverture applicable.',
      'Phase ultérieure.', 150),
    ('visa_submission', 'Préparation et dépôt visa', 'almago', false, true, '{}'::jsonb,
      array['financing','insurance']::text[],
      'Campus Allemagne préparera le dossier visa selon la route confirmée.',
      'Le détail visa n’est pas activé dans la présente phase.', 160),
    ('arrival', 'Après visa / arrivée', 'almago', false, false, '{}'::jsonb,
      array['visa_submission']::text[],
      'Campus Allemagne accompagnera les étapes applicables après le visa.',
      'Phase ultérieure.', 170)
)
insert into public.procedure_step_templates (
  procedure_template_id,
  key,
  title,
  owner,
  student_required_by_default,
  blocking,
  applies_if,
  depends_on_keys,
  deadline_rule,
  student_help,
  admin_help,
  sort_order
)
select
  template.id,
  step.key,
  step.title,
  step.owner,
  step.student_required_by_default,
  step.blocking,
  step.applies_if,
  step.depends_on_keys,
  '{}'::jsonb,
  step.student_help,
  step.admin_help,
  step.sort_order
from public.procedure_templates template
cross join common_steps step
where template.version = 1
on conflict (procedure_template_id, key) do update set
  title = excluded.title,
  owner = excluded.owner,
  student_required_by_default = excluded.student_required_by_default,
  blocking = excluded.blocking,
  applies_if = excluded.applies_if,
  depends_on_keys = excluded.depends_on_keys,
  deadline_rule = excluded.deadline_rule,
  student_help = excluded.student_help,
  admin_help = excluded.admin_help,
  sort_order = excluded.sort_order,
  updated_at = now();

create or replace function private.create_campus_student_procedure_for_route(
  p_student_id uuid,
  p_route_key text,
  p_created_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  template_record public.procedure_templates%rowtype;
  project_record public.student_projects%rowtype;
  current_record public.student_procedures%rowtype;
  new_procedure_id uuid := gen_random_uuid();
  procedure_snapshot jsonb;
  project_snapshot jsonb := '{}'::jsonb;
begin
  if p_student_id is null or p_route_key is null then
    raise exception 'student_and_route_required';
  end if;

  select *
  into template_record
  from public.procedure_templates
  where route_key = p_route_key
    and is_active
    and (active_from is null or active_from <= current_date)
    and (active_to is null or active_to >= current_date)
  order by version desc
  limit 1;

  if not found then
    raise exception 'procedure_template_not_found';
  end if;

  select *
  into project_record
  from public.student_projects
  where student_id = p_student_id;

  if found then
    project_snapshot := jsonb_build_object(
      'id', project_record.id,
      'path', project_record.path::text,
      'target_degree', project_record.target_degree,
      'target_field', project_record.target_field,
      'target_intake', project_record.target_intake,
      'preferred_cities', project_record.preferred_cities,
      'current_german_level', project_record.current_german_level,
      'target_german_level', project_record.target_german_level,
      'updated_at', project_record.updated_at
    );
  end if;

  select *
  into current_record
  from public.student_procedures
  where student_id = p_student_id
    and is_current
  order by created_at desc
  limit 1
  for update;

  if found
    and current_record.route_key = p_route_key
    and current_record.procedure_template_id = template_record.id
    and current_record.template_snapshot -> 'project' = project_snapshot
  then
    return current_record.id;
  end if;

  select jsonb_build_object(
    'schema_version', '1.1',
    'template_key', template_record.key,
    'template_version', template_record.version,
    'route_key', template_record.route_key,
    'source_policy_version', template_record.source_policy_version,
    'project', project_snapshot,
    'steps', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'key', step.key,
          'title', step.title,
          'owner', step.owner,
          'student_required_by_default', step.student_required_by_default,
          'blocking', step.blocking,
          'applies_if', step.applies_if,
          'depends_on_keys', to_jsonb(step.depends_on_keys),
          'deadline_rule', step.deadline_rule,
          'student_help', step.student_help,
          'admin_help', step.admin_help,
          'official_source_url', step.official_source_url,
          'source_verified_at', step.source_verified_at,
          'sort_order', step.sort_order
        )
        order by step.sort_order
      ) filter (where step.id is not null),
      '[]'::jsonb
    )
  )
  into procedure_snapshot
  from public.procedure_step_templates step
  where step.procedure_template_id = template_record.id;

  if current_record.id is not null then
    update public.student_procedures
    set is_current = false, updated_at = now()
    where id = current_record.id;
  end if;

  insert into public.student_procedures (
    id,
    student_id,
    project_id,
    procedure_template_id,
    procedure_template_key,
    procedure_template_version,
    route_key,
    target_intake,
    status,
    template_snapshot,
    is_current,
    created_by
  )
  values (
    new_procedure_id,
    p_student_id,
    project_record.id,
    template_record.id,
    template_record.key,
    template_record.version,
    p_route_key,
    project_record.target_intake,
    'ready',
    procedure_snapshot,
    true,
    p_created_by
  );

  if current_record.id is not null then
    update public.student_procedures
    set superseded_by = new_procedure_id, updated_at = now()
    where id = current_record.id;
  end if;

  return new_procedure_id;
end;
$$;

revoke all on function private.create_campus_student_procedure_for_route(uuid, text, uuid)
  from public, anon, authenticated;
