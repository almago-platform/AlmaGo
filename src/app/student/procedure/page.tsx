import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/product/ActivityTimeline";
import { DossierHeader } from "@/components/product/DossierHeader";
import { DocumentRow } from "@/components/product/DocumentRow";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { ResponsibilityStrip } from "@/components/product/ResponsibilityStrip";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDeadline, isActiveApplication } from "@/lib/phase4";
import {
  buildCampusInternalTargets,
  evaluateCampusApplicationDeadline,
  type CampusApplicationMethod,
} from "@/lib/student/procedure-deadline";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProcedureStep = {
  key?: string;
  title?: string;
  owner?: "student" | "almago" | "external" | "joint";
  student_help?: string | null;
  blocking?: boolean;
  sort_order?: number;
};

type RequirementRow = {
  id: string;
  requirement_key: string;
  label: string;
  category: string;
  status: string;
  requested_from_student: boolean;
  student_request_reason: string | null;
  student_request_due_date: string | null;
  document_id: string | null;
  updated_at: string;
};

const routeLabels = {
  fr: {
    study_preparation: "Préparation aux études",
    studies_bachelor: "Études — Bachelor",
    studies_master: "Études — Master",
    study_place_search: "Recherche d’une place d’études",
    standalone_language: "Cours de langue autonome",
    ausbildung: "Formation professionnelle / Ausbildung",
    ausbildung_search: "Recherche d’une place d’Ausbildung",
    research_doctorate: "Doctorat / recherche",
    study_internship: "Stage lié aux études",
  },
  ar: {
    study_preparation: "التحضير للدراسة",
    studies_bachelor: "دراسة البكالوريوس",
    studies_master: "دراسة الماجستير",
    study_place_search: "البحث عن مقعد دراسي",
    standalone_language: "دورة لغة مستقلة",
    ausbildung: "التكوين المهني Ausbildung",
    ausbildung_search: "البحث عن مكان Ausbildung",
    research_doctorate: "الدكتوراه / البحث",
    study_internship: "تدريب مرتبط بالدراسة",
  },
  en: {
    study_preparation: "Study preparation",
    studies_bachelor: "Bachelor studies",
    studies_master: "Master studies",
    study_place_search: "Study-place search",
    standalone_language: "Standalone language course",
    ausbildung: "Vocational training / Ausbildung",
    ausbildung_search: "Ausbildung-place search",
    research_doctorate: "Doctorate / research",
    study_internship: "Study-related internship",
  },
  de: {
    study_preparation: "Studienvorbereitung",
    studies_bachelor: "Bachelorstudium",
    studies_master: "Masterstudium",
    study_place_search: "Studienplatzsuche",
    standalone_language: "Eigenständiger Sprachkurs",
    ausbildung: "Berufsausbildung",
    ausbildung_search: "Ausbildungsplatzsuche",
    research_doctorate: "Promotion / Forschung",
    study_internship: "Studienbezogenes Praktikum",
  },
} as const;

function routeLabel(locale: "fr" | "ar" | "en" | "de", routeKey: string | null | undefined) {
  const labels = routeLabels[locale] as Record<string, string>;
  if (routeKey && labels[routeKey]) return labels[routeKey];
  return locale === "fr"
    ? "Parcours à confirmer"
    : locale === "ar"
      ? "المسار يحتاج إلى تأكيد"
      : locale === "de"
        ? "Weg noch zu bestätigen"
        : "Path to be confirmed";
}

const copy = {
  fr: {
    eyebrow: "Espace Étudiant",
    title: "Votre procédure Allemagne",
    description: "Une vue unique de ce que vous devez faire, de ce que Campus Allemagne traite et des étapes qui viennent ensuite.",
    active: "Procédure active",
    waiting: "Procédure en préparation",
    noProcedureTitle: "Votre procédure n’est pas encore créée",
    noProcedureBody: "Elle apparaît ici après validation du paiement et activation de votre espace Étudiant.",
    currentJourney: "Progression de votre dossier",
    nextAction: "Votre prochaine action",
    noActionTitle: "Aucune action requise pour le moment",
    noActionBody: "Campus Allemagne poursuit le traitement. Vous serez sollicité uniquement lorsqu’une action personnelle est réellement nécessaire.",
    you: "Vous",
    campus: "Campus Allemagne",
    external: "Organisme externe",
    youWaiting: "Aucune action personnelle demandée.",
    campusWorking: "Analyse, préparation et suivi du dossier.",
    externalWaiting: "Décisions et confirmations officielles restent du ressort des organismes compétents.",
    documents: "Documents de la procédure",
    documentsHelp: "Seules les pièces réellement nécessaires sont demandées.",
    deadlines: "Échéances utiles",
    official: "Prochaine échéance officielle vérifiée",
    internal: "Objectif interne Campus Allemagne",
    verify: "À vérifier",
    activity: "Activité récente",
    activityEmpty: "Aucune activité récente enregistrée.",
    openDocs: "Ouvrir mes documents",
    openApplications: "Ouvrir mes candidatures",
    done: "Terminé",
    current: "En cours",
    later: "À venir",
    locked: "Verrouillé",
    optional: "Facultatif",
    pending: "À vérifier",
    approved: "Validé",
    replacement: "À remplacer",
    missing: "Manquant",
  },
  ar: {
    eyebrow: "مساحة الطالب",
    title: "إجراءاتك لألمانيا",
    description: "نظرة موحدة على ما يجب عليك فعله، وما تعالجه Campus Allemagne، والخطوات القادمة.",
    active: "الإجراءات مفعّلة",
    waiting: "الإجراءات قيد الإعداد",
    noProcedureTitle: "لم يتم إنشاء إجراءاتك بعد",
    noProcedureBody: "ستظهر هنا بعد التحقق من الدفع وتفعيل مساحة الطالب.",
    currentJourney: "تقدم ملفك",
    nextAction: "خطوتك التالية",
    noActionTitle: "لا يوجد إجراء مطلوب منك الآن",
    noActionBody: "تواصل Campus Allemagne معالجة الملف، ولن يُطلب منك شيء إلا عند الحاجة الفعلية إلى إجراء شخصي.",
    you: "أنت",
    campus: "Campus Allemagne",
    external: "جهة خارجية",
    youWaiting: "لا يوجد إجراء شخصي مطلوب.",
    campusWorking: "تحليل الملف وتجهيزه ومتابعته.",
    externalWaiting: "تبقى القرارات والتأكيدات الرسمية من اختصاص الجهات المعنية.",
    documents: "وثائق الإجراءات",
    documentsHelp: "نطلب فقط الوثائق الضرورية فعلًا.",
    deadlines: "المواعيد المهمة",
    official: "أقرب موعد رسمي تم التحقق منه",
    internal: "هدف داخلي لـ Campus Allemagne",
    verify: "يجب التحقق",
    activity: "آخر النشاطات",
    activityEmpty: "لا يوجد نشاط حديث مسجل.",
    openDocs: "فتح وثائقي",
    openApplications: "فتح ترشحاتي",
    done: "مكتمل",
    current: "قيد الإنجاز",
    later: "لاحقًا",
    locked: "مقفل",
    optional: "اختياري",
    pending: "قيد التحقق",
    approved: "تم التحقق",
    replacement: "يجب الاستبدال",
    missing: "ناقص",
  },
  en: {
    eyebrow: "Student space",
    title: "Your Germany procedure",
    description: "One view of what you need to do, what Campus Allemagne is handling, and what comes next.",
    active: "Procedure active",
    waiting: "Procedure being prepared",
    noProcedureTitle: "Your procedure has not been created yet",
    noProcedureBody: "It appears here after payment validation and Student-space activation.",
    currentJourney: "Your dossier progress",
    nextAction: "Your next action",
    noActionTitle: "Nothing is required from you right now",
    noActionBody: "Campus Allemagne continues processing the dossier. You will be asked only when a personal action is genuinely required.",
    you: "You",
    campus: "Campus Allemagne",
    external: "External organisation",
    youWaiting: "No personal action is required.",
    campusWorking: "Dossier review, preparation and follow-up.",
    externalWaiting: "Official decisions and confirmations remain with the competent organisations.",
    documents: "Procedure documents",
    documentsHelp: "Only documents that are genuinely needed are requested.",
    deadlines: "Useful deadlines",
    official: "Next verified official deadline",
    internal: "Campus Allemagne internal target",
    verify: "To verify",
    activity: "Recent activity",
    activityEmpty: "No recent activity recorded.",
    openDocs: "Open my documents",
    openApplications: "Open my applications",
    done: "Done",
    current: "In progress",
    later: "Later",
    locked: "Locked",
    optional: "Optional",
    pending: "To verify",
    approved: "Approved",
    replacement: "Replace",
    missing: "Missing",
  },
  de: {
    eyebrow: "Studierendenbereich",
    title: "Ihr Deutschland-Verfahren",
    description: "Eine zentrale Ansicht: was Sie erledigen müssen, was Campus Allemagne bearbeitet und was als Nächstes kommt.",
    active: "Verfahren aktiv",
    waiting: "Verfahren wird vorbereitet",
    noProcedureTitle: "Ihr Verfahren wurde noch nicht erstellt",
    noProcedureBody: "Es erscheint hier nach Zahlungsprüfung und Freischaltung des Studierendenbereichs.",
    currentJourney: "Fortschritt Ihres Dossiers",
    nextAction: "Ihre nächste Aktion",
    noActionTitle: "Im Moment ist keine Aktion erforderlich",
    noActionBody: "Campus Allemagne bearbeitet das Dossier weiter. Sie werden nur dann einbezogen, wenn eine persönliche Handlung wirklich erforderlich ist.",
    you: "Sie",
    campus: "Campus Allemagne",
    external: "Externe Stelle",
    youWaiting: "Keine persönliche Aktion erforderlich.",
    campusWorking: "Prüfung, Vorbereitung und Nachverfolgung des Dossiers.",
    externalWaiting: "Offizielle Entscheidungen und Bestätigungen liegen bei den zuständigen Stellen.",
    documents: "Verfahrensdokumente",
    documentsHelp: "Es werden nur tatsächlich notwendige Unterlagen angefordert.",
    deadlines: "Wichtige Fristen",
    official: "Nächste verifizierte offizielle Frist",
    internal: "Internes Ziel von Campus Allemagne",
    verify: "Zu prüfen",
    activity: "Letzte Aktivitäten",
    activityEmpty: "Keine aktuelle Aktivität erfasst.",
    openDocs: "Meine Dokumente öffnen",
    openApplications: "Meine Bewerbungen öffnen",
    done: "Erledigt",
    current: "In Bearbeitung",
    later: "Später",
    locked: "Gesperrt",
    optional: "Optional",
    pending: "Zu prüfen",
    approved: "Geprüft",
    replacement: "Ersetzen",
    missing: "Fehlt",
  },
} as const;

function applicationMethod(value: unknown): CampusApplicationMethod {
  return ["direct", "uni_assist", "vpd_then_direct", "other_documented", "unknown"].includes(String(value))
    ? value as CampusApplicationMethod
    : "unknown";
}

function relation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function requirementStatus(row: RequirementRow): "approved" | "pending" | "replacement" | "missing" | "optional" {
  if (row.requirement_key === "existing_language_certificate" && row.status === "not_applicable") return "optional";
  if (["ready", "accepted_original", "authenticated", "translated"].includes(row.status)) return "approved";
  if (["replacement_required"].includes(row.status)) return "replacement";
  if (["uploaded", "under_review", "authentication_in_progress", "translation_in_progress", "legalisation_in_progress"].includes(row.status)) return "pending";
  return "missing";
}

function formatTimestamp(value: string | null | undefined, locale: "fr" | "ar" | "en" | "de") {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const tags = { fr: "fr-FR", ar: "ar-TN", en: "en-GB", de: "de-DE" } as const;
  return new Intl.DateTimeFormat(tags[locale], { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function StudentProcedurePage() {
  const locale = await getRequestLocale();
  const t = copy[locale];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [procedureResult, requirementsResult, applicationsResult, historyResult] = await Promise.all([
    supabase
      .from("student_procedures")
      .select("id,route_key,target_intake,status,template_snapshot,updated_at")
      .eq("student_id", user.id)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("student_document_requirements")
      .select("id,requirement_key,label,category,status,requested_from_student,student_request_reason,student_request_due_date,document_id,updated_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("applications")
      .select("id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,programs(name)")
      .eq("student_id", user.id)
      .order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("student_history")
      .select("id,event_type,message,created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const procedure = procedureResult.data;
  const requirements = (requirementsResult.data || []) as RequirementRow[];
  const applications = applicationsResult.data || [];
  const history = historyResult.data || [];

  if (!procedure) {
    return (
      <main className="mx-auto w-full max-w-[92rem] space-y-6 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <DossierHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          status={t.waiting}
          statusVariant="info"
        />
        <NextActionPanel
          eyebrow={t.nextAction}
          title={t.noProcedureTitle}
          description={t.noProcedureBody}
          waiting
        />
        <ResponsibilityStrip
          items={[
            { label: t.you, detail: t.youWaiting, tone: "user" },
            { label: t.campus, detail: t.campusWorking, tone: "campus" },
            { label: t.external, detail: t.externalWaiting, tone: "external" },
          ]}
        />
      </main>
    );
  }

  const snapshot = procedure.template_snapshot && typeof procedure.template_snapshot === "object"
    ? procedure.template_snapshot as Record<string, unknown>
    : {};
  const rawSteps = Array.isArray(snapshot.steps) ? snapshot.steps : [];
  const templateSteps = rawSteps
    .filter((step): step is ProcedureStep => Boolean(step && typeof step === "object"))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const studentActions = requirements.filter((row) =>
    row.requested_from_student && ["requested", "replacement_required"].includes(row.status),
  );
  const primaryAction = studentActions[0] || null;

  const journey: JourneyRailStep[] = templateSteps.slice(0, 8).map((step, index) => {
    const key = step.key || "";
    const matchingRequirements = requirements.filter((row) =>
      (row.requirement_key === "passport" && key === "starter_documents")
      || (["baccalaureate", "baccalaureate_transcript"].includes(row.requirement_key) && key === "starter_documents")
    );
    const requirementBlocked = matchingRequirements.some((row) =>
      ["requested", "replacement_required"].includes(row.status),
    );

    let status: JourneyRailStep["status"] = "upcoming";
    if (index === 0) status = "done";
    if (key === "starter_documents") status = requirementBlocked ? "active" : "done";
    if (index > 1 && primaryAction) status = "locked";
    if (index > 1 && !primaryAction && status === "upcoming") status = index === 2 ? "active" : "upcoming";

    return {
      label: step.title || step.key || t.verify,
      detail: status === "done" ? t.done : status === "active" ? t.current : status === "locked" ? t.locked : t.later,
      status,
      href: key === "starter_documents" ? "/student/documents" : undefined,
    };
  });

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
    ? buildCampusInternalTargets(nextOfficial.evaluation, applicationMethod(nextOfficial.application.application_method))
    : [];
  const nextInternal = internalTargets[0] || null;

  const activity: ActivityTimelineItem[] = history.map((event) => ({
    title: event.event_type === "document_requirement_changed"
      ? t.documents
      : event.event_type === "procedure_changed"
        ? t.currentJourney
        : event.event_type,
    description: event.message,
    timestamp: formatTimestamp(event.created_at, locale),
    tone: event.event_type === "document_requirement_changed" ? "warning" : "info",
  }));

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-7 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <DossierHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        status={t.active}
        statusVariant="success"
        facts={[
          { label: t.currentJourney, value: <bdi dir="auto">{routeLabel(locale, procedure.route_key)}</bdi> },
          { label: "Intake", value: <bdi dir="auto">{procedure.target_intake || t.verify}</bdi> },
          { label: t.documents, value: requirements.length },
          { label: t.activity, value: formatTimestamp(procedure.updated_at, locale) || t.verify },
        ]}
        actions={
          <>
            <Link href="/student/documents" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {t.openDocs}
            </Link>
            <Link href="/student/applications" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {t.openApplications}
            </Link>
          </>
        }
      />

      {journey.length ? (
        <section className="space-y-3">
          <PremiumSectionHeader eyebrow={t.currentJourney} title={t.currentJourney} />
          <JourneyRail steps={journey} ariaLabel={t.currentJourney} />
        </section>
      ) : null}

      <NextActionPanel
        eyebrow={t.nextAction}
        title={primaryAction ? primaryAction.label : t.noActionTitle}
        description={primaryAction?.student_request_reason || t.noActionBody}
        waiting={!primaryAction}
        metadata={
          primaryAction?.student_request_due_date
            ? formatDeadline(primaryAction.student_request_due_date, locale)
            : undefined
        }
        action={
          primaryAction ? (
            <Link
              href="/student/documents"
              className={buttonClassName("secondary")}
            >
              {t.openDocs}
            </Link>
          ) : undefined
        }
      />

      <ResponsibilityStrip
        items={[
          {
            label: t.you,
            detail: primaryAction ? primaryAction.student_request_reason || primaryAction.label : t.youWaiting,
            tone: "user",
          },
          {
            label: t.campus,
            detail: t.campusWorking,
            tone: "campus",
          },
          {
            label: t.external,
            detail: t.externalWaiting,
            tone: "external",
          },
        ]}
      />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <section className="pc-panel p-5 sm:p-6">
          <PremiumSectionHeader eyebrow={t.documents} title={t.documents} description={t.documentsHelp} />
          <div className="mt-4">
            {requirements.length ? requirements.map((row) => (
              <DocumentRow
                key={row.id}
                title={row.label}
                status={requirementStatus(row)}
                description={row.student_request_reason || (row.requirement_key === "existing_language_certificate" ? t.optional : undefined)}
                metadata={row.student_request_due_date ? formatDeadline(row.student_request_due_date, locale) : undefined}
                action={row.requested_from_student ? (
                  <Link href="/student/documents" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
                    {t.openDocs}
                  </Link>
                ) : undefined}
              />
            )) : (
              <PremiumEmptyState title={t.noActionBody} compact />
            )}
          </div>
        </section>

        <aside className="space-y-7">
          <section className="pc-card p-5">
            <PremiumSectionHeader eyebrow={t.deadlines} title={t.deadlines} />
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{t.official}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {nextOfficial?.evaluation.date ? formatDeadline(nextOfficial.evaluation.date, locale) : t.verify}
                </p>
                {nextOfficial ? (
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    <bdi dir="auto">{relation(nextOfficial.application.programs)?.name || t.openApplications}</bdi>
                  </p>
                ) : null}
              </div>
              <div className="border-t border-[var(--premium-border)] pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{t.internal}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {nextInternal ? formatDeadline(nextInternal.date, locale) : t.verify}
                </p>
              </div>
            </div>
          </section>

          <section className="pc-card p-5">
            <PremiumSectionHeader eyebrow={t.activity} title={t.activity} />
            <div className="mt-5">
              <ActivityTimeline items={activity} empty={t.activityEmpty} />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
