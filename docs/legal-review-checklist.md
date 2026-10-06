# AlmaGo — checklist de préparation juridique (A38)

**Statut : brouillon de préparation, non validé juridiquement.**

Ce document sert à préparer la relecture humaine demandée par A38. Il ne constitue pas un avis juridique.

## 1. Mentions / informations éditeur

Source officielle vérifiée le 23 septembre 2026 :

- DDG § 5 : https://www.gesetze-im-internet.de/ddg/__5.html

Pour un service entrant dans le champ de cette obligation, vérifier notamment les informations applicables parmi :

- nom de l’éditeur / exploitant ;
- adresse d’établissement ;
- adresse e-mail permettant un contact électronique rapide ;
- forme juridique et représentant si personne morale ;
- registre et numéro d’immatriculation si applicable ;
- numéro de TVA / Wirtschafts-Identifikationsnummer si applicable ;
- autres informations propres à une activité réglementée si applicable.

Ne pas publier de numéro ou qualité qui n’existe pas.

## 2. Information RGPD lors de la collecte

Source officielle :

- RGPD, article 13 : https://eur-lex.europa.eu/eli/reg/2016/679

La notice finale doit être relue pour couvrir notamment, lorsque applicable :

- identité et coordonnées du responsable du traitement ;
- coordonnées du DPO si un DPO existe ;
- finalités et base(s) juridique(s) ;
- destinataires ou catégories de destinataires ;
- éventuels transferts internationaux et garanties associées ;
- durée de conservation ou critères utilisés pour la déterminer ;
- droits d’accès, rectification, effacement, limitation, opposition et portabilité selon leur applicabilité ;
- retrait du consentement lorsque le traitement repose sur le consentement ;
- droit d’introduire une réclamation auprès d’une autorité de contrôle ;
- caractère obligatoire/facultatif de certaines données et conséquences éventuelles ;
- information sur une éventuelle décision automatisée si elle existe.

AlmaGo ne doit pas prétendre prendre automatiquement une décision d’admission.

## 3. Cookies / accès au terminal

Source officielle :

- TDDDG § 25 : https://www.gesetze-im-internet.de/ttdsg/__25.html

Avant A44, vérifier tout futur analytics/SDK.

Le texte légal prévoit en principe un consentement pour le stockage d’informations sur l’équipement terminal ou l’accès à des informations déjà stockées, avec des exceptions notamment pour ce qui est strictement nécessaire au service demandé.

Conséquence opérationnelle pour AlmaGo :

- ne pas activer un outil analytics simplement parce qu’une clé existe ;
- inventorier cookies/localStorage/identifiants du fournisseur ;
- décider avec la relecture juridique si un consentement est requis ;
- documenter la durée et le retrait éventuel.

## 4. Inventaire technique déjà préparé

Voir :

- `docs/data-processing-inventory.md`
- `docs/observability.md`
- `config/telemetry-events.json`

Ces documents décrivent le schéma et la frontière technique actuelle, mais ne choisissent pas la base juridique.

## 5. Informations encore attendues du propriétaire

Utiliser **un seul formulaire** : `docs/A38_OWNER_CONFIRMATION.md`.

Le dépôt fournit déjà les catégories de données, les sous-traitants techniques visibles et le fait qu’aucun analytics n’est actif. Le fournisseur analytics futur appartient à A44 et n’est **plus une condition préalable A38**.

Le statut pré-lancement/gratuit, la configuration d’offres TND de test, la politique de conservation et la procédure de suppression sont déjà confirmés dans le formulaire propriétaire.

A38 attend encore uniquement :
- l’adresse publique finale et les informations d’immatriculation/fiscales réellement applicables ;
- la détermination DPO / activité réglementée / autorisation éventuelle ;
- les bases juridiques, transferts internationaux, droit applicable et autorité compétente ;
- la relecture humaine/juridique finale, avec version et date d’entrée en vigueur.

## 6. Condition de clôture A38

A38 ne doit être marquée DONE que lorsque :

1. les champs publics sont confirmés ;
2. la politique de rétention/suppression est décidée ;
3. les textes finaux sont relus humainement ;
4. les pages publiques correspondent exactement aux textes relus.
