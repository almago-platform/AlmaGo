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
      <section className="relative overflow-hidden rounded-[1.3rem] border border-black/[.07] bg-white p-5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.3)] sm:p-6">
        <span className="absolute inset-y-0 start-0 w-1 bg-[#8d9296]" aria-hidden="true" />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#73787c]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]">
          {copy.unavailableTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {copy.unavailableBody}
        </p>
        <p className="mt-4 border-t border-black/[.06] pt-3 text-xs leading-5 text-[#7b8084]">
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
    <section className="relative overflow-hidden rounded-[1.35rem] border border-black/[.07] bg-white shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)]">
      <div className="absolute inset-y-0 start-0 w-1 bg-[var(--brand)]" aria-hidden="true" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand-strong)]">
                {copy.eyebrow}
              </p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]">
              {stateCopy.title}
            </h2>
          </div>
          <span className="rounded-full border border-[var(--brand-border)]/70 bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--brand-strong)]">
            {stateCopy.label}
          </span>
        </div>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--muted)]">
          {stateCopy.body}
        </p>

        {actionCopy ? (
          <div className="mt-5 rounded-2xl border border-[#ead59a] bg-[#fff9e9] p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7b5900]">
              {actionCopy.label}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#44413a]">
              {actionCopy.body}
            </p>
          </div>
        ) : null}

        <p className="mt-4 border-t border-black/[.06] pt-3 text-xs leading-5 text-[#7b8084]">
          {copy.disclaimer}
        </p>
      </div>
    </section>
  );
}
