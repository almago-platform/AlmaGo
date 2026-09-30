import Link from "next/link";
import { redirect } from "next/navigation";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import {
  publicDiagnosticCodes,
  publicDiagnosticHeadlineCodes,
  publicDiagnosticStatuses,
  type PublicDiagnosticItem,
  type PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

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
      {items.length ? (
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
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">—</p>
      )}
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

  const { data: prospect } = await access.supabase
    .from("prospects")
    .select("id")
    .eq("user_id", access.user.id)
    .maybeSingle();

  let orientation: {
    engine_version: string;
    result: unknown;
    created_at: string;
  } | null = null;

  if (prospect?.id) {
    const { data } = await access.supabase
      .from("orientations")
      .select("engine_version,result,created_at")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) orientation = data;
  }

  const diagnostic = orientation?.engine_version === "public-orientation-v1"
    && validDiagnostic(orientation.result)
    ? orientation.result
    : null;

  const savedOn = orientation?.created_at
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(orientation.created_at))
    : null;

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

      {!diagnostic ? (
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
      ) : (
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

          <div className="mt-6 grid gap-5">
            <DiagnosticCards
              id="possibilities"
              title={t.possibilities}
              items={diagnostic.paths}
              copy={diagnosticCopy}
            />
            <DiagnosticCards
              id="roadmap"
              title={t.roadmap}
              items={diagnostic.priorities}
              copy={diagnosticCopy}
            />
            <DiagnosticCards
              id="missing"
              title={t.missing}
              items={diagnostic.checks}
              copy={diagnosticCopy}
            />
          </div>

          <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h2 className="text-xl font-bold">{t.updateProject}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.updateProjectText}</p>
            <Link
              href="/orientation"
              className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
            >
              {t.updateProjectCta}
            </Link>
          </section>

          <p className="mt-6 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
            {t.disclaimer}
          </p>
        </>
      )}
    </main>
  );
}
