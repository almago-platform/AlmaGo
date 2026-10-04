import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectJourneyProgress } from "@/components/prospect/ProspectJourneyProgress";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadProspectHubState } from "@/lib/prospect/hub";

type Step = {
  title: string;
  body: string;
  href: string;
};

function activeStepIndex(state: Awaited<ReturnType<typeof loadProspectHubState>>) {
  if (!state.current || !state.orientationConfirmed) return 0;
  if (!state.intake || state.intake.status === "starter_documents") return 1;
  if (state.intake.status === "campus_review") return 2;
  if (state.intake.status === "route_proposed" || state.intake.status === "student_question") return 3;
  if (state.intake.status === "procedure_created") return 4;
  return 1;
}

function steps(locale: "fr" | "ar" | "en" | "de"): Step[] {
  const all = {
    fr: [
      ["Orientation", "Confirmer les informations qui servent de point de départ à votre projet.", "/prospect/orientation"],
      ["Documents", "Envoyer les pièces nécessaires pour que Campus Allemagne puisse vérifier votre situation.", "/prospect/documents"],
      ["Analyse Campus", "Campus Allemagne examine votre orientation et les pièces validées.", "/prospect/proposal"],
      ["Proposition", "Consulter le parcours proposé, le confirmer ou demander une modification.", "/prospect/proposal"],
      ["Procédure", "Après confirmation, votre procédure structurée peut être créée et suivie.", "/prospect/roadmap"],
      ["Candidatures", "Les candidatures viennent après validation du parcours et des exigences de chaque programme.", "/prospect/catalogue"],
      ["Admission", "Une admission officielle appartient à l’université et ne peut jamais être garantie.", "/prospect/roadmap"],
      ["Visa & départ", "Après admission, préparez financement, assurance, compte bloqué, visa et départ selon les exigences applicables.", "/prospect/solutions"],
    ],
    en: [
      ["Orientation", "Confirm the information used as the starting point for your project.", "/prospect/orientation"],
      ["Documents", "Send the documents Campus Allemagne needs to review your situation.", "/prospect/documents"],
      ["Campus review", "Campus Allemagne reviews your orientation and approved documents.", "/prospect/proposal"],
      ["Proposal", "Review the proposed route, confirm it or request a change.", "/prospect/proposal"],
      ["Procedure", "After confirmation, your structured procedure can be created and tracked.", "/prospect/roadmap"],
      ["Applications", "Applications come after the route and each programme’s requirements have been checked.", "/prospect/catalogue"],
      ["Admission", "Official admission is decided by the university and can never be guaranteed.", "/prospect/roadmap"],
      ["Visa & departure", "After admission, prepare funding, insurance, blocked account, visa and departure as required.", "/prospect/solutions"],
    ],
    de: [
      ["Orientierung", "Bestätige die Angaben, die als Ausgangspunkt für dein Projekt dienen.", "/prospect/orientation"],
      ["Dokumente", "Sende die Unterlagen, die Campus Allemagne zur Prüfung braucht.", "/prospect/documents"],
      ["Campus-Prüfung", "Campus Allemagne prüft Orientierung und bestätigte Dokumente.", "/prospect/proposal"],
      ["Vorschlag", "Prüfe den vorgeschlagenen Weg, bestätige ihn oder bitte um Änderung.", "/prospect/proposal"],
      ["Verfahren", "Nach der Bestätigung kann dein strukturiertes Verfahren angelegt und verfolgt werden.", "/prospect/roadmap"],
      ["Bewerbungen", "Bewerbungen folgen nach Prüfung des Weges und der Programmbedingungen.", "/prospect/catalogue"],
      ["Zulassung", "Über die Zulassung entscheidet die Hochschule; sie kann nie garantiert werden.", "/prospect/roadmap"],
      ["Visum & Abreise", "Nach der Zulassung folgen Finanzierung, Versicherung, Sperrkonto, Visum und Abreise.", "/prospect/solutions"],
    ],
    ar: [
      ["التوجيه", "أكد المعلومات التي يعتمد عليها مشروعك.", "/prospect/orientation"],
      ["الوثائق", "أرسل الوثائق التي تحتاجها Campus Allemagne لمراجعة وضعك.", "/prospect/documents"],
      ["مراجعة Campus", "تراجع Campus Allemagne توجيهك والوثائق التي تمت المصادقة عليها.", "/prospect/proposal"],
      ["الاقتراح", "راجع المسار المقترح وأكده أو اطلب تعديله.", "/prospect/proposal"],
      ["الإجراءات", "بعد التأكيد يمكن إنشاء إجراءاتك المنظمة ومتابعتها.", "/prospect/roadmap"],
      ["الترشحات", "تأتي الترشحات بعد التحقق من المسار وشروط كل برنامج.", "/prospect/catalogue"],
      ["القبول", "قرار القبول الرسمي يعود للجامعة ولا يمكن ضمانه.", "/prospect/roadmap"],
      ["التأشيرة والمغادرة", "بعد القبول حضّر التمويل والتأمين والحساب المغلق والتأشيرة والمغادرة.", "/prospect/solutions"],
    ],
  } as const;

  return all[locale].map(([title, body, href]) => ({ title, body, href }));
}

export const dynamic = "force-dynamic";

export default async function ProspectRoadmapPage() {
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
  const t = prospectHubCopy[locale].roadmap;
  const current = activeStepIndex(state);
  const journey = steps(locale);
  const currentStep = journey[current] ?? journey[0];
  const nextStep = journey[current + 1] ?? null;
  const completedSteps = journey.slice(0, current);
  const futureSteps = journey.slice(current + 2);

  return (
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
      />

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <ProspectJourneyProgress
          hasOrientation={Boolean(state.current)}
          orientationConfirmed={state.orientationConfirmed}
          intake={state.intake}
          starterSummary={state.starterSummary}
          locale={locale}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <article className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {String(current + 1).padStart(2, "0")} · {t.current}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{currentStep.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{currentStep.body}</p>
          <Link
            href={currentStep.href}
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {t.current}
          </Link>
        </article>

        {nextStep ? (
          <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              {String(current + 2).padStart(2, "0")} · {t.next}
            </p>
            <h2 className="mt-2 text-xl font-bold">{nextStep.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{nextStep.body}</p>
            <Link
              href={nextStep.href}
              className="mt-5 inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
            >
              {t.next}
            </Link>
          </article>
        ) : null}
      </section>

      {(completedSteps.length || futureSteps.length) ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {completedSteps.length ? (
            <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
              <summary className="cursor-pointer font-bold">{t.completedGroup}</summary>
              <div className="mt-3 grid gap-2">
                {completedSteps.map((step, index) => (
                  <div key={step.title} className="flex items-center gap-3 rounded-[var(--radius-control)] bg-emerald-50/70 px-3 py-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">✓</span>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")} · {t.done}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          {futureSteps.length ? (
            <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
              <summary className="cursor-pointer font-bold">{t.futureGroup}</summary>
              <div className="mt-3 grid gap-2">
                {futureSteps.map((step, index) => (
                  <Link
                    key={step.title}
                    href={step.href}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--brand-soft)]"
                  >
                    <span>{step.title}</span>
                    <span className="text-xs font-normal text-[var(--muted)]">
                      {String(current + index + 3).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
