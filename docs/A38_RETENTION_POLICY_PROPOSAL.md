# A38 — proposition de politique de conservation et suppression

**Statut : PROPOSITION INTERNE POUR VALIDATION — ne constitue pas un avis juridique et ne doit pas être publiée telle quelle.**

Date de préparation : 24 septembre 2026.

Objectif : fournir au propriétaire et au relecteur A38 une base opérationnelle courte, cohérente avec l'architecture actuelle d'AlmaGo, afin de réduire les décisions restantes sans inventer l'identité juridique de l'exploitant.

## 1. Principes proposés

- conserver les données personnelles uniquement aussi longtemps qu'elles sont nécessaires à la finalité annoncée ;
- prévoir des échéances de revue et d'effacement plutôt qu'une conservation indéfinie ;
- séparer les données nécessaires au service des données purement techniques ;
- supprimer les documents et données de dossier lors de la fermeture du compte, sauf obligation légale ou litige justifiant une conservation ciblée ;
- conserver, si nécessaire, seulement une preuve minimale d'une suppression/consentement, sans conserver le contenu du dossier ;
- ne jamais conserver un document étudiant uniquement « au cas où ».

Références de principe à faire confirmer par le relecteur :
- Commission européenne — principe de limitation de la conservation (RGPD) ;
- EDPB — principes de traitement, dont limitation de la conservation ;
- RGPD art. 5 et art. 13/17 selon applicabilité.

## 2. Politique opérationnelle proposée

### Compte, profil et checklist

Proposition :
- conservation pendant que le compte est actif et que le service est utilisé ;
- revue des comptes sans activité depuis **24 mois** ;
- avant suppression automatique d'un compte inactif : notification et délai de **30 jours** pour réactivation ;
- après demande confirmée de suppression : suppression des données actives dans un objectif opérationnel de **30 jours maximum**, sauf obligation légale ou litige documenté.

### Documents étudiants

Proposition :
- conservation uniquement pendant la préparation/suivi du projet d'études et tant que le compte est actif ;
- permettre la suppression d'un document qui n'est plus utile ;
- lors de la fermeture du compte : suppression des objets du bucket privé `student-documents` avant suppression de l'utilisateur Auth ;
- objectif opérationnel : effacement du Storage actif sous **30 jours maximum** après demande confirmée.

Important : la suppression doit passer par l'API Supabase Storage, pas par une suppression SQL directe des métadonnées.

### Orientation, candidatures, historique et notifications

Proposition :
- conservation pendant la vie active du dossier ;
- à la fermeture du compte : suppression ou anonymisation lorsque l'historique n'est plus nécessaire ;
- si une obligation légale, un litige ou une défense de droits impose une conservation plus longue, ne conserver que les éléments nécessaires et documenter le motif/la durée.

### Notes internes admin

Proposition :
- conserver uniquement tant qu'elles sont nécessaires au traitement du dossier ;
- les supprimer avec le dossier utilisateur, sauf justification spécifique validée par le relecteur ;
- ne jamais conserver des notes libres après suppression uniquement pour de la convenance interne.

### Logs techniques

Proposition :
- logs ordinaires : **30 jours** ;
- logs nécessaires à l'investigation d'un incident de sécurité : jusqu'à **90 jours**, puis suppression ou anonymisation ;
- aucune donnée de document, mot de passe, token, e-mail complet ou note libre ne doit être copiée dans les logs si elle n'est pas strictement nécessaire.

### Consentements / preuve de conformité

Proposition :
- conserver une preuve minimale d'un consentement/version de politique aussi longtemps que nécessaire pour la responsabilité juridique applicable ;
- ne pas utiliser cette justification pour conserver le dossier étudiant complet ;
- la durée finale doit être fixée par le relecteur en fonction de la base juridique réellement retenue.

### Sauvegardes et fournisseurs

Proposition :
- les suppressions doivent être effectives dans les systèmes actifs immédiatement selon le processus ci-dessous ;
- les copies de sauvegarde suivent la rotation technique du fournisseur et ne doivent pas être réinjectées comme données actives sauf restauration après incident ;
- si une sauvegarde antérieure à une suppression est restaurée, la liste des suppressions/tombstones doit être rejouée avant remise en service ;
- documenter dans la notice finale la logique de conservation des sauvegardes et logs fournisseurs après vérification des paramètres réellement utilisés.

## 3. Procédure de suppression proposée

Ordre recommandé pour éviter des objets Storage orphelins ou une suppression Auth bloquée :

1. confirmer l'identité et la demande de suppression ;
2. bloquer les nouvelles écritures liées au compte si nécessaire ;
3. inventorier les objets Storage appartenant à l'utilisateur ;
4. supprimer les fichiers avec l'API Supabase Storage ;
5. vérifier qu'aucun objet utilisateur ne subsiste dans le bucket concerné ;
6. supprimer/anonymiser les données applicatives conformément aux règles validées ;
7. supprimer l'utilisateur via l'API d'administration Supabase Auth côté serveur ;
8. conserver uniquement une trace minimale de l'opération si nécessaire et validée ;
9. laisser expirer les copies de sauvegarde selon la rotation fournisseur et réappliquer les suppressions en cas de restauration.

Raison technique : la documentation Supabase précise qu'un utilisateur peut ne pas être supprimable s'il possède encore des objets Storage et recommande de supprimer/réattribuer ces objets d'abord. La suppression d'objets doit se faire via l'API Storage.

## 4. Décisions humaines réduites à quatre choix

Le propriétaire/relecteur peut accepter ou modifier seulement ces valeurs proposées :

1. compte inactif : revue après **24 mois** ;
2. délai maximum opérationnel après demande de suppression : **30 jours** ;
3. logs techniques : **30 jours**, jusqu'à **90 jours** en cas d'incident ;
4. confirmer si AlmaGo est actuellement **gratuit ou payant**, car les obligations contractuelles/commerciales peuvent modifier la conservation requise.

Les éventuelles obligations fiscales/comptables ou de défense de droits doivent être évaluées séparément selon le statut réel de l'exploitant et le caractère gratuit/payant du service.

## 5. Ce que cette proposition ne décide pas

Ce document ne choisit pas :
- l'identité de l'exploitant ;
- la forme juridique ;
- l'adresse publique ;
- le pays d'établissement ;
- la base juridique de chaque traitement ;
- l'existence d'un DPO ;
- les obligations fiscales/comptables ;
- le droit applicable final ;
- les clauses de responsabilité ;
- le fournisseur analytics A44.

Ces éléments restent soumis à la confirmation propriétaire et à la relecture humaine A38.

## 6. Références techniques et réglementaires utilisées pour préparer la proposition

- Commission européenne, principes du RGPD : https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en
- EDPB, Basic principles : https://www.edpb.europa.eu/topics/key-gdpr-concepts/basic-principles_en
- Supabase, User Management / deleting users : https://supabase.com/docs/guides/auth/managing-user-data
- Supabase, Delete Objects : https://supabase.com/docs/guides/storage/management/delete-objects
- DDG § 5 : https://www.gesetze-im-internet.de/ddg/__5.html

## 7. Utilisation dans A38

Après validation humaine :
- recopier les choix approuvés dans `docs/A38_OWNER_CONFIRMATION.md` ;
- mettre à jour les trois brouillons juridiques canoniques ;
- seulement après suppression de tous les placeholders/warnings et vraie relecture humaine, passer `A38_REVIEW_READY: true`.

Cette proposition ne modifie aucun gate et ne constitue pas une approbation A38.
