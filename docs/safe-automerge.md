# AlmaGo — Controlled Merge Readiness

Le workflow de merge readiness peut publier un signal de préparation uniquement pour une catégorie très limitée :

- Issue créée par le Master Plan ;
- route `ai` ;
- risque `low` dans le plan ;
- branche `automation/issue-N` ;
- maximum 3 fichiers ;
- chaque fichier doit être exactement dans la liste de la tâche ;
- aucun chemin Auth/Admin/API/Supabase/permissions sensible ;
- `AlmaGo PR CI` vert ;
- `AlmaGo Browser Quality` vert ;

Les tâches Codex, humaines, high/critical ou les PR manuelles ne sont jamais auto-mergées par ce workflow. En réalité, ce workflow ne fusionne aucune PR : il publie uniquement `MERGE READINESS: READY` après les contrôles de périmètre et les deux checks canoniques. Un échec ou un timeout ne force jamais le merge.

Render n’est pas utilisé comme preuve de PR car les previews de Pull Request sont désactivées. La preuve Render appartient au gate A45 après merge : le service canonique doit alors servir le SHA exact de `main`.
