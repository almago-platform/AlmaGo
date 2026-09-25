# #205 — privilèges PostgreSQL inutiles du rôle authenticated

## Audit lecture seule du 25 septembre 2026

Le rôle `authenticated` possède actuellement `TRUNCATE`, `TRIGGER` et `REFERENCES` sur plusieurs tables publiques AlmaGo.

Ces privilèges ne sont pas utilisés par les flux applicatifs normaux. Les opérations métier reposent sur les droits CRUD nécessaires et les policies RLS.

## Proposition minimale

```sql
revoke truncate, references, trigger
  on all tables in schema public
  from authenticated;
```

Cette proposition :

- ne retire pas `SELECT` ;
- ne retire pas `INSERT` ;
- ne retire pas `UPDATE` ;
- ne retire pas `DELETE` ;
- ne modifie aucune policy RLS ;
- ne touche aucune donnée ;
- ne touche aucune fonction ou trigger existant.

## Vérifications avant application

1. Auth étudiant : profil, onboarding, documents, checklist, notifications, orientation, candidatures.
2. Auth admin : documents, orientation, candidatures, catalogue, dossiers étudiants.
3. Fonctions `SECURITY INVOKER` : revue document et changement de statut candidature.
4. Upload Storage + suppression autorisée.
5. Security Advisor.
6. Performance Advisor.

## Limite

Cette proposition ne corrige pas les grants CRUD trop larges au niveau table/colonnes. Ce travail reste séparé, notamment dans #185 pour `notifications` et `profiles`.
