# AlmaGo Render runbook

Render est le runtime canonique utilisé pour valider AlmaGo avant lancement public.

## Service canonique

État opérationnel confirmé :
- service : `almago-dev`
- URL : `https://almago-dev.onrender.com`
- région : Frankfurt
- branche : `main`
- runtime : Node
- plan : Free
- auto-deploy : activé sur commit
- previews PR : désactivées
- Health Check Path : `/api/health`

Le repository contient aussi `render.yaml`. Le dashboard du service existant reste la source de vérité pour sa configuration live.

## GitHub → Render auto-deploy

L'incident historique de permission GitHub est résolu (#389).

Preuve enregistrée :
- Render GitHub App réautorisée pour `almago-platform/AlmaGo` ;
- un merge réel sur `main` a créé automatiquement un deploy avec trigger `new_commit` ;
- Render a cloné le SHA exact ;
- le build a réussi et le deploy a atteint `live`.

Ne pas utiliser un deploy manuel/API pour masquer un futur échec d'auto-deploy.

## Contrat de build

Le build Render conserve les gates du repository. Une build défaillante ne doit pas être contournée en retirant les tests ou protections.

Pour chaque changement destiné à la production :
1. relever le commit `main` ;
2. vérifier qu'un deploy `new_commit` démarre ;
3. attendre `live` ;
4. vérifier `/api/health` ;
5. comparer `revision` au SHA attendu ;
6. inspecter les erreurs runtime/build ;
7. tester la surface touchée avec données synthétiques/comptes E2E.

## Health endpoint

`/api/health` est no-store et ne doit exposer que des métadonnées de déploiement bornées.

Il ne doit jamais contenir :
- secrets ;
- identifiants utilisateurs ;
- données base ;
- valeurs d'environnement protégées.

## Free-plan cold start

Le service peut s'endormir après inactivité. Les workflows A43/A45 utilisent des retries bornés.

Le passage à un plan payant reste une décision propriétaire séparée.

## Rollback

Si un deploy échoue au build, conserver le dernier deploy live.

Si une régression atteint `live` :
- identifier le dernier commit connu sain ;
- préférer un revert dans Git puis un deploy normal afin de garder Git/Render alignés ;
- utiliser rollback/redeploy dashboard seulement en urgence puis réconcilier `main`.

Ne jamais corriger une régression en affaiblissant RLS, Auth, validation de fichiers ou gestion des secrets.

## Secrets

Les secrets appartiennent à Render Environment ou GitHub Actions Secrets.

Ne jamais mettre une clé serveur Supabase dans `NEXT_PUBLIC_*`.

## Gates liés

- P2.4 : preuve Auth/Supabase cible
- A38 : revue juridique humaine
- P2.3 : livraison e-mail réelle
- A43 : E2E authentifiés exact-SHA sur Render
- A44 : observabilité après A38 + A43
- A45 : release gate final exact-SHA
