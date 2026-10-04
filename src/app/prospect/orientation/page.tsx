import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadProspectHubState } from "@/lib/prospect/hub";

export const dynamic = "force-dynamic";

export default async function ProspectOrientationPage() {
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
  const t = prospectHubCopy[locale].orientation;
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <main className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.subtitle}</p>
      </header>

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

      {state.current ? (
        <>
          <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">{t.current}</p>
            <h2 className="mt-2 text-2xl font-bold">
              {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                state.answers?.targetDegree,
                state.answers?.targetField,
                state.answers?.preferredCities.length
                  ? state.answers.preferredCities.join(", ")
                  : null,
                state.answers?.germanLevel ? `Allemand ${state.answers.germanLevel}` : null,
              ].filter((value): value is string => Boolean(value)).map((value) => (
                <span key={value} className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
                  <bdi dir="auto">{value}</bdi>
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              {t.savedOn} <bdi dir="auto">{dateFormatter.format(new Date(state.current.created_at))}</bdi>
            </p>
            <Link
              href="/orientation?mode=update"
              className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
            >
              {t.update}
            </Link>
          </section>

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xl font-bold">{diagnosticCopy.sections.paths}</h2>
            <div className="mt-4 grid gap-3">
              {state.current.diagnostic.paths.map((item) => {
                const itemCopy = diagnosticCopy.items[item.code];
                return (
                  <article key={item.code} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-semibold">{itemCopy.title}</h3>
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                        {diagnosticCopy.status[item.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{itemCopy.body}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {state.orientations.length > 1 ? (
            <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <summary className="cursor-pointer text-lg font-bold">{t.history}</summary>
              <div className="mt-4 grid gap-2">
                {state.orientations.slice(1, 6).map((orientation) => (
                  <div key={orientation.id} className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
                    <p className="font-semibold">
                      {diagnosticCopy.headlines[orientation.diagnostic.headlineCode].title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      <bdi dir="auto">{dateFormatter.format(new Date(orientation.created_at))}</bdi>
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <section className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center">
          <p className="text-sm text-[var(--muted)]">{t.noOrientation}</p>
          <Link
            href="/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
          >
            {t.update}
          </Link>
        </section>
      )}
    </main>
  );
}
