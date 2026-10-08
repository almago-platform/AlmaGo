# Campus Allemagne — Plan directeur V1 du Dossier étudiant central
**Statut : ARCHITECTURE UX V1 FIXÉE / implementation progressive**  
**Date de référence : 2026-10-08**  
**Base inspectée :** `main@69be8eeb9d32a407a357436f6b68d29509c0a59a`  
**Public :** administrateur-conseiller Campus Allemagne, avec possibilité ultérieure d'une équipe  
**Objet :** transformer l'expérience admin en « chercher une personne → lire son dossier → agir → consigner l'action » sans créer un deuxième système de gestion.

## 0. Documents de référence obligatoires
Ce plan traite **l'expérience conseiller**. Pour les règles opérationnelles, il dépend de :
- `docs/CAMPUS_ALLEMAGNE_READ_FIRST.md`
- `docs/CAMPUS_ALLEMAGNE_IMPLEMENTATION_HANDOFF.md`
- `docs/CAMPUS_ALLEMAGNE_PROCEDURE_DEADLINE_ENGINE_PLAN.md`
- `docs/ADMIN_CANDIDATE_JOURNEY_TUNISIA_20261008.md`

Le plan P1–P9 de procédures/délais demeure canonique et **n'est pas remplacé** par les phases UX ci-dessous. Si les deux entrent en conflit, les décisions métier du handoff priment. Vérifier l'état effectif des migrations et de `main` avant chaque changement.

## 1. Modèles examinés et décisions retenues
| Modèle / référence primaire | Patron utile | Décision AlmaGo |
| --- | --- | --- |
| OpenMRS Patient Dashboard https://guide.openmrs.org/collecting-data/the-patient-dashboard-in-depth/ | rechercher une personne, voir une synthèse et l'historique des événements | modèle de navigation ; **aucune analogie médicale** dans le langage produit |
| Salesforce Education Cloud Student Success https://help.salesforce.com/s/articleView?id=sfdo.ec_student_success_app.htm&type=5 | vue conseiller, alertes, tâches et suivi du parcours étudiant | référentiel de besoins très pertinent |
| Zendesk Agent Workspace https://support.zendesk.com/hc/en-us/articles/4408821259930-About-the-Zendesk-Agent-Workspace/ | contexte, conversations et éléments associés sans quitter le dossier | messages en contexte, pas double messagerie |
| HubSpot CRM activity timeline https://knowledge.hubspot.com/records/associate-activities-with-records | timeline d'activités associées à une personne | distinguer événements prouvés, notes internes et changements d'état |
| Microsoft Dynamics 365 next best action https://learn.microsoft.com/en-us/dynamics365/release-plan/2026wave1/service/dynamics365-customer-service/view-next-best-actions-customer-intent-agent | recommandation de la prochaine action pertinente | action proposée, jamais décision automatique d'admission/visa |
| NHS task list et summary list https://service-manual.nhs.uk/design-system/components/task-list et https://service-manual.nhs.uk/design-system/components/summary-list/ | statuts explicites, petites listes de faits lisibles | montrer seulement l'essentiel, révéler les preuves à la demande |
| GOV.UK Service Design https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs et https://design-system.service.gov.uk/components/task-list/ | service construit autour de la tâche et vérifié par les usages | scénario complet testé avec dossiers réalistes |
| European Data Protection Board, Art. 25 https://www.edpb.europa.eu/documents/guideline/guidelines-42019-on-article-25-data-protection-by-design-and-by-default_en | protection des données par défaut | droits inchangés, aucune nouvelle fuite de renseignements |

La synthèse n'implique aucun achat de ces produits, ni intégration avec un logiciel de santé.

## 2. Diagnostic confirmé dans `main`
**Déjà existant et à réutiliser :**
- `/admin` : bureau et priorités ;
- `/admin/people` : recherche `q`, segmentation et redirection vers un dossier ;
- `/admin/dossiers/[studentId]` : fiche 360° avec statut, action prioritaire, jalons, blocages, messages, journal, projet, orientation, documents, candidatures, paiement et historique ;
- `/admin/traitement` : files transversales ;
- `/admin/orientation` : audits paginés et revue humaine ;
- `/admin/accompagnement` : phases A à Z et sources visa ;
- primitives persistantes : `profiles`, `prospects`, `student_intake_cases`, `student_case_assignments`, `student_case_notes`, `student_checklist_items`, `student_history`, `documents`, `program_recommendations`, `applications`, `student_dossier_messages`, `student_procedures`, dossiers visa si migration réellement présente.

**Complexité à supprimer :** devoir ouvrir des modules différents pour comprendre la même personne ; affichage simultané de trop de sections, répétitions de compteurs, absence de recherche visible sur l'accueil, libellés techniques et longues listes de données sans prochaine action.

**Attention :** une personne non liée à un compte vérifié ne doit pas être transformée artificiellement en étudiant actif. Les événements d'orientation répétés ne créent pas autant de personnes. Les archives anonymisées et dossiers terminés ne doivent pas gonfler les files actives.

## 3. Décision produit immuable pour la V1
### Parcours administrateur cible
`Mon bureau / Recherche → Personne → Synthèse (état + action) → Agir → Historique et preuves`

Trois surfaces principales :
1. **Mon bureau :** recherche visible nom/e-mail et vraie file de décisions, maximum quatre chiffres prioritaires. Les rapports restent repliés.
2. **Liste Personnes :** recherche/filtre depuis l'URL, une ligne par personne vérifiée, distinction explicite prospect/candidat/étudiant/terminé, ouverture du vrai dossier 360°.
3. **Dossier 360° :** en tête : identité enregistrée, état confirmé, action humaine prioritaire, propriétaire et date justifiée. Navigation principale : Résumé, Historique, Messages, Actions, Documents, Candidatures. Les sections Projet, Orientation, Offre/Paiement, Journal, Visa restent disponibles sous « Autres étapes », jamais supprimées.

**Seul objet opérationnel canonique : la personne/dossier existant.** Pas de table `patients`, `student_records_v2`, pas de réplication des prospects, pas de synchronisation des statuts par une nouvelle base.

### Informations et états
- Afficher « inconnu », « non enregistré », « à vérifier » si une source manque. Ne jamais inventer une échéance, une admission, un justificatif ou un visa.
- Une prochaine action a un propriétaire (Campus/étudiant/externe), sa raison, et une échéance seulement si enregistrée. Les échéances officielles exigent cycle, source et date de vérification ; les cibles internes sont étiquetées distinctement.
- Le consentement marketing et la possibilité d'écrire au candidat sont respectés.
- Les historiques personnels ne sont visibles qu'aux comptes autorisés, selon RLS.
- Une décision sensible passe toujours par la route/API métier préexistante, et conserve confirmation explicite et journal.
- Le dossier doit différencier « recommandation de programme », « candidature déposée », « décision de l'université » et « décision consulaire ».

### Ergonomie
- « Une question principale par écran » ; pas de grille de 30 indicateurs.
- Nombre de rubriques principales visible sans scroll à 1366 × 768 ; sur mobile, pas de débordement horizontal.
- Accessibilité clavier, labels, focus, en-têtes sémantiques, cibles tactiles.
- Ancres historiques `#overview`, `#history`, `#messages`, `#actions`, `#orientation`, `#documents`, `#applications`, etc. maintenues : aucun lien profond existant ne doit casser.
- FR simple en premier ; terminologie et RTL arabe adaptés dans une étape ultérieure.
- Les outils experts demeurent accessibles au conseiller sans imposer leur lecture quotidienne.

## 4. Roadmap FIXÉE — livraisons séparées
Ces étapes UX sont **distinctes** des P1–P9 métier déjà approuvées.

| Lot | Contenu | Livrable | Critère d'acceptation |
| --- | --- | --- | --- |
| **UX-0 — présent** | Plan figé, recherche depuis Mon bureau, entrée contextualisée sur dossier | PR isolée, sans DB | Rechercher un nom/e-mail mène à `/admin/people?q=…`; les ancres et contrôles existants restent présents |
| **UX-1 — fiche conseiller** | Synthèse ciblée en haut du Dossier 360° ; contacts/étape/action/preuve récente | Composant réutilisant les calculs déjà présents | En moins de 10 s, opérateur identifie personne, étape, responsable et action (objectif à tester, pas résultat garanti) |
| **UX-2 — navigation du dossier** | Navigation principale courte, sous-sections par tâche, accès expert/étapes secondaires | Composants accessibles, sans duplication de données | Tous les liens profonds et formulaires continuent à fonctionner au clavier/mobile |
| **UX-3 — historique central** | Frise avec messages, notes, décisions, documents, candidatures et preuves **uniquement si autorisées et justifiées** | Vue chronologique avec filtres types | Événement = date, auteur/source, action et statut ; absence de doublons, pas d'historique inventé |
| **UX-4 — actions et décisions** | Prochaine action contextualisée, responsable, justification, suivi d'actions | Réutilisation des tables/API métiers ; ajouts contrôlés seulement si nécessaire | Aucun changement de statut sans permission et piste d'audit ; interdiction de décision automatique |
| **UX-5 — tâches documentaires / admission / visa** | Regrouper en vues lisibles et progressives, préserver la source de vérité | Sections par phase liées aux modules spécialisés | Pas de date officielle sans source ; statut visa basé sur preuve ; utilisateur étudiant sollicité seulement en exception |
| **UX-6 — file et recherche à l'échelle** | Recherche rapide, filtres fiables et pagination ; rapprochement sûr de doublons identifiés | Mesure de charge, tests sur 100+ dossiers | Aucun utilisateur caché arbitrairement par `limit`, masquage conforme des archives, pas de résultats hors RLS |
| **UX-7 — validation opérateur** | Tests avec 5 scénarios représentatifs (prospect libre, prospect lié, candidat, étudiant/visa, terminé), desktop/mobile, FR/AR | Revue d'utilisabilité et correctifs | Tâches réelles accomplies sans aide, problèmes bloquants résolus |
| **UX-8 — bascule** | Déprécier les redondances de menus **après** tests, sans supprimer les opérations critiques | Déploiement contrôlé Render, suivi erreurs, retour arrière | CI + Browser Quality + RLS + smoke prod conformes ; lien dossier ancien toujours valable |

### Ordre et dépendances
UX-0 → UX-1 → UX-2 → UX-3/UX-4 → UX-5 → UX-6 → UX-7 → UX-8. Chaque lot est une PR vérifiable. **Ne pas tout fusionner d'un coup.** La première version continue de fonctionner pendant l'évolution.

## 5. UX-0 : périmètre de travail démarré
À implémenter sur la branche `feat/admin-student-record-command-center-v1-20261008` :
1. ajouter une recherche globale sur `/admin` sous l'en-tête (formulaire GET vers `/admin/people` paramètre `q`) ;
2. dans `/admin/dossiers/[studentId]`, regrouper les raccourcis de navigation en un chemin explicite **Résumé / Historique / Messages / Actions / Documents / Candidatures**, avec les outils supplémentaires conservés sous un bloc expert non destructif ;
3. assurer que `#history`, `#messages` et autres ancres restent atteignables ;
4. tests de contrat et vérification compile/CI ;
5. ouvrir PR et **ne pas merger jusqu'aux contrôles verts et à la vérification des conflits**.

Pas de migration, pas de nouvelle requête Supabase, pas de nouvelles écritures, pas de modification de l'authentification, RLS, prix ou visa dans UX-0.

## 6. Contrôle de qualité transversal
Avant fusion de chaque PR :
- HEAD de `main` et PR concurrentes inspectés ; changements hors périmètre exclus ;
- tests Node/TypeScript/lint/build et Browser Quality verts ;
- RLS/security tests et erreurs de données traités sans convertir les requêtes échouées en `0` ;
- clavier, lecteur d'écran de base, mise au point visible, contraste et viewport 360/390/768/1280/1440 ;
- pas de changement silencieux de migration ; pas d'envoi de message, d'offre, de paiement, de candidature, de document ou de visa ;
- vérification de la branche Render réellement déployée, et smoke test manuel sur le domaine.

### Critères de succès produit (à mesurer après déploiement, pas à inventer)
- retrouver une personne parmi les dossiers sans connaître son statut ;
- identifier sa prochaine action réelle en moins de 10 secondes dans une session de test ;
- ouvrir l'historique en 1 clic depuis la fiche ;
- enregistrer une note/action autorisée en 3 étapes au plus lorsque le métier le permet ;
- retrouver la preuve d'un événement sans revenir à Mon bureau ;
- ne jamais perdre le contexte en passant des messages à la candidature ou au visa.

## 7. Gouvernance du plan
Ce fichier est la **référence V1 approuvée par la demande de plan du 2026-10-08**. Chaque PR doit indiquer son lot UX et les critères testés. Tout changement des invariants métier demande une décision explicite et une mise à jour du handoff canonique. Les décisions sur l'interface sont révisables après tests auprès de vrais conseillers et utilisateurs. La notion de « plan fixé » **n'autorise ni merge aveugle, ni migration risquée, ni divulgation d'un dossier**.
