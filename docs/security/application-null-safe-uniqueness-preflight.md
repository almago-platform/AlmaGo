# #182 — préflight unicité candidature NULL-safe

Cette proposition cible PostgreSQL 17 et utilise `UNIQUE NULLS NOT DISTINCT`.

## État vérifié en lecture seule

Au 25 septembre 2026 :

- contrainte actuelle : `applications_student_id_program_id_intake_key` ;
- définition : `UNIQUE (student_id, program_id, intake)` ;
- groupes en doublon : **0** ;
- lignes supplémentaires dues à des doublons : **0** ;
- groupes en doublon avec `intake IS NULL` : **0**.

Aucune donnée n’a été modifiée.

## Pourquoi changer

Avec un `UNIQUE` PostgreSQL classique, plusieurs lignes avec `intake = NULL` ne sont pas considérées comme identiques. La route AlmaGo fait déjà un contrôle applicatif, mais la DB doit aussi couvrir les requêtes concurrentes et les chemins Data API autorisés.

## Proposition

```sql
alter table public.applications
  drop constraint if exists applications_student_id_program_id_intake_key;

alter table public.applications
  add constraint applications_student_program_intake_unique
  unique nulls not distinct (student_id, program_id, intake);
```

## Tests avant application

1. Première candidature avec intake NULL → acceptée.
2. Deuxième candidature même étudiant/programme avec intake NULL → refus `23505`.
3. Même étudiant/programme avec deux intakes non NULL différents → accepté.
4. Même étudiant/programme/intake non NULL identique → refus `23505`.
5. Étudiants différents sur même programme/intake → accepté.
6. Route `POST /api/student/applications` continue à traduire `23505` en HTTP 409.
7. E2E étudiant/admin + Security/Performance Advisors après application.

## Garde-fou

Ne pas supprimer/fusionner de lignes automatiquement. Si un futur préflight trouve des doublons, arrêter la migration et traiter les données séparément.
