# #178 — preflight avant toute migration RLS

Ce document est une **checklist de revue**, pas une autorisation d’appliquer la proposition.

## Frontière visée

Un étudiant ne doit pouvoir insérer une candidature via la Data API que si la recommandation :

- appartient à `auth.uid()` ;
- n’est pas archivée ;
- n’est pas `not_recommended` ;
- pointe vers un programme actif ;
- pointe vers une université active ;
- pointe vers un programme avec `verified_at` ;
- dispose d’une URL `source_url` ou `application_url` à préfixe HTTP(S).

L’Admin conserve ses chemins existants ; cette proposition ne modifie ni grants ni politiques SELECT.

## Requêtes de contrôle lecture seule

```sql
-- 1. Candidatures existantes qui ne passeraient plus la frontière proposée.
select
  a.id,
  a.program_id,
  a.status,
  a.created_at
from public.applications a
left join public.programs p on p.id = a.program_id
left join public.universities u on u.id = p.university_id
where not (
  p.is_active
  and u.is_active
  and p.verified_at is not null
  and (
    nullif(trim(p.source_url), '') ~* '^https?://'
    or nullif(trim(p.application_url), '') ~* '^https?://'
  )
);

-- 2. Recommandations étudiantes actives qui ne sont pas publiables selon la future frontière.
select
  r.id,
  r.program_id,
  r.status,
  r.is_archived
from public.program_recommendations r
join public.programs p on p.id = r.program_id
join public.universities u on u.id = p.university_id
where not r.is_archived
  and r.status <> 'not_recommended'
  and not (
    p.is_active
    and u.is_active
    and p.verified_at is not null
    and (
      nullif(trim(p.source_url), '') ~* '^https?://'
      or nullif(trim(p.application_url), '') ~* '^https?://'
    )
  );
```

## Tests obligatoires avant application

1. Étudiant + recommandation valide + programme vérifié → INSERT accepté.
2. Programme inactif → INSERT refusé.
3. Université inactive → INSERT refusé.
4. `verified_at IS NULL` → INSERT refusé.
5. URL vide / non HTTP(S) → INSERT refusé.
6. Recommandation archivée → INSERT refusé.
7. `not_recommended` → INSERT refusé.
8. Recommandation d’un autre étudiant → INSERT refusé.
9. Parcours AlmaGo normal `POST /api/student/applications` reste fonctionnel.
10. E2E Admin/Étudiant + Security Advisor après application.

## Limite connue

La DB vérifie ici un préfixe HTTP(S), alors que l’application valide l’URL avec le parseur `URL`. La confirmation `verified_at` reste donc un signal de revue Admin important. Une validation URL parfaite en SQL n’est pas recherchée dans cette proposition.
