# Audit UX & Accessibilité — Matching Étudiant Master (Allemagne)

- **Date de l'audit :** 2026-09-25
- **Auditeur :** Spécialiste Gemini UX/Accessibilité (@almago-gemini-ux)
- **Cible de la review :** PR #225 — `feat(germany): show verified Master criteria in student orientation`
- **Branche de base :** `feat/germany-lot2-student-master-match-ui`
- **Statut de l'audit :** Terminé — Rapport d'audit de conformité d'interface client.

---

## 1. Synthèse de l'Audit

Cet audit évalue l'expérience utilisateur (UX) et l'accessibilité (A11y) du module d'orientation étudiant introduit dans la PR #225. L'objectif de cette fonctionnalité est d'afficher les résultats du matching vérifié des critères d'accès aux Masters en Allemagne de manière claire, humaine, sans donner de verdict d'admission ni afficher de scores bruts ou de pourcentages.

### Points Forts Constatés :
1. **Respect des Garde-fous Métier :** Aucun score, pourcentage ou probabilité d'admission n'est affiché. Les termes de type « verdict d'admission » ou « admissible » sont soigneusement évités, se concentrant sur une « comparaison factuelle ».
2. **Excellente gestion du squelette de chargement :** Le fichier `loading.tsx` implémente des attributs d'accessibilité idéaux (`aria-busy="true"`, `aria-live="polite"`, et un texte caché destiné aux lecteurs d'écran `sr-only`).
3. **Sécurité et performance :** Les JSONB techniques d'administration restent confidentiels et ne sont pas transférés au navigateur de l'étudiant.

Cependant, plusieurs anomalies d'accessibilité s'élevant au niveau d'**anomalies de conformité (A11y)** ainsi que des risques de **confusion sémantique / UX** ont été relevés et méritent d'être corrigés lors de la prochaine itération.

---

## 2. Analyses & Observations Détaillées

### A. Clarté des États de Matching & Critères

#### Observation 1 : Terme « À compléter » pour des inadéquations bloquantes (not_satisfied)
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 428)
- **Détail :** Le statut `not_satisfied` est traduit par « À compléter ». Si un étudiant a un niveau d'allemand déclaré A2 alors que le programme exige un niveau C1 (écart majeur de 4 niveaux), l'étiquette affiche « À compléter », avec pour explication « Le niveau d’allemand déclaré est inférieur au niveau requis ».
- **Impact UX :** Le libellé « À compléter » est trompeur. Il suggère qu'il s'agit d'une simple pièce administrative manquante ou d'un champ vide à remplir dans un formulaire. Or, c'est une inadéquation académique directe (blocking mismatch). Cela peut amener l'étudiant à sous-estimer la sévérité du critère et à engager des démarches inutiles.
- **Gravité :** Élevée (Risque de déception et d'erreur d'orientation).

---

### B. Structure Sémantique & Accessibilité (A11y)

#### Observation 2 : Absence de Titres Sémantiques dans les Sections
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 374 et Ligne 278)
- **Détail :** 
  Dans le composant `RequirementAssessment`, le titre de section est codé comme suit :
  ```tsx
  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Comparaison avec votre projet</p>
  ```
  De même, pour la section « Critères enregistrés » :
  ```tsx
  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Critères enregistrés</p>
  ```
- **Impact A11y :** Un paragraphe (`<p>`) stylisé en gras n'est pas reconnu comme un en-tête par les technologies d'assistance (lecteurs d'écran). Les utilisateurs malvoyants naviguant via la structure des titres (touche `H` du clavier) ne pourront pas détecter ni sauter directement à ces sections de comparaison clés.
- **Gravité :** Moyenne (Non-respect des règles d'accessibilité WCAG 1.3.1 - Info and Relationships).

#### Observation 3 : Multiples Landmarks Sémantiques Identiques non Uniques
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 360-372)
- **Détail :** 
  Chaque carte de programme recommandée est rendue sous forme d'un élément `<Card as="article">`. À l'intérieur, le composant `<RequirementAssessment>` utilise la balise de sectionnement suivante :
  ```tsx
  <section className="mt-5 ..." aria-label="Comparaison avec votre projet">
  ```
- **Impact A11y :** Si un étudiant a plusieurs recommandations sur sa page, le lecteur d'écran listera plusieurs sections de type `<section>` ayant exactement le même `aria-label="Comparaison avec votre projet"`. L'utilisateur n'aura aucun moyen de savoir à quel programme se rattache chaque section sans naviguer en profondeur dans l'article.
- **Gravité :** Moyenne (Perturbe la navigation par landmarks).

#### Observation 4 : Rupture de la Hiérarchie des Titres
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 339-347)
- **Détail :** 
  Le composant `SummaryCard` utilise un tag `<h2>` pour son titre :
  ```tsx
  <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
  ```
  Ces cartes de résumé sont incluses dans une section secondaire latérale. Les titres principaux de la page sont déjà des `<h2>` (« Votre orientation », « Programmes à comparer »). Introduire des `<h2>` à l'intérieur de composants de petite taille imbriqués perturbe la structure séquentielle logique des titres (qui devrait être `<h1>` -> `<h2>` -> `<h3>`).
- **Gravité :** Faible (Légère incohérence sémantique).

---

### C. Risques Responsives

#### Observation 5 : Risque d'Éclatement Sémantique ou d'Overflow sur Petits Écrans
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 383-386)
- **Détail :** 
  Dans l'affichage des critères de matching individuels, le titre du critère et son badge de statut sont disposés dans un conteneur Flexbox enveloppant :
  ```tsx
  <div className="flex flex-wrap items-center justify-between gap-2">
    <p className="text-sm font-semibold text-slate-900">{criterionLabel(item.criterion)}</p>
    <Badge variant={criterionTone(item)}>{criterionStatusLabel(item)}</Badge>
  </div>
  ```
- **Impact UX :** Sur les appareils très étroits (largeur < 360px ou zoom important), si un critère possède un nom long (par exemple, un libellé de crédit par matière personnalisé comme `Crédits · Advanced Software Engineering`), le badge sera poussé à la ligne ou écrasé, diminuant la lisibilité immédiate du statut de validation. De plus, aucun attribut `overflow-wrap:anywhere` n'est appliqué ici contrairement aux autres éléments d'information.
- **Gravité :** Faible (Esthétique / Confort de lecture mobile).

---

### D. Cohérence des Libellés & Vocabulaire Technique Admin (Exposition)

#### Observation 6 : Fuite de Vocabulaire Technique / Admin vers les Étudiants
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 440-447)
- **Détail :** 
  Le composant affiche le message brut `item.reason` (venant de la base de données ou du modèle de matching backend) comme explication textuelle par défaut. 
  Cela expose aux étudiants des messages conçus pour la gestion interne ou l'administration :
  - `"Source ou vérification à revalider."` (si le statut de l'évaluation est `needs_reverification`)
  - `"Valeur numérique non exploitable."` (si la valeur n'est pas un nombre positif)
  - `"Le prérequis est disponible uniquement en texte libre."` (lorsque l'admin a saisi une note textuelle sans structurer de valeur quantitative)
  - `"La deadline vérifiée n’est pas une date structurée comparable."`
  - `"Le niveau requis n’est pas un niveau CEFR comparable."`
- **Impact UX :** Ces messages contiennent du jargon technique ou administratif (ex: "valeur numérique non exploitable", "CEFR comparable", "texte libre"). Ils peuvent inquiéter ou désorienter l'étudiant, en lui donnant l'impression qu'un bug technique affecte son dossier ou que le système est défaillant, plutôt que de lui expliquer simplement ce qu'il doit faire.
- **Gravité :** Moyenne (UX anxiogène / manque de vulgarisation).

---

### E. Risques de Multilinguisme & i18n

#### Observation 7 : Génération de Libellés Mixtes (Français / Anglais)
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 411-420)
- **Détail :** 
  La fonction `criterionLabel` effectue un découpage à la volée de l'identifiant du critère :
  ```tsx
  if (criterion.startsWith("language:")) return `Langue · ${criterion.slice("language:".length)}`;
  if (criterion.startsWith("subject_credits:")) return `Crédits · ${criterion.slice("subject_credits:".length)}`;
  ```
  Si la base de données stocke `"language:german"` ou `"subject_credits:Mathematics"`, l'interface affichera respectivement :
  - **« Langue · german »**
  - **« Crédits · Mathematics »**
- **Impact UX :** Le site étant en français, l'intégration de termes anglais non traduits altère la cohérence de l'interface et donne une impression de travail inachevé ou non localisé.
- **Gravité :** Faible à Moyenne (Incohérence linguistique).

---

### F. Communication des Informations Vérifiées vs Déclaratives

#### Observation 8 : Absence de distinction visuelle entre Données Saisies (Projet) et Données Certifiées (Programme)
- **Composant :** `src/components/student/StudentOrientationPanel.tsx` (Ligne 389-395)
- **Détail :** 
  La comparaison affiche les valeurs côte à côte :
  ```text
  Votre information : A2 · Critère publié : C1
  ```
- **Impact UX :** Le terme « Critère publié » fait référence au critère vérifié officiellement par l'équipe d'AlmaGo (qui est fiable à 100%), tandis que « Votre information » fait référence à la donnée auto-déclarée par l'étudiant dans son profil (potentiellement obsolète ou erronée). Il n'est pas explicitement rappelé à l'étudiant que l'évaluation repose sur sa propre saisie déclarative.
- **Gravité :** Faible (Optimisation de la clarté informationnelle).

---

### G. Code Mort / Prop Orpheline

#### Observation 9 : Propriété `loadError` inutilisée
- **Fichiers :** `src/app/student/orientation/page.tsx` et `src/components/student/StudentOrientationPanel.tsx` (Ligne 64 et Ligne 125)
- **Détail :** 
  Le panneau d'orientation déclare la propriété optionnelle `loadError?: string` et intègre un traitement d'erreur complet (lignes 125-138). Cependant, dans le composant serveur `StudentOrientationPage`, cette propriété n'est jamais transmise. En cas d'erreur lors du chargement des recommandations, le serveur retourne directement le composant `<OrientationUnavailable />`.
- **Impact Dev :** Complexité inutile du code client et possibilité d'incohérences de maintenance futures.
- **Gravité :** Très Faible (Propreté du code).

---

## 3. Classification des Anomalies

Pour faciliter la priorisation des travaux futurs, les observations sont classées ci-dessous :

### anomalies de conformité (Confirmed Issues)
*Doivent être résolues en priorité pour garantir l'accessibilité légale et éviter les erreurs d'interprétation critiques.*

1. **[Accessibilité] Titres de sous-sections non sémantiques :** Remplacer les paragraphes `<p>` stylisés par des balises de titres structurés (`<h4>`) dans les composants de comparaison.
2. **[Accessibilité] Landmarks non uniques :** Rendre l'attribut `aria-label` de la section `RequirementAssessment` unique en y incluant dynamiquement le nom du programme.
3. **[UX / Sémantique] Libellé trompeur « À compléter » :** Remplacer par « Critère non atteint » ou « Écart de niveau » pour les cas d'incompatibilité flagrante (`not_satisfied`).
4. **[UX / Copie] Fuite de jargon technique :** Retravailler les fallbacks de messages backend techniques (`needs_reverification`, `needs_manual_review`) en explications adaptées au profil étudiant.

### Suggestions d'Amélioration (Suggestions)
*Améliorent l'esthétique générale, la robustesse multilingue et le confort d'utilisation.*

1. **[i18n] Traduction des clés dynamiques :** Ajouter une fonction de mappage de langues et de matières pour traduire automatiquement les critères comme `german` ou `Mathematics` en français.
2. **[Accessibilité] Alignement de la hiérarchie des titres :** Abaisser le niveau des titres de `SummaryCard` de `<h2>` vers `<h3>` pour respecter l'imbrication logique.
3. **[UX] Distinction Declarative vs Certified :** Clarifier les libellés de comparaison (ex : « Donnée de votre projet » au lieu de « Votre information »).
4. **[Maintenance] Suppression du code orphelin :** Supprimer la prop `loadError` du composant client ou unifier les gestionnaires d'erreurs entre le serveur et le client.

---

## 4. Plan de Changements Sécurisés ("Safe Next Changes")

Voici les recommandations de modifications de code non intrusives, localisées exclusivement sur l'interface utilisateur frontend sans aucun impact sur la logique métier, la base de données, l'authentification ou les services d'API.

### Fichier cible : `src/components/student/StudentOrientationPanel.tsx`

#### 1. Correction de l'accessibilité sémantique (Titres et Landmark Unique)

*Passer le nom du programme à `RequirementAssessment` pour personnaliser l'en-tête sémantique et la balise d'accessibilité unique.*

```tsx
// Modification de la signature du composant :
function RequirementAssessment({ 
  match, 
  programName 
}: { 
  match?: MasterRequirementsMatch | null; 
  programName: string; 
}) {
  if (!match || (!match.criteria.length && match.application_route === "unknown")) return null;

  const summary = match.has_blocking_mismatch
    ? { label: "Point à compléter", tone: "warning" as const }
    : match.needs_manual_review
      ? { label: "Vérification nécessaire", tone: "info" as const }
      : match.has_unknowns
        ? { label: "Informations manquantes", tone: "neutral" as const }
        : { label: "Critères comparés", tone: "success" as const };

  return (
    <section 
      className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4" 
      aria-label={`Comparaison avec votre projet pour ${programName}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {/* Transformation en titre h4 sémantique pour l'accessibilité */}
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
            Comparaison avec votre projet
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Lecture factuelle des critères vérifiés disponibles. Ce n’est pas une décision d’admission.
          </p>
        </div>
        <Badge variant={summary.tone}>{summary.label}</Badge>
      </div>
      ...
```

#### 2. Localisation linguistique et traduction des critères

*Ajouter un traducteur de mots-clés de base pour éviter l'apparition de l'anglais.*

```tsx
function translateKey(key: string): string {
  const dictionary: Record<string, string> = {
    german: "allemand",
    deutsch: "allemand",
    english: "anglais",
    mathematics: "mathématiques",
    physics: "physique",
    chemistry: "chimie",
    computer_science: "informatique",
  };
  const normalizedKey = key.trim().toLowerCase();
  return dictionary[normalizedKey] || key;
}

function criterionLabel(criterion: string) {
  if (criterion === "minimum_ects") return "ECTS minimum";
  if (criterion === "minimum_grade") return "Note minimale";
  if (criterion === "prior_degree") return "Diplôme antérieur";
  if (criterion === "intake") return "Rentrée";
  if (criterion === "deadline") return "Échéance";
  if (criterion.startsWith("language:")) {
    const lang = criterion.slice("language:".length);
    return `Langue · ${translateKey(lang)}`;
  }
  if (criterion.startsWith("subject_credits:")) {
    const subj = criterion.slice("subject_credits:".length);
    return `Crédits · ${translateKey(subj)}`;
  }
  return "Critère du programme";
}
```

#### 3. Humanisation des explications techniques d'administration

*Empêcher l'exposition directe de descriptions de bas niveau sémantique.*

```tsx
function criterionExplanation(item: RequirementMatchResult) {
  // Traduction des statuts et explications orientée étudiant
  if (item.status === "needs_manual_review" && item.reason === "Source ou vérification à revalider.") {
    return "Les données de ce programme sont en cours de mise à jour par nos conseillers. N'hésitez pas à consulter le site officiel.";
  }
  if (item.status === "needs_manual_review" && item.reason === "Valeur numérique non exploitable.") {
    return "Les modalités détaillées de ce critère nécessitent une vérification manuelle de votre dossier.";
  }
  if (item.status === "needs_manual_review" && item.reason === "Le prérequis est disponible uniquement en texte libre.") {
    return "Ce critère ne peut pas être comparé automatiquement car ses modalités sont spécifiques. Veuillez vous référer à la description ou à la source officielle.";
  }
  
  // Reste des fallbacks existants
  if (item.criterion === "minimum_ects" && item.status === "unknown") return "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.";
  if (item.criterion === "minimum_grade" && item.status === "unknown") return "Votre note n’est pas encore disponible dans un format comparable.";
  if (item.criterion.startsWith("subject_credits:") && item.status === "unknown") return "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.";
  if (item.criterion.startsWith("language:") && item.status === "unknown") return "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.";
  if (item.criterion === "prior_degree" && item.status === "needs_manual_review") return "La compatibilité de votre diplôme doit être vérifiée avant de conclure.";
  return item.reason;
}
```

#### 4. Reformulation des statuts d'inadéquation

```tsx
function criterionStatusLabel(item: RequirementMatchResult) {
  if (item.criterion === "deadline") {
    if (item.status === "satisfied") return "Échéance ouverte";
    if (item.status === "not_satisfied") return "Échéance dépassée";
  }
  if (item.status === "satisfied") return "Critère rempli";
  // Remplacement de "À compléter" par une formule plus claire et moins trompeuse
  if (item.status === "not_satisfied") return "Incompatible / Non atteint";
  if (item.status === "needs_manual_review") return "À vérifier";
  return "Information manquante";
}
```

---

## Conclusion de l'Audit

La PR #225 jette d'excellentes bases fonctionnelles et sémantiques pour rassurer et guider les étudiants dans leur orientation en Allemagne. Les modifications proposées dans la section **"Safe Next Changes"** permettront de corriger les anomalies critiques de conformité d'accessibilité (WCAG), d'harmoniser les contenus multilingues et d'éliminer toute confusion d'interprétation pour les étudiants.
