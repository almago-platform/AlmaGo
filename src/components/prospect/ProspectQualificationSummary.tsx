import type { ProspectQualificationCopy } from "@/content/prospect-qualification-copy";
import type { ProspectStoredQualification } from "@/lib/prospect/hub";

const stateTheme = {
  not_evaluated: "pc-theme-blue",
  too_early: "pc-theme-blue",
  needs_information: "pc-theme-red",
  needs_verification: "pc-theme-amber",
  ready_for_review: "pc-theme-green",
  qualified_prospect: "pc-theme-green",
} as const;

export function ProspectQualificationSummary({
  qualification,
  copy,
}: {
  qualification: ProspectStoredQualification | null;
  copy: ProspectQualificationCopy;
}) {
  if (!qualification) {
    return (
      <section className="pc-panel pc-premium-card pc-theme-blue p-5 sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">
          {copy.unavailableTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {copy.unavailableBody}
        </p>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          {copy.disclaimer}
        </p>
      </section>
    );
  }

  const stateCopy = copy.states[qualification.state];
  const actionCopy = qualification.next_action
    ? copy.actions[qualification.next_action]
    : null;

  const themeClass = stateTheme[qualification.state];

  return (
    <section className={`pc-panel pc-premium-card ${themeClass} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">
            {stateCopy.title}
          </h2>
        </div>
        <span className="rounded-full border border-[var(--brand-border)]/60 bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]">
          {stateCopy.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {stateCopy.body}
      </p>

      {actionCopy ? (
        <div className="pc-glass mt-5 rounded-[var(--premium-radius-control)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
            {actionCopy.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
            {actionCopy.body}
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        {copy.disclaimer}
      </p>
    </section>
  );
}
