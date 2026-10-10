# AlmaGo — Accès Prospect avant vérification e-mail

## Décision d'architecture (stacked PR sur #1050)

L'utilisateur souhaite explorer presque toutes les fonctionnalités **gratuites de consultation** sans attendre la confirmation e-mail. Le fonctionnement actuel de Supabase Auth avec confirmation obligatoire ne livre **pas** de session utilisable après `signUp` tant que l'e-mail n'est pas confirmé. L'application conserve cette vérification et **n'active ni l'auth anonyme ni une connexion par service role**.

À la suite d'une demande d'inscription associée à un `orientation_token`, en absence de session :
1. Le navigateur est redirigé vers `/prospect-preview/start?orientation_token=...` ; le serveur vérifie hash, expiration et version de l'orientation.
2. En cas de jeton valide, il place un cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, limité à `/prospect-preview` et à **4 heures** ; il redirige vers une adresse propre sans jeton.
3. La page provisoire affiche uniquement des données de l'orientation déjà autorisées par ce **jeton de rapport existant**, une recherche dans le **catalogue public vérifié**, une feuille de route de découverte et les prochaines étapes.
4. Le candidat peut demander un e-mail de confirmation dans l'espace provisoire. Sa réponse est toujours générique et ne divulgue pas l'existence d'un compte.
5. L'inscription confirmée continue via le flux original `/auth/callback` et `/orientation/claim`. La consultation provisoire ne revendique aucun compte.

**Pour les visiteurs sans jeton valide**, l'espace affiche uniquement le catalogue public et une orientation à démarrer ; aucune identification n'est déduite de l'e-mail.

## Matrice des autorisations

| Opération | Aperçu provisoire | Compte confirmé selon entitlement |
|---|---|---|
| Consultation du catalogue universitaire public | Oui, source publique et recherche locale | Oui |
| Orientation déjà détenue via jeton valable | Oui, uniquement sélection de réponses de l'orientation | Oui, sous RLS / lien confirmé |
| Parcours de découverte et conseils généraux | Oui | Oui |
| Liste de programmes filtrée localement | Oui | Oui |
| Enregistrer/éditer durablement un dossier | Non | Selon rôle, RLS et lifecycle |
| Rattacher une orientation à un compte | Non | Oui, session vérifiée et RPC contrôlée |
| Joindre documents / ouvrir pièce jointe privée | Non | Selon RLS et ownership |
| Messages, demandes personnalisées et décision commerciale | Non | Selon rôle/lifecycle |
| Paiement / activation espace Étudiant | Non | Selon workflow commercial validé |

## Analyse Auth / RLS

- L'accès provisoire **n'est jamais une session Supabase**, ni un rôle DB. Il n'ouvre pas les pages protégées sous `/prospect` (layout existant).
- Les utilisateurs non confirmés et anonymes sont explicitement rejetés par `getTechnicalStudentUser` ; les routes API sensibles utilisant des RPC privilégiées exigent désormais `hasVerifiedEmail(user)` avant l'appel RPC. Aucune vérification front-end seule.
- Pas de nouvelle policy permissive. Les RLS existantes restent actives pour les comptes vérifiés. Aucun transfert de dossier par e-mail non confirmé.
- Le cookie est une capacité de **lecture** limitée à un hash existant et à une expiration. L'ID, l'e-mail, les paiements, les documents, les messages et les identifiants utilisateur ne sont **jamais** renvoyés à la page.
- Le cookie est réinitialisé sur un nouveau démarrage, expirera automatiquement et peut être vidé par `/prospect-preview/leave`.
- Le jeton passé par la première URL est sensible : nettoyer l'URL immédiatement, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` et ne pas transmettre le jeton dans les liens externes.
- Tout envoi de confirmation reste contrôlé par les protections de débit Supabase Auth, avec un message de résultat générique. Aucune clé SMTP ou service role n'atteint le navigateur.

### Risques résiduels et limites

- Le détenteur du lien d'orientation est déjà autorisé à voir les rapports via `/orientation/report/[token]`. Un lien volé est un risque de confidentialité existant : garder les rapports à durée limitée, ne pas journaliser le token et recommander un navigateur privé sur appareil partagé.
- L'aperçu provisoire **n'est pas une session durable ni un dossier éditable**. Les opérations persistantes impliquant identité, compte ou transfert d'informations exigent toujours le clic de confirmation e-mail. Il serait trompeur de promettre un « compte complet avant confirmation » avec l'authentification actuelle.
- Après expiration du cookie, on peut toujours consulter le catalogue public ; la personnalisation nécessite à nouveau le jeton de rapport.
- Tester manuellement : compte nouveau, compte existant, absence de mail, confirmation tardive, jeton invalide/expiré, mobile, RTL, appareil partagé et création/connexion sur navigateur différent.

## Déploiement

Cette PR est empilée sur **#1050**, à fusionner séparément et dans cet ordre après contrôle CI. Elle ne modifie **aucun** paramètre Supabase Auth, donnée utilisateur, migration, RLS ou environnement de production. Aucun merge automatique.
