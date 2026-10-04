import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadProspectHubState } from "@/lib/prospect/hub";

export const dynamic = "force-dynamic";

export default async function ProspectProposalPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const state = await loadProspectHubState({
    userId: access.user.id,
    email: access.user.email,
    emailConfirmed: Boolean(access.user.email_confirmed_at),
  });
  const t = prospectHubCopy[locale].proposal;

  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.subtitle}</p>
      </header>

      {!state.intake && state.orientationConfirmed ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold">{t.waitingTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.waitingBody}</p>
        </section>
      ) : null}

      <IntakeFlowCard
        recovery={state.recovery}
        orientationId={state.current?.id ?? null}
        orientationConfirmed={state.orientationConfirmed}
        intake={state.intake
          ? {
              status: state.intake.status,
              proposed_route_key: state.intake.proposed_route_key,
              proposal_reason: state.intake.proposal_reason,
              procedure_id: state.intake.procedure_id,
            }
          : null}
        starterSummary={state.starterSummary}
      />

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
        <h2 className="font-bold">{t.waitingTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.waitingBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/prospect/catalogue"
            className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold"
          >
            Programmes & catalogue
          </Link>
          <Link
            href="/prospect/solutions"
            className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold"
          >
            Solutions utiles
          </Link>
        </div>
      </section>
    </main>
  );
}
