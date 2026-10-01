# Campus Allemagne — mode Partner-Ready / Pre-Launch

Issue: #679

## But

Le mode `ALMAGO_PARTNER_PRELAUNCH_MODE=true` permet de montrer un produit fonctionnel à des partenaires avant l'ouverture réelle du service.

Il s'agit d'un **verrou de sécurité**, pas d'un mode production commerciale.

## Ce qui reste démontrable

Lorsque `ALMAGO_PHASE2_ENABLED=true`, l'orientation et les interfaces Phase 2 peuvent rester visibles pour la recette et les démonstrations.

Les comptes de démonstration existants peuvent se connecter normalement.

## Ce qui est forcé OFF

Même si une variable associée est accidentellement mise à `true`, le mode partenaire force OFF :

- indexation publique ;
- capture/persistance de nouveaux prospects ;
- rattachement de nouveaux comptes à une orientation ;
- livraison e-mail transactionnelle ;
- orchestration de paiement ;
- adaptateur de paiement de développement ;
- télémétrie funnel ;
- attribution acquisition/referral.

La création de compte et l'envoi d'un lien de récupération depuis l'UI Auth sont également neutralisés. La connexion de comptes de démonstration existants reste disponible.

## Données autorisées

Utiliser uniquement :

- comptes E2E/démonstration dédiés ;
- profils fictifs ;
- documents synthétiques ;
- transactions simulées lors des futurs tests sandbox.

Ne pas saisir de vraies données étudiant dans l'environnement partenaire tant que le gate juridique final n'est pas validé.

## Activation Render

Le mode n'est pas activé automatiquement par le code.

Après merge et vérification du déploiement exact-SHA, l'environnement Render de démonstration peut recevoir :

`ALMAGO_PARTNER_PRELAUNCH_MODE=true`

Le flag `ALMAGO_PUBLIC_INDEXING_ENABLED` doit rester `false`.

Les flags e-mail, paiement, télémétrie, attribution, prospect capture et account linking peuvent rester `false`; le verrou Partner-Ready les maintient de toute façon fail-closed.

## Sortie du mode

Avant ouverture réelle :

1. finaliser l'établissement/immatriculation et les validations applicables ;
2. finaliser A38 ;
3. figer le release candidate ;
4. désactiver le mode Partner-Ready ;
5. activer seulement les intégrations explicitement approuvées ;
6. rejouer A43/A44/A45 sur le SHA final.
