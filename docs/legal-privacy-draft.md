# Campus Allemagne — brouillon de notice de confidentialité

**NE PAS PUBLIER TEL QUEL — bases juridiques, transferts et relecture finale restent à confirmer humainement.**

## 1. Responsable

Responsable du traitement prévu : **Ayoub Tayari**

Forme actuelle : **personne physique**

Pays de développement / démonstration partenaire avant ouverture : **Allemagne**

Pays prévu pour l’établissement légal et l’ouverture du service : **Tunisie**

Adresse : **[À CONFIRMER AVANT PUBLICATION]**

Contact : **contact@campus-allemagne.info**

DPO : **[À CONFIRMER PAR LE RELECTEUR SELON APPLICABILITÉ]**

## 2. Données traitées

Inventaire technique détaillé : `docs/data-processing-inventory.md`.

Grandes catégories observées :

- prospect Free Validation : e-mail, réponses d’orientation, consentement contact facultatif, signal explicite de souhait de continuer et historique Smart Orientation ;
- compte et authentification via Supabase Auth ;
- profil et coordonnées étudiant ;
- parcours académique et langues ;
- projet d’études et préférences ;
- documents et métadonnées de fichiers ;
- checklist et historique du dossier ;
- recommandations d’orientation ;
- candidatures, échéances, actions et résultats ;
- notifications et consentements ;
- notes internes réservées à l’équipe ;
- journaux techniques internes.

## 3. Finalités

Finalités correspondant au produit actuel :

- permettre une orientation gratuite sans compte ;
- sauvegarder une orientation lorsqu’un visiteur choisit volontairement de laisser son e-mail ;
- délivrer ultérieurement un rapport/e-mail transactionnel lorsque ce canal sera légalement activé ;
- enregistrer séparément un consentement facultatif à être recontacté ;
- enregistrer séparément le signal explicite « Je veux continuer avec Campus Allemagne » afin de mesurer la demande Free Validation ;
- créer et maintenir l’espace étudiant ;
- organiser le dossier académique ;
- recevoir, stocker et vérifier les documents ;
- présenter des recommandations d’orientation préparées dans Campus Allemagne ;
- suivre les candidatures et leurs prochaines actions ;
- assurer l’administration, la sécurité et le fonctionnement technique ;
- gérer les consentements lorsque nécessaire.

**Base(s) juridique(s) correspondantes : [À DÉTERMINER ET RELIRE].**

## 4. Destinataires / sous-traitants techniques

Actuellement visibles dans le projet :

- **Supabase** — Auth, PostgreSQL et Storage ; région technique du projet vérifiée le 02/10/2026 : `eu-west-1` ;
- **Render** — hébergement/déploiement canonique de l’application ; région vérifiée le 02/10/2026 : **Frankfurt**.

Une intégration Vercel reste liée au dépôt pour des usages de développement/preview historiques ou futurs. Son éventuel rôle de traitement de données en production ne doit être décrit qu’après vérification contractuelle et technique.

Analytics/observabilité produit : **non actif à ce jour**. Le fournisseur éventuel sera choisi et validé séparément dans A44 avant toute activation.


Compte tenu des localisations techniques ci-dessus, **ne pas activer la collecte réelle en supposant que les transferts internationaux sont déjà couverts**. La loi tunisienne et les formalités INPDP applicables aux transferts hors Tunisie doivent être confirmées avant activation du Free Validation Launch. Le gate de préparation est documenté dans `docs/FREE_VALIDATION_PRIVACY_GATE.md`.

Pour chaque fournisseur, confirmer avant publication :

- rôle contractuel ;
- lieu(x) de traitement ;
- transferts internationaux éventuels ;
- garanties applicables ;
- durée de conservation.

## 5. Durées de conservation — décision propriétaire approuvée

Le propriétaire a approuvé la politique opérationnelle suivante, sous réserve de validation juridique finale :

- compte/profil : conservation pendant l’utilisation active ; revue après **24 mois d’inactivité** ;
- documents : conservation tant qu’ils sont utiles au dossier actif ; suppression avec le compte ou dès qu’ils ne sont plus nécessaires ;
- candidatures/historique/notes internes : suppression ou anonymisation avec le dossier, sauf obligation légale ou litige documenté ;
- logs techniques ordinaires : **30 jours** ;
- logs liés à l’investigation d’un incident : jusqu’à **90 jours** ;
- suppression des données actives après demande confirmée : objectif opérationnel de **30 jours maximum**.

## 6. Suppression

Procédure approuvée par le propriétaire :

1. confirmer l’identité et la demande ;
2. supprimer les objets du bucket privé via l’API Supabase Storage ;
3. vérifier l’absence d’objets utilisateur résiduels ;
4. supprimer/anonymiser les données applicatives selon les règles validées ;
5. supprimer l’utilisateur via l’API d’administration Supabase Auth côté serveur ;
6. laisser expirer sauvegardes/logs fournisseurs selon leur rotation documentée, avec réapplication des suppressions en cas de restauration.

Cette procédure reste soumise à la validation juridique finale quant aux éventuelles obligations de conservation.

## 7. Droits

Le texte final doit décrire les droits applicables au contexte réel après relecture humaine.

Canal de demande prévu : **contact@campus-allemagne.info**

Autorité de contrôle / réclamation : **[À CONFIRMER AVANT OUVERTURE RÉELLE SELON L’ÉTABLISSEMENT LÉGAL, LE PUBLIC VISÉ ET LES RÈGLES APPLICABLES]**

## 8. Cookies et analytics

Aucun fournisseur analytics n’est actuellement actif dans Campus Allemagne.

Avant toute activation A44 :

- inventorier cookies/localStorage/identifiants du fournisseur ;
- appliquer la politique d’événements prévue ;
- décider si un consentement est nécessaire ;
- documenter fournisseur, transferts et rétention.

## 9. Statut commercial actuel

L’orientation en ligne est actuellement **gratuite**.

Le propriétaire souhaite que le premier lancement réel soit un **Free Validation Launch** : orientation gratuite, e-mail facultatif, mesure d’un souhait explicite de continuer, puis éventuellement une cohorte pilote gratuite. Cette stratégie ne constitue pas à elle seule une autorisation juridique de collecter des données réelles : le gate #717 doit être clarifié avant activation.

Des offres payantes d’accompagnement et de préparation de dossier sont configurées pour le pré-lancement et les tests internes, mais ne sont **pas encore ouvertes à la vente publique**. Leur activation publique reste soumise aux gates juridique et de lancement.

Toute activation commerciale devra être accompagnée d’une mise à jour des conditions applicables et de la présente notice si nécessaire.

## 10. Modifications de la notice

Version : **[À CONFIRMER]**

Date d’entrée en vigueur : **[À CONFIRMER]**

Relecteur humain/juridique : **[À CONFIRMER]**
