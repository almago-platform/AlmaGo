# AlmaGo — Release checklist

Cette checklist décrit la publication du produit actuel.

## Avant release

- aucune PR produit indispensable ne reste en conflit avec `main` ;
- les migrations du repository correspondent à la base de production ;
- les alertes Supabase Security Advisor bloquantes sont traitées ou explicitement documentées ;
- les secrets de production sont uniquement dans VPS/GitHub/Supabase ;
- les pages légales et la politique de traitement des données sont validées ;
- les comptes E2E restent des identités de test dédiées ;
- l’indexation publique n’est activée que sur le domaine final approuvé.

## Contrôles automatiques

Lancer **AlmaGo Release Gate** depuis `main`.

Le workflow doit réussir :

- `npm test` ;
- `npx tsc --noEmit` ;
- `npm run lint` ;
- `npm run build` ;
- `git diff --check` ;
- preuve que le VPS sert exactement le SHA `main` attendu ;
- smoke tests sur `/`, `/login`, `/orientation` et `/api/health`.

Exécuter aussi **AlmaGo Authenticated E2E** sur la cible VPS pour vérifier les parcours étudiant/admin.

## Après release

- vérifier `/api/health` ;
- vérifier les erreurs Nginx/Next.js sur le VPS ;
- vérifier les logs Supabase pertinents ;
- confirmer login, orientation, étudiant et admin avec données de test ;
- créer le tag/release Git correspondant au SHA validé.

En cas de régression, préférer un revert Git afin de garder GitHub et le VPS alignés.
