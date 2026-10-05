# AlmaGo Product System V2 — Active PR Collision Map

Status: **Stage 1 complete for current open-PR baseline**

Open PRs inspected before V2 implementation sequencing.

## High collision risk with future Student redesign

### #852 — Fix student document next-action navigation
Changed:
- `src/app/student/page.tsx`

V2 rule:
- Do not touch Student dashboard production UI until this PR is resolved or rebased.
- Candidate/Prospect/Figma work can proceed independently.

### #833 — P3 smart documents
Changed:
- `src/app/student/documents/page.tsx`
- `src/components/student/DocumentsPanel.tsx`
- student document upload route
- migration/tests

V2 rule:
- Treat smart-document behaviour as business logic to preserve.
- Delay visual migration of Student documents until this PR is resolved.

### #834 — P4 deadline engine
Changed:
- `src/app/student/page.tsx`
- `src/app/student/applications/page.tsx`
- `src/components/student/StudentApplicationsPanel.tsx`
- deadline engine/migration/tests

V2 rule:
- Preserve deadline semantics.
- Do not redesign Student dashboard/applications production files while open.

### #836 / #837 / #838 / #839 — procedure UX, notifications, freshness, final coverage
Shared changed surface:
- `src/app/student/procedure/page.tsx`
- Student journey/test surfaces
- admin procedure page in some PRs
- migrations and tests

V2 rule:
- Procedure design remains out of the first production migration until these PRs settle.
- Their states become input to the future Student Journey component.

## High collision risk with future Admin dossier redesign

### #835 — P5 admin procedure cockpit
Changed:
- `src/app/admin/students/[studentId]/procedure/page.tsx`
- `AdminApplicationsPanel.tsx`
- `AdminDocumentsPanel.tsx`

### #838 — source freshness
Also changes:
- `src/app/admin/students/[studentId]/procedure/page.tsx`

V2 rule:
- The future Admin 360° dossier should absorb these capabilities after these branches are resolved.
- Do not overwrite or redesign the procedure cockpit while they are open.

## Low collision / independent

### #829
- Orientation live verification test only.

V2 rule:
- Safe for design research; production orientation code still requires normal rebase check before implementation.

### #830 / #831
- Procedure data-model/generator migrations and tests.

V2 rule:
- Preserve as backend foundations; no immediate visual file collision.

### #772
- Governance/documentation only.

V2 rule:
- No UI collision; future V2 governance docs should remain compatible.

---

## Safe Stage 1 work while these PRs are open

Safe now:
- Figma strategy, benchmark and foundations.
- Candidate/Prospect wire architecture.
- Admin 360° dossier wire architecture as design only.
- Student wire architecture as design only.
- Design-token specification.
- Component inventory.
- Content/terminology system.
- Accessibility/responsive specifications.

Not safe yet:
- broad production edits to `src/app/student/page.tsx`;
- Student documents/applications/procedure production redesign;
- admin procedure production redesign.

## Implementation rule

Before each production implementation stage:
1. refresh `main`;
2. inspect open PR changed files again;
3. rebase the scoped V2 branch;
4. preserve newly merged business logic;
5. redesign presentation around the merged behaviour rather than replacing it.

This collision map is a point-in-time baseline and must be refreshed before every implementation PR.
