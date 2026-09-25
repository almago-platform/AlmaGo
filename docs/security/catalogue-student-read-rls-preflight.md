# #183 — lecture Data API du catalogue

## État vérifié en production

Policies actuelles :

- `programs authenticated read` → SELECT `qual = true` ;
- `catalog authenticated read` → SELECT `qual = true` ;
- les policies Admin `programs admin write` et `catalog admin write` sont `FOR ALL` avec `is_admin()`.

Conséquence : un utilisateur authentifié peut lire directement via la Data API des lignes masquées par l’UI AlmaGo.

## Cible proposée

### Universités côté étudiant

Lisibles si `is_active = true`.

L’Admin garde l’accès complet via `catalog admin write`.

### Programmes côté étudiant

Lisibles si :

- `is_active = true` ;
- université parente active ;
- `verified_at IS NOT NULL` ;
- `source_url` ou `application_url` commence par HTTP(S).

L’Admin garde l’accès complet via `programs admin write`.

## Pourquoi l’université n’exige pas `verified_at` ici

La frontière applicative actuelle `isPublishableProgram()` exige que l’université parente soit active, mais n’exige pas encore une date de vérification de l’université elle-même. La proposition DB reste alignée avec ce contrat afin de ne pas introduire une divergence silencieuse.

## Préflight obligatoire avant application

1. Admin voit toujours toutes les universités et tous les programmes, y compris inactifs.
2. Étudiant lit une université active.
3. Étudiant ne lit pas une université inactive.
4. Étudiant lit un programme actif + université active + vérifié + URL HTTP(S).
5. Programme inactif → non lisible étudiant.
6. Université inactive → programme non lisible étudiant.
7. `verified_at IS NULL` → programme non lisible étudiant.
8. URL absente/non HTTP(S) → programme non lisible étudiant.
9. Orientation, dashboard étudiant et candidatures continuent à charger les relations attendues.
10. E2E étudiant/admin + Security/Performance Advisors après application.

Aucune policy production n’a été modifiée pendant cette préparation.
