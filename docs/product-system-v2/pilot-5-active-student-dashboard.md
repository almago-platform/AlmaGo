# Pilot 5 — Active Student Dashboard / Dossier Home

Status: **Architecture defined — production implementation blocked by open Student PR collisions**

## Entry condition

This screen is for an **activated Student / Client AlmaGo** only.

It is not the Prospect home.

## Primary Student questions

1. Where is my dossier now?
2. What do I need to do next?
3. What is Campus doing?
4. What external party are we waiting for?
5. What deadline matters next?

## Current strengths to preserve

The existing Student dashboard already computes:
- next action;
- document issues;
- application actions;
- checklist actions;
- progress;
- deadlines;
- recent activity.

This is valuable business logic and should survive the redesign.

## Target hierarchy

### 1. Active Student dossier header
- Student name;
- target project;
- active service/route;
- dossier status;
- important intake/date.

### 2. Dominant next action
One action with:
- what;
- why;
- expected effort/time when useful;
- CTA.

### 3. Responsibility strip
Three clear possible owners:
- You
- Campus Allemagne
- University / external authority

### 4. Journey / procedure status
Show meaningful milestones only.

Avoid turning every backend state into a visible step.

### 5. Deadlines
Compact and prioritised:
- overdue;
- soon;
- later.

### 6. Work panels
- Documents
- Applications
- Recommendations/programmes
- Messages

Only show a panel prominently when it contains relevant information/action.

### 7. Activity timeline
Recent meaningful changes, not raw logs.

## Navigation target

Primary:
- Accueil
- Mon parcours
- Documents
- Candidatures / Programmes
- Messages

Secondary:
- Profil
- Services
- Aide
- Settings / logout

## Acceptance criteria

- [ ] No Prospect-only commercial onboarding remains in Student navigation.
- [ ] One next action dominates.
- [ ] Responsibility is explicit.
- [ ] Deadlines are prioritised.
- [ ] Panels are not all equal-weight cards.
- [ ] Empty states do not create large dead zones.
- [ ] 360/390/768/1024/1440 layouts approved.
- [ ] Arabic/RTL approved.
- [ ] Open PR logic is reconciled before production edits.
