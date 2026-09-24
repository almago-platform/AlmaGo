# AlmaGo — Chantier Études Allemagne

**Version de référence : 24 septembre 2026**

## Principe central

AlmaGo doit résoudre d'abord le besoin académique de l'étudiant, puis déterminer le bon parcours réglementaire et visa à partir de sa situation réelle.

Ordre cible :

```
Projet étudiant
→ analyse du profil
→ recherche académique
→ recherche langue/préparation si nécessaire
→ candidatures
→ preuve académique obtenue
→ détermination du parcours réglementaire
→ financement
→ assurance
→ Consular Services Portal ou TLS selon la catégorie
→ visa
→ arrivée en Allemagne
→ Anmeldung / université / assurance / Ausländerbehörde
→ études
```

Le visa ne doit jamais être présenté comme la première étape lorsque l'étudiant ne possède pas encore le document académique requis.

## Parcours réglementaires à supporter

1. **Studium §16b**
   - Admission définitive obtenue.
   - AlmaGo recherche d'abord l'admission si elle n'existe pas encore.
   - Après admission, ouverture du workflow visa études.

2. **Studienvorbereitung §16b**
   - L'étudiant doit disposer d'une base académique acceptée : admission conditionnelle, Bewerberbestätigung ou correspondance universitaire équivalente.
   - AlmaGo recherche ensuite le cours préparatoire adapté.
   - Référence Tunis actuelle : cours préparatoire au moins 20 h/semaine et allemand au moins A2 selon la checklist spécifique.

3. **Studienplatzsuche §17(2)**
   - Pas encore d'admission, mais projet réel de chercher un Bachelor/Master en Allemagne.
   - Possibilité de suivre une préparation linguistique durant la recherche.
   - Référence 2026 : jusqu'à 9 mois, financement 1 091 €/mois, travail jusqu'à 20 h/semaine.
   - Après admission : passage vers le titre étudiant §16b.

4. **Sprachkurs §16f**
   - Cours de langue isolé, indépendant d'un projet universitaire préparatoire.
   - Parcours séparé des études.
   - À Tunis, ce parcours passe directement par TLScontact et non par le workflow études du Consular Services Portal.

## Règles Tunis à conserver

- Pour les catégories couvertes par le Consular Services Portal :
  1. préparer et téléverser les documents ;
  2. soumettre pour pré-vérification ;
  3. corriger si nécessaire ;
  4. attendre la confirmation explicite que la vérification est terminée et que la prise de rendez-vous est autorisée ;
  5. seulement ensuite réserver/payer TLS ;
  6. rendez-vous physique, biométrie, originaux ;
  7. transmission à l'Ambassade ;
  8. décision et restitution du passeport.

- Ne pas présenter un bouton « Réserver TLS » avant l'autorisation correspondante.
- Références 2026 à revalider avant affichage production :
  - financement Studium / Studienvorbereitung : 11 904 €/an = 992 €/mois ;
  - Studienplatzsuche : 1 091 €/mois ;
  - frais TLS Tunisie : 25 € ;
  - visa national D adulte : 75 € sauf exemption.

---

# Plan de chantier

## LOT 0 — Référentiel et source de vérité

### DE-001 — Versionner le référentiel Allemagne
Créer un document de référence daté et traçable.

### DE-002 — Enregistrer les quatre parcours
Valeurs métier internes :
- `STUDIUM`
- `STUDIENVORBEREITUNG`
- `STUDIENPLATZSUCHE`
- `SPRACHKURS`

### DE-003 — Sources officielles
Chaque règle sensible doit conserver :
- source officielle ;
- date de vérification ;
- date d'effet si connue.

### DE-004 — Fraîcheur
Prévoir un statut de type `needs_reverification` pour les règles à recontrôler.

### DE-005 — Source unique
Ne pas dupliquer dans plusieurs composants les montants, heures ou règles réglementaires.

**Fini quand :** une règle sensible peut être identifiée, sourcée, datée et mise à jour à un seul endroit.

---

## LOT 1 — Projet étudiant

Nouvelle surface proposée : `/student/project`.

### Choix utilisateur

1. **Je veux trouver une université**
2. **Je dois préparer mon allemand avant mes études**
3. **Je cherche un Master et un cours d'allemand**
4. **Je veux uniquement apprendre l'allemand**

### DE-010 — Questionnaire projet
Collecter uniquement les informations utiles :
- niveau recherché ;
- domaine ;
- diplôme actuel ;
- établissement d'origine ;
- notes ;
- pays du diplôme ;
- langue cible ;
- niveau actuel allemand/anglais ;
- intake visé ;
- budget ;
- préférences géographiques.

### DE-011 — Sauvegarde du projet
Donnée structurée de type `student_study_project` avec notamment :
- `target_degree`
- `target_field`
- `target_language`
- `current_language_level`
- `target_intake`
- `academic_goal`
- `origin_country`
- `destination_country`

**Périmètre V1 :** Tunisie → Allemagne.

---

## LOT 2 — Recherche académique

Réutiliser les briques existantes :
- `universities`
- `programs`
- `program_recommendations`
- `applications`

### DE-020 — Matching profil / programmes
Filtrer sur :
- diplôme ;
- domaine ;
- Bachelor/Master ;
- prérequis ;
- langue ;
- intake ;
- deadline ;
- frais ;
- méthode de candidature.

### DE-021 — Vérification Master
Pour chaque Master :
- compatibilité du Bachelor ;
- ECTS/prérequis ;
- note minimale ;
- langue ;
- deadline ;
- documents spécifiques.

### DE-022 — Type de candidature
Identifier :
- candidature directe ;
- uni-assist ;
- VPD.

### DE-023 — Publication sûre
Une formation ne doit être recommandée à l'étudiant que si elle respecte les garde-fous déjà existants :
- active ;
- source officielle HTTP/HTTPS valide ;
- vérification réelle enregistrée.

---

## LOT 3 — Candidatures universitaires

Réutiliser le système `applications`.

Pipeline cible :

```
Programme identifié
→ À examiner
→ Intéressé
→ Documents à préparer
→ Prête
→ Envoyée
→ En attente université
→ Admission / refus
```

### Règles
- AlmaGo ne décide jamais de l'admission.
- Aucune probabilité ou garantie.
- Une deadline absente n'est jamais inventée.
- Le résultat d'une candidature alimente le moteur de parcours réglementaire.

---

## LOT 4 — Preuves académiques

Distinguer explicitement :

| Preuve | Conséquence possible |
|---|---|
| Admission définitive | Studium |
| Admission conditionnelle | Studienvorbereitung possible |
| Bewerberbestätigung | Studienvorbereitung possible |
| Correspondance universitaire admissible | Studienvorbereitung possible |
| Aucune preuve | Continuer recherche / examiner Studienplatzsuche |

### DE-040 — Documents
Réutiliser le système `documents`.

Chaque preuve doit avoir :
- type ;
- établissement ;
- date ;
- étudiant ;
- statut de vérification ;
- fichier privé.

### DE-041 — Validation admin
Statuts fonctionnels possibles :
- reçu ;
- à vérifier ;
- accepté comme preuve de parcours ;
- à remplacer.

Aucune altération du fichier original.

---

## LOT 5 — Cours de langue

Créer une vraie brique fonctionnelle distinguant :

- cours préparatoire aux études ;
- cours de langue autonome.

### DE-050 — Catalogue langue
Structure proposée `language_courses` :
- école ;
- ville ;
- type ;
- niveau ;
- heures/semaine ;
- dates ;
- prix ;
- source officielle ;
- `verified_at` ;
- lien d'inscription ;
- actif/inactif.

### DE-051 — Master + langue
Pour l'étudiant visant un Master :
- chercher les Masters compatibles ;
- identifier le niveau linguistique requis ;
- chercher un cours pertinent pour atteindre ce niveau.

### DE-052 — Garde-fou
Un cours de langue ne doit jamais être assimilé automatiquement à une préparation universitaire.

---

## LOT 6 — Moteur de parcours réglementaire

Utiliser des règles déterministes et explicables.

### Règle A
Admission définitive obtenue
→ `STUDIUM`

### Règle B
Admission conditionnelle / Bewerberbestätigung / correspondance admissible + cours préparatoire adapté
→ `STUDIENVORBEREITUNG`

### Règle C
Pas d'admission + objectif réel de chercher une place d'études en Allemagne
→ examiner `STUDIENPLATZSUCHE`

### Règle D
Objectif langue uniquement
→ `SPRACHKURS`

### DE-060 — Explication utilisateur
Ne pas afficher uniquement « Votre visa est X ».

Afficher aussi :
- pourquoi ce parcours correspond à la situation actuelle ;
- quelles preuves ont été utilisées ;
- ce qui manque encore.

---

## LOT 7 — Checklist personnalisée

Réutiliser :
- `checklist_templates`
- `student_checklist_items`

### Principe
Les tâches dépendent du parcours réel.

Exemple :
- Studium + Master + Tunisie → checklist correspondante ;
- Studienvorbereitung → autre checklist ;
- Studienplatzsuche → autre checklist ;
- Sprachkurs → workflow séparé.

### Règle UX
Ne pas générer 30 tâches dès l'inscription.
Les étapes apparaissent progressivement selon l'avancement réel.

---

## LOT 8 — Financement et assurance

### DE-080 — Référentiel financier
Stocker les règles avec :
- montant ;
- devise ;
- période ;
- catégorie ;
- `effective_from` ;
- `source_url` ;
- `verified_at`.

### DE-081 — Assurance
Afficher les besoins d'assurance en fonction du parcours et du moment du séjour.

### Règle
Aucun montant réglementaire ne doit être dupliqué dans plusieurs pages.

---

## LOT 9 — Consular Services Portal et TLS

Ce workflow ne s'active que lorsque le dossier académique est suffisamment prêt.

### Pour les catégories couvertes par le portail

```
Dossier prêt
→ Portail consulaire
→ Documents téléversés
→ Soumission
→ Pré-vérification
→ Correction éventuelle
→ Vérification terminée
→ Autorisation rendez-vous TLS
→ Rendez-vous TLS
→ Biométrie / originaux
→ Transmission
→ Décision
→ Passeport
```

### DE-090 — Gate TLS
Impossible de présenter le rendez-vous TLS comme prochaine action tant que l'autorisation de réservation n'est pas enregistrée.

### DE-091 — Sprachkurs
Conserver une branche distincte directe TLS pour le cours de langue isolé à Tunis.

---

## LOT 10 — Page « Mon parcours »

Route proposée : `/student/parcours`.

Afficher :

### En-tête
- objectif ;
- étape actuelle ;
- prochaine action ;
- blocage factuel éventuel.

### Timeline

```
Profil
→ Orientation
→ Candidatures
→ Admission
→ Langue / préparation
→ Financement
→ Visa
→ TLS
→ Départ
→ Arrivée
```

Les étapes futures peuvent être visibles mais inactives/grisées.

---

## LOT 11 — Intégration aux surfaces existantes

Ne pas recréer :
- Mon profil ;
- Mes documents ;
- Mon orientation ;
- Mes démarches ;
- Mes candidatures ;
- Mes échéances.

`Mon parcours` devient la couche d'orchestration.

Exemples :
- « Téléverser votre Bachelor » → bouton vers Documents ;
- « 3 Masters vérifiés proposés » → bouton vers Orientation ;
- « Candidature à compléter » → bouton vers Candidatures.

---

## LOT 12 — Dossier Admin Allemagne

Réutiliser les routes existantes :
- `/admin/students`
- `/admin/students/[id]`

Ajouter une section **Parcours Allemagne** avec :
- projet ;
- parcours actuel ;
- justification ;
- preuves académiques ;
- programmes ;
- candidatures ;
- cours de langue ;
- niveau linguistique ;
- financement ;
- étape visa ;
- prochaine action ;
- échéances ;
- sources.

### Frontière
Les notes internes AlmaGo restent strictement séparées des informations visibles par l'étudiant.

---

## LOT 13 — Centre de contrôle Admin

Créer des vues opérationnelles :

- Recherche université
- Candidature à préparer
- Attente admission
- Admission reçue
- Langue à trouver
- Visa à préparer
- Portail soumis
- Autorisation TLS
- Décision en attente
- Départ à préparer

### Règle
Aucun score étudiant.
Aucune probabilité de visa.
Aucun classement de personnes.

---

## LOT 14 — Après le visa

Créer le parcours d'arrivée :

```
Logement
→ Voyage
→ Anmeldung
→ Assurance
→ Université / cours
→ Immatriculation
→ Ausländerbehörde
→ Titre de séjour
```

### Studienplatzsuche
Après admission obtenue en Allemagne :
→ ouvrir l'étape de passage vers le titre étudiant approprié.

---

## LOT 15 — Fraîcheur réglementaire

Chaque donnée sensible doit afficher :
- source officielle ;
- dernière date de vérification.

### DE-150 — Revalidation
Statut interne recommandé : `needs_reverification`.

Concerne notamment :
- financement ;
- heures de cours ;
- frais ;
- documents requis ;
- procédure Portal/TLS ;
- URLs officielles.

---

## LOT 16 — Sécurité et frontières produit

Conserver les protections existantes :

| Domaine | Règle |
|---|---|
| Auth | conservée |
| RLS | conservée et étendue si nécessaire |
| Storage | privé |
| Student/Admin | isolation stricte |
| service_role | jamais dans l'application |
| Notes internes | jamais visibles étudiant |
| Admission | jamais décidée par AlmaGo |
| Visa | jamais garanti |
| Deadline | jamais inventée |
| Catalogue | aucune recommandation non vérifiée |

---

## LOT 17 — Tests métier

Cas minimums :

1. Admission définitive + Master → Studium.
2. Admission conditionnelle + cours préparatoire → Studienvorbereitung.
3. Bewerberbestätigung + préparation → Studienvorbereitung.
4. Pas d'admission + recherche Master en Allemagne → Studienplatzsuche à examiner.
5. Langue uniquement → Sprachkurs.
6. Admission retirée/remplacée → recalcul du parcours.
7. Source réglementaire non vérifiée → aucune règle présentée comme confirmée.
8. Aucune deadline → aucune date inventée.

---

## LOT 18 — Tests étudiant/admin

E2E minimum :

- Student A ne voit jamais Student B.
- Student ne voit jamais `admin_notes`.
- Admin peut ouvrir le dossier unifié.
- Documents privés restent privés.
- Candidature fermée ne devient pas une action active.
- Règle expirée ou non vérifiée déclenche un avertissement.
- Mobile/tablette/desktop passent les validations prévues.
- Les routes protégées conservent les guards existants.

---

## LOT 19 — Lancement progressif

### Périmètre V1
- pays d'origine : Tunisie ;
- destination : Allemagne ;
- études supérieures ;
- Master/Bachelor selon catalogue ;
- langue ;
- préparation ;
- visa étudiant / recherche de place / cours langue.

### Hors périmètre initial
- France ;
- Italie ;
- Canada ;
- Ausbildung ;
- travail ;
- regroupement familial.

Le modèle doit cependant rester extensible via `origin_country` et `destination_country`.

---

# Ordre d'exécution du chantier

| Ordre | Lot | Dépendance |
|---:|---|---|
| 1 | Lot 0 — Référentiel | — |
| 2 | Lot 1 — Projet étudiant | 0 |
| 3 | Lot 2 — Recherche académique | 1 |
| 4 | Lot 3 — Candidatures | 2 |
| 5 | Lot 4 — Preuves académiques | 3 |
| 6 | Lot 5 — Langue | 1 |
| 7 | Lot 6 — Moteur de parcours | 4 + 5 |
| 8 | Lot 7 — Checklist | 6 |
| 9 | Lot 8 — Financement/assurance | 6 |
| 10 | Lot 9 — Portal/TLS | 6–8 |
| 11 | Lots 10–11 — Expérience étudiant | 1–9 |
| 12 | Lots 12–13 — Admin | 1–9 |
| 13 | Lot 14 — Arrivée Allemagne | 9 |
| 14 | Lots 15–18 — Fraîcheur, sécurité, tests | transversal |
| 15 | Lot 19 — Mise en production | tout validé |

## Premier bloc de code recommandé

Commencer par :

```
Projet étudiant
→ recherche académique
→ type de preuve académique obtenue
→ moteur de parcours
```

Ne pas commencer par TLS ou un formulaire visa.

---

# Définition globale de « fini »

Le chantier est considéré terminé lorsque :

1. un étudiant peut décrire son projet sans connaître le vocabulaire juridique allemand ;
2. AlmaGo peut lui proposer des programmes vérifiés correspondant à son profil ;
3. les candidatures et preuves académiques réelles déterminent le parcours réglementaire ;
4. la bonne checklist apparaît automatiquement ;
5. le visa et TLS ne sont ouverts qu'au bon moment ;
6. l'étudiant voit toujours sa prochaine action et la raison ;
7. l'admin voit le même dossier de bout en bout sans duplication ;
8. chaque règle réglementaire sensible est sourcée, datée et revalidable ;
9. aucune admission, deadline, responsabilité ou garantie de visa n'est inventée ;
10. l'isolation Student/Admin, les RLS et le stockage privé restent intacts.

## Sources de référence à revalider avant affichage production

- Ambassade d'Allemagne à Tunis
- TLScontact Tunis
- Consular Services Portal
- Make-it-in-Germany
- uni-assist
- Hochschulkompass / DAAD pour la recherche académique
- Gesetz über den Aufenthalt, die Erwerbstätigkeit und die Integration von Ausländern im Bundesgebiet (AufenthG)

