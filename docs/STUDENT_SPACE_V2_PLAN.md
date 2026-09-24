# AlmaGo — Student Space V2 Professional Plan

**Status:** SAVED DESIGN SOURCE OF TRUTH  
**Date:** 24 September 2026  
**Scope:** authenticated student space only (`/student/**`)  
**Relation to Master Plan:** professional UX/UI refinement only. No new business capability. Existing Auth/RLS/Supabase truth remains unchanged.

---

## 1. Objective

The student space must feel like a guided service, not like a technical management dashboard.

Within seconds, a student should understand:

1. where they are in their dossier;
2. what they need to do now;
3. what AlmaGo is currently following;
4. what is already complete;
5. what comes next.

The target feeling is:

> “Je sais exactement où j’en suis. Je vois ce que je dois faire. Et je sens que mon dossier est organisé.”

---

## 2. Reference fusion

AlmaGo Student Space V2 combines principles from TLScontact and uni-assist without copying their proprietary design.

### From TLScontact

Keep:
- trust and institutional clarity;
- obvious next action;
- calm visual hierarchy;
- easy navigation;
- reassuring status communication;
- limited visual noise.

Do not copy:
- TLScontact branding;
- exact navigation;
- proprietary visual assets;
- exact interaction patterns.

### From uni-assist / My assist

Keep:
- human and educational language;
- step-by-step guidance;
- clear application/document progress;
- strong sense of “what happens next”;
- student-centred information architecture.

Do not copy:
- uni-assist branding;
- exact portal layout;
- proprietary illustrations or photography;
- exact process visualisations.

### AlmaGo result

The space must feel:
- professional;
- human;
- easy;
- reassuring;
- personal;
- transparent;
- clearly AlmaGo.

---

## 3. Global experience principles

### The interface should always answer

- What is happening?
- Do I need to do something?
- Who owns the next action?
- What happens next?
- Where can I see more detail?

### Avoid

- technical database language;
- raw internal status names;
- too many badges;
- too many cards with equal visual weight;
- vague “progress” that looks like admission probability;
- tables on mobile;
- excessive photography inside authenticated pages;
- generic SaaS dashboard aesthetics.

### Prefer

- one clear primary action per section;
- human wording;
- strong spacing;
- explicit ownership of actions;
- contextual help;
- truthful status language;
- concise explanations.

---

## 4. Student space shell

### Desktop

Permanent left sidebar:

- AlmaGo
- “Votre espace étudiant”
- Mon dossier
- Mon profil
- Mes documents
- Mon orientation
- Mes démarches
- Mes candidatures

Bottom area:
- real help/contact destination only if it exists;
- logout.

The active page must be obvious through:
- AlmaGo blue;
- subtle orange accent;
- icon + label;
- clear active background.

### Content header

Human greeting:

> Bonjour {prénom}

Context line:

> Voici ce qui compte aujourd’hui pour votre projet d’études.

Only relevant controls should appear on the right.

### Mobile

- compact AlmaGo header;
- current page title;
- navigation simple and thumb-friendly;
- no crowded horizontal UI;
- full-width primary actions when useful.

---

## 5. Dashboard / Mon dossier

This is the most important authenticated page.

The current data model already contains the right concepts:
- next action;
- checklist progress;
- documents;
- recommendations;
- applications;
- deadlines.

Student Space V2 changes presentation, not business truth.

### Block A — Human welcome

Example:

> Bonjour Ayoub, voici votre dossier.

Contextual message:

> Vous avez 2 actions à traiter. Commencez par la plus importante ci-dessous.

or:

> Aucune action n’est demandée actuellement. Nous suivons 2 étapes de votre dossier.

### Block B — What you need to do now

This is the highest-priority card.

Title:
`Votre prochaine action`

Show:
- action label;
- short explanation;
- owner: student / AlmaGo / follow-up;
- one primary CTA.

Examples:
- Corriger mes documents
- Voir ma candidature
- Continuer ma checklist

If no action exists:

> Vous n’avez rien à faire pour le moment.

### Block C — Student journey visual

Six stages:

1. Profil
2. Documents
3. Orientation
4. Préparation
5. Candidatures
6. Démarches suivantes

Important truth rule:

> This journey visualises dossier items recorded in AlmaGo. It never represents admission probability or an official decision.

### Block D — Simple dossier overview

Four cards only:

- Documents
- Orientation
- Candidatures
- Démarches

Each card:
- one meaningful count/status;
- one concise line;
- direct route to the relevant page.

### Block E — Next deadline

Show:
- date;
- application/program if known;
- next action if known;
- CTA to candidature detail/list.

---

## 6. Documents page

The documents page must reduce anxiety.

### Header

`Vos documents`

Summary:
- Validés
- En vérification
- À corriger

### Priority area

If correction is required:

`Action nécessaire`

Show:
- document name;
- clear reason/comment when available;
- next action.

CTA:
`Remplacer le document` or relevant action.

### Upload flow

Make the flow visually obvious:

1. Choisir le type
2. Choisir le fichier
3. Envoyer

After upload:

> Document reçu. Son statut sera mis à jour après vérification.

### Document cards

Show:
- category;
- filename;
- status;
- upload date;
- relevant AlmaGo comment;
- open;
- delete only when business rules allow it.

### Status language

Use human labels only:
- Validé
- En vérification
- Correction demandée
- Remplacement requis
- Reçu

Never show raw database statuses to the student.

---

## 7. Orientation page

The orientation page must feel like guidance, not a database.

Each programme recommendation should become a real orientation card.

Show when available:
- university;
- programme;
- degree level;
- city;
- teaching language;
- deadline;
- language requirement;
- application source.

Add:

`Pourquoi cette piste apparaît ?`

Explain using only real recorded criteria.

Actions:
- Voir les critères
- Ça m’intéresse
- Voir / créer candidature when supported

Permanent truth rule:

> Une recommandation est une piste de travail, pas une garantie d’admission.

---

## 8. Checklist / démarches

This section should strongly use step-by-step guidance.

### Top summary

Show:
- progression of recorded tasks;
- number requiring student action;
- number followed by AlmaGo;
- completed count.

### Status vocabulary

Use:
- À faire par vous
- En cours
- Suivi par AlmaGo
- Terminé

Avoid raw implementation terms.

### Grouping

Keep categories visually separated.

Example:

`Documents académiques`
- Diplôme ✓
- Traduction ✓
- Relevé à remplacer ●
- Certificat de langue ○

### Progress truth

Always explain:

> Cette progression concerne les démarches enregistrées dans votre dossier. Elle ne représente ni une admission ni une validation finale.

---

## 9. Applications page

Each application should be immediately recognisable.

Card structure:

- university;
- programme;
- degree level;
- status;
- deadline;
- next action;
- history/timeline.

### Timeline

Possible stages only if backed by real recorded application events:

- Créée
- Préparée
- Envoyée
- En attente
- Résultat enregistré

Truth rule:

> Le statut AlmaGo reflète le suivi enregistré et ne remplace pas le statut officiel de l’université.

### Priority

Applications with:
- upcoming deadlines;
- overdue deadline;
- student next action;
must be visually prioritised.

---

## 10. Profile page

The profile should feel structured, not administrative.

Split into clear visual sections:

### Informations personnelles
- identity/context fields already stored.

### Parcours académique
- studies and qualifications.

### Langues
- German / English and relevant levels.

### Projet d’études
- degree level;
- field;
- preferences.

### Profile completeness

Only show a completion percentage if it is calculated from real required fields.

Never invent an arbitrary score.

Explain:

> Ces informations permettent à AlmaGo de mieux organiser votre dossier.

---

## 11. Human language system

Student Space V2 should systematically use reassuring microcopy.

Examples:

### Why
`Pourquoi AlmaGo vous demande cela ?`

### What happens next
`Que va-t-il se passer ensuite ?`

### No action
`Vous n’avez rien à faire actuellement.`

### Upload success
`Votre fichier est bien enregistré.`

### Waiting
`Aucune action n’est demandée de votre côté pendant cette vérification.`

### Error
`Nous n’arrivons pas à afficher cette information pour le moment. Rien n’a été supprimé ou modifié.`

---

## 12. Visual system

Keep the same family as Homepage V2.

### Palette
- AlmaGo blue;
- white;
- warm off-white background;
- orange for important attention only;
- semantic warning/success colors with accessible contrast.

### Style
- generous spacing;
- clear page headers;
- medium-radius cards;
- subtle shadows;
- consistent icons;
- one visual priority per section.

### Avoid
- overly dark dashboards;
- too many gradients;
- too many pill badges;
- “AI startup” visual style;
- decorative charts with no real meaning.

---

## 13. Photography and human imagery

Unlike the public homepage, authenticated pages should use very little photography.

Recommended only for:
- onboarding;
- welcome/empty states;
- first-use moments;
- optional help or guidance panels.

Do not place large photos on every student page.

Inside the private space, the student’s own dossier data is the main visual content.

---

## 14. Empty states

Every empty state must tell the student:

1. what is empty;
2. whether that is normal;
3. what they can do next.

Example:

Instead of:
`Aucun document`

Use:

`Vous n’avez encore ajouté aucun document.`

> Lorsque votre dossier nécessitera une pièce, vous pourrez la déposer ici.

CTA:
`Ajouter un document`

---

## 15. Error states

Never expose raw technical errors.

Use:

`Nous n’arrivons pas à afficher vos documents pour le moment.`

> Rien n’a été supprimé ou modifié. Vous pouvez réessayer.

CTA:
`Réessayer`

Keep destructive operations clearly separate.

---

## 16. Mobile requirements

Treat mobile as a real product, not a compressed desktop layout.

Requirements:
- next action visible early;
- no wide tables;
- stacked cards;
- simple upload;
- full-width primary CTA when useful;
- vertical timeline;
- accessible horizontal nav only when unavoidable;
- minimum practical 44 px touch targets;
- no clipped labels;
- no hidden critical status.

Target widths:
- 320 px
- 375 px
- 390 px
- 768 px
- 1024 px
- 1440 px

---

## 17. Accessibility requirements

Before every merge:
- WCAG AA contrast;
- correct heading hierarchy;
- visible keyboard focus;
- accessible status messages;
- accessible form labels;
- no keyboard trap;
- no serious/critical axe violations;
- meaningful aria labels where necessary;
- semantic status/alert usage.

---

## 18. Performance requirements

- keep authenticated pages lightweight;
- no heavy animation library;
- no decorative video;
- avoid unnecessary client components;
- preserve existing server-side data loading where appropriate;
- keep Lighthouse within AlmaGo advisory budgets.

---

## 19. Implementation sequence

### E1 — Shell + sidebar + student header
- navigation hierarchy;
- desktop sidebar;
- mobile header/nav;
- human greeting context;
- active states;
- logout placement.

### E2 — Dashboard / Mon dossier
- human welcome;
- next action;
- six-stage student journey;
- four-card overview;
- next deadline.

### E3 — Documents
- priority action;
- status summary;
- clearer upload flow;
- reassuring success/error messages;
- human document cards.

### E4 — Checklist / démarches
- clearer progression;
- human status labels;
- category grouping;
- student-vs-AlmaGo ownership.

### E5 — Orientation
- human recommendation cards;
- readable criteria;
- why-this-program explanation;
- truth boundary.

### E6 — Applications
- recognisable application cards;
- timeline/history;
- deadlines;
- next action;
- official-status truth boundary.

### E7 — Profile
- sectioned form;
- clearer guidance;
- real completeness only if justified.

### E8 — Empty/error states + microcopy
- unify wording;
- remove technical language;
- reassuring system feedback.

### E9 — Mobile/responsive polish
- 320/375/390/768/1024/1440;
- navigation;
- forms;
- cards;
- timelines;
- uploads.

### E10 — Final quality pass
- tests;
- TypeScript;
- lint;
- build;
- Playwright;
- responsive screenshots;
- axe;
- Lighthouse;
- manual visual review.

---

## 20. Governance

Exactly like Homepage V2:

- one active phase at a time;
- dedicated branch;
- one PR;
- canonical CI;
- Browser Quality where relevant;
- screenshots review;
- merge only after green evidence;
- no business logic invention;
- no Auth/RLS/permission changes unless explicitly required and separately reviewed.

---

## 21. Acceptance criteria

Student Space V2 is accepted only when:

- students understand their current situation immediately;
- the next action is obvious;
- responsibility is clear;
- wording is human and reassuring;
- no fake progress/admission signal exists;
- dashboard feels personal rather than technical;
- all main pages share one visual system;
- desktop and mobile both feel intentional;
- empty/error states are helpful;
- accessibility passes;
- tests pass;
- TypeScript passes;
- lint passes;
- build passes;
- browser quality passes;
- final screenshots have been manually reviewed.

---

## 22. Approved design direction

> TLScontact trust + uni-assist guidance + AlmaGo personal dossier experience.

Student Space V2 should not feel like a backend interface for students.

It should feel like a calm, trustworthy personal service that always makes the next step understandable.
