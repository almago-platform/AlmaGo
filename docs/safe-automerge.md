# AlmaGo — Safe Auto Merge

La boucle autonome peut continuer sans intervention humaine uniquement pour une catégorie très limitée :

- Issue créée par le Master Plan ;
- route `ai` ;
- risque `low` dans le plan ;
- branche `automation/issue-N` ;
- maximum 3 fichiers ;
- chaque fichier doit être exactement dans la liste de la tâche ;
- aucun chemin Auth/Admin/API/Supabase/permissions sensible ;
- `AlmaGo PR CI` vert ;
- `AlmaGo Browser Quality` vert ;
- statut Vercel `success`.

Les tâches Codex, humaines, high/critical ou les PR manuelles ne sont jamais auto-mergées par ce workflow. Un échec ou un timeout ne force jamais le merge : le système attend une nouvelle exécution ou une inspection.
