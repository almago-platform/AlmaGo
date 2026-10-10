# AlmaGo — exploitation VPS Ubuntu

Le runtime de production canonique est **https://campusallemagne.tn** sur un VPS Ubuntu avec Nginx et Next.js.
L'ancien service Render `almago-dev` est suspendu. Il n'est pas utilisé pour les tests de release.

## Déploiement

- Repository : `almago-platform/AlmaGo`, branche `main`.
- Déploiement automatique sur le VPS : `almago-autodeploy.timer`, cadence observée d'environ une minute.
- Application Next.js : `127.0.0.1:3000` derrière Nginx HTTPS.
- Virtual host Nginx : `/etc/nginx/sites-enabled/almago`.
- Santé publique : `https://campusallemagne.tn/api/health` ; cache `no-store`.

La commande de build Next.js détecte le commit Git via `git rev-parse --verify HEAD` et l'intègre dans la configuration compilée sous `ALMAGO_BUILD_COMMIT`. Le endpoint de santé expose les 12 premiers caractères comme `revision`. `branch` est seulement indicatif : il peut être vide si le checkout est détaché.

**Fail closed** : si la révision est absente ou ne correspond pas au commit complet `main` déclencheur (préfixe de 12 caractères), les workflows de release et E2E VPS échouent. Ne jamais remplacer cette vérification par un simple HTTP 200, ni forcer artificiellement la révision attendue.

## Diagnostic sans modification

```bash
sudo systemctl status almago-autodeploy.timer --no-pager
sudo journalctl -u almago-autodeploy.service --no-pager -n 50
sudo nginx -t
sudo tail -n 50 /var/log/nginx/error.log
curl --fail --silent --show-error https://campusallemagne.tn/api/health
```

Attention à masquer les identifiants, cookies, tokens et paramètres privés dans les logs avant de les partager.

## Publication sûre

1. Vérifier que les tests PR passent et que `main` pointe sur le commit voulu.
2. Laisser `almago-autodeploy.timer` construire ce commit sur le VPS.
3. Contrôler l'état de Nginx/Next.js et `/api/health` ; comparer `revision` au SHA du commit.
4. Lancer manuellement **AlmaGo Release Gate** sur `main`.
5. Les E2E authentifiés sur `vps` conservent A38, les tests étudiant et la preuve humaine admin AAL2 exacte-SHA (issue #84).
6. Vérifier les pages `/`, `/login`, `/orientation` et `/api/health`.

Ne jamais stocker d'identifiants personnels admin ou de secrets Supabase dans des logs, captures ou commentaires GitHub.

## Rollback

Privilégier un revert Git du commit fautif, suivi d'un déploiement automatique et d'une vérification de la nouvelle révision. Un redémarrage manuel ne doit pas masquer un build défaillant. Ne jamais affaiblir Auth, RLS ou les contrôles AAL2 pour faire passer le release gate.

## Limites

Le script `/usr/local/sbin/almago-autodeploy` et l'unité systemd du VPS sont gérés **hors repository**. Ce runbook ne prétend pas les avoir modifiés. Vérifier opérationnellement que le build s'exécute dans un checkout Git valide ; sinon `revision` restera nul et les gates échoueront correctement.

## Impression des PDF par e-mail — même présentation que le site

Le système doit joindre EXACTEMENT deux PDF imprimés par Chromium depuis les pages enregistrées :
- Résumé A4 (document=orientation).
- Dossier détaillé (document=detailed) si une shortlist existe ; sinon rapport candidat (document=candidate).
Les anciens PDF différents générés avec le PDF writer serveur ne sont plus envoyés.

### Prérequis VPS obligatoires

Chromium doit être installé et utilisable par le compte de service Next.js, avec son sandbox actif.

Commande diagnostic : command -v chromium || command -v chromium-browser || command -v google-chrome
Vérifier le compte exécutant Next.js via systemctl et la santé de http://127.0.0.1:3000/api/health.
Ne jamais faire tourner le navigateur en root ni désactiver le sandbox pour contourner les erreurs.

Variables d’environnement facultatives :
- ALMAGO_PDF_CHROMIUM_PATH=/usr/bin/chromium (chemin absolu, ou détection Ubuntu par défaut).
- ALMAGO_PDF_ORIGIN=http://127.0.0.1:3000 (seules les origines HTTP loopback sont permises).

Le token privé n’est jamais placé dans les arguments du processus Chromium ; il est transmis par le protocole CDP local.
Le profil temporaire Chromium est effacé après chaque opération et les fichiers sont bornés en taille.
Si les deux PDF ne peuvent pas être générés, l’orientation est sauvegardée mais aucun ancien PDF divergent n’est envoyé.

### Recette impérative avant fusion et déploiement

Confirmer la présence et le sandbox de Chromium sur le VPS. Faire un test avec une identité de test autorisée
et une boîte de test : deux pièces jointes, résumé A4 + détaillé avec universités/photos/crédits et liens.
Comparer visuellement avec les PDF imprimés depuis les mêmes pages du site. Tester également le cas sans shortlist
(résumé + candidat) et le rendu arabe RTL. Ne pas utiliser les données d’un vrai candidat comme test.
Un CI vert ne confirme pas que Chromium est installé sur le VPS.
