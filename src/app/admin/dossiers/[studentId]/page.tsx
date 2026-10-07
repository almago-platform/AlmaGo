import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/product/ActivityTimeline";
import { DossierHeader } from "@/components/product/DossierHeader";
import { DocumentRow } from "@/components/product/DocumentRow";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminDossierActionsPanel, type AdminDossierActionItem } from "@/components/admin/AdminDossierActionsPanel";
import { AdminDossierBlockersPanel, type AdminDossierBlocker } from "@/components/admin/AdminDossierBlockersPanel";
import { AdminCaseOwnerPanel, type AdminAdvisorOption } from "@/components/admin/AdminCaseOwnerPanel";
import { AdminCaseJournalPanel, type AdminCaseNoteItem } from "@/components/admin/AdminCaseJournalPanel";
import { AdminDocumentRequirementsPanel, type AdminDocumentRequirementItem } from "@/components/admin/AdminDocumentRequirementsPanel";
import { AdminStudentProjectPanel } from "@/components/admin/AdminStudentProjectPanel";
import { AdminRecommendationApplicationAction } from "@/components/admin/AdminRecommendationApplicationAction";
import { DossierMessageThread, type DossierMessageItem } from "@/components/product/DossierMessageThread";
import { Badge } from "@/components/ui/Badge";
import { DataList } from "@/components/ui/DataList";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
import {
  applicationStatusLabels,
  isActiveApplication,
  type KnownApplicationStatus,
} from "@/lib/application-workflow";
import {
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  applicationOfficialDeadlineUrgencyLabel,
  applicationRouteRisk,
  applicationRouteRiskLabel,
  campusTodayDateKey,
} from "@/lib/admin/application-risk";
import { campusRouteLabel } from "@/lib/campus-intake";
import { recommendationStatusLabels } from "@/lib/phase4";
import { formatMinorCurrency } from "@/lib/money";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { orientationProjectFacts } from "@/lib/prospect/orientation-presentation";
import {
  adminDocumentState,
  adminDossierLifecycle,
  adminDossierLifecycleStatus,
  adminDossierNextAction,
  adminDossierStageIndex,
  adminDossierStatusLabel,
  adminDossierStatusVariant,
  customerAccessLabel,
  purchaseStatusLabel,
} from "@/lib/admin/student-dossier";
import { adminActionOwnerLabel, adminActionWaiting, adminPersonSegmentLabels, classifyAdminPerson, isOpenAdminAction } from "@/lib/admin/people";
import { createClient } from "@/lib/supabase/server";

type ApplicationRow = {
  id: string;
  program_id: string;
  status: string;
  intake: string | null;
  deadline: string | null;
  deadline_kind: string | null;
  deadline_source_url: string | null;
  deadline_verified_at: string | null;
  deadline_cycle: string | null;
  application_method: string | null;
  next_action: string | null;
  result: string | null;
  created_at: string;
  programs:
    | { name: string | null; universities: { name: string | null; city: string | null } | null }
    | Array<{ name: string | null; universities: { name: string | null; city: string | null } | null }>
    | null;
  application_events?: Array<{
    id: string;
    event_type: string;
    message: string | null;
    visible_to_student: boolean;
    created_at: string;
  }> | null;
};

type DocumentRowData = {
  id: string;
  category: string;
  original_filename: string | null;
  status: string;
  admin_comment: string | null;
  created_at: string;
};

type ProgramRecommendationRow = {
  id: string;
  program_id: string;
  status: string;
  note: string | null;
  created_at: string;
  programs:
    | { name: string | null; degree_level: string | null; field: string | null; universities: { name: string | null; city: string | null } | null }
    | Array<{ name: string | null; degree_level: string | null; field: string | null; universities: { name: string | null; city: string | null } | null }>
    | null;
};

type DocumentRequirementRow = AdminDocumentRequirementItem & {
  student_procedure_id: string | null;
};

type DossierActionRow = AdminDossierActionItem & {
  requires_student_action: boolean;
  student_action_reason: string | null;
  blocked_reason: string | null;
  deadline_kind: string | null;
};

type PurchaseRow = {
  id: string;
  offer_snapshot: unknown;
  amount_minor: number | string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type HistoryRow = {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function firstProgram(application: ApplicationRow) {
  return Array.isArray(application.programs)
    ? application.programs[0] ?? null
    : application.programs;
}

function offerName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const value = (snapshot as Record<string, unknown>).display_name;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function recommendationTone(status: string) {
  if (status === "recommended" || status === "possible") return "success" as const;
  if (status === "missing_requirements") return "warning" as const;
  if (status === "ambitious") return "info" as const;
  return "neutral" as const;
}

function applicationDeadlineIsTrusted(application: ApplicationRow) {
  return applicationDateIsTrusted(application);
}

function applicationTone(status: string) {
  if (status === "admission" || status === "accepted") return "success" as const;
  if (status === "rejection" || status === "rejected" || status === "withdrawn") return "error" as const;
  if (status === "documents_missing") return "warning" as const;
  return "info" as const;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Non enregistrée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function bacStatusLabel(value: string) {
  if (value === "obtained") return "Bac obtenu";
  if (value === "preparing") return "Bac en préparation";
  if (value === "no_bac") return "Sans Bac";
  return value || "À confirmer";
}

function latestDocument(documents: DocumentRowData[], category: string) {
  return documents.find((document) => document.category === category) ?? null;
}

function documentStatusLabel(status: string) {
  if (status === "approved") return "Approuvé";
  if (status === "pending") return "À vérifier";
  if (status === "reviewed") return "Revu";
  if (status === "replace_required") return "Remplacement demandé";
  if (status === "rejected") return "Rejeté";
  if (status === "quarantined") return "Quarantaine";
  return status;
}

function documentStatusVariant(status: string): "success" | "info" | "warning" | "error" | "neutral" {
  if (status === "approved") return "success";
  if (status === "pending" || status === "reviewed") return "info";
  if (status === "replace_required") return "warning";
  if (status === "rejected" || status === "quarantined") return "error";
  return "neutral";
}

export const dynamic = "force-dynamic";

export default async function AdminStudentDossierPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) notFound();

  const supabase = await createClient();

  const [
    profileResult,
    prospectResult,
    intakeResult,
    accessResult,
    documentsResult,
    procedureResult,
    requirementsResult,
    recommendationsResult,
    applicationsResult,
    purchasesResult,
    actionsResult,
    historyResult,
    assignmentResult,
    adminRolesResult,
    caseNotesResult,
    messagesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,full_name,target_degree,target_field,study_language,german_level,general_average,preferred_cities,target_intake,budget_range")
      .eq("id", studentId)
      .maybeSingle(),
    supabase
      .from("prospects")
      .select("id,user_id,email,created_at,updated_at")
      .eq("user_id", studentId)
      .maybeSingle(),
    supabase
      .from("student_intake_cases")
      .select("student_id,orientation_id,status,proposed_route_key,proposal_reason,proposed_offer_version_id,purchase_id,student_response_note,student_responded_at,updated_at")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("customer_access")
      .select("status")
      .eq("user_id", studentId)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("id,category,original_filename,status,admin_comment,created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_procedures")
      .select("id")
      .eq("student_id", studentId)
      .eq("is_current", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("student_document_requirements")
      .select("id,student_procedure_id,requirement_key,label,category,status,requested_from_student,student_request_reason,student_request_due_date,document_id,requires_tunisian_authentication,requires_translation,requires_german_legalisation,legalisation_status,legalisation_reason,due_date,deadline_kind,deadline_cycle,source_url,source_verified_at,admin_note,created_at,updated_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true }),
    supabase
      .from("program_recommendations")
      .select("id,program_id,status,note,created_at,programs(name,degree_level,field,universities(name,city))")
      .eq("student_id", studentId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id,program_id,status,intake,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,next_action,result,created_at,programs(name,universities(name,city)),application_events(id,event_type,message,visible_to_student,created_at)")
      .eq("student_id", studentId)
      .order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("commercial_purchases")
      .select("id,offer_snapshot,amount_minor,currency,status,created_at,updated_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("student_checklist_items")
      .select("id,title,description,status,owner,due_date,template_id,completed_at,created_at,requires_student_action,student_action_reason,blocked_reason,deadline_kind")
      .eq("student_id", studentId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("student_history")
      .select("id,event_type,message,created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("student_case_assignments")
      .select("student_id,assigned_admin_id,assigned_at,updated_at")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin"),
    supabase
      .from("student_case_notes")
      .select("id,author_id,kind,content,occurred_at,created_at")
      .eq("student_id", studentId)
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("student_dossier_messages")
      .select("id,sender_role,body,student_read_at,admin_read_at,created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  const profile = profileResult.data;
  const prospect = prospectResult.data;
  const intake = intakeResult.data;
  const access = accessResult.data;
  const documents = (documentsResult.data || []) as DocumentRowData[];
  const currentProcedureId = procedureResult.data?.id || null;
  const documentRequirements = ((requirementsResult.data || []) as DocumentRequirementRow[])
    .filter((item) => Boolean(currentProcedureId) && item.student_procedure_id === currentProcedureId);
  const recommendations = (recommendationsResult.data || []) as unknown as ProgramRecommendationRow[];
  const applications = (applicationsResult.data || []) as unknown as ApplicationRow[];
  const purchase = ((purchasesResult.data || []) as PurchaseRow[])[0] ?? null;
  const dossierActions = (actionsResult.data || []) as DossierActionRow[];
  const historyRows = (historyResult.data || []) as HistoryRow[];
  const assignment = assignmentResult.data;
  const adminIds = (adminRolesResult.data || []).map((item) => item.user_id);
  const caseNotesRaw = caseNotesResult.data || [];
  const dossierMessages = (messagesResult.data || []) as DossierMessageItem[];

  if (!profile && !prospect && !intake) {
    notFound();
  }

  const fatalError =
    profileResult.error
    || prospectResult.error
    || intakeResult.error
    || accessResult.error
    || documentsResult.error
    || procedureResult.error
    || requirementsResult.error
    || recommendationsResult.error
    || applicationsResult.error
    || purchasesResult.error
    || actionsResult.error
    || historyResult.error
    || assignmentResult.error
    || adminRolesResult.error
    || caseNotesResult.error
    || messagesResult.error;

  if (fatalError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminLoadError
          title="Le dossier 360° est temporairement indisponible"
          description="Une partie du dossier étudiant n’a pas pu être chargée. Aucune donnée n’a été modifiée."
          retryHref={`/admin/dossiers/${studentId}`}
        />
      </main>
    );
  }

  const hiddenErasedRecord =
    typeof prospect?.email === "string"
    && (prospect.email.startsWith("erased-") || prospect.email.endsWith("@invalid.local"));

  if (hiddenErasedRecord) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <DossierHeader
          eyebrow="Dossier archivé"
          title="Enregistrement retiré des opérations"
          description="Cet enregistrement anonymisé n’est pas affiché dans les files de travail opérationnelles."
          status="Archivé"
          statusVariant="neutral"
          actions={
            <Link
              href="/admin/intake"
              className={buttonClassName("secondary", "min-h-10 px-4 py-2")}
            >
              Retour aux dossiers
            </Link>
          }
        />
      </main>
    );
  }

  const advisorProfilesResult = adminIds.length
    ? await supabase
        .from("profiles")
        .select("id,first_name,last_name,full_name")
        .in("id", adminIds)
    : { data: [], error: null };

  const advisorProfiles = advisorProfilesResult.data || [];
  const advisorProfileById = new Map(advisorProfiles.map((item) => [item.id, item]));
  const advisorOptions: AdminAdvisorOption[] = adminIds
    .map((id, index) => {
      const item = advisorProfileById.get(id);
      const split = [item?.first_name, item?.last_name].filter(Boolean).join(" ").trim();
      return {
        id,
        name: split || item?.full_name?.trim() || `Conseiller Campus ${index + 1}`,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "fr"));
  const assignedAdminName =
    advisorOptions.find((item) => item.id === assignment?.assigned_admin_id)?.name || null;
  const advisorNameById = new Map(advisorOptions.map((item) => [item.id, item.name]));
  const caseNotes: AdminCaseNoteItem[] = caseNotesRaw.map((item) => ({
    id: item.id,
    kind: item.kind,
    content: item.content,
    occurred_at: item.occurred_at,
    created_at: item.created_at,
    author_name: item.author_id
      ? advisorNameById.get(item.author_id) || "Ancien administrateur"
      : "Ancien administrateur",
  }));
  const latestContact = caseNotes.find((item) => item.kind !== "internal_note") || null;

  let orientationHistory = [] as Array<{
    id: string;
    input: unknown;
    created_at: string;
  }>;

  if (prospect?.id) {
    const orientationResult = await supabase
      .from("orientations")
      .select("id,input,created_at")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(30);
    orientationHistory = (orientationResult.data || []) as typeof orientationHistory;
  }

  if (intake?.orientation_id && !orientationHistory.some((item) => item.id === intake.orientation_id)) {
    const orientationResult = await supabase
      .from("orientations")
      .select("id,input,created_at")
      .eq("id", intake.orientation_id)
      .maybeSingle();
    if (orientationResult.data) orientationHistory.unshift(orientationResult.data);
  }

  const orientation = intake?.orientation_id
    ? orientationHistory.find((item) => item.id === intake.orientation_id) || orientationHistory[0] || null
    : orientationHistory[0] || null;

  const offerResult = intake?.proposed_offer_version_id
    ? await supabase
        .from("commercial_offer_versions")
        .select("id,display_name,summary,price_minor,currency")
        .eq("id", intake.proposed_offer_version_id)
        .maybeSingle()
    : { data: null, error: null };

  const offer = offerResult.data;
  const input = orientation?.input && typeof orientation.input === "object"
    ? orientation.input as Record<string, unknown>
    : {};
  const answers = restorePublicOrientationAnswers(input.answers);
  const projectFacts = orientationProjectFacts(answers, "fr");
  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
    || profile?.full_name
    || "Étudiant";
  const email = prospect?.email || "Adresse non enregistrée";
  const personSegment = classifyAdminPerson(access?.status, Boolean(intake));
  const currentStage = adminDossierStageIndex(intake?.status, applications.length > 0);
  const workflowNextAction = adminDossierNextAction(intake?.status, applications.length > 0);
  const latestDocumentByCategory = new Map<string, DocumentRowData>();
  for (const item of documents) {
    if (!latestDocumentByCategory.has(item.category)) {
      latestDocumentByCategory.set(item.category, item);
    }
  }
  const latestOperationalDocuments = [...latestDocumentByCategory.values()];
  const documentsAwaitingDecision = latestOperationalDocuments.filter((item) =>
    item.status === "pending" || item.status === "reviewed"
  );
  const unreadStudentMessages = dossierMessages.filter((item) =>
    item.sender_role === "student" && !item.admin_read_at
  ).length;
  const studentDocumentRequests = documentRequirements.filter((item) =>
    item.requested_from_student && (item.status === "requested" || item.status === "replacement_required")
  );
  const recordedNextAction = dossierActions.find((item) => isOpenAdminAction(item.status) && item.template_id === null) || null;

  const blockers: AdminDossierBlocker[] = [];
  const blockerIds = new Set<string>();
  const addBlocker = (blocker: AdminDossierBlocker) => {
    if (blockerIds.has(blocker.id)) return;
    blockerIds.add(blocker.id);
    blockers.push(blocker);
  };

  for (const action of dossierActions) {
    if (action.status === "blocked") {
      addBlocker({
        id: `action:${action.id}`,
        kind: "Étape bloquée",
        title: action.title,
        reason: action.blocked_reason?.trim()
          || action.description?.trim()
          || "Cette étape est explicitement marquée comme bloquée dans la procédure.",
        owner: action.owner === "student" || action.owner === "external" || action.owner === "joint"
          ? action.owner
          : "almago",
        severity: "critical",
        href: "#actions",
        actionLabel: "Traiter l’action",
      });
      continue;
    }

    if (
      action.status === "waiting_student"
      && action.requires_student_action
      && action.student_action_reason?.trim()
    ) {
      addBlocker({
        id: `student-action:${action.id}`,
        kind: "Action étudiante requise",
        title: action.title,
        reason: action.student_action_reason.trim(),
        owner: action.owner === "joint" ? "joint" : "student",
        severity: "warning",
        href: "#actions",
        actionLabel: "Voir l’action",
      });
    }
  }

  for (const requirement of studentDocumentRequests) {
    addBlocker({
      id: `document-request:${requirement.id}`,
      kind: requirement.status === "replacement_required" ? "Remplacement requis" : "Pièce attendue",
      title: requirement.label,
      reason: requirement.student_request_reason?.trim()
        || "Une pièce ou une action personnelle est nécessaire avant de poursuivre cette partie du dossier.",
      owner: "student",
      severity: requirement.status === "replacement_required" ? "critical" : "warning",
      href: "#documents",
      actionLabel: "Voir la demande",
    });
  }

  for (const requirement of documentRequirements) {
    if (requirement.status === "legalisation_to_verify") {
      addBlocker({
        id: `document-legalisation-review:${requirement.id}`,
        kind: "Légalisation à vérifier",
        title: requirement.label,
        reason: requirement.legalisation_reason?.trim()
          || "La nécessité d’une légalisation allemande doit être vérifiée avant de poursuivre cette opération documentaire.",
        owner: "almago",
        severity: "warning",
        href: "#documents",
        actionLabel: "Vérifier la règle",
      });
    }

    if (["authentication_required", "translation_required", "legalisation_required"].includes(requirement.status)) {
      addBlocker({
        id: `document-internal-operation:${requirement.id}`,
        kind: requirement.status === "authentication_required"
          ? "Authentification à lancer"
          : requirement.status === "translation_required"
            ? "Traduction à lancer"
            : "Légalisation à lancer",
        title: requirement.label,
        reason: requirement.admin_note?.trim()
          || requirement.legalisation_reason?.trim()
          || "Une opération documentaire interne est requise avant que la pièce puisse être considérée comme prête.",
        owner: "almago",
        severity: "warning",
        href: "#documents",
        actionLabel: "Voir l’exigence",
      });
    }
  }

  for (const document of documentsAwaitingDecision) {
    addBlocker({
      id: `document-decision:${document.id}`,
      kind: "Décision Campus",
      title: document.original_filename || `Document ${document.category}`,
      reason: "La version actuelle a été reçue mais attend encore une validation, un rejet ou une demande de remplacement.",
      owner: "almago",
      severity: "warning",
      href: "/admin/documents",
      actionLabel: "Décider",
    });
  }

  const todayKey = campusTodayDateKey();
  for (const application of applications) {
    if (!isActiveApplication(application.status)) continue;
    const programName = firstProgram(application)?.name || "Candidature";
    const trustedApplicationDeadline = applicationDeadlineIsTrusted(application);

    if (application.deadline && !trustedApplicationDeadline) {
      addBlocker({
        id: `application-deadline:${application.id}`,
        kind: "Deadline à vérifier",
        title: programName,
        reason: "Une date est enregistrée sans provenance complète. Elle ne peut pas servir d’échéance officielle avant vérification de la source, du cycle et de la date de vérification.",
        owner: "almago",
        severity: "critical",
        href: `/admin/applications?student=${studentId}`,
        actionLabel: "Vérifier la deadline",
      });
    }

    const officialUrgency = applicationOfficialDeadlineUrgency({
      status: application.status,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: trustedApplicationDeadline,
    }, todayKey);

    if (officialUrgency?.kind === "overdue") {
      addBlocker({
        id: `application-official-overdue:${application.id}`,
        kind: "Deadline officielle dépassée",
        title: programName,
        reason: "La candidature n’est pas enregistrée comme soumise alors que sa deadline officielle vérifiée est dépassée. Vérifiez immédiatement la situation réelle avant toute autre décision.",
        owner: "almago",
        severity: "critical",
        href: `/admin/applications?student=${studentId}`,
        actionLabel: "Escalader maintenant",
      });
    } else if (officialUrgency?.kind === "d3" || officialUrgency?.kind === "d7") {
      addBlocker({
        id: `application-official-urgent:${application.id}`,
        kind: applicationOfficialDeadlineUrgencyLabel(officialUrgency),
        title: programName,
        reason: `La deadline officielle vérifiée approche dans ${officialUrgency.daysRemaining} jour${officialUrgency.daysRemaining > 1 ? "s" : ""}. Confirmez que le dépôt peut encore être réalisé à temps.`,
        owner: "almago",
        severity: officialUrgency.kind === "d3" ? "critical" : "warning",
        href: `/admin/applications?student=${studentId}`,
        actionLabel: "Sécuriser le dépôt",
      });
    }

    const routeRisk = applicationRouteRisk({
      status: application.status,
      application_method: application.application_method,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: trustedApplicationDeadline,
    }, todayKey);

    if (routeRisk) {
      addBlocker({
        id: `application-route-risk:${application.id}`,
        kind: applicationRouteRiskLabel(routeRisk.kind),
        title: programName,
        reason: `La cible interne D-${routeRisk.leadDays} est atteinte ou dépassée avant soumission. Elle sert à sécuriser la préparation du dossier et ne remplace pas la deadline officielle.`,
        owner: "almago",
        severity: "warning",
        href: `/admin/applications?student=${studentId}`,
        actionLabel: "Accélérer la préparation",
      });
    }

    if (!application.next_action?.trim()) {
      addBlocker({
        id: `application-next-action:${application.id}`,
        kind: "Suivi incomplet",
        title: programName,
        reason: "Cette candidature est active mais aucune prochaine action n’est enregistrée pour l’équipe.",
        owner: "almago",
        severity: "warning",
        href: `/admin/applications?student=${studentId}`,
        actionLabel: "Définir l’action",
      });
    }
  }

  const missingProjectFields = [
    !profile?.target_degree ? "diplôme visé" : null,
    !profile?.target_field ? "domaine" : null,
    !profile?.target_intake ? "rentrée visée" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingProjectFields.length) {
    addBlocker({
      id: "project:missing-core",
      kind: "Projet incomplet",
      title: "Informations de projet à confirmer",
      reason: `Il manque : ${missingProjectFields.join(", ")}. Ces informations structurent l’orientation et la préparation des candidatures.`,
      owner: "joint",
      severity: "warning",
      href: "#project",
      actionLabel: "Compléter le projet",
    });
  }

  if (access?.status === "client_active" && !currentProcedureId) {
    addBlocker({
      id: "procedure:missing-current",
      kind: "Procédure absente",
      title: "Aucune procédure Campus active",
      reason: "Le client est actif mais aucune procédure courante n’est rattachée au dossier. Vérifiez l’activation commerciale et le parcours avant de créer des obligations manuelles.",
      owner: "almago",
      severity: "critical",
      href: "/admin/intake",
      actionLabel: "Vérifier l’activation",
    });
  }

  const blockerRank = { critical: 0, warning: 1, info: 2 } as const;
  blockers.sort((left, right) => blockerRank[left.severity] - blockerRank[right.severity]);

  const nextAction = unreadStudentMessages > 0
    ? {
        title: unreadStudentMessages > 1
          ? `${unreadStudentMessages} messages étudiants attendent une réponse`
          : "1 message étudiant attend une réponse",
        description: "Ouvrez le fil étudiant et répondez avant de poursuivre les autres actions du dossier.",
        href: "#messages" as string | null,
        waiting: false,
      }
    : documentsAwaitingDecision.length > 0
      ? {
          title: documentsAwaitingDecision.length > 1
            ? `${documentsAwaitingDecision.length} documents attendent une décision`
            : "1 document attend une décision",
          description: "Une pièce reçue attend une validation, un rejet ou une demande de remplacement.",
          href: "/admin/documents" as string | null,
          waiting: false,
        }
      : recordedNextAction
        ? {
            title: recordedNextAction.title,
            description: `${adminActionOwnerLabel(recordedNextAction.owner)} · ${recordedNextAction.description || "Action enregistrée dans le suivi du dossier."}`,
            href: "#actions" as string | null,
            waiting: adminActionWaiting(recordedNextAction.status),
          }
        : studentDocumentRequests.length > 0
          ? {
              title: studentDocumentRequests.length > 1
                ? `En attente de ${studentDocumentRequests.length} documents de l’étudiant`
                : `En attente du document « ${studentDocumentRequests[0].label} »`,
              description: "La prochaine action appartient à l’étudiant. La demande reste visible dans le suivi documentaire.",
              href: "#documents" as string | null,
              waiting: true,
            }
          : workflowNextAction;

  const lifecycleSteps: JourneyRailStep[] = adminDossierLifecycle.map((label, index) => ({
    label,
    detail:
      index < currentStage
        ? "Terminé"
        : index === currentStage
          ? "En cours"
          : index === 5 && currentStage < 5
            ? "Verrouillé"
            : "À venir",
    status: adminDossierLifecycleStatus(index, currentStage),
    href:
      index === 1 ? "/admin/documents"
        : index === 2 || index === 3 ? "/admin/intake"
          : index === 4 ? "/admin/payments"
            : index === 6 ? `/admin/applications?student=${studentId}`
              : undefined,
  }));

  const timeline: ActivityTimelineItem[] = historyRows.map((item) => ({
    title:
      item.event_type.includes("document") ? "Documents"
        : item.event_type.includes("payment") || item.event_type.includes("purchase") ? "Paiement"
          : item.event_type.includes("application") ? "Candidature"
            : item.event_type.includes("orientation") || item.event_type.includes("route") ? "Orientation / parcours"
              : item.event_type.includes("action") ? "Action de suivi"
                : "Dossier mis à jour",
    description: item.message,
    timestamp: formatDate(item.created_at),
    tone:
      item.event_type.includes("payment") ? "info"
        : item.event_type.includes("document") ? "warning"
          : item.event_type.includes("orientation") || item.event_type.includes("route") ? "brand"
            : "neutral",
  }));

  if (!historyRows.length && orientation?.created_at) {
    timeline.push({
      title: "Orientation enregistrée",
      description: projectFacts.length ? projectFacts.join(" · ") : "Projet enregistré dans AlmaGo.",
      timestamp: formatDate(orientation.created_at),
      tone: "brand",
    });
  }
  if (!historyRows.length && intake?.student_responded_at) {
    timeline.push({
      title: "Réponse de l’étudiant",
      description: intake.student_response_note || "Une réponse a été envoyée depuis l’espace Prospect.",
      timestamp: formatDate(intake.student_responded_at),
      tone: "warning",
    });
  }
  if (!historyRows.length && purchase?.created_at) {
    timeline.push({
      title: "Achat créé",
      description: `${offerName(purchase.offer_snapshot) || "Offre Campus Allemagne"} · ${purchaseStatusLabel(purchase.status)}`,
      timestamp: formatDate(purchase.created_at),
      tone: purchase.status === "client_active" ? "success" : "info",
    });
  }

  if (!historyRows.length) for (const application of applications) {
    for (const event of application.application_events || []) {
      timeline.push({
        title: event.event_type === "application_status_changed"
          ? "Statut candidature mis à jour"
          : "Événement candidature",
        description: event.message || firstProgram(application)?.name || "Candidature mise à jour.",
        timestamp: formatDate(event.created_at),
        tone: event.visible_to_student ? "info" : "neutral",
      });
    }
  }

  timeline.sort((left, right) => {
    const leftDate = typeof left.timestamp === "string" ? Date.parse(left.timestamp) : 0;
    const rightDate = typeof right.timestamp === "string" ? Date.parse(right.timestamp) : 0;
    return rightDate - leftDate;
  });

  const documentVersionById = new Map<string, number>();
  for (const category of [...new Set(documents.map((item) => item.category))]) {
    const versions = documents.filter((item) => item.category === category).slice().reverse();
    versions.forEach((item, index) => documentVersionById.set(item.id, index + 1));
  }

  const documentDefinitions = [
    { category: "passport", title: "Passeport", optional: answers.bacStatus === "preparing" },
    { category: "baccalaureate", title: "Baccalauréat", optional: answers.bacStatus === "preparing" },
    { category: "transcripts", title: "Relevé de notes", optional: answers.bacStatus === "preparing" },
    { category: "language_certificate", title: "Certificat de langue", optional: true },
  ];

  const applicationProgramIds = new Set(applications.map((item) => item.program_id));

  const purchaseAmount = purchase
    ? formatMinorCurrency(purchase.amount_minor, purchase.currency, "fr-FR")
    : null;
  const proposedOfferAmount = offer?.price_minor !== null && offer?.price_minor !== undefined && offer?.currency
    ? formatMinorCurrency(offer.price_minor, offer.currency, "fr-FR")
    : null;

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-7 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <DossierHeader
        eyebrow={`${adminPersonSegmentLabels[personSegment]} · dossier 360°`}
        title={name}
        description="Une seule vue pour comprendre la personne, ses orientations, ses pièces, ses candidatures, ses actions et la suite du parcours."
        status={adminDossierStatusLabel(intake?.status)}
        statusVariant={adminDossierStatusVariant(intake?.status)}
        facts={[
          { label: "Contact", value: <bdi dir="auto">{email}</bdi> },
          { label: "Accès", value: customerAccessLabel(access?.status) },
          { label: "Parcours", value: campusRouteLabel(intake?.proposed_route_key) },
          { label: "Dernier contact", value: latestContact ? formatDate(latestContact.occurred_at) : "Aucun contact journalisé" },
          { label: "Dernière mise à jour", value: formatDate(intake?.updated_at || prospect?.updated_at) },
        ]}
        actions={
          <Link
            href="/admin/people"
            className={buttonClassName("secondary", "min-h-10 px-4 py-2")}
          >
            Retour aux personnes
          </Link>
        }
      />

      <nav
        aria-label="Navigation du dossier"
        className="pc-card flex flex-wrap gap-1.5 p-2"
      >
        {[
          ["#overview", "Synthèse"],
          ["#blockers", "Blocages"],
          ["#actions", "Actions"],
          ["#messages", "Messages"],
          ["#journal", "Journal interne"],
          ["#project", "Projet"],
          ["#orientation", "Orientation"],
          ["#documents", "Documents"],
          ["#applications", "Candidatures"],
          ["#commercial", "Offre & paiement"],
          ["#history", "Historique"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="scroll-mt-24 space-y-3">
        <PremiumSectionHeader
          eyebrow="Cycle du dossier"
          title="Où en est cette personne ?"
          description="Les étapes techniques restent en arrière-plan ; l’équipe voit seulement l’avancement opérationnel utile."
        />
        <JourneyRail steps={lifecycleSteps} ariaLabel="Progression du dossier étudiant" />
      </section>

      <NextActionPanel
        eyebrow="Action Campus prioritaire"
        title={nextAction.title}
        description={nextAction.description}
        waiting={nextAction.waiting}
        action={
          nextAction.href ? (
            <Link
              href={nextAction.href}
              className={
                nextAction.waiting
                  ? "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--foreground)]"
                  : "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-white px-5 text-sm font-semibold text-[var(--foreground)]"
              }
            >
              Ouvrir la file concernée
            </Link>
          ) : undefined
        }
      />

      <div id="blockers" className="scroll-mt-24">
        <AdminDossierBlockersPanel blockers={blockers} />
      </div>

      <div id="actions" className="scroll-mt-24">
        <AdminDossierActionsPanel studentId={studentId} actions={dossierActions} />
      </div>

      <div id="messages" className="scroll-mt-24">
        <DossierMessageThread
          messages={dossierMessages}
          endpoint={"/api/admin/dossiers/" + studentId + "/messages"}
          viewerRole="admin"
          title="Messages avec l’étudiant"
          description="Ce fil est visible par l’étudiant. Utilisez le Journal interne pour les informations réservées à l’équipe."
        />
      </div>

      <AdminCaseJournalPanel studentId={studentId} notes={caseNotes} />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <div className="space-y-7">
          <div id="project" className="scroll-mt-24">
            <AdminStudentProjectPanel
              studentId={studentId}
              project={{
                target_degree: profile?.target_degree || null,
                target_field: profile?.target_field || null,
                study_language: profile?.study_language || null,
                german_level: profile?.german_level || null,
                general_average: profile?.general_average ?? null,
                preferred_cities: Array.isArray(profile?.preferred_cities) ? profile.preferred_cities : [],
                target_intake: profile?.target_intake || null,
                budget_range: profile?.budget_range || null,
              }}
            />
          </div>

          <section id="orientation" className="pc-panel scroll-mt-24 p-5 sm:p-6">
            <PremiumSectionHeader
              eyebrow="Orientation Campus"
              title={recommendations.length
                ? `${recommendations.length} recommandation${recommendations.length > 1 ? "s" : ""} active${recommendations.length > 1 ? "s" : ""}`
                : "Aucune recommandation Campus publiée"}
              description="Le projet étudiant décrit le besoin. Cette section montre séparément les programmes réellement recommandés par Campus Allemagne."
              actions={
                <Link
                  href={`/admin/orientation?student=${studentId}`}
                  className={buttonClassName("secondary", "min-h-9 px-3 py-1.5 text-xs")}
                >
                  Gérer l’orientation
                </Link>
              }
            />

            {recommendations.length ? (
              <div className="mt-5 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
                {recommendations.map((recommendation) => {
                  const program = Array.isArray(recommendation.programs)
                    ? recommendation.programs[0] ?? null
                    : recommendation.programs;
                  const university = Array.isArray(program?.universities)
                    ? program?.universities[0] ?? null
                    : program?.universities;
                  return (
                    <article key={recommendation.id} className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-950">{program?.name || "Programme"}</h3>
                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {university?.name || "Université à confirmer"}
                            {university?.city ? ` · ${university.city}` : ""}
                            {program?.degree_level ? ` · ${program.degree_level}` : ""}
                          </p>
                          {recommendation.note ? (
                            <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.note}</p>
                          ) : null}
                          <AdminRecommendationApplicationAction
                            recommendationId={recommendation.id}
                            hasApplication={applicationProgramIds.has(recommendation.program_id)}
                          />
                        </div>
                        <Badge variant={recommendationTone(recommendation.status)}>
                          {recommendationStatusLabels[recommendation.status] || recommendation.status}
                        </Badge>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5">
                <PremiumEmptyState
                  eyebrow="Orientation Campus"
                  title="Aucun programme recommandé"
                  description="Complétez le projet étudiant puis ouvrez l’orientation pour publier une recommandation fondée sur les informations vérifiées."
                  compact
                />
              </div>
            )}

            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-950">Historique des projets / orientations saisis</p>
                <Badge variant="neutral">{orientationHistory.length}</Badge>
              </div>
              {orientationHistory.length ? (
                <div className="mt-3 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
                  {orientationHistory.map((item) => {
                    const itemInput = item.input && typeof item.input === "object"
                      ? item.input as Record<string, unknown>
                      : {};
                    const itemAnswers = restorePublicOrientationAnswers(itemInput.answers);
                    const itemFacts = orientationProjectFacts(itemAnswers, "fr");
                    const current = item.id === orientation?.id;
                    return (
                      <div key={item.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950">
                              {itemAnswers.targetDegree || "Projet"} · {itemAnswers.targetField || "Domaine à confirmer"}
                            </p>
                            {current ? <Badge variant="info">Orientation retenue</Badge> : null}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {itemFacts.length ? itemFacts.join(" · ") : "Orientation enregistrée"}
                          </p>
                        </div>
                        <time className="text-xs font-semibold text-slate-500" dateTime={item.created_at}>
                          {formatDate(item.created_at)}
                        </time>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Aucune orientation enregistrée.</p>
              )}
            </div>
          </section>

          <section id="documents" className="pc-panel scroll-mt-24 p-5 sm:p-6">
            <PremiumSectionHeader
              eyebrow="Pièces"
              title="Documents du dossier"
              description="Cette vue résume les derniers états enregistrés. Les décisions documentaires restent dans la file Documents."
              actions={
                <Link href="/admin/documents" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
                  Ouvrir Documents →
                </Link>
              }
            />
            <AdminDocumentRequirementsPanel
              studentId={studentId}
              requirements={documentRequirements}
              documents={documents}
            />

            <div className="mt-5">
              {documentDefinitions.map((definition) => {
                const document = latestDocument(documents, definition.category);
                const baseStatus = adminDocumentState(documents, definition.category);
                const status = !document && definition.optional ? "optional" : baseStatus;
                return (
                  <DocumentRow
                    key={definition.category}
                    title={definition.title}
                    status={status}
                    description={document?.original_filename || (definition.optional ? "Non requis à ce stade." : "Aucun fichier enregistré.")}
                    metadata={document ? `Version ${documentVersionById.get(document.id) || 1} · ajoutée le ${formatDate(document.created_at)}` : undefined}
                    note={document?.admin_comment || undefined}
                  />
                );
              })}
            </div>

            {documents.length ? (
              <details className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-950">
                  Tous les fichiers enregistrés · {documents.length}
                </summary>
                <div className="mt-3 divide-y divide-[var(--border)]">
                  {documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{document.original_filename || document.category}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Version {documentVersionById.get(document.id) || 1} · {document.category} · {formatDate(document.created_at)}
                        </p>
                      </div>
                      <Badge variant={documentStatusVariant(document.status)}>{documentStatusLabel(document.status)}</Badge>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </section>

          <section id="commercial" className="pc-panel scroll-mt-24 p-5 sm:p-6">
            <PremiumSectionHeader
              eyebrow="Proposition & paiement"
              title="Cadre commercial du dossier"
              description="Le montant affiché est lisible pour l’équipe ; les unités monétaires internes restent masquées."
            />
            <DataList
              className="mt-5"
              items={[
                { label: "Parcours proposé", value: campusRouteLabel(intake?.proposed_route_key) },
                { label: "Offre proposée", value: offer?.display_name || offerName(purchase?.offer_snapshot) || "Aucune offre arrêtée" },
                { label: "Prix proposé", value: proposedOfferAmount || purchaseAmount || "Non enregistré" },
                { label: "Paiement", value: purchaseStatusLabel(purchase?.status) },
                { label: "Accès étudiant", value: customerAccessLabel(access?.status) },
                { label: "Motif de proposition", value: intake?.proposal_reason || "Aucun motif enregistré" },
              ]}
            />
            {intake?.student_response_note ? (
              <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Dernière réponse étudiante</p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{intake.student_response_note}</p>
              </div>
            ) : null}
          </section>

          <section id="applications" className="pc-panel scroll-mt-24 p-5 sm:p-6">
            <PremiumSectionHeader
              eyebrow="Candidatures"
              title={applications.length ? `${applications.length} candidature${applications.length > 1 ? "s" : ""} rattachée${applications.length > 1 ? "s" : ""}` : "Aucune candidature enregistrée"}
              description="Le détail opérationnel et les changements de statut restent dans la file Candidatures."
              actions={
                applications.length ? (
                  <Link href={`/admin/applications?student=${studentId}`} className={buttonClassName("ghost", "min-h-8 px-2.5 py-1 text-xs")}>
                    Ouvrir Candidatures →
                  </Link>
                ) : undefined
              }
            />

            {applications.length ? (
              <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {applications.map((application) => {
                  const program = firstProgram(application);
                  const university = program?.universities;
                  const universityValue = Array.isArray(university) ? university[0] ?? null : university;
                  return (
                    <article key={application.id} className="py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {program?.name || "Programme"}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            {universityValue?.name || "Université à confirmer"}
                            {universityValue?.city ? ` · ${universityValue.city}` : ""}
                          </p>
                          {application.next_action ? (
                            <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
                              Prochaine action · {application.next_action}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Badge variant={applicationTone(application.status)}>
                            {applicationStatusLabels[application.status as KnownApplicationStatus] || application.status}
                          </Badge>
                          {application.deadline ? (
                            <Badge variant="neutral">{formatDate(application.deadline)}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5">
                <PremiumEmptyState
                  eyebrow="Candidatures"
                  title="Aucune candidature enregistrée"
                  description="Les candidatures apparaîtront ici lorsque la phase étudiante aura commencé."
                  compact
                />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-7">
          <AdminCaseOwnerPanel
            studentId={studentId}
            advisors={advisorOptions}
            assignedAdminId={assignment?.assigned_admin_id || null}
            assignedAdminName={assignedAdminName}
          />

          <section className="pc-card p-5">
            <PremiumSectionHeader eyebrow="Synthèse" title="Repères du dossier" />
            <div className="mt-4 flex flex-wrap gap-2">
              {projectFacts.length ? projectFacts.map((fact) => (
                <Badge key={fact} variant="neutral">{fact}</Badge>
              )) : <Badge variant="neutral">Projet à compléter</Badge>}
            </div>
            <div className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
              Les informations techniques, identifiants et états internes inutiles ne sont pas affichés dans cette vue.
            </div>
          </section>

          <section id="history" className="pc-card scroll-mt-24 p-5">
            <PremiumSectionHeader
              eyebrow="Historique"
              title="Activité récente"
              description="Événements utiles à la continuité du suivi."
            />
            <div className="mt-5">
              <ActivityTimeline
                items={timeline.slice(0, 12)}
                empty="Aucune activité récente n’est disponible pour ce dossier."
              />
            </div>
          </section>

          <section className="pc-soft-strip p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Principe Dossier 360°</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Cette page rassemble le contexte. Les mutations sensibles restent dans leurs écrans métier dédiés : documents, proposition, paiement et candidatures.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
