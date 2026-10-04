import type { ProspectQualificationCopy } from "@/content/prospect-qualification-copy";
import type { ProspectStoredQualification } from "@/lib/prospect/hub";

export function ProspectQualificationSummary({
  qualification,
  copy,
}: {
  qualification: ProspectStoredQualification | null;
  copy: ProspectQualificationCopy;
}) {
  if (!qualification) {
    return (
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
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

  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {stateCopy.title}
          </h2>
        </div>
        <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-strong)]">
          {stateCopy.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {stateCopy.body}
      </p>

      {actionCopy ? (
        <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
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
