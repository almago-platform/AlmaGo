# Audit du profil étudiant — Phase 2

Le formulaire et les deux routes serveur utilisent les mêmes noms SQL. Les écritures passent par `profileUpdateFromInput`, qui autorise uniquement les champs listés ici. Les routes utilisent `auth.uid()` comme clé `profiles.id` et un `upsert` pour couvrir les comptes créés avant le trigger de profil.

Les listes partagées de l’interface et de la validation serveur se trouvent dans `src/lib/student/profile-options.ts`. Les nationalités sont recherchables ; les sections du Bac tunisien, diplômes, niveaux de langue, certificats, projets, domaines, langues d’études, budgets et villes allemandes préférées sont contrôlés. Les villes sont enregistrées dans `preferred_cities` (`text[]`).

| Colonne | Catégorie | Source / usage |
|---|---|---|
| `id` | technique/interne | `auth.uid()` ; jamais modifiable par le formulaire |
| `first_name`, `last_name`, `nationality` | obligatoire | onboarding et profil |
| `target_degree`, `target_field`, `study_language`, `target_intake` | obligatoire | projet, validation finale |
| `birth_date`, `current_city`, `phone` | facultatif | informations personnelles |
| `last_diploma`, `bac_track`, `bac_year`, `general_average`, `institution` | facultatif | parcours académique |
| `current_university_studies`, `current_field`, `university_semesters` | facultatif | études actuelles |
| `german_level`, `english_level`, `french_level` | facultatif | langues ; `none` est accepté |
| `language_certificate`, `language_certificate_other` | facultatif | certificat de langue |
| `preferred_cities`, `budget_range` | facultatif | projet en Allemagne |
| `full_name` | technique/dérivé | synchronisé depuis prénom + nom ; jamais un mot de passe |
| `onboarding_completed`, `onboarding_completed_at` | technique/interne | état de validation |
| `created_at`, `updated_at` | technique/interne | audit de ligne |
| `country`, `education_level`, `language_notes` | legacy/inutilisé | hérités de la Phase 1, non lus ni écrits par la Phase 2 ; conservation temporaire pour compatibilité |

Le mot de passe n’existe dans aucune colonne `profiles`. Il reste exclusivement dans Supabase Auth. `0004_phase2_profile_upsert.sql` ajoute seulement la permission RLS d’insérer son propre profil si celui-ci n’existe pas.
