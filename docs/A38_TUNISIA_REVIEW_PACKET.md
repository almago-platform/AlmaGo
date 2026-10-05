# A38 — paquet de relecture Tunisie / INPDP

**Statut : préparation opérationnelle uniquement — ne constitue pas un avis juridique ni une autorisation d’ouvrir la collecte.**

Date de préparation : **5 octobre 2026**

Ce document rassemble les faits techniques déjà vérifiés dans AlmaGo/Campus Allemagne et les questions qui doivent être confirmées par un relecteur tunisien compétent et/ou l’INPDP avant toute collecte réelle.

## 1. Situation produit déjà confirmée

- Nom public : **Campus Allemagne**.
- Exploitant actuel prévu : **Ayoub Tayari**, personne physique.
- Ouverture réelle prévue après établissement légal en **Tunisie**.
- E-mail public prévu : **contact@campus-allemagne.info**.
- Runtime canonique : **Render**, région Frankfurt.
- Auth / base / Storage : **Supabase**, projet en région `eu-west-1`.
- Analytics / marketing : **OFF**.
- Paiement production : **OFF**.
- Vraie capture prospect publique : **OFF** sous `ALMAGO_PARTNER_PRELAUNCH_MODE`.
- Orientation gratuite disponible sans persistance.
- Décision propriétaire du 5 octobre 2026 : la collecte persistée initiale (e-mail + orientation sauvegardée + poursuite vers un compte lié) est **18+ uniquement**.
- Politique de conservation/suppression propriétaire approuvée : voir `docs/A38_OWNER_CONFIRMATION.md`.

## 2. Flux de données à examiner en priorité

### Free Validation

Données pouvant être persistées lorsque le gate sera un jour activé :

- prénom ;
- nom ;
- date de naissance ;
- e-mail ;
- réponses d’orientation académique et linguistique ;
- préférences de villes et budget ;
- acknowledgement de confidentialité ;
- consentement contact facultatif, séparé ;
- signal explicite « Je veux continuer » ;
- métadonnées techniques bornées ;
- jetons de reprise/intérêt stockés sous forme hachée.

La persistance n’est pas nécessaire pour utiliser l’orientation locale/non sauvegardée.

### Compte étudiant et dossier

Après création volontaire d’un compte, le produit peut traiter :

- profil étudiant ;
- projet d’études ;
- checklist ;
- recommandations ;
- candidatures ;
- notifications ;
- documents dans un bucket Storage privé ;
- historique et notes internes réservées à l’équipe.

Voir l’inventaire complet : `docs/data-processing-inventory.md`.

## 3. Sources officielles INPDP à utiliser pour la relecture

Sources consultées le 5 octobre 2026 :

- Textes INPDP : https://www.inpdp.tn/Texte.html
- Formulaires INPDP : https://www.inpdp.tn/Formulaires.html
- Manuel de procédures : https://www.inpdp.tn/Manuel_procedures_INPDP.pdf
- Formulaire / procédure de transfert vers l’étranger : https://www.inpdp.tn/Procedures.pdf
- Site / coordonnées INPDP : https://www.inpdp.tn/

La page « Formulaires » indique qu’une procédure préalable est requise et qu’une **déclaration est à réaliser pour chaque finalité de traitement**. Elle indique également que les transferts de données à l’étranger font partie des traitements nécessitant, en plus de la déclaration, une **demande d’autorisation**.

Le formulaire de transfert demande notamment :

- identité et adresse du demandeur ;
- finalité du transfert ;
- identité / nature du bénéficiaire ;
- pays destinataire ;
- nature du traitement ;
- catégories de données transférées ;
- garanties mises en œuvre.

Ces constats sont des éléments de préparation. Leur applicabilité exacte au montage Campus Allemagne doit être confirmée par le relecteur/INPDP.

## 4. Questions juridiques exactes à confirmer

Le relecteur doit fournir une réponse explicite, exploitable pour la version finale, sur les points suivants.

### Responsable / établissement

1. L’exploitation envisagée par Ayoub Tayari comme personne physique établie en Tunisie est-elle compatible avec les conditions applicables au responsable de traitement ?
2. Quelle adresse doit être publiée et utilisée dans les déclarations avant ouverture ?
3. Quelles mentions d’immatriculation, registre, identifiant fiscal ou autorisation professionnelle sont applicables ?
4. Une désignation de DPO ou fonction équivalente est-elle requise dans ce contexte ?

### Déclarations / finalités

5. Quelles finalités doivent faire l’objet de déclarations distinctes ?
6. Les finalités suivantes peuvent-elles être regroupées ou doivent-elles être séparées :
   - orientation gratuite sauvegardée ;
   - e-mail transactionnel ;
   - création/gestion de compte ;
   - suivi de dossier/candidatures ;
   - consentement facultatif au contact ;
   - signal volontaire « Je veux continuer » ;
   - gestion de documents ?
7. Quelle base juridique et quelle formulation d’information/consentement retenir pour chacune ?

### Transferts internationaux

8. L’utilisation de Render Frankfurt et Supabase `eu-west-1` constitue-t-elle un transfert soumis à autorisation INPDP dans ce montage ?
9. Une autorisation doit-elle être demandée par fournisseur, par finalité ou autrement ?
10. Quels contrats / garanties / annexes fournisseur doivent être joints ou conservés ?
11. Quelles localisations ou sous-traitants ultérieurs doivent être documentés ?

### Mineurs

12. Confirmer que le choix produit **18+ uniquement pour la persistance initiale** permet de ne pas ouvrir le parcours persistant mineur tant qu’un mécanisme spécifique n’est pas validé.
13. Confirmer si l’orientation non persistée/localement calculée peut rester accessible aux moins de 18 ans dans les conditions prévues.

### Conservation / droits

14. Valider ou corriger les durées déjà approuvées par le propriétaire :
   - revue compte/profil après 24 mois d’inactivité ;
   - documents supprimés lorsqu’ils ne sont plus utiles / avec le compte ;
   - logs ordinaires 30 jours ;
   - logs incident jusqu’à 90 jours ;
   - objectif opérationnel de suppression active sous 30 jours.
15. Faut-il une durée distincte pour un prospect Free Validation n’ayant jamais créé de compte ?
16. Quels droits et modalités doivent être décrits dans la notice finale ?
17. Quelle autorité / voie de réclamation et quel droit applicable doivent être mentionnés ?

## 5. Documents à remettre au relecteur

- `docs/A38_OWNER_CONFIRMATION.md`
- `docs/A38_FINALIZATION_MATRIX.md`
- `docs/data-processing-inventory.md`
- `docs/legal-imprint-draft.md`
- `docs/legal-privacy-draft.md`
- `docs/legal-terms-draft.md`
- `docs/A38_RETENTION_POLICY_PROPOSAL.md`
- `docs/FREE_VALIDATION_PRIVACY_GATE.md`

## 6. Informations propriétaire encore manquantes avant version finale

Ne pas inventer ces éléments :

- adresse publique finale après établissement en Tunisie ;
- immatriculation / registre / identifiant fiscal réels ;
- éventuelle autorisation/licence applicable ;
- identité du relecteur final ;
- date de relecture ;
- version/date d’entrée en vigueur.

## 7. Règle de lancement

Jusqu’à validation humaine et formalités applicables :

- `A38_REVIEW_READY` reste **false** ;
- la capture réelle reste désactivée ;
- aucun analytics/marketing ne doit être activé ;
- aucun paiement public ne doit être activé ;
- les documents juridiques publics restent en état « en cours de finalisation ».

Une fois les réponses obtenues, elles doivent être intégrées dans les trois textes canoniques, relues, mergées sur un **main gelé**, puis la chaîne de preuve exact-SHA A38 → A43 → A44 → A45 doit être rejouée.
