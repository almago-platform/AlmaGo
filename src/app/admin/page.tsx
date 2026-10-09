import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { catalogVerificationCutoff } from "@/lib/catalog-freshness";
import {
  adminActionDateIsTrusted,
  applicationDateIsOperationalWorkDate,
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  applicationRouteRisk,
  campusTodayDateKey,
} from "@/lib/admin/application-risk";
import { isActiveApplication } from "@/lib/application-workflow";
import { isHumanAdminAction } from "@/lib/admin/people";
import { AdminQuickActionCompleteButton } from "@/components/admin/AdminQuickActionCompleteButton";
import { belongsToAdminPortfolio, isSoloAdmin } from "@/lib/admin/solo-workspace";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const supabase = await createClient();

  const now = new Date();
  const staleCutoff = catalogVerificationCutoff(now);
  const dueSoonCutoff = new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000).toISOString();
  const staleContactCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const today = campusTodayDateKey(now);
  const weekEnd = shiftDateKey(today, 7);
  const { data: { user: currentAdmin } } = await supabase.auth.getUser();

  if (!staleCutoff) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
        <AdminPageHeader section="Pilotage" title="Vue d’ensemble" description="Priorités opérationnelles de l’équipe AlmaGo." />
        <AdminLoadError title="La vue d’ensemble est temporairement indisponible" description="Nous n’arrivons pas à calculer les indicateurs de l’équipe pour le moment." retryHref="/admin" />
      </main>
    );
  }

  const [
    { count: universityCount, error: universitiesError },
    { count: programCount, error: programsError },
    { count: applicationCount, error: applicationsError },
    { count: documentsToReview, error: documentsError },
    { count: intakeAttentionCount, error: intakeAttentionError },
    { count: studentQuestionCount, error: studentQuestionError },
    { count: orientationCount, error: orientationError },
    { count: pendingOrientationReviewsCount, error: orientationReviewsError },
    { count: staleLanguageCount, error: staleLanguageError },
    { count: dueLanguageCount, error: dueLanguageError },
    { count: staleFinanceCount, error: staleFinanceError },
    { count: dueFinanceCount, error: dueFinanceError },
    unreadNotificationsResult,
    adminRolesResult,
    accessRowsResult,
    intakeRowsResult,
    assignmentsResult,
    recentContactsResult,
    actionsResult,
    applicationRowsResult,
    currentProceduresResult,
    requirementSignalsResult,
  ] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewed"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).in("status", ["student_question", "campus_review", "paid_pending_validation"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).eq("status", "student_question"),
    supabase.from("program_recommendations").select("id", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("orientation_human_reviews").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
    currentAdmin
      ? supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", currentAdmin.id).is("read_at", null)
      : Promise.resolve({ count: 0, error: null }),
    supabase.from("user_roles").select("user_id").eq("role", "admin"),
    supabase.from("customer_access").select("user_id,status").limit(1000),
    supabase.from("student_intake_cases").select("student_id,status").limit(1000),
    supabase.from("student_case_assignments").select("student_id,assigned_admin_id").limit(1000),
    supabase.from("student_case_notes").select("student_id,kind,occurred_at").neq("kind", "internal_note").gte("occurred_at", staleContactCutoff).limit(3000),
    supabase.from("student_checklist_items").select("id,student_id,title,status,owner,due_date,deadline_kind,official_source_url,official_source_verified_at,deadline_cycle,template_id,procedure_step_template_id,requires_student_action,student_action_reason").limit(5000),
    supabase.from("applications").select("student_id,status,next_action,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method").limit(5000),
    supabase.from("student_procedures").select("id,student_id").eq("is_current", true).limit(1000),
    supabase.from("student_document_requirements").select("student_id,student_procedure_id,status,requested_from_student,student_request_reason").limit(5000),
  ]);

  if (
    universitiesError || programsError || applicationsError || documentsError
    || intakeAttentionError || studentQuestionError || orientationError || orientationReviewsError
    || staleLanguageError || dueLanguageError || staleFinanceError || dueFinanceError
    || unreadNotificationsResult.error || adminRolesResult.error || accessRowsResult.error || intakeRowsResult.error
    || assignmentsResult.error || recentContactsResult.error || actionsResult.error || applicationRowsResult.error
    || currentProceduresResult.error || requirementSignalsResult.error
  ) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
        <AdminPageHeader section="Pilotage" title="Vue d’ensemble" description="Priorités opérationnelles de l’équipe AlmaGo." />
        <AdminLoadError title="La vue d’ensemble est temporairement indisponible" description="Nous n’arrivons pas à charger les indicateurs de l’équipe pour le moment." retryHref="/admin" />
      </main>
    );
  }

  const documents = documentsToReview || 0;
  const intakeAttention = intakeAttentionCount || 0;
  const studentQuestions = studentQuestionCount || 0;
  const applications = applicationCount || 0;
  const orientations = orientationCount || 0;
  const pendingOrientationReviews = pendingOrientationReviewsCount || 0;
  const catalogue = (universityCount || 0) + (programCount || 0);
  const staleLanguage = staleLanguageCount || 0;
  const dueLanguage = dueLanguageCount || 0;
  const staleFinance = staleFinanceCount || 0;
  const dueFinance = dueFinanceCount || 0;
  const staleCatalogue = staleLanguage + staleFinance;
  const dueCatalogue = dueLanguage + dueFinance;

  const unreadNotifications = unreadNotificationsResult.count || 0;
  const soloAdmin = isSoloAdmin(adminRolesResult.data?.map((item) => item.user_id) || [], currentAdmin?.id ?? null);
  const operationalIds = new Set<string>();
  const completedIds = new Set(
    (accessRowsResult.data || [])
      .filter((item) => item.status === "client_completed")
      .map((item) => item.user_id),
  );
  for (const item of accessRowsResult.data || []) {
    if (!completedIds.has(item.user_id)) operationalIds.add(item.user_id);
  }
  for (const item of intakeRowsResult.data || []) {
    if (!completedIds.has(item.student_id)) operationalIds.add(item.student_id);
  }

  const assignmentByStudent = new Map(
    (assignmentsResult.data || []).map((item) => [item.student_id, item.assigned_admin_id]),
  );
  const assignedIds = new Set(
    (assignmentsResult.data || [])
      .filter((item) => Boolean(item.assigned_admin_id))
      .map((item) => item.student_id),
  );
  const contactedRecentlyIds = new Set(
    (recentContactsResult.data || []).map((item) => item.student_id),
  );
  const currentProcedureIds = new Set(
    (currentProceduresResult.data || []).map((item) => item.id),
  );
  const currentRequirementSignals = (requirementSignalsResult.data || []).filter((item) =>
    currentProcedureIds.has(item.student_procedure_id)
  );

  const explicitActionIds = new Set<string>();
  const blockedCaseIds = new Set(
    (actionsResult.data || [])
      .filter((item) => item.status === "blocked")
      .map((item) => item.student_id),
  );
  const waitingCampusCaseIds = new Set(
    (actionsResult.data || [])
      .filter((item) => item.status === "waiting_almago")
      .map((item) => item.student_id),
  );
  for (const requirement of currentRequirementSignals) {
    if (["authentication_required", "translation_required", "legalisation_to_verify", "legalisation_required"].includes(requirement.status)) {
      waitingCampusCaseIds.add(requirement.student_id);
    }
  }
  const waitingStudentCaseIds = new Set(
    (actionsResult.data || [])
      .filter((item) =>
        item.status === "waiting_student"
        && item.requires_student_action
        && Boolean(item.student_action_reason?.trim())
      )
      .map((item) => item.student_id),
  );
  const replacementDocumentCaseIds = new Set<string>();
  for (const requirement of currentRequirementSignals) {
    if (
      requirement.requested_from_student
      && ["requested", "replacement_required"].includes(requirement.status)
      && Boolean(requirement.student_request_reason?.trim())
    ) {
      waitingStudentCaseIds.add(requirement.student_id);
    }
    if (requirement.status === "replacement_required") {
      replacementDocumentCaseIds.add(requirement.student_id);
    }
  }
  const waitingExternalCaseIds = new Set(
    (actionsResult.data || [])
      .filter((item) => item.status === "waiting_external")
      .map((item) => item.student_id),
  );
  const humanActions = (actionsResult.data || []).filter((item) =>
    isHumanAdminAction(item)
  );
  const humanCampusActions = humanActions.filter((item) =>
    item.owner === "almago" || item.owner === "joint"
  );
  for (const item of humanActions) explicitActionIds.add(item.student_id);
  for (const item of applicationRowsResult.data || []) {
    if (isActiveApplication(item.status) && item.next_action?.trim()) explicitActionIds.add(item.student_id);
  }

  const nearestDueByStudent = new Map<string, string>();
  const registerDue = (studentId: string, value: string | null | undefined) => {
    const key = dateKey(value || null);
    if (!key) return;
    const current = nearestDueByStudent.get(studentId);
    if (!current || key < current) nearestDueByStudent.set(studentId, key);
  };

  for (const item of humanActions) {
    if (actionDeadlineIsTrusted(item)) registerDue(item.student_id, item.due_date);
  }
  for (const item of applicationRowsResult.data || []) {
    if (applicationDateIsOperationalWorkDate(item)) {
      registerDue(item.student_id, item.deadline);
    }
  }

  const unverifiedDeadlineCaseIds = new Set<string>();
  const applicationRiskCaseIds = new Set<string>();
  const officialOverdueCaseIds = new Set<string>();
  const officialD3CaseIds = new Set<string>();
  const officialD7CaseIds = new Set<string>();
  const officialD14CaseIds = new Set<string>();
  const officialD30CaseIds = new Set<string>();
  for (const item of humanActions) {
    if (item.due_date && !actionDeadlineIsTrusted(item)) {
      unverifiedDeadlineCaseIds.add(item.student_id);
    }
  }
  for (const item of applicationRowsResult.data || []) {
    if (!isActiveApplication(item.status)) continue;
    const trusted = applicationDeadlineIsTrusted(item);
    if (item.deadline && !trusted) unverifiedDeadlineCaseIds.add(item.student_id);
    if (applicationRouteRisk({
      status: item.status,
      application_method: item.application_method,
      deadline: item.deadline,
      deadline_kind: item.deadline_kind,
      deadlineTrusted: trusted,
    }, today)) {
      applicationRiskCaseIds.add(item.student_id);
    }

    const officialUrgency = applicationOfficialDeadlineUrgency({
      status: item.status,
      deadline: item.deadline,
      deadline_kind: item.deadline_kind,
      deadlineTrusted: trusted,
    }, today);
    if (officialUrgency?.kind === "overdue") {
      officialOverdueCaseIds.add(item.student_id);
    } else if (officialUrgency) {
      if (officialUrgency.daysRemaining <= 30) officialD30CaseIds.add(item.student_id);
      if (officialUrgency.daysRemaining <= 14) officialD14CaseIds.add(item.student_id);
      if (officialUrgency.daysRemaining <= 7) officialD7CaseIds.add(item.student_id);
      if (officialUrgency.daysRemaining <= 3) officialD3CaseIds.add(item.student_id);
    }
  }

  const operationalList = [...operationalIds];
  const blockedCases = operationalList.filter((id) => blockedCaseIds.has(id)).length;
  const waitingCampusCases = operationalList.filter((id) => waitingCampusCaseIds.has(id)).length;
  const waitingStudentCases = operationalList.filter((id) => waitingStudentCaseIds.has(id)).length;
  const waitingExternalCases = operationalList.filter((id) => waitingExternalCaseIds.has(id)).length;
  const replacementDocumentCases = operationalList.filter((id) => replacementDocumentCaseIds.has(id)).length;
  const deadlineVerifyCases = operationalList.filter((id) => unverifiedDeadlineCaseIds.has(id)).length;
  const applicationRiskCases = operationalList.filter((id) => applicationRiskCaseIds.has(id)).length;
  const officialOverdueCases = operationalList.filter((id) => officialOverdueCaseIds.has(id)).length;
  const officialD3Cases = operationalList.filter((id) => officialD3CaseIds.has(id)).length;
  const officialD7Cases = operationalList.filter((id) => officialD7CaseIds.has(id)).length;
  const officialD14Cases = operationalList.filter((id) => officialD14CaseIds.has(id)).length;
  const officialD30Cases = operationalList.filter((id) => officialD30CaseIds.has(id)).length;
  const unassignedCases = operationalList.filter((id) => !assignedIds.has(id)).length;
  const staleContactCases = operationalList.filter((id) => !contactedRecentlyIds.has(id)).length;
  const missingNextActionCases = operationalList.filter((id) => !explicitActionIds.has(id)).length;
  const myCases = currentAdmin
    ? operationalList.filter((id) => belongsToAdminPortfolio(assignmentByStudent.get(id), currentAdmin.id, soloAdmin)).length
    : 0;
  const myHumanActions = currentAdmin
    ? humanCampusActions
        .filter((item) => operationalIds.has(item.student_id) && belongsToAdminPortfolio(assignmentByStudent.get(item.student_id), currentAdmin.id, soloAdmin))
        .sort((left, right) => {
          const leftDate = actionDeadlineIsTrusted(left) ? dateKey(left.due_date) : null;
          const rightDate = actionDeadlineIsTrusted(right) ? dateKey(right.due_date) : null;
          if (leftDate && rightDate) return leftDate.localeCompare(rightDate);
          if (leftDate) return -1;
          if (rightDate) return 1;
          return left.title.localeCompare(right.title, "fr");
        })
    : [];
  const myOpenActions = myHumanActions.length;

  const taskStudentIds = [...new Set(myHumanActions.slice(0, 5).map((item) => item.student_id))];
  const taskProfilesResult = taskStudentIds.length
    ? await supabase.from("profiles").select("id,first_name,last_name,full_name").in("id", taskStudentIds)
    : { data: [], error: null };
  const taskProfileByStudent = new Map(
    (taskProfilesResult.data || []).map((profile) => [profile.id, profile]),
  );
  const overdueCases = operationalList.filter((id) => {
    const due = nearestDueByStudent.get(id);
    return Boolean(due && due < today);
  }).length;
  const todayCases = operationalList.filter((id) => nearestDueByStudent.get(id) === today).length;
  const weekCases = operationalList.filter((id) => {
    const due = nearestDueByStudent.get(id);
    return Boolean(due && due >= today && due <= weekEnd);
  }).length;

  const priority = officialOverdueCases > 0
    ? {
        badge: "Deadline officielle dépassée",
        title: officialOverdueCases > 1
          ? `${officialOverdueCases} dossiers ont dépassé une deadline officielle vérifiée`
          : "1 dossier a dépassé une deadline officielle vérifiée",
        description: "La candidature n’est pas encore enregistrée comme soumise alors que sa deadline officielle vérifiée est dépassée. Vérifiez immédiatement la situation réelle et le statut du dossier.",
        href: "/admin/people?work=official_overdue",
        action: "Escalader les deadlines",
      }
    : blockedCases > 0
      ? {
        badge: "Dossiers bloqués",
        title: blockedCases > 1
          ? `${blockedCases} dossiers ont un blocage explicite`
          : "1 dossier a un blocage explicite",
        description: "Une étape de procédure est marquée comme bloquée. Ouvrez le dossier 360° pour voir le responsable, la raison et l’action de résolution.",
        href: "/admin/people?work=blocked",
        action: "Traiter les blocages",
      }
    : studentQuestions > 0
      ? {
        badge: "Réponse étudiant reçue",
        title: studentQuestions > 1
          ? `${studentQuestions} étudiants attendent une réponse de Campus Allemagne`
          : "1 étudiant attend une réponse de Campus Allemagne",
        description: "Une demande de discussion a été envoyée depuis l’espace étudiant. Ouvrez la file des parcours pour répondre ou ajuster la proposition.",
        href: "/admin/intake",
        action: "Répondre aux étudiants",
      }
    : waitingCampusCases > 0
      ? {
          badge: "Étudiants attendent Campus",
          title: waitingCampusCases > 1
            ? `${waitingCampusCases} dossiers attendent une action Campus Allemagne`
            : "1 dossier attend une action Campus Allemagne",
          description: "Une étape de procédure est explicitement en attente de Campus Allemagne. Ouvrez la file concernée et traitez l’action avant de laisser avancer le dossier.",
          href: "/admin/people?work=waiting_campus",
          action: "Traiter les attentes Campus",
        }
      : documents > 0
      ? {
          badge: "Documents à traiter",
          title: `${documents} document${documents > 1 ? "s" : ""} demande${documents > 1 ? "nt" : ""} votre attention`,
          description: "Commencez par la file documentaire : ces pièces ont été reçues et attendent une décision de l’équipe.",
          href: "/admin/documents",
          action: "Ouvrir la file documents",
        }
      : intakeAttention > 0
        ? {
            badge: "Dossiers à traiter",
            title: `${intakeAttention} dossier${intakeAttention > 1 ? "s" : ""} demande${intakeAttention > 1 ? "nt" : ""} une décision Campus`,
            description: "Des parcours sont prêts à être proposés ou un paiement reçu attend une validation interne.",
            href: "/admin/intake",
            action: "Ouvrir les dossiers",
          }
        : deadlineVerifyCases > 0
          ? {
              badge: "Dates à vérifier",
              title: deadlineVerifyCases > 1
                ? `${deadlineVerifyCases} dossiers contiennent une date non vérifiée`
                : "1 dossier contient une date non vérifiée",
              description: "Une date sans source, cycle ou vérification complète ne doit pas piloter un compte à rebours officiel. Vérifiez sa provenance avant de l’utiliser.",
              href: "/admin/people?work=deadline_verify",
              action: "Vérifier les dates",
            }
          : applicationRiskCases > 0
            ? {
                badge: "VPD / uni-assist à risque",
                title: applicationRiskCases > 1
                  ? `${applicationRiskCases} dossiers ont dépassé leur cible interne de préparation`
                  : "1 dossier a dépassé sa cible interne de préparation",
                description: "La deadline officielle est vérifiée, mais la cible interne D-70 pour VPD ou D-56 pour uni-assist est atteinte ou dépassée avant soumission.",
                href: "/admin/people?work=application_risk",
                action: "Traiter les candidatures à risque",
              }
            : applications > 0
          ? {
              badge: "Candidatures actives",
              title: `${applications} candidature${applications > 1 ? "s" : ""} reste${applications > 1 ? "nt" : ""} en suivi`,
              description: "Aucun dossier Campus ne demande d’action immédiate. Vérifiez les échéances, statuts et prochaines actions des candidatures actives.",
              href: "/admin/applications",
              action: "Suivre les candidatures",
            }
          : pendingOrientationReviews > 0
            ? {
                badge: "Audits d’orientation",
                title: `${pendingOrientationReviews} orientation${pendingOrientationReviews > 1 ? "s" : ""} à auditer`,
                description: "Les résultats automatiques ont déjà été remis. Il reste à effectuer le contrôle qualité humain ; aucune recommandation étudiant n’est publiée par cette revue.",
                href: "/admin/orientation",
                action: "Examiner les orientations",
              }
          : staleCatalogue > 0
            ? {
                badge: "Catalogue à revalider",
                title: staleCatalogue > 1 ? `${staleCatalogue} fiches vérifiées ont expiré` : "1 fiche vérifiée a expiré",
                description: "Ces fiches ne sont plus publiées aux étudiants. Revalidez leur source officielle avant de les remettre dans le catalogue visible.",
                href: staleLanguage > 0 ? "/admin/language-courses" : "/admin/finance-insurance",
                action: "Revalider le catalogue",
              }
            : {
                badge: "File prioritaire à jour",
                title: "Aucun blocage dossier prioritaire n’est visible",
                description: "Les réponses étudiants, dossiers Campus, documents et candidatures ne signalent pas de charge prioritaire dans cette vue.",
                href: "/admin/intake",
                action: "Voir les dossiers",
              };

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
      <AdminPageHeader
        section="Pilotage"
        title={soloAdmin ? "Mon bureau" : "Vue d’ensemble"}
        description={soloAdmin
          ? "Un seul endroit pour traiter vos dossiers, même sans attribution formelle, et décider quoi faire ensuite."
          : "Voyez d’abord ce qui demande l’attention de l’équipe, puis ouvrez directement la bonne file de travail."}
        actions={
          <>
            <ButtonLink href="/admin/people">Retrouver une personne</ButtonLink>
            <ButtonLink href="/admin/traitement" variant="secondary">Voir les tâches à traiter</ButtonLink>
          </>
        }
      />

      <section aria-labelledby="person-lookup-title" className="mb-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="person-lookup-title" className="text-lg font-semibold text-slate-950">Retrouver un étudiant ou un prospect</h2>
            <p className="mt-1 text-sm text-slate-600">Recherchez d’abord la personne ; son Dossier 360° rassemble l’historique et les actions.</p>
          </div>
          <Link href="/admin/people" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">Tous les dossiers →</Link>
        </div>
        <form method="get" action="/admin/people" role="search" className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="admin-global-person-search" className="sr-only">Nom ou adresse e-mail de la personne</label>
          <input
            id="admin-global-person-search"
            name="q"
            type="search"
            autoComplete="off"
            className="field min-h-11 min-w-0 flex-1 bg-white"
            placeholder="Nom ou adresse e-mail du candidat"
          />
          <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 text-sm font-bold text-white hover:bg-[var(--brand-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            Rechercher
          </button>
        </form>
      </section>

      <section aria-label="Priorité opérationnelle" className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.7fr)]">
        <Card className="pc-card relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <Badge variant={blockedCases > 0 ? "error" : studentQuestions > 0 || documents > 0 ? "warning" : intakeAttention > 0 || applications > 0 ? "info" : staleCatalogue > 0 ? "warning" : "success"}>{priority.badge}</Badge>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">À traiter maintenant</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {priority.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{priority.description}</p>
            <div className="mt-4">
              <ButtonLink href={priority.href}>{priority.action}</ButtonLink>
            </div>
          </div>
        </Card>

        <details className="self-start rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--premium-cream)] p-4 sm:p-5">
          <summary className="cursor-pointer text-sm font-bold text-slate-900 hover:text-[var(--brand-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            Ordre de traitement · afficher les 3 priorités
          </summary>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">1</span>
              <span><strong className="text-slate-950">Réponses & dossiers</strong><br />Traiter d’abord les étudiants qui attendent une réponse.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">2</span>
              <span><strong className="text-slate-950">Documents & candidatures</strong><br />Lever les blocages et mettre à jour les statuts.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</span>
              <span><strong className="text-slate-950">Catalogue</strong><br />Maintenir universités et programmes fiables.</span>
            </li>
          </ol>
        </details>
      </section>

      <section aria-label="Accès rapides" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Mes dossiers", number: myCases, href: "/admin/people?work=mine", detail: "Personnes à accompagner" },
          { title: "À décider", number: intakeAttention, href: "/admin/intake", detail: "Parcours ou validation Campus" },
          { title: "Sans prochaine action", number: missingNextActionCases, href: "/admin/people?work=no_action", detail: "Planifier le suivi" },
          { title: "Documents à vérifier", number: documents, href: "/admin/documents", detail: "Pièces en attente" },
        ].map((signal) => (
          <Link key={signal.href} href={signal.href} className="group rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--brand-border)] hover:shadow-sm">
            <p className="text-xs font-bold text-slate-600">{signal.title}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <strong className="text-3xl font-bold tabular-nums text-slate-950">{signal.number}</strong>
              <span className="text-sm font-bold text-[var(--brand)]" aria-hidden="true">→</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{signal.detail}</p>
          </Link>
        ))}
      </section>

      <section className="mb-6" aria-labelledby="my-actions-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Mon travail</p>
            <h2 id="my-actions-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">
              Mes prochaines actions
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {soloAdmin
                ? "Vos actions humaines ouvertes, y compris dans les dossiers non attribués. Les étapes automatiques restent hors de cette liste."
                : "Seulement les actions humaines des dossiers qui vous sont attribués. Les étapes système restent hors de cette liste."}
            </p>
          </div>
          <ButtonLink href="/admin/people?work=mine" variant="secondary">Voir mon portefeuille</ButtonLink>
        </div>

        <Card className="mt-4 overflow-hidden p-0 shadow-none">
          {myHumanActions.length ? (
            <div className="divide-y divide-[var(--border)]">
              {myHumanActions.slice(0, 5).map((item) => {
                const profile = taskProfileByStudent.get(item.student_id);
                const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()
                  || profile?.full_name?.trim()
                  || "Dossier étudiant";
                const due = actionDeadlineIsTrusted(item) ? dateKey(item.due_date) : null;
                const overdue = Boolean(due && due < today);
                const dueToday = due === today;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center">
                    <Link
                    href={`/admin/dossiers/${item.student_id}#actions`}
                    className="group grid min-w-0 flex-1 gap-3 px-4 py-4 transition-colors hover:bg-[var(--surface-subtle)] sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-center sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{name}</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-600">Cible interne</p>
                      <p className={`mt-1 text-sm font-semibold ${overdue ? "text-red-700" : dueToday ? "text-amber-800" : "text-slate-900"}`}>
                        {due ? formatDashboardDate(due) : "Sans date"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[var(--brand)] group-hover:underline">Ouvrir →</span>
                    </Link>
                    {soloAdmin ? (
                      <div className="px-4 pb-4 sm:py-3 sm:pr-5 sm:pl-0">
                        <AdminQuickActionCompleteButton studentId={item.student_id} actionId={item.id} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 sm:px-5">
              <p className="text-sm font-bold text-slate-950">Aucune action humaine ouverte dans votre portefeuille.</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Les étapes automatiques de procédure ne sont pas comptées comme du travail conseiller.
              </p>
            </div>
          )}
        </Card>
      </section>

      <details className="my-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
          Suivi des échéances · {overdueCases} en retard · {todayCases} aujourd’hui · {weekCases} dans les 7 jours
        </summary>
      <section aria-labelledby="daily-cockpit-title" className="mt-4">
        <PremiumSectionHeader
          eyebrow="Cockpit quotidien"
          title={<span id="daily-cockpit-title">Tous vos repères de suivi</span>}
          description={soloAdmin
            ? "Les chiffres servent de contrôle après votre priorité et vos prochaines actions. Les dossiers non attribués font partie de votre portefeuille."
            : "Les premières cartes montrent la charge datée et votre portefeuille. Les suivantes signalent les dossiers qui risquent de disparaître du radar."}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DailySignalCard
            href="/admin/people?work=mine"
            label="Mes dossiers"
            value={myCases}
            detail={myOpenActions
              ? `${myOpenActions} action${myOpenActions > 1 ? "s" : ""} humaine${myOpenActions > 1 ? "s" : ""} ouverte${myOpenActions > 1 ? "s" : ""}`
              : "Aucune action humaine ouverte dans votre portefeuille"}
            tone={myOpenActions ? "info" : "success"}
            statusLabel={myOpenActions ? "À piloter" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=overdue"
            label="En retard"
            value={overdueCases}
            detail="Dossiers avec une échéance vérifiée ou une cible interne dépassée"
            tone={overdueCases ? "error" : "success"}
            statusLabel={overdueCases ? "Urgent" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=today"
            label="Aujourd’hui"
            value={todayCases}
            detail="Dossiers dont la prochaine date de travail fiable tombe aujourd’hui"
            tone={todayCases ? "warning" : "success"}
            statusLabel={todayCases ? "À traiter" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=week"
            label="7 prochains jours"
            value={weekCases}
            detail="Dossiers à préparer avant leur prochaine date de travail fiable"
            tone={weekCases ? "info" : "success"}
            statusLabel={weekCases ? "À préparer" : "À jour"}
          />
        </div>

        <details className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
          <summary className="cursor-pointer text-sm font-bold text-slate-950">Voir tous les indicateurs détaillés, dates officielles et exceptions</summary>
          <p className="mt-2 text-xs leading-5 text-slate-600">Ces chiffres servent à auditer les dossiers, pas à créer des échéances ou des preuves absentes.</p>
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Deadlines officielles vérifiées</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Compteurs cumulatifs uniquement pour les candidatures encore à déposer. Une date non vérifiée reste hors de ces alertes.
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DailySignalCard
            href="/admin/people?work=official_overdue"
            label="Dépassées"
            value={officialOverdueCases}
            detail="Deadline officielle vérifiée dépassée avant soumission"
            tone={officialOverdueCases ? "error" : "success"}
            statusLabel={officialOverdueCases ? "Escalade" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=official_3"
            label="≤ 3 jours"
            value={officialD3Cases}
            detail="Dossiers à J-3 ou moins de leur deadline officielle"
            tone={officialD3Cases ? "error" : "success"}
            statusLabel={officialD3Cases ? "Critique" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=official_7"
            label="≤ 7 jours"
            value={officialD7Cases}
            detail="Dossiers à J-7 ou moins de leur deadline officielle"
            tone={officialD7Cases ? "warning" : "success"}
            statusLabel={officialD7Cases ? "Urgent" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=official_14"
            label="≤ 14 jours"
            value={officialD14Cases}
            detail="Dossiers à J-14 ou moins de leur deadline officielle"
            tone={officialD14Cases ? "warning" : "success"}
            statusLabel={officialD14Cases ? "Attention" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=official_30"
            label="≤ 30 jours"
            value={officialD30Cases}
            detail="Dossiers entrant dans la fenêtre d’information J-30"
            tone={officialD30Cases ? "info" : "success"}
            statusLabel={officialD30Cases ? "À préparer" : "À jour"}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DailySignalCard
            href="/admin/inbox"
            label="Boîte de réception"
            value={unreadNotifications}
            detail={unreadNotifications ? "Événements non lus pour votre compte admin" : "Aucun événement non lu"}
            tone={unreadNotifications ? "warning" : "success"}
            statusLabel={unreadNotifications ? "Nouveau" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=no_action"
            label="Sans prochaine action"
            value={missingNextActionCases}
            detail="Dossiers actifs sans action humaine explicite ni prochaine action candidature"
            tone={missingNextActionCases ? "warning" : "success"}
            statusLabel={missingNextActionCases ? "À compléter" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=unassigned"
            label="Non attribués"
            value={unassignedCases}
            detail="Dossiers actifs sans conseiller responsable"
            tone={unassignedCases ? "warning" : "success"}
            statusLabel={unassignedCases ? "À répartir" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=stale"
            label="Sans contact 14 j"
            value={staleContactCases}
            detail="Dossiers actifs sans contact journalisé récemment"
            tone={staleContactCases ? "info" : "success"}
            statusLabel={staleContactCases ? "À reprendre" : "À jour"}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DailySignalCard
            href="/admin/people?work=waiting_campus"
            label="Attend Campus"
            value={waitingCampusCases}
            detail="Étapes explicitement en attente d’une action Campus Allemagne"
            tone={waitingCampusCases ? "warning" : "success"}
            statusLabel={waitingCampusCases ? "À traiter" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=waiting_student"
            label="Attend étudiant"
            value={waitingStudentCases}
            detail="Actions personnelles ciblées avec une raison explicite pour l’étudiant"
            tone={waitingStudentCases ? "info" : "success"}
            statusLabel={waitingStudentCases ? "En attente" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=waiting_external"
            label="Attend externe"
            value={waitingExternalCases}
            detail="Étapes qui dépendent d’une université, autorité ou autre acteur externe"
            tone={waitingExternalCases ? "info" : "success"}
            statusLabel={waitingExternalCases ? "À suivre" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=document_replacement"
            label="Documents à remplacer"
            value={replacementDocumentCases}
            detail="Dossiers dont une exigence de la procédure attend une nouvelle version étudiante"
            tone={replacementDocumentCases ? "warning" : "success"}
            statusLabel={replacementDocumentCases ? "Étudiant attendu" : "À jour"}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DailySignalCard
            href="/admin/people?work=deadline_verify"
            label="Dates à vérifier"
            value={deadlineVerifyCases}
            detail="Dossiers avec une date enregistrée dont la provenance officielle n’est pas complète"
            tone={deadlineVerifyCases ? "warning" : "success"}
            statusLabel={deadlineVerifyCases ? "À vérifier" : "À jour"}
          />
          <DailySignalCard
            href="/admin/people?work=application_risk"
            label="VPD / uni-assist à risque"
            value={applicationRiskCases}
            detail="Cible interne D-70 (VPD) ou D-56 (uni-assist) atteinte sur une deadline officielle vérifiée"
            tone={applicationRiskCases ? "warning" : "success"}
            statusLabel={applicationRiskCases ? "À accélérer" : "À jour"}
          />
        </div>
        </details>
      </section>
      </details>

      <details className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
          Files spécialisées · {intakeAttention} dossier(s) Campus · {pendingOrientationReviews} revue(s) d’orientation
        </summary>
      <section className="mt-4" aria-labelledby="admin-overview-title">
        <PremiumSectionHeader
          eyebrow="Files de travail"
          title={<span id="admin-overview-title">Files de traitement</span>}
          description="Ouvrez le centre de traitement, ou accédez à une file spécifique."
        />

        <Card className="mt-4 overflow-hidden p-0 shadow-none">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-bold text-slate-950">File opérationnelle consolidée</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Une seule surface pour lire les volumes, repérer les files actives et ouvrir directement le bon espace.
              </p>
            </div>
            <Badge variant={documents || studentQuestions || intakeAttention ? "warning" : applications ? "info" : "success"}>
              {documents || studentQuestions || intakeAttention
                ? "Attention requise"
                : applications
                  ? "Suivi en cours"
                  : "Files à jour"}
            </Badge>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <AdminQueueRow
              href="/admin/intake"
              title="Dossiers Campus"
              value={intakeAttention}
              detail={studentQuestions ? `${studentQuestions} réponse${studentQuestions > 1 ? "s" : ""} étudiant à traiter` : "Décisions et validations en attente"}
              tone={studentQuestions ? "warning" : intakeAttention ? "info" : "neutral"}
            />
            <AdminQueueRow
              href="/admin/documents"
              title="Documents à traiter"
              value={documents}
              detail={documents ? "Vérification ou remplacement en attente" : "Aucune pièce en attente"}
              tone={documents ? "warning" : "neutral"}
            />
            <AdminQueueRow
              href="/admin/applications"
              title="Candidatures actives"
              value={applications}
              detail="Dossiers encore en suivi"
              tone={applications ? "info" : "neutral"}
            />
            <AdminQueueRow
              href="/admin/orientation"
              title="Audits d’orientation en attente"
              value={pendingOrientationReviews}
              detail={`${orientations} recommandation${orientations > 1 ? "s" : ""} publiée${orientations > 1 ? "s" : ""} · revue humaine distincte`}
              tone={pendingOrientationReviews ? "warning" : "neutral"}
            />
            <AdminQueueRow
              href="/admin/universities"
              title="Catalogue actif"
              value={catalogue}
              detail={`${universityCount || 0} université${(universityCount || 0) > 1 ? "s" : ""} · ${programCount || 0} programme${(programCount || 0) > 1 ? "s" : ""}`}
              tone="neutral"
            />
          </div>
        </Card>
      </section>
      </details>

      <details className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-bold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
          Révalidations du catalogue · {staleCatalogue} expirée(s) · {dueCatalogue} à planifier
        </summary>
      <section className="mt-4" aria-labelledby="catalogue-health-title">
        <PremiumSectionHeader
          eyebrow="Fraîcheur des sources"
          title={<span id="catalogue-health-title">Révalidations du catalogue Allemagne</span>}
          description="Une vérification catalogue expire automatiquement après 30 jours. Les fiches expirées restent visibles ici pour l’équipe, mais disparaissent de l’espace étudiant."
        />

        <Card className="pc-card mt-4 overflow-hidden p-0 shadow-none">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-bold text-slate-950">État des sources utilisées dans les services</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Les éléments à jour restent publiables. Une source expirée exige une nouvelle vérification officielle.
              </p>
            </div>
            <Badge variant={staleCatalogue ? "warning" : dueCatalogue ? "info" : "success"}>
              {staleCatalogue
                ? `${staleCatalogue} à revalider`
                : dueCatalogue
                  ? `${dueCatalogue} à planifier`
                  : "Catalogue à jour"}
            </Badge>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <CatalogHealthRow href="/admin/language-courses" title="Cours de langue" stale={staleLanguage} dueSoon={dueLanguage} />
            <CatalogHealthRow href="/admin/finance-insurance" title="Finance & assurance" stale={staleFinance} dueSoon={dueFinance} />
          </div>
        </Card>
      </section>
      </details>
    </main>
  );
}

function AdminQueueRow({
  href,
  title,
  value,
  detail,
  tone,
}: {
  href: string;
  title: string;
  value: number;
  detail: string;
  tone: "warning" | "info" | "neutral";
}) {
  const status =
    value > 0
      ? tone === "warning"
        ? "Action requise"
        : "En cours"
      : "À jour";

  const accentClass =
    value > 0 && tone === "warning"
      ? "bg-amber-400"
      : value > 0 && tone === "info"
        ? "bg-blue-400"
        : value > 0
          ? "bg-slate-300"
          : "bg-emerald-300";

  return (
    <Link
      href={href}
      aria-label={`Ouvrir ${title}`}
      className="group relative grid min-h-[5.75rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] sm:px-5 lg:grid-cols-[0.3rem_5.5rem_minmax(0,1fr)_10rem_2.5rem] lg:gap-5"
    >
      <span aria-hidden="true" className={`hidden h-10 w-1 rounded-full lg:block ${accentClass}`} />

      <div className="flex min-w-[4rem] items-baseline gap-2 lg:block">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <span className="text-xs font-semibold text-slate-600 lg:hidden">{status}</span>
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-600 [overflow-wrap:anywhere]">{detail}</p>
      </div>

      <div className="hidden justify-self-start lg:block">
        <Badge variant={value > 0 ? (tone === "warning" ? "warning" : tone === "info" ? "info" : "neutral") : "success"}>
          {status}
        </Badge>
      </div>

      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white text-sm font-bold text-[var(--brand)] transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function CatalogHealthRow({
  href,
  title,
  stale,
  dueSoon,
}: {
  href: string;
  title: string;
  stale: number;
  dueSoon: number;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div>
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          {stale ? `${stale} fiche${stale > 1 ? "s" : ""} expirée${stale > 1 ? "s" : ""}` : "Aucune fiche expirée"}
          {" · "}
          {dueSoon ? `${dueSoon} à revoir sous 7 jours` : "aucune échéance sous 7 jours"}
        </p>
      </div>
      <Badge variant={stale ? "warning" : dueSoon ? "info" : "success"}>
        {stale ? "Action requise" : dueSoon ? "À planifier" : "À jour"}
      </Badge>
    </Link>
  );
}


function DailySignalCard({
  href,
  label,
  value,
  detail,
  tone,
  statusLabel,
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  tone: "warning" | "info" | "success" | "error";
  statusLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <Badge variant={tone}>{statusLabel || (value ? "À vérifier" : "À jour")}</Badge>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-600">{detail}</p>
      <p className="mt-3 text-xs font-bold text-[var(--brand)]">Ouvrir →</p>
    </Link>
  );
}

function dateKey(value: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : null;
}

function shiftDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function actionDeadlineIsTrusted(action: Parameters<typeof adminActionDateIsTrusted>[0]) {
  return adminActionDateIsTrusted(action);
}

function applicationDeadlineIsTrusted(application: Parameters<typeof applicationDateIsTrusted>[0]) {
  return applicationDateIsTrusted(application);
}

function formatDashboardDate(value: string) {
  const timestamp = Date.parse(value + "T12:00:00Z");
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(timestamp));
}
