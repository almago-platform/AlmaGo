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
      <section className="rounded-[1.3rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.30)] backdrop-blur-sm sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#1d2022]">
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
    <section className="rounded-[1.3rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.30)] backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#1d2022]">
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
        <div className="mt-5 rounded-xl border border-black/[.05] bg-[#f6f3ed] p-4">
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
