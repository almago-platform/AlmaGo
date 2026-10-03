# Campus Allemagne — READ FIRST before procedure/deadline implementation

If you are about to implement Campus Allemagne student dossier workflow, document processing, deadlines, admin cockpit, student next-actions, visa/study preparation workflow, or procedure automation:

**STOP and read these files first.**

1. [CAMPUS_ALLEMAGNE_IMPLEMENTATION_HANDOFF.md](./CAMPUS_ALLEMAGNE_IMPLEMENTATION_HANDOFF.md) — canonical product/implementation handoff.
2. [CAMPUS_ALLEMAGNE_PROCEDURE_DEADLINE_ENGINE_PLAN.md](./CAMPUS_ALLEMAGNE_PROCEDURE_DEADLINE_ENGINE_PLAN.md) — detailed plan and official-source register.
3. [campus-allemagne-procedure-templates.v1.json](./campus-allemagne-procedure-templates.v1.json) — design prototype for route/deadline semantics.

## Already decided

- Student provides only **passport + Bac/proof + Bac transcript** by default.
- Existing language certificate is optional at intake.
- Campus Allemagne manages the rest by default.
- Student tasks are exception-based and must explain why personal action is required.
- Official deadlines and internal Campus targets are different data types.
- Official dates require source + verification + intake/cycle.
- German legalisation is not assumed by default.
- Existing AlmaGo checklist/document/application/deadline primitives must be reused/extended.
- The recommended implementation is phased P1–P9, not one large rewrite.

## Do not duplicate work

Do not restart the product discovery or build a second generic checklist unless the source-of-truth documents are first reviewed and a documented reason for divergence is recorded.

Before coding:
- inspect current `main`;
- inspect open PRs/issues;
- identify which P1–P9 phase you are implementing;
- keep the above files updated if an agreed business rule changes.

This file exists specifically so a new ChatGPT/agent/developer does not unknowingly redo the already completed workflow design.
