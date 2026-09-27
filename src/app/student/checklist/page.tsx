import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";
import { summarizeAcademicEvidence, type AcademicEvidenceRecord } from "@/lib/academic-evidence";
import { buildGermanyChecklist, type GermanyChecklistItem } from "@/lib/germany-checklist";
import { determineRegulatoryPath } from "@/lib/regulatory-path-engine";

const labels: Record<string, string> = {
  not_started: "À faire par vous",
  todo: "À faire par vous",
  in_progress: "En cours",
  waiting_student: "À faire par vous",
  waiting_almago: "Suivi par AlmaGo",
  completed: "Terminé",
};

const badgeVariants = {
  completed: "success",
  waiting_student: "warning",
  waiting_almago: "info",
  todo: "neutral",
  in_progress: "info",
  not_started: "neutral",
} as const;

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <ChecklistUnavailable />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const now = new Date();
  const [
    itemsResult,
    projectResult,
    documentsResult,
    evidenceResult,
    selectionResult,
  ] = await Promise.all([
    supabase
      .from("student_checklist_items")
      .select("id,title,description,status,completed_at,checklist_templates(category,sort_order)")
      .order("created_at"),
    supabase
      .from("student_projects")
      .select("path")
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("id,status")
      .eq("student_id", user.id),
    supabase
      .from("academic_evidence")
      .select("evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at")
      .eq("student_id", user.id),
    supabase
      .from("student_language_course_selections")
      .select("language_course_id")
      .eq("student_id", user.id)
      .maybeSingle(),
  ]);

  if (
    itemsResult.error
    || projectResult.error
    || documentsResult.error
    || evidenceResult.error
    || selectionResult.error
  ) return <ChecklistUnavailable />;

  let selectedCourse: {
    id: string;
    title: string;
    provider_name: string;
    language: string;
    purpose: "study_preparation" | "standalone_language";
    source_url: string | null;
    application_url: string | null;
    verified_at: string | null;
    is_active: boolean;
  } | null = null;

  if (selectionResult.data?.language_course_id) {
    const { data, error } = await supabase
      .from("language_courses")
      .select("id,title,provider_name,language,purpose,source_url,application_url,verified_at,is_active")
      .eq("id", selectionResult.data.language_course_id)
      .maybeSingle();
    if (error) return <ChecklistUnavailable />;
    selectedCourse = data
      ? {
          id: data.id,
          title: data.title,
          provider_name: data.provider_name,
          language: data.language,
          purpose: data.purpose as "study_preparation" | "standalone_language",
          source_url: data.source_url,
          application_url: data.application_url,
          verified_at: data.verified_at,
          is_active: data.is_active,
        }
      : null;
  }

  const documentStatusById = new Map(
    (documentsResult.data || []).map((document) => [document.id, document.status]),
  );
  const evidence = (evidenceResult.data || []).map((item) => ({
    type: item.evidence_type,
    institution: item.institution,
    evidence_date: item.evidence_date,
    origin: item.origin,
    verification_status: item.verification_status,
    document_id: item.document_id,
    document_status: item.document_id
      ? documentStatusById.get(item.document_id) || null
      : null,
    verified_at: item.verified_at,
  })) as AcademicEvidenceRecord[];
  const evidenceSummary = summarizeAcademicEvidence(evidence, now);

  // Student RLS on language_courses exposes only active, currently verified,
  // source-valid catalogue rows. A stale/non-publishable selected course therefore
  // resolves to null here and fails closed.
  const hasPublishableStudyPreparationCourse =
    selectedCourse?.purpose === "study_preparation";
  const hasPublishableStandaloneLanguageCourse =
    selectedCourse?.purpose === "standalone_language";

  const regulatoryDecision = determineRegulatoryPath({
    project_path: projectResult.data?.path || null,
    accepted_definitive_admission: evidenceSummary.accepted_definitive_admission,
    accepted_preparatory_basis: evidenceSummary.accepted_preparatory_basis,
    has_publishable_study_preparation_course: hasPublishableStudyPreparationCourse,
    has_pending_academic_review: evidenceSummary.has_pending_review,
    has_replacement_required: evidenceSummary.has_replacement_required,
  });

  const personalizedItems = buildGermanyChecklist({
    project_path: projectResult.data?.path || null,
    decision: regulatoryDecision,
    accepted_definitive_admission: evidenceSummary.accepted_definitive_admission,
    accepted_preparatory_basis: evidenceSummary.accepted_preparatory_basis,
    has_publishable_study_preparation_course: hasPublishableStudyPreparationCourse,
    has_publishable_standalone_language_course: hasPublishableStandaloneLanguageCourse,
    has_pending_academic_review: evidenceSummary.has_pending_review,
    has_replacement_required: evidenceSummary.has_replacement_required,
  });

  const checklistItems = itemsResult.data || [];
  const completedCount = checklistItems.filter((item) => item.status === "completed").length;
  const progression = checklistItems.length ? Math.round((completedCount / checklistItems.length) * 100) : 0;
  const actionableItems = checklistItems.filter((item) =>
    ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status),
  );
  const waitingAlmaGoCount = checklistItems.filter((item) => item.status === "waiting_almago").length;
  const nextItem =
    actionableItems.find((item) => item.status === "waiting_student") ||
    actionableItems[0];

  const groups = new Map<string, (typeof checklistItems)[number][]>();
  for (const item of checklistItems) {
    const relation = Array.isArray(item.checklist_templates)
      ? item.checklist_templates[0]
      : item.checklist_templates;
    const category = relation?.category || "Autre";
    groups.set(category, [...(groups.get(category) || []), item]);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="checklist"
        eyebrow="Mon dossier"
        title="Mes démarches"
        description="Voyez en un coup d’œil ce qui est à faire par vous, ce qu’AlmaGo suit et les étapes déjà terminées dans votre dossier."
        actions={<ButtonLink href="/student/documents" variant="secondary">Voir mes documents</ButtonLink>}
      />

      <section className="mb-8" aria-labelledby="germany-plan-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Plan Allemagne personnalisé</p>
          <h2 id="germany-plan-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Étapes calculées à partir de votre dossier
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Ces étapes sont générées uniquement à partir des faits actuellement enregistrés : projet, preuves académiques vérifiées et cours explicitement sélectionné. Elles n’inventent ni admission, ni délai, ni éligibilité de visa.
          </p>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
          {personalizedItems.map((item) => (
            <PersonalizedChecklistCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card aria-labelledby="checklist-progress-title" className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-none">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre progression</p>
                <h2 id="checklist-progress-title" className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Démarches enregistrées dans votre dossier</h2>
              </div>
              <Badge variant={checklistItems.length > 0 && progression === 100 ? "success" : "info"}>
                {checklistItems.length ? `${completedCount}/${checklistItems.length} terminées` : "Aucune étape"}
              </Badge>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{checklistItems.length ? `${progression}%` : "—"}</p>
                <p className="max-w-xs text-right text-sm leading-6 text-slate-600">Étapes réellement enregistrées dans AlmaGo</p>
              </div>
              {checklistItems.length > 0 && <ProgressBar value={progression} label="Progression des démarches enregistrées" />}
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Cette progression concerne les démarches enregistrées dans votre dossier. Elle ne représente ni une admission ni une validation finale.
            </p>
          </div>
        </Card>

        <Card aria-labelledby="checklist-next-action-title" className={nextItem ? "border-amber-200 bg-amber-50/25 shadow-none" : "shadow-none"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant={nextItem ? "warning" : waitingAlmaGoCount ? "info" : "neutral"}>
              {nextItem ? "À faire maintenant" : waitingAlmaGoCount ? "Suivi en cours" : "Aucune action demandée"}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              {nextItem ? "À faire par vous" : waitingAlmaGoCount ? "Suivi par AlmaGo" : "Dossier"}
            </span>
          </div>
          {nextItem ? (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">{nextItem.title}</h2>
              {nextItem.description && <p className="mt-3 text-sm leading-6 text-slate-700">{nextItem.description}</p>}
              <div className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-900">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                {labels[nextItem.status] || "À faire par vous"}
              </div>
            </>
          ) : (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {waitingAlmaGoCount ? "Vous n’avez rien à faire pour le moment" : "Aucune action n’est demandée actuellement"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {waitingAlmaGoCount
                  ? "AlmaGo suit actuellement certaines étapes de votre dossier. Vous pouvez consulter leur détail ci-dessous."
                  : "Les démarches enregistrées dans votre dossier apparaissent ci-dessous. Une nouvelle action sera mise en évidence lorsqu’elle vous concernera."}
              </p>
            </>
          )}
        </Card>
      </div>

      <section aria-label="Résumé des démarches" className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard title="À faire par vous" value={actionableItems.length} badge={actionableItems.length ? "À traiter" : "Rien à faire"} tone={actionableItems.length ? "warning" : "success"} />
        <SummaryCard title="Suivi par AlmaGo" value={waitingAlmaGoCount} badge={waitingAlmaGoCount ? "En cours" : "Aucune étape"} tone="info" />
        <SummaryCard title="Terminées" value={completedCount} badge="Étapes complétées" tone="success" />
      </section>

      {checklistItems.length === 0 ? (
        <Card aria-labelledby="checklist-empty-title" className="mt-6 border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">✓</span>
          <h2 id="checklist-empty-title" className="mt-4 text-lg font-bold text-slate-950">Aucune démarche n’est enregistrée pour le moment.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Lorsqu’une nouvelle étape sera ajoutée à votre dossier, elle apparaîtra ici avec son responsable et son statut.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <ButtonLink href="/student">Retour à mon dossier</ButtonLink>
            <ButtonLink href="/student/documents" variant="secondary">Voir mes documents</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.entries()].map(([category, group]) => {
            const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
            const groupCompleted = group.filter((item) => item.status === "completed").length;
            return (
              <section key={category} aria-labelledby={categoryId}>
                <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Étape du dossier</p>
                    <h2 id={categoryId} className="mt-1 text-xl font-bold tracking-[-0.02em] text-slate-950">{category}</h2>
                  </div>
                  <Badge variant={groupCompleted === group.length ? "success" : "neutral"}>{groupCompleted}/{group.length} terminées</Badge>
                </div>
                <div className="space-y-3">
                  {group.map((item) => (
                    <Card as="article" key={item.id} aria-labelledby={`checklist-item-title-${item.id}`} className={item.status === "waiting_student" || item.status === "todo" || item.status === "not_started" ? "border-amber-200 bg-amber-50/25 shadow-none" : item.status === "waiting_almago" ? "border-blue-200 bg-blue-50/20 shadow-none" : "shadow-none"}>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={badgeVariants[item.status as keyof typeof badgeVariants] || "neutral"}>
                              {labels[item.status] || item.status}
                            </Badge>
                            {["waiting_student", "todo", "not_started"].includes(item.status) && <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Responsable : vous</span>}
                            {item.status === "waiting_almago" && <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Responsable : AlmaGo</span>}
                          </div>
                          <h3 id={`checklist-item-title-${item.id}`} className="mt-3 font-bold text-slate-950">{item.title}</h3>
                          {item.description && <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>}
                          {item.completed_at && (
                            <p className="mt-3 text-xs text-slate-500">
                              Terminé le{" "}
                              <time dateTime={item.completed_at}>
                                {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(item.completed_at))}
                              </time>
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value, badge, tone }: { title: string; value: number; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="shadow-none">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function ChecklistUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="checklist" eyebrow="Mon dossier" title="Mes démarches" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Démarches temporairement indisponibles</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Nous n’arrivons pas à afficher vos démarches pour le moment. Rien n’a été supprimé ou modifié. Vous pouvez réessayer ou revenir à votre dossier.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/checklist">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}


function PersonalizedChecklistCard({ item }: { item: GermanyChecklistItem }) {
  const variant =
    item.status === "completed"
      ? "success"
      : item.status === "waiting_almago"
        ? "info"
        : "warning";
  const statusLabel =
    item.status === "completed"
      ? "Terminé"
      : item.status === "waiting_almago"
        ? "Suivi par AlmaGo"
        : "À faire par vous";

  return (
    <article className="grid gap-4 p-5 sm:grid-cols-[9rem_minmax(12rem,0.7fr)_minmax(0,1.3fr)] sm:items-start sm:p-6">
      <div>
        <Badge variant={variant}>{statusLabel}</Badge>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Responsable : {item.owner === "student" ? "vous" : "AlmaGo"}
        </p>
      </div>
      <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
      <p className="text-sm leading-6 text-slate-600">{item.explanation}</p>
    </article>
  );
}
