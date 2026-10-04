/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDeadline, isActiveApplication } from "@/lib/phase4";
import {
  buildCampusInternalTargets,
  evaluateCampusApplicationDeadline,
  type CampusApplicationMethod,
} from "@/lib/orientation-engine/deadline";

export const dynamic = "force-dynamic";

const copy = {
  fr: {
    eyebrow: "Campus Allemagne",
    title: "Votre dossier Allemagne",
    description: "Une vue simple de ce qui avance, de ce qui vous concerne et des prochaines dates importantes.",
    studentAction: "Ce que vous devez faire maintenant",
    noStudentAction: "Aucune action requise pour le moment — Campus Allemagne s’occupe de cette étape.",
    almagoNow: "Ce que Campus Allemagne fait maintenant",
    externalWait: "En attente d’un organisme externe",
    officialDeadline: "Prochaine deadline officielle",
    internalTarget: "Prochain objectif Campus Allemagne",
    toVerify: "À vérifier",
    starterDocs: "Vos pièces de départ",
    optional: "Facultatif s’il existe",
    why: "Pourquoi ?",
    whatNext: "Après cette action",
    documents: "Documents",
    applications: "Candidatures",
  },
  ar: {
    eyebrow: "كامبوس ألمانيا",
    title: "ملفك لألمانيا",
    description: "نظرة بسيطة على تقدم الملف، ما المطلوب منك، وأهم المواعيد القادمة.",
    studentAction: "ما الذي يجب عليك فعله الآن",
    noStudentAction: "لا يوجد أي إجراء مطلوب منك حاليًا — كامبوس ألمانيا يتولى هذه المرحلة.",
    almagoNow: "ما الذي تقوم به كامبوس ألمانيا الآن",
    externalWait: "في انتظار جهة خارجية",
    officialDeadline: "أقرب موعد رسمي",
    internalTarget: "أقرب هدف داخلي لكامبوس ألمانيا",
    toVerify: "يجب التحقق",
    starterDocs: "وثائق البداية",
    optional: "اختياري إذا كان موجودًا",
    why: "لماذا؟",
    whatNext: "ماذا يحدث بعد ذلك",
    documents: "الوثائق",
    applications: "الترشحات",
  },
  en: {
    eyebrow: "Campus Germany",
    title: "Your Germany file",
    description: "A simple view of what is moving, what needs you, and the next important dates.",
    studentAction: "What you need to do now",
    noStudentAction: "No action required for now — Campus Germany is handling this step.",
    almagoNow: "What Campus Germany is doing now",
    externalWait: "Waiting on an external organisation",
    officialDeadline: "Next official deadline",
    internalTarget: "Next Campus Germany target",
    toVerify: "To verify",
    starterDocs: "Your starter documents",
    optional: "Optional if you already have it",
    why: "Why?",
    whatNext: "What happens next",
    documents: "Documents",
    applications: "Applications",
  },
  de: {
    eyebrow: "Campus Deutschland",
    title: "Ihre Deutschland-Akte",
    description: "Ein einfacher Überblick über den Stand, Ihre nächsten Schritte und wichtige Termine.",
    studentAction: "Was Sie jetzt tun müssen",
    noStudentAction: "Derzeit ist keine Aktion erforderlich — Campus Deutschland kümmert sich um diesen Schritt.",
    almagoNow: "Was Campus Deutschland jetzt erledigt",
    externalWait: "Warten auf eine externe Stelle",
    officialDeadline: "Nächste offizielle Frist",
    internalTarget: "Nächstes internes Ziel von Campus Deutschland",
    toVerify: "Zu prüfen",
    starterDocs: "Ihre Startunterlagen",
    optional: "Optional, falls bereits vorhanden",
    why: "Warum?",
    whatNext: "Was danach passiert",
    documents: "Dokumente",
    applications: "Bewerbungen",
  },
} as const;

function relation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function applicationMethod(value: unknown): CampusApplicationMethod {
  return ["direct", "uni_assist", "vpd_then_direct", "other_documented", "unknown"].includes(String(value))
    ? value as CampusApplicationMethod
    : "unknown";
}

export default async function StudentProcedurePage() {
  const locale = await getRequestLocale();
  const t = copy[locale];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    procedureResult,
    requirementsResult,
    checklistResult,
    applicationsResult,
  ] = await Promise.all([
    supabase
      .from("student_procedures")
      .select("id,route_key,target_intake,status,updated_at")
      .eq("student_id", user.id)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("student_document_requirements")
      .select("id,requirement_key,label,status,requested_from_student,student_request_reason,student_request_due_date,updated_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("student_checklist_items")
      .select("id,title,description,status,owner,requires_student_action,student_action_reason,student_action_kind,due_date,updated_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("applications")
      .select("id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,programs(name)")
      .eq("student_id", user.id)
      .order("deadline", { ascending: true, nullsFirst: false }),
  ]);

  const unavailable = procedureResult.error || requirementsResult.error || checklistResult.error || applicationsResult.error;
  const procedure = procedureResult.data;
  const requirements = requirementsResult.data || [];
  const checklist = checklistResult.data || [];
  const applications = applicationsResult.data || [];

  const documentActions = requirements.filter((item) =>
    item.requested_from_student && ["requested", "replacement_required"].includes(item.status),
  );
  const checklistActions = checklist.filter((item) =>
    item.requires_student_action && !["completed", "not_applicable"].includes(item.status),
  );
  const studentActions = [
    ...documentActions.map((item) => ({
      id: `document-${item.id}`,
      title: item.label,
      reason: item.student_request_reason,
      dueDate: item.student_request_due_date,
      next: t.documents,
      href: "/student/documents",
    })),
    ...checklistActions.map((item) => ({
      id: `checklist-${item.id}`,
      title: item.title,
      reason: item.student_action_reason,
      dueDate: item.due_date,
      next: item.description || t.applications,
      href: "/student/checklist",
    })),
  ];

  const almagoSteps = checklist.filter((item) =>
    item.owner === "almago" && !["completed", "not_applicable"].includes(item.status),
  );
  const externalSteps = checklist.filter((item) =>
    item.owner === "external" && !["completed", "not_applicable"].includes(item.status),
  );

  const activeApplicationDeadlines = applications
    .filter((application) => isActiveApplication(application.status))
    .map((application) => ({
      application,
      evaluation: evaluateCampusApplicationDeadline(application),
    }));
  const nextOfficial = activeApplicationDeadlines
    .filter((row) => row.evaluation.status === "open" && row.evaluation.date)
    .sort((a, b) => String(a.evaluation.date).localeCompare(String(b.evaluation.date)))[0];

  const internalTargets = nextOfficial
    ? buildCampusInternalTargets(
        nextOfficial.evaluation,
        applicationMethod(nextOfficial.application.application_method),
      )
    : [];
  const nextInternal = internalTargets[0];

  const starterKeys = new Set([
    "passport",
    "baccalaureate",
    "baccalaureate_transcript",
    "existing_language_certificate",
  ]);
  const starterDocuments = requirements.filter((item) => starterKeys.has(item.requirement_key));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="procedure"
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        actions={
          <>
            <ButtonLink href="/student/documents" variant="secondary">{t.documents}</ButtonLink>
            <ButtonLink href="/student/applications" variant="secondary">{t.applications}</ButtonLink>
          </>
        }
      />

      {unavailable && (
        <p role="alert" className="mb-5 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
          {t.toVerify}
        </p>
      )}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Card className={studentActions.length ? "border-amber-200 bg-amber-50/25 shadow-none" : "border-[var(--brand-border)] bg-white shadow-none"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant={studentActions.length ? "warning" : "success"}>
              {studentActions.length ? studentActions.length : "✓"}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              {procedure?.route_key || "—"}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {studentActions.length ? t.studentAction : t.noStudentAction}
          </h2>

          {studentActions.length > 0 && (
            <div className="mt-5 space-y-3">
              {studentActions.map((action) => (
                <article key={action.id} className="rounded-[var(--radius-control)] border border-amber-200 bg-white p-4">
                  <p className="font-bold text-slate-950">{action.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    <strong>{t.why}</strong> {action.reason || t.toVerify}
                  </p>
                  {action.dueDate && (
                    <p className="mt-2 text-sm text-slate-600">{formatDeadline(action.dueDate, locale)}</p>
                  )}
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    <strong>{t.whatNext}</strong> {action.next}
                  </p>
                  <div className="mt-3">
                    <ButtonLink href={action.href} variant="secondary">{action.title}</ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.almagoNow}</p>
          <div className="mt-4 space-y-3">
            {almagoSteps.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">{procedure?.status || t.toVerify}</p>
            ) : almagoSteps.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <Badge variant="info">{item.status}</Badge>
                </div>
                {item.description && <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>}
              </div>
            ))}
          </div>

          {externalSteps.length > 0 && (
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t.externalWait}</p>
              <p className="mt-2 text-sm text-slate-700">{externalSteps.map((item) => item.title).join(" · ")}</p>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.officialDeadline}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {nextOfficial?.evaluation.date ? formatDeadline(nextOfficial.evaluation.date, locale) : t.toVerify}
          </p>
          {nextOfficial && (
            <p className="mt-2 text-sm text-slate-600">
              {relation(nextOfficial.application.programs)?.name || t.applications}
            </p>
          )}
        </Card>

        <Card className="border-blue-200 bg-blue-50/20 shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">{t.internalTarget}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {nextInternal ? formatDeadline(nextInternal.date, locale) : t.toVerify}
          </p>
          {nextInternal && (
            <p className="mt-2 text-sm text-blue-900">
              Campus Allemagne · {nextInternal.key}
            </p>
          )}
        </Card>
      </section>

      <Card aria-labelledby="starter-docs-title" className="mt-5 shadow-none">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.starterDocs}</p>
            <h2 id="starter-docs-title" className="mt-1 text-xl font-semibold text-slate-950">
              3 pièces demandées par défaut
            </h2>
          </div>
          <Badge variant="neutral">{starterDocuments.length}</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {starterDocuments.map((item) => (
            <div key={item.id} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="font-bold text-slate-950">{item.label}</p>
              <p className="mt-2 text-xs text-slate-500">
                {item.requirement_key === "existing_language_certificate" ? t.optional : item.status}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
