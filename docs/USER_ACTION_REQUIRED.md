# AlmaGo — interventions propriétaire réellement requises

Ce fichier ne liste que les actions qui nécessitent le compte, une décision, un secret, un paiement ou une écriture production protégée du propriétaire.

Source opérationnelle de suivi : GitHub issue #22.

## Séquence de fermeture — garder un release candidate stable

Avant les preuves finales A38 → A43 → A44 → A45 :

1. terminer et merger uniquement les changements réellement retenus pour le lancement ;
2. fermer ou différer les PR/tickets superseded ;
3. relever le SHA exact du release candidate sur `main` ;
4. éviter tout changement non indispensable pendant la chaîne de preuve.

Si `main` change après une preuve exact-SHA, cette preuve doit être rejouée sur le nouveau SHA.

## État infrastructure déjà résolu

- GitHub Actions fonctionne normalement (#286 fermé).
- `main` est protégé par le ruleset **Protect main** (#336 fermé).
- une Pull Request est obligatoire ;
- suppression et force-push/non-fast-forward sont bloqués ;
- aucun bypass large ;
- le check global requis est `verify` (AlmaGo PR CI) ;
- Vercel n'est pas un required check.
- Render `almago-dev` (`https://almago-dev.onrender.com`) est le runtime canonique ;
- GitHub → Render auto-deploy est restauré (#389 fermé) ;
- `Health Check Path = /api/health` ;
- un merge réel sur `main` a déjà produit un deploy Render `new_commit` exact-SHA.

## 1. P2.4 — preuve Auth/Supabase réelle

Le code est prêt. La campagne E2E temporaire #674 attend uniquement un secret GitHub Actions backend :

- `SUPABASE_SECRET_KEY`

Cette clé doit rester exclusivement dans GitHub Actions Secrets / backend. Ne jamais la publier dans une Issue, un commit, une capture ou le chat.

Une fois configurée, exécuter la preuve :
- signup + confirmation + claim ;
- login compte existant + claim ;
- reset password en conservant le contexte ;
- claim idempotent ;
- autre utilisateur refusé ;
- compte gratuit reste `prospect_account`, jamais `client_active`.

## 2. A38 — validation juridique humaine

Suivi : #66.

Déjà confirmé par le propriétaire :
- service public : Campus Allemagne ;
- exploitant prévu : Ayoub Tayari ;
- personne physique / établissement prévu en Tunisie ;
- contact public : contact@campus-allemagne.info ;
- orientation en ligne actuellement gratuite ;
- services payants futurs non encore activés ;
- politique de rétention/suppression proposée approuvée.

Reste humain :
- adresse publique finale ;
- identifiants d'enregistrement/fiscaux si applicables ;
- DPO applicable ou non ;
- activité réglementée/autorisation éventuelle ;
- bases juridiques par finalité ;
- transferts internationaux / garanties fournisseurs ;
- autorité de contrôle, droit applicable et litiges ;
- relecteur humain/juridique compétent ;
- date, version et date d'entrée en vigueur.

Après vraie relecture, suivre le gate A38 prévu. Ne jamais inventer ces champs.

## 3. P2.3 — email transactionnel réel

Le code supporte Resend et reste fail-closed.

À fournir/configurer :
- compte Resend ;
- domaine d'envoi authentifié ;
- `RESEND_API_KEY` ;
- `ALMAGO_TRANSACTIONAL_EMAIL_FROM` ;
- `ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER=resend` ;
- `SITE_URL` HTTPS final ;
- activation Phase 2 seulement après A38.

Puis exécuter un test réel FR et un test AR/RTL.

## 4. A43 — E2E authentifiés sur Render

Les identités et mots de passe E2E sont déjà configurés et les E2E locaux passent.

Après A38, exécuter **AlmaGo Authenticated E2E** depuis le `main` exact avec `target=render`.

Le workflow doit :
- vérifier que Render sert le SHA exact ;
- tester isolation étudiant/admin ;
- exécuter les matrices qualité étudiant/admin ;
- revalider `main` avant de fermer A43.

## 5. P2.8/P2.9 — offres et paiement

La structure Bronze/Silver/Gold existe, mais aucune version commerciale n'est encore publiée dans le Supabase cible.

Décisions propriétaire requises :
- services réels par offre ;
- prix ;
- devise ;
- limites/support ;
- conformité avec les CGV finales ;
- prestataire de paiement compatible avec l'établissement réel.

Les migrations P2.9 sont déjà appliquées au Supabase cible et la machine d'état paiement a été prouvée en transaction réelle avec rollback propre. Le vrai checkout/webhook/fournisseur reste à connecter.

## 6. A44 / P2.10 — observabilité et analytics

A44 vient après A38 + A43.

La persistance d'attribution et le contrat de télémétrie minimisée sont prêts, mais le transport reste OFF.

À faire :
- choisir le fournisseur ;
- définir rétention/consentement selon A38 ;
- stocker ses secrets uniquement dans Render/GitHub ;
- n'envoyer que l'allow-list ;
- tester avec données synthétiques ;
- vérifier qu'aucun email, nom, ID étudiant, token, document ou texte libre n'est envoyé.

## 7. Supabase Auth — sécurité

Le Security Advisor signale encore **Leaked Password Protection disabled**. Vérifier l'option disponible pour le plan retenu et traiter ce point avant release, sans exposer de secrets ni affaiblir Auth/RLS.

## 8. A45 — final release gate

A45 est le dernier gate.

Il exige :
- A38 fermée avec preuve humaine exact-SHA ;
- A43 fermée avec preuve Render exact-SHA ;
- A44 fermée avec preuve exact-SHA ;
- `main` protégé ;
- checks release verts ;
- Render servant exactement le SHA de `main` ;
- smoke public `/`, `/login`, `/signup`.

Le workflow ne déploie, ne merge et ne change aucune permission.

## Garde-fous

- aucun secret dans Issues, commits, logs, captures ou chat ;
- aucune vraie donnée étudiant dans les E2E ;
- aucun affaiblissement Auth/RLS/Storage pour faire passer un test ;
- aucun fournisseur payant ou upgrade de plan sans décision explicite ;
- aucun marketing/analytics avant le cadre A38/A44 ;
- aucun nouveau chantier non indispensable après le release freeze.


## Non requis pour lancer

Gemini/Grok ou un autre fournisseur IA externe n’est **pas** une action nécessaire au lancement AlmaGo. Ne l’activer qu’après décision séparée si un besoin produit réel apparaît.
