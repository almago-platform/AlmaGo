# A38 — confirmation propriétaire minimale

A38_REVIEW_READY: false

**Statut : document interne de collecte, non validé juridiquement, ne pas publier tel quel.**

Objectif : réduire A38 aux seules décisions qui ne peuvent pas être déduites du code ou des migrations AlmaGo.

Ne jamais mettre ici de mot de passe, clé API, document d’identité ou autre secret.

## Ce qui est déjà établi — aucune réponse propriétaire requise

Le dépôt et les migrations montrent déjà les faits techniques suivants :

- le service s’appelle **AlmaGo** ;
- le service organise un projet d’études en Allemagne : profil, documents, checklist, orientation et suivi de candidatures ;
- Supabase fournit Auth, PostgreSQL et Storage ;
- Render fournit actuellement l’hébergement/déploiement canonique ;
- les catégories de données traitées sont inventoriées dans `docs/data-processing-inventory.md` ;
- les recommandations AlmaGo ne sont pas des décisions d’admission ;
- aucun fournisseur analytics/observabilité n’est actuellement actif dans l’application ;
- l’activation d’un futur fournisseur analytics appartient à **A44** et ne doit pas bloquer la validation de la situation actuelle en A38.

## Voie rapide — accepter ou modifier la proposition de rétention

Une proposition interne détaillée est disponible dans `docs/A38_RETENTION_POLICY_PROPOSAL.md`.

Si le propriétaire et le relecteur l'acceptent, il n'est pas nécessaire de ressaisir toutes les durées. Il suffit d'écrire dans le bloc ci-dessous :

`Politique de conservation proposée : APPROUVÉE`

La proposition actuellement soumise à validation utilise :
- revue des comptes inactifs après **24 mois** ;
- délai opérationnel cible de suppression des données actives : **30 jours maximum** après demande confirmée ;
- logs techniques ordinaires : **30 jours** ;
- logs liés à l'investigation d'un incident : jusqu'à **90 jours** ;
- suppression des objets Supabase Storage avant suppression de l'utilisateur Auth ;
- suppression/anonymisation des données de dossier à la fermeture du compte, sous réserve d'une obligation légale ou d'un litige documenté.

Ces valeurs restent une **proposition**, pas une décision juridique. Le propriétaire/relecteur peut les modifier ligne par ligne.

## Une seule confirmation humaine à remplir

Copier ce bloc et compléter uniquement les lignes applicables :

```text
A38 OWNER CONFIRMATION

1. Éditeur / exploitant légal :
2. Forme juridique : [personne physique / société + forme / autre]
3. Représentant légal, si applicable : [N/A si non applicable]
4. Adresse publique à publier :
5. E-mail public de contact :
6. Registre + numéro, si applicable : [N/A si non applicable]
7. TVA / W-IdNr, si applicable : [N/A si non applicable]
8. Pays principal d’établissement :
9. Statut commercial actuel : [gratuit / payant]
10. DPO : [nom/contact / aucun DPO / à confirmer par le relecteur]
11. Activité soumise à autorisation ou profession réglementée : [non / oui + autorité]
12. Politique de conservation proposée : [APPROUVÉE / MODIFICATIONS CI-DESSOUS]
    - compte + profil : [24 mois d'inactivité avant revue, si approuvé]
    - documents : [suppression avec le compte / dès qu'ils ne sont plus utiles, si approuvé]
    - candidatures + historique + notes internes : [suppression/anonymisation avec le dossier, sauf obligation documentée, si approuvé]
    - logs techniques : [30 jours / jusqu'à 90 jours pour incident, si approuvé]
13. Procédure de suppression validée : [APPROUVÉE / MODIFICATIONS]
    - Storage Supabase via API avant suppression Auth
    - suppression/anonymisation des données applicatives
    - suppression utilisateur Auth côté serveur
    - sauvegardes/logs fournisseurs selon rotation documentée
14. Relecteur humain/juridique final :
15. Date de relecture finale :
```

Une durée fixe n’est pas obligatoire si un **critère de conservation clair** est retenu et validé par le relecteur.

## Décisions qui ne sont plus demandées en A38

Ne pas demander au propriétaire de ressaisir :

- la liste des champs de profil ;
- la liste des tables ;
- les catégories de documents ;
- les sous-traitants techniques déjà visibles dans le dépôt ;
- le fournisseur analytics futur.

Ces éléments sont soit déjà inventoriés, soit appartiennent à A44.

## Base de relecture

Sources officielles vérifiées le 23 septembre 2026 :

- DDG § 5 — informations générales du fournisseur : https://www.gesetze-im-internet.de/ddg/__5.html
- RGPD article 13 — information lors de la collecte : https://eur-lex.europa.eu/eli/reg/2016/679
- TDDDG § 25 — stockage/accès sur l’équipement terminal : https://www.gesetze-im-internet.de/ttdsg/__25.html

Le relecteur doit déterminer l’applicabilité exacte au contexte réel d’AlmaGo et confirmer notamment les bases juridiques, droits, transferts, durées/critères et éventuelles obligations supplémentaires.

## Condition de clôture A38

A38 peut être clôturée uniquement lorsque :

1. le bloc de confirmation ci-dessus est complété ;
2. les décisions de conservation/suppression sont approuvées ;
3. les trois brouillons juridiques sont mis à jour avec ces réponses ;
4. un humain compétent les relit et valide ;
5. les pages publiques finales correspondent exactement aux textes validés.

## Preuve automatique de préparation

Quand toutes les informations sont réellement remplies et que les trois textes ne contiennent plus aucun placeholder/warning de brouillon, remplacer `A38_REVIEW_READY: false` par `A38_REVIEW_READY: true` dans cette même PR.

Le workflow `.github/workflows/almago-a38-readiness.yml` vérifie alors automatiquement les quatre fichiers et publie sur l’Issue A38 un marqueur lié au SHA exact de `main`. Si un placeholder subsiste, le workflow échoue et A38 reste ouverte.

## Gate mécanique après la vraie relecture

La décision reste humaine. Le workflow `.github/workflows/almago-a38-human-approval.yml` ne peut fermer A38 que lorsque :

1. les textes finalisés ont été mergés sur `main` ;
2. l’Issue A38 contient une preuve machine liée au **SHA exact** sous la forme `<!-- almago-a38-review-ready:sha=... -->` ;
3. le propriétaire du repository poste exactement : `A38 HUMAN REVIEW APPROVED`.

Le workflow vérifie que le signal vient du propriétaire et qu’il correspond au SHA courant de `main`, puis il ferme A38 et relance le Master Orchestrator. Il n’effectue aucune appréciation juridique lui-même.

Jusqu’à cette étape, les brouillons restent marqués **NE PAS PUBLIER TEL QUEL**.
