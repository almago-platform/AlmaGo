import Link from "next/link";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { redirect } from "next/navigation";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import { prospectQualificationCopy } from "@/content/prospect-qualification-copy";
import {
  publicDiagnosticCodes,
  publicDiagnosticHeadlineCodes,
  publicDiagnosticStatuses,
  type PublicDiagnosticItem,
  type PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { findRecoverableOrientationForAccount } from "@/lib/orientation/recovery";
import { buildProspectRoadmap, type ProspectRoadmap } from "@/lib/orientation/roadmap";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import {
  prospectQualificationNextActions,
  prospectQualificationStates,
  type ProspectQualificationNextAction,
  type ProspectQualificationState,
} from "@/lib/phase2/qualification";

type StoredOrientation = {
  id: string;
  engine_version: string;
  input: unknown;
  result: unknown;
  created_at: string;
};

type ValidStoredOrientation = StoredOrientation & {
  diagnostic: PublicOrientationDiagnostic;
};

type StoredQualification = {
  state: ProspectQualificationState;
  next_action: ProspectQualificationNextAction | null;
};

function validStoredQualification(value: unknown): value is StoredQualification {
  if (!value || typeof value !== "object") return false;
  const qualification = value as Record<string, unknown>;
  const state = qualification.state;
  const nextAction = qualification.next_action;

  return (
    typeof state === "string"
    && prospectQualificationStates.includes(state as ProspectQualificationState)
    && (
      nextAction === null
      || (
        typeof nextAction === "string"
        && prospectQualificationNextActions.includes(
          nextAction as ProspectQualificationNextAction,
        )
      )
    )
  );
}

function validDiagnosticItem(value: unknown): value is PublicDiagnosticItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === "string"
    && publicDiagnosticCodes.includes(item.code as (typeof publicDiagnosticCodes)[number])
    && typeof item.status === "string"
    && publicDiagnosticStatuses.includes(item.status as (typeof publicDiagnosticStatuses)[number])
  );
}

function validDiagnostic(value: unknown): value is PublicOrientationDiagnostic {
  if (!value || typeof value !== "object") return false;
  const diagnostic = value as Record<string, unknown>;

  return (
    typeof diagnostic.overallStatus === "string"
    && publicDiagnosticStatuses.includes(
      diagnostic.overallStatus as (typeof publicDiagnosticStatuses)[number],
    )
    && typeof diagnostic.headlineCode === "string"
    && publicDiagnosticHeadlineCodes.includes(
      diagnostic.headlineCode as (typeof publicDiagnosticHeadlineCodes)[number],
    )
    && Array.isArray(diagnostic.paths)
    && diagnostic.paths.every(validDiagnosticItem)
    && Array.isArray(diagnostic.priorities)
    && diagnostic.priorities.every(validDiagnosticItem)
    && Array.isArray(diagnostic.checks)
    && diagnostic.checks.every(validDiagnosticItem)
    && Array.isArray(diagnostic.ruleTrace)
  );
}

function orientationAnswers(input: unknown) {
  if (!input || typeof input !== "object") return restorePublicOrientationAnswers(null);
  return restorePublicOrientationAnswers((input as Record<string, unknown>).answers);
}

function StatusBadge({
  item,
  label,
}: {
  item: PublicDiagnosticItem;
  label: string;
}) {
  const className = item.status === "needs_verification"
    ? "bg-amber-100 text-amber-900"
    : item.status === "known_gap"
      ? "bg-orange-100 text-orange-900"
      : item.status === "needs_information"
        ? "bg-slate-100 text-slate-700"
        : "bg-blue-100 text-blue-900";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}>
      {label}
    </span>
  );
}

function DiagnosticItems({
  items,
  copy,
}: {
  items: PublicDiagnosticItem[];
  copy: (typeof orientationDiagnosticCopy)[keyof typeof orientationDiagnosticCopy];
}) {
  if (!items.length) {
    return <p className="mt-3 text-sm leading-6 text-[var(--muted)]">—</p>;
  }

  return (
    <div className="mt-4 grid gap-3">
      {items.map((item) => {
        const message = copy.items[item.code];
        return (
          <article key={item.code} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-semibold text-[var(--foreground)]">{message.title}</h3>
              <StatusBadge item={item} label={copy.status[item.status]} />
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{message.body}</p>
          </article>
        );
      })}
    </div>
  );
}

function DiagnosticCards({
  id,
  title,
  items,
  copy,
}: {
  id: string;
  title: string;
  items: PublicDiagnosticItem[];
  copy: (typeof orientationDiagnosticCopy)[keyof typeof orientationDiagnosticCopy];
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
      <DiagnosticItems items={items} copy={copy} />
    </section>
  );
}

function QualificationPanel({
  qualification,
  copy,
}: {
  qualification: StoredQualification | null;
  copy: (typeof prospectQualificationCopy)[keyof typeof prospectQualificationCopy];
}) {
  if (!qualification) {
    return (
      <section
        id="qualification"
        className="mt-6 scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      >
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
          {copy.unavailableTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {copy.unavailableBody}
        </p>
      </section>
    );
  }

  const stateCopy = copy.states[qualification.state];
  const actionCopy = qualification.next_action
    ? copy.actions[qualification.next_action]
    : null;

  return (
    <section
      id="qualification"
      className="mt-6 scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
            {stateCopy.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {stateCopy.body}
          </p>
        </div>
        <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]">
          {stateCopy.label}
        </span>
      </div>

      {actionCopy ? (
        <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {actionCopy.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {actionCopy.body}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{copy.disclaimer}</p>
    </section>
  );
}

function RoadmapPanel({
  roadmap,
  copy,
  labels,
}: {
  roadmap: ProspectRoadmap;
  copy: (typeof orientationDiagnosticCopy)[keyof typeof orientationDiagnosticCopy];
  labels: {
    title: string;
    now: string;
    afterResults: string;
    verifyNext: string;
  };
}) {
  return (
    <section id="roadmap" className="scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--foreground)]">{labels.title}</h2>

      <div className="mt-5 grid gap-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--brand)]">{labels.now}</h3>
          <DiagnosticItems items={roadmap.now} copy={copy} />
        </div>

        {roadmap.afterResults.length ? (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--brand)]">{labels.afterResults}</h3>
            <DiagnosticItems items={roadmap.afterResults} copy={copy} />
          </div>
        ) : null}

        <div id="missing" className="scroll-mt-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--brand)]">{labels.verifyNext}</h3>
          <DiagnosticItems items={roadmap.verifyNext} copy={copy} />
        </div>
      </div>
    </section>
  );
}

export default async function ProspectDashboardPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const t = prospectDashboardCopy[locale].page;
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const qualificationCopy = prospectQualificationCopy[locale];
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const { data: prospect } = await access.supabase
    .from("prospects")
    .select("id")
    .eq("user_id", access.user.id)
    .maybeSingle();

  const recovery = !prospect?.id
    ? await findRecoverableOrientationForAccount({
        userId: access.user.id,
        email: access.user.email,
        emailConfirmed: Boolean(access.user.email_confirmed_at),
      })
    : null;

  let orientations: StoredOrientation[] = [];

  if (prospect?.id) {
    const { data } = await access.supabase
      .from("orientations")
      .select("id,engine_version,input,result,created_at")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) orientations = data as StoredOrientation[];
  }

  const validOrientations: ValidStoredOrientation[] = orientations.flatMap((orientation) => {
    if (
      orientation.engine_version !== "public-orientation-v1"
      || !validDiagnostic(orientation.result)
    ) {
      return [];
    }

    return [{
      ...orientation,
      diagnostic: orientation.result,
    }];
  });

  const current = validOrientations[0] ?? null;
  const diagnostic = current?.diagnostic ?? null;
  const answers = current ? orientationAnswers(current.input) : null;
  const roadmap = diagnostic && answers
    ? buildProspectRoadmap(answers, diagnostic)
    : null;
  const savedOn = current?.created_at
    ? dateFormatter.format(new Date(current.created_at))
    : null;

  let qualification: StoredQualification | null = null;

  if (current?.id) {
    const { data } = await access.supabase
      .from("prospect_qualifications")
      .select("state,next_action")
      .eq("orientation_id", current.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (validStoredQualification(data)) qualification = data;
  }

  const [intakeResult, starterDocumentsResult] = await Promise.all([
    access.supabase
      .from("student_intake_cases")
      .select("orientation_id,status,orientation_confirmed_at,proposed_route_key,proposal_reason,procedure_id")
      .eq("student_id", access.user.id)
      .maybeSingle(),
    access.supabase
      .from("documents")
      .select("category,status")
      .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"]),
  ]);

  const intake = intakeResult.data;
  const starterDocuments = starterDocumentsResult.data || [];
  const requiredCategories = ["passport", "baccalaureate", "transcripts"];
  const approvedCategories = new Set(
    starterDocuments
      .filter((document) => document.status === "approved")
      .map((document) => document.category),
  );
  const pendingCategories = new Set(
    starterDocuments
      .filter((document) => ["pending", "reviewed"].includes(document.status))
      .map((document) => document.category),
  );
  const replacementCategories = new Set(
    starterDocuments
      .filter((document) => ["rejected", "replace_required"].includes(document.status))
      .map((document) => document.category),
  );
  const starterSummary = {
    approved: requiredCategories.filter((category) => approvedCategories.has(category)).length,
    required: requiredCategories.length,
    pending: requiredCategories.filter((category) => pendingCategories.has(category)).length,
    needsReplacement: requiredCategories.filter((category) => replacementCategories.has(category)).length,
  };
  const orientationConfirmed = Boolean(
    current?.id
    && intake?.orientation_id === current.id
    && intake?.orientation_confirmed_at,
  );

  return (
    <main>
      <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="bg-[linear-gradient(115deg,#1c2124_0%,#252b2f_68%,#332a22_100%)] px-5 py-7 text-white sm:px-7 sm:py-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#fcb50a]">{t.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d9d3c7] sm:text-base sm:leading-7">{t.subtitle}</p>
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--brand-soft)] p-5 sm:p-6">
          <h2 className="font-bold text-[var(--foreground)]">{t.freeAccountTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.freeAccountText}</p>
        </div>
      </section>

      <IntakeFlowCard
        recovery={recovery}
        orientationId={current?.id ?? null}
        orientationConfirmed={orientationConfirmed}
        intake={intake
          ? {
              status: intake.status,
              proposed_route_key: intake.proposed_route_key,
              proposal_reason: intake.proposal_reason,
              procedure_id: intake.procedure_id,
            }
          : null}
        starterSummary={starterSummary}
      />

      {!recovery && (!diagnostic || !roadmap) ? (
        <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold">{t.noOrientationTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{t.noOrientationText}</p>
          <Link
            href="/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
          >
            {t.startOrientation}
          </Link>
        </section>
      ) : diagnostic && roadmap ? (
        <>
          <section id="orientation" className="mt-6 scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{t.latestOrientation}</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                  {diagnosticCopy.headlines[diagnostic.headlineCode].title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  {diagnosticCopy.headlines[diagnostic.headlineCode].body}
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]">
                {diagnosticCopy.status[diagnostic.overallStatus]}
              </span>
            </div>
            {savedOn ? (
              <p className="mt-4 text-xs text-[var(--muted)]">
                {t.savedOn} <bdi dir="auto">{savedOn}</bdi>
              </p>
            ) : null}
          </section>

          <QualificationPanel qualification={qualification} copy={qualificationCopy} />

          <div className="mt-6 grid gap-5">
            <DiagnosticCards
              id="possibilities"
              title={t.possibilities}
              items={diagnostic.paths}
              copy={diagnosticCopy}
            />
            <RoadmapPanel
              roadmap={roadmap}
              copy={diagnosticCopy}
              labels={{
                title: t.roadmap,
                now: t.roadmapNow,
                afterResults: t.roadmapAfterResults,
                verifyNext: t.roadmapVerifyNext,
              }}
            />
          </div>

          {validOrientations.length ? (
            <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <h2 className="text-xl font-bold">{t.historyTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.historyText}</p>
              <div className="mt-4 grid gap-3">
                {validOrientations.map((orientation, index) => (
                  <article
                    key={`${orientation.created_at}-${index}`}
                    className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {diagnosticCopy.headlines[orientation.diagnostic.headlineCode].title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        <bdi dir="auto">{dateFormatter.format(new Date(orientation.created_at))}</bdi>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {index === 0 ? (
                        <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-strong)]">
                          {t.historyCurrent}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                        {diagnosticCopy.status[orientation.diagnostic.overallStatus]}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xl font-bold">{t.updateProject}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.updateProjectText}</p>
            <Link
              href="/orientation?mode=update"
              className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
            >
              {t.updateProjectCta}
            </Link>
          </section>

          <p className="mt-6 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
            {t.disclaimer}
          </p>
        </>
      ) : null}
    </main>
  );
}
