-- Temporary Tunisia-market test pricing for AlmaGo commercial offers.
-- Keeps offer history intact by retiring the previous published version and publishing v2 in TND.

do $$
declare
  v_offer_id uuid;
begin
  -- Bronze / Essentiel
  select id into v_offer_id
  from public.commercial_offers
  where code = 'bronze'::public.commercial_offer_code;

  update public.commercial_offer_versions
  set status = 'retired'::public.commercial_offer_version_status
  where offer_id = v_offer_id
    and status = 'published'::public.commercial_offer_version_status
    and version <> 2;

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
    2,
    'published'::public.commercial_offer_version_status,
    'Essentiel · Préparation',
    'Pour démarrer avec une orientation claire, un plan de préparation et les premières vérifications du projet.',
    '[
      "Analyse de l’orientation et du projet",
      "Feuille de route personnalisée",
      "Sélection initiale de programmes adaptés",
      "Vérification des documents de départ",
      "Recommandations langue et prochaines étapes"
    ]'::jsonb,
    590000,
    'TND',
    now()
  )
  on conflict (offer_id, version) do update
  set
    status = excluded.status,
    display_name = excluded.display_name,
    summary = excluded.summary,
    service_items = excluded.service_items,
    price_minor = excluded.price_minor,
    currency = excluded.currency,
    published_at = excluded.published_at;

  -- Silver / Accompagnement
  select id into v_offer_id
  from public.commercial_offers
  where code = 'silver'::public.commercial_offer_code;

  update public.commercial_offer_versions
  set status = 'retired'::public.commercial_offer_version_status
  where offer_id = v_offer_id
    and status = 'published'::public.commercial_offer_version_status
    and version <> 2;

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
    2,
    'published'::public.commercial_offer_version_status,
    'Accompagnement · Études',
    'Pour structurer le projet d’études et préparer les candidatures avec un suivi plus complet.',
    '[
      "Tout le contenu de l’offre Essentiel",
      "Sélection élargie de programmes et priorités",
      "Plan de candidature personnalisé",
      "Checklist détaillée des pièces",
      "Deux cycles de relecture du dossier",
      "Suivi des prochaines échéances"
    ]'::jsonb,
    1490000,
    'TND',
    now()
  )
  on conflict (offer_id, version) do update
  set
    status = excluded.status,
    display_name = excluded.display_name,
    summary = excluded.summary,
    service_items = excluded.service_items,
    price_minor = excluded.price_minor,
    currency = excluded.currency,
    published_at = excluded.published_at;

  -- Gold / Premium
  select id into v_offer_id
  from public.commercial_offers
  where code = 'gold'::public.commercial_offer_code;

  update public.commercial_offer_versions
  set status = 'retired'::public.commercial_offer_version_status
  where offer_id = v_offer_id
    and status = 'published'::public.commercial_offer_version_status
    and version <> 2;

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
    2,
    'published'::public.commercial_offer_version_status,
    'Premium · Projet Allemagne',
    'Pour un accompagnement renforcé du projet, des candidatures et de la préparation aux étapes après admission.',
    '[
      "Tout le contenu de l’offre Accompagnement",
      "Suivi renforcé du dossier et des candidatures",
      "Quatre cycles de relecture ou points de suivi",
      "Priorisation des universités et scénarios alternatifs",
      "Préparation des étapes après admission",
      "Checklist financement, assurance et visa",
      "Suivi prioritaire du dossier"
    ]'::jsonb,
    2490000,
    'TND',
    now()
  )
  on conflict (offer_id, version) do update
  set
    status = excluded.status,
    display_name = excluded.display_name,
    summary = excluded.summary,
    service_items = excluded.service_items,
    price_minor = excluded.price_minor,
    currency = excluded.currency,
    published_at = excluded.published_at;
end;
$$;
