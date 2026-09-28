# AlmaGo — brouillon de notice de confidentialité

**NE PAS PUBLIER TEL QUEL — base juridique, durées, responsable et fournisseurs à confirmer humainement.**

## 1. Responsable

Responsable du traitement : **[NOM LÉGAL À CONFIRMER]**

Adresse : **[À CONFIRMER]**

Contact : **[EMAIL À CONFIRMER]**

DPO : **[À CONFIRMER / NON APPLICABLE]**

## 2. Données traitées

Inventaire technique détaillé : `docs/data-processing-inventory.md`.

Grandes catégories observées :

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

## 3. Finalités à valider

Brouillon de finalités correspondant au produit actuel :

- créer et maintenir l’espace étudiant ;
- organiser le dossier académique ;
- recevoir, stocker et vérifier les documents ;
- présenter des recommandations d’orientation préparées dans AlmaGo ;
- suivre les candidatures et leurs prochaines actions ;
- assurer l’administration, la sécurité et le fonctionnement technique ;
- gérer les consentements lorsque nécessaire.

**Base(s) juridique(s) correspondantes : [À DÉTERMINER ET RELIRE].**

## 4. Destinataires / sous-traitants techniques

Actuellement visibles dans le projet :

- Supabase — Auth, PostgreSQL et Storage ;
- Render — hébergement/déploiement canonique actuellement utilisé pour l’application ;
- une intégration Vercel reste visible/connectée au dépôt ; son rôle technique éventuel et tout traitement de données associé doivent être confirmés avant publication, sans la présenter comme hébergement canonique sans preuve.

Analytics/observabilité produit : **non actif à ce jour**. Le fournisseur éventuel sera choisi et validé séparément dans A44 avant toute activation.

Pour chaque fournisseur, confirmer avant publication :
- rôle contractuel ;
- lieu(x) de traitement ;
- transferts internationaux éventuels ;
- garanties applicables ;
- durée de conservation.

## 5. Durées de conservation

Les migrations actuelles ne définissent pas de politique métier complète de rétention.

À décider :

- compte/profil : **[DURÉE OU CRITÈRE]** ;
- documents : **[DURÉE OU CRITÈRE]** ;
- candidatures/historique : **[DURÉE OU CRITÈRE]** ;
- notes internes : **[DURÉE OU CRITÈRE]** ;
- logs techniques : **[DURÉE OU CRITÈRE]** ;
- analytics/observabilité : **[DURÉE OU CRITÈRE]**.

## 6. Suppression

Certaines tables liées au compte utilisent des suppressions SQL en cascade.

Cela ne suffit pas, à lui seul, à garantir l’effacement complet des objets Storage, sauvegardes ou systèmes tiers.

Procédure de suppression : une proposition technique documentée existe dans `docs/A38_RETENTION_POLICY_PROPOSAL.md` ; elle doit encore être approuvée ou modifiée par le propriétaire/relecteur avant publication.

## 7. Droits

Le texte final doit décrire les droits applicables au contexte réel et la manière de les exercer, après relecture humaine.

Canal de demande : **[EMAIL / PROCÉDURE À CONFIRMER]**.

Autorité de contrôle / réclamation : **[À CONFIRMER SELON ÉTABLISSEMENT]**.

## 8. Cookies et analytics

Aucun fournisseur analytics n’est actuellement codé comme actif dans AlmaGo.

Avant A44 :
- examiner les cookies/stockages utilisés ;
- appliquer `config/telemetry-events.json` ;
- décider si un consentement est nécessaire ;
- documenter le fournisseur et la rétention.

## 9. Modifications de la notice

Version : **[À CONFIRMER]**

Date d’entrée en vigueur : **[À CONFIRMER]**
