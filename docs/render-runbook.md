# AlmaGo — Render runbook

Render est le runtime canonique de l’application.

## Service actuel

- service : `almago-dev`
- région : Frankfurt
- branche : `main`
- runtime : Node
- auto-deploy : activé sur commit
- previews PR : désactivées
- health check : `/api/health`

Le nom du service peut évoluer pour le lancement public ; le domaine final doit être configuré via `SITE_URL` / `ALMAGO_PRODUCTION_URL`.

## Déploiement

Pour un changement destiné à la production :

1. merger une PR validée dans `main` ;
2. vérifier le deploy Render déclenché par le commit ;
3. attendre l’état `live` ;
4. vérifier `/api/health` ;
5. comparer `revision` au SHA attendu ;
6. exécuter le release gate et les E2E authentifiés si la surface le nécessite.

Ne pas utiliser un redeploy manuel pour masquer un problème de build.

## Health endpoint

`/api/health` est `no-store` et ne doit exposer que des métadonnées bornées de déploiement. Il ne doit jamais exposer secrets, identifiants utilisateurs ou données métier.

## Rollback

En cas de régression :

- identifier le dernier commit sain ;
- préférer un revert Git ;
- laisser l’auto-deploy remettre Render en cohérence ;
- utiliser un rollback Render uniquement en urgence puis réconcilier immédiatement `main`.

Ne jamais corriger une régression en affaiblissant Auth, RLS, validation de fichiers ou gestion des secrets.
