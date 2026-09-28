# AlmaGo — inventaire factuel des données

Ce document décrit **ce que le code et les migrations AlmaGo montrent aujourd’hui**. Il ne constitue pas un avis juridique et ne remplace pas la relecture humaine demandée par A38.

## 1. Authentification

L’authentification est gérée par Supabase Auth.

Le code applicatif ne stocke pas de mot de passe en clair dans les tables AlmaGo. Les tables applicatives référencent l’identifiant Supabase `auth.users.id`.

À confirmer pour la politique finale :
- durée de conservation du compte ;
- procédure de suppression complète ;
- paramètres Supabase Auth effectivement activés en production.

## 2. Profil étudiant

Table principale : `public.profiles`.

Champs observés dans les migrations :
- nom complet historique ;
- prénom et nom ;
- téléphone ;
- pays ;
- date de naissance ;
- nationalité ;
- ville actuelle ;
- niveau/diplôme et parcours scolaire ;
- filière du baccalauréat et année ;
- moyenne générale ;
- établissement ;
- études universitaires actuelles, domaine et nombre de semestres ;
- niveaux d’allemand, anglais et français ;
- informations de certificat de langue ;
- langue d’études ;
- diplôme et domaine visés ;
- rentrée visée ;
- villes préférées ;
- tranche de budget ;
- état d’onboarding et dates techniques de création/mise à jour.

Accès observé :
- l’étudiant peut lire et mettre à jour son propre profil ;
- un admin AlmaGo peut lire/mettre à jour les profils conformément aux politiques RLS.

## 3. Rôles et autorisations

Table : `public.user_roles`.

Donnée enregistrée :
- identifiant utilisateur ;
- rôle `student` ou `admin` ;
- date de création.

La table sert à protéger les fonctions et écrans administratifs. L’interface publique ne doit pas permettre à un utilisateur de se promouvoir lui-même.

## 4. Documents étudiants

Table : `public.documents`.

Métadonnées observées :
- étudiant propriétaire ;
- chemin Storage ;
- nom original du fichier ;
- type MIME ;
- taille ;
- catégorie du document ;
- statut de vérification ;
- commentaire destiné à l’étudiant ;
- identifiants upload/review ;
- date de review et dates techniques.

Fichiers :
- les octets sont stockés dans le bucket Supabase Storage privé `student-documents` ;
- limite déclarée : 10 MiB ;
- types déclarés : PDF, JPEG, PNG ;
- les objets sont rangés dans le dossier de l’utilisateur ;
- les politiques permettent la lecture de son propre dossier et l’accès admin prévu par RLS.

Point non défini dans les migrations :
- la durée de conservation des fichiers ;
- la procédure opérationnelle garantissant la suppression des objets Storage lors de la suppression d’un compte.

## 5. Orientation

Tables : `universities`, `programs`, `program_recommendations`.

Les universités/programmes sont essentiellement des données catalogue.

Pour une recommandation étudiant, AlmaGo peut enregistrer :
- étudiant ;
- programme ;
- admin auteur ;
- note/justification ;
- statut ;
- archivage ;
- date d’intérêt de l’étudiant ;
- dates techniques.

Les recommandations sont des pistes de travail AlmaGo ; elles ne constituent pas une décision d’admission.

## 6. Candidatures

Table : `public.applications`.

Données observées :
- étudiant ;
- programme ;
- rentrée ;
- statut ;
- deadline ;
- prochaine action ;
- documents requis sous forme de libellés ;
- message/note visible étudiant ;
- résultat ;
- date de soumission/review ;
- dates techniques.

Historique visible :
- `public.application_events` contient type d’événement, message, acteur éventuel, visibilité étudiant et date.

La politique RLS permet à l’étudiant de lire uniquement les événements marqués visibles et reliés à ses propres candidatures.

## 7. Checklist, historique et notifications

Tables :
- `student_checklist_items` ;
- `student_history` ;
- `notifications`.

Ces tables peuvent contenir :
- tâches et statut de progression ;
- échéances ;
- messages d’historique visibles ;
- notifications, titre, corps et métadonnées ;
- dates et identifiants de rattachement.

Les politiques observées limitent la lecture aux données propres de l’étudiant, avec accès admin prévu.

## 8. Consentements

Table : `public.consents`.

Données observées :
- utilisateur ;
- type de consentement ;
- version de politique ;
- date d’accord ;
- date de révocation éventuelle ;
- métadonnées.

Aucune politique juridique finale ni durée de conservation spécifique n’est définie dans le code actuel.

## 9. Notes internes et logs techniques

### Notes internes

Table : `public.admin_notes`.

Contenu :
- étudiant concerné ;
- admin auteur ;
- note interne ;
- dates.

Les migrations les déclarent explicitement **admin-only**.

### Logs techniques

Table : `public.technical_logs`.

Contenu possible :
- acteur ;
- nom d’événement ;
- type/id d’entité ;
- métadonnées ;
- date.

Aucune politique SELECT/WRITE destinée aux clients authentifiés n’est définie dans la migration initiale.

## 10. Suppression et cascade observées

Plusieurs tables liées à l’étudiant utilisent `on delete cascade` sur `auth.users(id)`, notamment le profil et différentes données de dossier.

D’autres références utilisent `set null` ou `restrict` selon le rôle de l’acteur ou la nécessité de conserver une relation.

Important : cette mécanique SQL ne suffit pas à démontrer qu’un **effacement complet** couvre automatiquement :
- les objets Supabase Storage ;
- d’éventuels logs externes ;
- les sauvegardes du fournisseur ;
- un futur outil analytics/observabilité.

A38 doit donc définir une procédure et une durée de conservation explicites.

## 11. Tiers techniques visibles dans le projet

Actuellement le code montre l’utilisation de :
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Storage ;
- Render pour l’hébergement/déploiement canonique actuel ;
- une intégration Vercel reste visible/connectée au dépôt ; son rôle technique éventuel et tout traitement de données associé doivent être confirmés avant la notice finale.

Aucun fournisseur analytics/observabilité n’est actuellement codé comme actif dans l’application.

A44 prévoit une activation séparée avec allow-list de télémétrie et relecture confidentialité.

## 12. Décisions encore nécessaires pour A38

Le propriétaire doit confirmer :
- identité légale de l’éditeur/exploitant ;
- adresse publique de contact ;
- email public de contact ;
- immatriculation/TVA si applicable ;
- service gratuit ou payant actuellement ;
- finalités formulées de manière définitive pour les catégories ci-dessus ;
- durée de conservation par catégorie ;
- procédure de suppression de compte et de fichiers Storage ;
- politique concernant sauvegardes/logs fournisseurs ;
- base/consentement applicable au futur analytics selon la décision juridique ;
- personne responsable de la relecture juridique finale.

## 13. Principe de publication

Aucune page juridique ne doit être présentée comme « validée » tant que :
1. les informations publiques ci-dessus ne sont pas confirmées ;
2. les choix de conservation/suppression sont décidés ;
3. une relecture humaine/juridique est effectuée.
