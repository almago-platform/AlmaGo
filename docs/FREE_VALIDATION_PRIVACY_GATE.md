# Free Validation Launch — privacy gate de préparation

**Statut : préparation interne uniquement. Ne constitue pas un avis juridique, une déclaration INPDP ni une autorisation d’ouvrir la collecte réelle.**

Dernière vérification factuelle : **2 octobre 2026**.

## 1. But

Le premier lancement visé sert à valider la demande sans paiement :

```
orientation gratuite
→ Smart Orientation
→ e-mail facultatif
→ consentement contact séparé
→ souhait explicite de continuer
→ éventuel pilote gratuit sur invitation
```

Le présent gate sépare :
- **Gate A** : e-mail + orientation + signal d’intérêt ;
- **Gate B** : vrais documents d’un pilote invité.

## 2. Sources officielles à faire relire

INPDP :
- https://www.inpdp.tn/Formulaires.html
- https://www.inpdp.tn/formulaires.pdf
- https://www.inpdp.tn/Manuel_procedures_INPDP.pdf
- https://www.inpdp.tn/ressources/loi_2004.pdf
- https://www.inpdp.tn/contact.html

Points identifiés à confirmer avant activation :
- déclaration préalable par finalité ;
- information claire des personnes ;
- consentement exprès/traçable lorsqu’il est requis ;
- droits d’accès, rectification, opposition/retrait et suppression ;
- lieu/durée de conservation et sécurité ;
- formalités de transfert hors Tunisie ;
- conditions applicables au responsable et aux sous-traitants ;
- régime spécifique des personnes mineures.

## 3. Architecture réelle actuelle

Render :
- service canonique : `almago-dev` ;
- région vérifiée : **Frankfurt** ;
- plan : Free.

Supabase :
- Auth, PostgreSQL, Storage ;
- région technique vérifiée : `eu-west-1` ;
- plan : Free.

Désactivé aujourd’hui :
- collecte publique réelle prospect ;
- livraison e-mail production ;
- analytics/marketing ;
- paiement production.

Le mode `ALMAGO_PARTNER_PRELAUNCH_MODE` maintient ces effets de production désactivés.

## 4. Gate A — prospect Free Validation

Données prévues lorsqu’un visiteur choisit de sauvegarder :
- adresse e-mail ;
- statut/année/filière du Bac ;
- moyenne officielle ou actuelle/estimée ;
- niveau et domaine visés ;
- langues ;
- budget approximatif ;
- villes préférées facultatives ;
- acknowledgement confidentialité ;
- consentement contact facultatif ;
- priorité Smart Orientation ;
- signal `wants_support` uniquement après clic explicite ;
- métadonnées techniques minimales.

Finalités à séparer et confirmer :
1. sauvegarder/restituer l’orientation ;
2. envoyer le rapport transactionnel ;
3. rattacher ultérieurement l’orientation à un compte gratuit ;
4. enregistrer le souhait explicite de poursuivre ;
5. contacter uniquement lorsqu’une autorisation correspondante existe.

Avant activation :
- [ ] responsable du traitement confirmé ;
- [ ] adresse publique/juridiquement utilisable confirmée ;
- [ ] applicabilité des conditions de l’article 22 clarifiée ;
- [ ] déclarations INPDP applicables préparées/soumises ;
- [ ] transfert international clarifié et autorisation obtenue si requise ;
- [ ] notice FR/AR relue ;
- [ ] consentement/acknowledgement versionné ;
- [ ] durée de conservation approuvée ;
- [ ] procédure de retrait/suppression testée ;
- [ ] fournisseurs et lieux de traitement vérifiés ;
- [ ] test E2E synthétique exact-SHA.

## 5. Mineurs

Le produit peut intéresser des élèves préparant le Bac.

La loi 2004-63 contient un régime spécifique pour les données d’un enfant. Pour réduire la complexité du premier test réel, l’option opérationnelle recommandée est :

> **réserver la collecte persistée Free Validation aux personnes de 18 ans ou plus**, jusqu’à validation juridique d’un parcours mineur.

Cette recommandation n’est pas encore une décision propriétaire.

Si les mineurs doivent être inclus dans la collecte persistée, le flux ne doit être conçu qu’après confirmation du processus applicable au tuteur et à l’autorisation du juge de la famille.

## 6. Gate B — pilote documents

Le signal `wants_support` n’ouvre jamais les documents.

Avant le premier vrai document :
- [ ] cohorte limitée et invitation humaine ;
- [ ] catégories de documents explicitement autorisées ;
- [ ] données de santé/sensibles exclues sauf besoin validé séparément ;
- [ ] finalité/conservation/suppression définies par catégorie ;
- [ ] cadre de transfert international confirmé pour Storage ;
- [ ] RLS et accès admin revalidés ;
- [ ] suppression Storage testée ;
- [ ] notice/consentement mis à jour ;
- [ ] formalités INPDP additionnelles confirmées ;
- [ ] E2E sécurité synthétique réussi.

## 7. Questions à faire confirmer par l’INPDP ou un relecteur tunisien compétent

1. Quelles déclarations préalables sont nécessaires pour sauvegarde d’orientation, e-mail transactionnel et suivi volontaire ?
2. L’utilisation de Render Frankfurt et Supabase `eu-west-1` implique-t-elle une autorisation de transfert au titre des articles 50 à 52, et selon quelles modalités ?
3. Comment s’applique la condition de résidence mentionnée à l’article 22 dans le montage réel envisagé ?
4. Un pilote de collecte persistée réservé aux personnes de 18 ans ou plus évite-t-il les formalités propres à l’article 28 sur les enfants ?
5. Quelles formalités additionnelles s’appliquent plus tard à des documents académiques ou d’identité sur invitation ?

## 8. Exit criteria

Gate A n’est prêt qu’après confirmation humaine compétente des formalités applicables et mise à jour A38.

Gate B reste fermé indépendamment tant que la partie documents n’a pas été revue.

Aucun agent ne doit transformer ce document en « conformité validée » sans les confirmations externes requises.
