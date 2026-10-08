# AlmaGo — Back-office pour un administrateur unique
Date : 2026-10-08
Base de l'analyse : `main` au commit `8f8268e6445f368ea4f7de13a114186da2dca78e`
Portée : audit de lecture + première amélioration d'interface en branche dédiée.

## Règle produit

L'opérateur Campus Allemagne est actuellement **la seule personne administratrice**.
Son bureau ne doit jamais masquer un dossier actif sous prétexte qu'il n'a pas d'attribution explicite.
Le mode solo doit se détecter depuis les rôles effectifs, pas depuis une constante ni une adresse e-mail.
Il **ne donne aucun droit supplémentaire** et **n'écrit aucune attribution** dans la base.
Dès l'arrivée d'un deuxième admin, la sémantique collaborative classique reprend.

## Audit des surfaces existantes

| Surface | Capacité dans le dépôt | Friction ou frontière |
| --- | --- | --- |
| /admin | Signaux de retard, réponse, blocage, sources, tâches | Trop de statistiques avant la priorité concrète |
| /admin/inbox | Notifications, marquage lu | À distinguer d'une action réellement terminée |
| /admin/team | Répartition et charge | Pour un seul opérateur, écran secondaire |
| /admin/people | Recherche segmentée, filtres métiers, dossier 360 | « Mes dossiers » excluait les non attribués |
| /admin/dossiers/[studentId] | Projet, actions, blocages, messages, journal, attribution, documents, candidatures | Le travail de traitement est distribué entre modules |
| /admin/prospects | Qualification des orientations et consentement | Ne constitue pas une admission universitaire |
| /admin/intake | Contrôle du pré-dossier, route, offre, motif, proposition | Pièces de départ et acceptation nécessaires |
| /admin/documents | Revue du fichier, remplacement, preuve académique, versions | Le traitement avancé dépend d'une procédure active |
| /admin/applications | Statut, source et vérification de deadline, note, prochaine action | Dépôt externe non automatisé |
| /admin/orientation | Recommandation manuelle, revue humaine Orientation V4 | Revue IA ≠ publication automatique |
| /admin/payments | Enregistrement puis validation de paiement | Activation conditionnelle, ne pas simuler de paiement réel |
| /admin/offers | Versions publiées Bronze/Silver/Gold | Publication explicite, état versionné |
| /admin/universities | Établissements et sources | Données vérifiées seulement |
| /admin/programs | Programmes, prérequis, Master, dates | Les données catalogue ne garantissent pas l'admission |
| /admin/language-courses | Cours sourcés et fraîcheur | Exige des vérifications périodiques |
| /admin/finance-insurance | Informations officielles factuelles | Pas de classement ni déduction automatique d'éligibilité |

Les pages admin sont protégées par contrôle de rôle et MFA (AAL2) au niveau du layout.
Les routes d'écriture vérifiées appellent également `getAdminUser()`.
Ne pas contourner ces contrôles par un accès privilégié depuis l'interface.

## Diagnostic du moteur de procédures

Base Supabase observée le 8 octobre :
- 9 modèles de procédure actifs ;
- 153 étapes modèles (17 par parcours) ;
- 0 procédure étudiante créée ;
- 0 exigence documentaire liée à une procédure ;
- 0 candidature et 0 achat enregistré ;
- 1 pré-dossier en revue Campus et 4 fichiers approuvés ;
- 88 revues d'orientation en attente.

**Décalage métier identifié :** `activate_phase2_paid_purchase` mappe les routes
`study_preparation`, `studies_master`, `standalone_language`,
`studies_bachelor` et `study_place_search` seulement. Les quatre autres routes modèles
ne peuvent pas terminer le parcours de validation payée via ce mapping.
Corriger ce contrat dans un travail métier dédié (migration + tests E2E), sans toucher
aux dossiers ni aux paiements réels dans ce chantier UI.

**Dates :** 0 des 153 étapes modèles portent une règle `deadline_rule` non vide ou une
source officielle ; ne pas présenter une frise modèle comme des échéances réelles.
Les validations de deadline des candidatures sont une logique séparée.

## Première itération livrée dans cette branche

1. Un seul admin : `Mes dossiers` inclut les dossiers opérationnels non attribués.
   La règle est partagée entre tableau de bord et Personnes.
2. Le dashboard affiche d'abord la priorité métier, puis les actions humaines ouvertes,
   **avant** les nombreux indicateurs de suivi.
3. Le mode solo s'affiche sous « Mon bureau » et « Mon portefeuille », supprime les
   contrôles de conseiller inutiles dans la recherche et fait remonter « Sans prochaine
   action » au lieu d'exiger des attributions artificielles.
4. Les audits humains Orientation V4 en attente remontent désormais dans le cockpit et la file prioritaire quand aucune urgence dossier ne précède cette revue. Ils ne publient rien automatiquement.\n5. Aucun changement RLS, Auth, table, journal, paiement ou workflow.
6. En mode équipe, l'ancienne logique d'attribution est conservée.

## Prochaine évolution recommandée (non livrée ici)

P0 : exécuter un scénario E2E isolé orientation -> starter documents ->
proposition -> acceptation -> paiement de TEST -> activation -> exigences ->
candidature, avec compte autorisé et données fictives.

P0 : unifier sous Dossier 360 une vraie liste « Ma prochaine action » par personne,
source fiable de deadline, responsable, et actions de résolution ; éviter une deuxième
entité CRM ou le doublonnage des états.

P1 : créer le moteur de dates métier et de dépendances avec provenance des sources,
cible interne distinguée de deadline officielle, puis relances ciblées.

P1 : compléter le module de documents administratifs préparables par Campus
(CV, lettre, checklist, pièces de candidature) sans produire automatiquement de
documents officiels ni soumettre aux universités sans consentement.

P1 : corriger le mapping des 9 routes et valider l'activation sur chaque famille.

P2 : améliorer l'audit et la revalidation des catalogues et l'orientation humaine.

## Contrôle anti-collision

Deux PR étaient ouvertes au début : #1001 (visionneuse et performance Documents)
et #981 (messagerie candidat et pièces jointes). Cette itération ne modifie
ni leurs routes ni leurs composants et ne fusionne rien.

## Scénarios de recette

- Un admin + dossier sans `student_case_assignments` : dossier présent dans
  `Mes dossiers` et actions humaines dans « Mes prochaines actions ».
- Un admin + dossier explicitement attribué au même admin : présent une seule fois.
- Plusieurs admins + dossier non attribué : absent de `Mes dossiers`,
  présent dans « Non attribués ».
- Plusieurs admins + dossier attribué à un autre : absent de `Mes dossiers`.
- Procédure archivée/accès terminé : ne pas apparaître dans filtre « Mes dossiers ».
- Session non-admin / MFA absent : aucun changement de droit.
- Aucun INSERT/UPDATE de l'attribution suite à une simple consultation.
- Contrôler visuellement le bureau à 360, 390, 768, 1440 pixels avant merge.

**Limite de la présente session :** l'accès navigateur authentifié à Render n'a pas
été effectué ; l'intégration complète reste à confirmer par CI et recette utilisateur.
