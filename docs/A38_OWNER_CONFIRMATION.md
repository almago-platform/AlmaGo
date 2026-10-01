# A38 — confirmation propriétaire minimale

A38_REVIEW_READY: false

**Statut : document interne de collecte, non validé juridiquement, ne pas publier tel quel.**

Objectif : réduire A38 aux seules décisions qui ne peuvent pas être déduites du code ou des migrations.

Ne jamais mettre ici de mot de passe, clé API, document d’identité ou autre secret.

## Faits propriétaire confirmés — 30 septembre 2026

Les éléments suivants ont été confirmés par le propriétaire pour la préparation A38 :

- nom public du service : **Campus Allemagne** ;
- exploitant actuel prévu : **Ayoub Tayari** ;
- forme actuelle : **personne physique** ;
- représentant légal distinct : **non applicable à ce stade** ;
- pays d’exploitation au lancement public : **Allemagne** ;
- pays principal d’établissement prévu à terme : **Tunisie** ;
- e-mail public : **contact@campus-allemagne.info** ;
- orientation en ligne actuellement proposée gratuitement ;
- le propriétaire souhaite lancer publiquement **la version gratuite avant toute immatriculation/identifiant fiscal en Tunisie** ;
- des services payants d’accompagnement/préparation de dossier sont envisagés, mais **aucune offre payante, aucun tarif et aucune condition commerciale ne sont encore activés ou finalisés** ;
- la politique de conservation et la procédure de suppression proposées dans `docs/A38_RETENTION_POLICY_PROPOSAL.md` sont **APPROUVÉES** par le propriétaire.

Ces confirmations sont des faits/décisions propriétaire. Elles ne remplacent pas la détermination juridique de leur applicabilité par le relecteur final.

## Ce qui est déjà établi techniquement

- Supabase fournit Auth, PostgreSQL et Storage ;
- Render fournit l’hébergement/déploiement canonique ;
- les catégories de données traitées sont inventoriées dans `docs/data-processing-inventory.md` ;
- les recommandations Campus Allemagne ne sont pas des décisions d’admission ;
- aucun fournisseur analytics/observabilité produit n’est actuellement actif dans l’application ;
- l’activation d’un futur fournisseur analytics appartient à **A44**.

## Confirmation propriétaire consolidée

```text
A38 OWNER CONFIRMATION

1. Éditeur / exploitant légal : Ayoub Tayari
2. Forme juridique : personne physique
3. Représentant légal, si applicable : N/A à ce stade
4. Adresse publique à publier : À CONFIRMER AVANT PUBLICATION APRÈS ÉTABLISSEMENT EN TUNISIE
5. E-mail public de contact : contact@campus-allemagne.info
6. Registre + numéro, si applicable : À CONFIRMER SELON IMMATRICULATION / STATUT FINAL EN TUNISIE
7. TVA / identifiant fiscal, si applicable : À CONFIRMER SELON STATUT FINAL EN TUNISIE
8. Exploitation au lancement public : Allemagne ; établissement prévu à terme : Tunisie
9. Statut commercial actuel : orientation gratuite ; lancement public gratuit prévu avant immatriculation en Tunisie ; services payants d’accompagnement/préparation envisagés mais non encore activés, tarifés ni proposés à la vente
10. DPO : À CONFIRMER PAR LE RELECTEUR SELON APPLICABILITÉ
11. Activité soumise à autorisation ou profession réglementée : À CONFIRMER PAR LE RELECTEUR
12. Politique de conservation proposée : APPROUVÉE
    - compte + profil : revue après 24 mois d’inactivité
    - documents : suppression avec le compte / dès qu’ils ne sont plus utiles
    - candidatures + historique + notes internes : suppression/anonymisation avec le dossier, sauf obligation documentée
    - logs techniques : 30 jours ; jusqu’à 90 jours pour un incident
13. Procédure de suppression validée : APPROUVÉE
    - Storage Supabase via API avant suppression Auth
    - suppression/anonymisation des données applicatives
    - suppression utilisateur Auth côté serveur
    - sauvegardes/logs fournisseurs selon rotation documentée
14. Relecteur humain/juridique final : À CONFIRMER
15. Date de relecture finale : À CONFIRMER
```

## Politique de conservation approuvée par le propriétaire

Le propriétaire approuve la proposition opérationnelle suivante, sous réserve de validation juridique finale :

- revue des comptes inactifs après **24 mois** ;
- délai opérationnel cible de suppression des données actives : **30 jours maximum** après demande confirmée ;
- logs techniques ordinaires : **30 jours** ;
- logs liés à l’investigation d’un incident : jusqu’à **90 jours** ;
- suppression des objets Supabase Storage avant suppression de l’utilisateur Auth ;
- suppression/anonymisation des données du dossier lors de la fermeture du compte, sous réserve d’une obligation légale ou d’un litige documenté.

## Statut commercial confirmé

Pour la Phase 1 :

- l’orientation en ligne est **gratuite** ;
- les futurs services payants d’accompagnement et de préparation de dossier ne sont **pas encore commercialisés** ;
- le propriétaire souhaite lancer cette version gratuite avant immatriculation en Tunisie ; cette décision produit ne vaut pas validation juridique de ce lancement ;
- aucun pack Bronze/Silver/Gold, tarif, paiement ou condition commerciale ne doit être présenté comme actif tant qu’il n’a pas été formellement défini et relu ;
- avant toute activation commerciale, les conditions applicables devront être finalisées et publiées.

## Champs humains encore ouverts

A38 n’est pas prête à être publiée tant que les points suivants ne sont pas réellement résolus :

1. déterminer avec le relecteur quelle adresse publique peut/doit être publiée pour un lancement exploité depuis l’Allemagne avant établissement/immatriculation en Tunisie ;
2. confirmer avec le relecteur le cadre applicable à une exploitation publique gratuite depuis l’Allemagne avant immatriculation en Tunisie, puis compléter immatriculation / registre / identifiant fiscal lorsqu’ils existent ;
3. détermination de l’existence ou non d’un DPO ;
4. détermination d’une éventuelle activité réglementée/autorisation ;
5. bases juridiques des traitements ;
6. transferts internationaux et garanties des fournisseurs, selon les contrats réellement applicables ;
7. autorité de contrôle, droit applicable et règlement des litiges selon l’établissement final ;
8. relecteur humain/juridique final, date de relecture, version et date d’entrée en vigueur.

## Condition de clôture A38

A38 peut être clôturée uniquement lorsque :

1. les champs publics restants ci-dessus sont complétés ;
2. les trois brouillons juridiques sont mis à jour sans placeholder bloquant ;
3. un humain compétent les relit et valide ;
4. les pages publiques finales correspondent exactement aux textes validés ;
5. `A38_REVIEW_READY: false` est remplacé par `A38_REVIEW_READY: true` dans le commit de finalisation.

## Gate mécanique après la vraie relecture

Le workflow `.github/workflows/almago-a38-readiness.yml` vérifie les documents et publie une preuve liée au SHA exact.

Le workflow `.github/workflows/almago-a38-human-approval.yml` ne peut fermer A38 que lorsque :

1. les textes finalisés sont mergés sur `main` ;
2. l’Issue A38 contient la preuve machine liée au SHA exact ;
3. un administrateur autorisé poste exactement : `A38 HUMAN REVIEW APPROVED`.

Jusqu’à cette étape, les brouillons restent non publiables.
