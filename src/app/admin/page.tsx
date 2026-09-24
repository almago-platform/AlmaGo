import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth/access";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  daysUntilDeadline,
  formatDeadline,
  isActiveApplication,
  isPastDeadline,
  studentHistoryDisplayMessage,
} from "@/lib/phase4";
import {
  hasVerifiedProgramSource,
  hasVerifiedUniversitySource,
  isHttpSourceUrl,
} from "@/lib/source-verification";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) redirect("/login");
  if (!isAdmin) redirect("/unauthorized");

  const [
    { count: universityCount, error: universitiesError },
    { count: programCount, error: programsError },
    { count: orientationCount, error: orientationError },
    { data: studentRoles, error: studentRolesError },
    { data: documentRows, error: documentsError },
    { data: applicationRows, error: applicationsError },
    { data: checklistRows, error: checklistError },
    { data: recentHistory, error: recentHistoryError },
    { data: universityQualityRows, error: universityQualityError },
    { data: programQualityRows, error: programQualityError },
  ] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("program_recommendations").select("id", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("user_roles").select("user_id").eq("role", "student"),
    supabase.from("documents").select("student_id,status"),
    supabase.from("applications").select("id,student_id,status,deadline,next_action,created_at"),
    supabase.from("student_checklist_items").select("student_id,status,due_date"),
    supabase
      .from("student_history")
      .select("id,student_id,event_type,message,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("universities").select("id,website_url,source_url,verified_at").eq("is_active", true),
    supabase.from("programs").select("id,application_url,source_url,verified_at,universities(is_active)").eq("is_active", true),
  ]);

  if (
    universitiesError ||
    programsError ||
    orientationError ||
    studentRolesError ||
    documentsError ||
    applicationsError ||
    checklistError ||
    universityQualityError ||
    programQualityError
  ) {
    return <AdminOverviewUnavailable />;
  }

  const historyStudentIds = [...new Set((recentHistory || []).map((event) => event.student_id))];
  const { data: historyProfiles, error: historyProfilesError } = historyStudentIds.length
    ? await supabase
        .from("profiles")
        .select("id,first_name,last_name")
        .in("id", historyStudentIds)
    : { data: [], error: null };

  const students = studentRoles || [];
  const documents = documentRows || [];
  const applications = applicationRows || [];
  const checklist = checklistRows || [];
  const orientations = orientationCount || 0;
  const catalogue = (universityCount || 0) + (programCount || 0);

  const correctionDocuments = documents.filter((document) =>
    ["rejected", "replace_required"].includes(document.status),
  );
  const correctionStudentIds = new Set(correctionDocuments.map((document) => document.student_id));
  const documentsWithAlmaGo = documents.filter((document) =>
    ["pending", "reviewed"].includes(document.status),
  );

  const activeApplications = applications.filter((application) =>
    isActiveApplication(application.status),
  );
  const overdueApplications = activeApplications
    .filter(
      (application) =>
        Boolean(application.deadline) &&
        isPastDeadline(String(application.deadline)),
    )
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  const upcomingApplications = activeApplications
    .filter((application) => {
      if (!application.deadline || isPastDeadline(application.deadline)) return false;
      const days = daysUntilDeadline(application.deadline);
      return days !== null && days >= 0 && days <= 30;
    })
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  const applicationsWithoutNextAction = activeApplications.filter(
    (application) => !application.next_action?.trim(),
  );

  const openChecklistItems = checklist.filter((item) => item.status === "todo");
  const openChecklistStudentIds = new Set(openChecklistItems.map((item) => item.student_id));

  const universitiesQuality = universityQualityRows || [];
  const programsQuality = programQualityRows || [];
  const universitySourceGaps = universitiesQuality.filter(
    (university) => !hasValidUniversitySource(university),
  ).length;
  const programSourceGaps = programsQuality.filter(
    (program) => !hasValidProgramSource(program),
  ).length;
  const universityVerificationGaps = universitiesQuality.filter(
    (university) => !hasVerifiedUniversitySource(university),
  ).length;
  const programVerificationGaps = programsQuality.filter(
    (program) => !hasVerifiedProgramSource(program),
  ).length;
  const programParentGaps = programsQuality.filter(
    (program) => !hasActiveProgramUniversity(program),
  ).length;
  const catalogueQualityIssues =
    universitiesQuality.filter(
      (university) => !hasVerifiedUniversitySource(university),
    ).length +
    programsQuality.filter(
      (program) =>
        !hasVerifiedProgramSource(program) ||
        !hasActiveProgramUniversity(program),
    ).length;
  const catalogueSourceGaps = universitySourceGaps + programSourceGaps;
  const catalogueVerificationGaps = universityVerificationGaps + programVerificationGaps;
  const universityIssues = universityQualityIssues(universitiesQuality);
  const programIssues = programQualityIssues(programsQuality);
  const universityPriorityFilter =
    universityVerificationGaps >= universitySourceGaps
      ? "missing_verification"
      : "missing_source";
  const programPriorityFilter =
    programParentGaps >= programVerificationGaps && programParentGaps >= programSourceGaps
      ? "inactive_university"
      : programVerificationGaps >= programSourceGaps
        ? "missing_verification"
        : "missing_source";
  const cataloguePriorityHref =
    universityIssues >= programIssues
      ? `/admin/universities?quality=${universityPriorityFilter}`
      : `/admin/programs?quality=${programPriorityFilter}`;

  const priority = correctionStudentIds.size > 0
    ? {
        badge: "Correction étudiant",
        title: `${correctionStudentIds.size} dossier${correctionStudentIds.size > 1 ? "s" : ""} demande${correctionStudentIds.size > 1 ? "nt" : ""} une correction documentaire`,
        description: `${correctionDocuments.length} document${correctionDocuments.length > 1 ? "s sont" : " est"} en état rejeté ou à remplacer. La responsabilité étudiant est explicite uniquement pour ces pièces.`,
        href: "/admin/students",
        action: "Ouvrir les dossiers étudiants",
        tone: "warning" as const,
      }
    : overdueApplications.length > 0
      ? {
          badge: "Échéances dépassées",
          title: `${overdueApplications.length} candidature${overdueApplications.length > 1 ? "s actives ont" : " active a"} une échéance dépassée`,
          description: `La plus ancienne échéance enregistrée est ${formatDeadline(overdueApplications[0].deadline)}. Vérifiez le dossier sans inventer le responsable lorsqu’aucune prochaine action ne le précise.`,
          href: "/admin/applications",
          action: "Vérifier les candidatures",
          tone: "warning" as const,
        }
      : documentsWithAlmaGo.length > 0
        ? {
            badge: "Documents chez AlmaGo",
            title: `${documentsWithAlmaGo.length} document${documentsWithAlmaGo.length > 1 ? "s sont" : " est"} en vérification`,
            description: "Ces pièces sont enregistrées comme pending ou reviewed. Elles constituent un travail interne AlmaGo, sans demander automatiquement une nouvelle action à l’étudiant.",
            href: "/admin/documents",
            action: "Traiter les documents",
            tone: "info" as const,
          }
        : applicationsWithoutNextAction.length > 0
          ? {
              badge: "Suivi candidature",
              title: `${applicationsWithoutNextAction.length} candidature${applicationsWithoutNextAction.length > 1 ? "s actives n’ont" : " active n’a"} pas de prochaine action enregistrée`,
              description: "Le cockpit signale l’absence d’information structurée ; il ne génère pas lui-même une action ou une responsabilité.",
              href: "/admin/applications",
              action: "Revoir les candidatures",
              tone: "info" as const,
            }
          : openChecklistStudentIds.size > 0
            ? {
                badge: "Démarches ouvertes",
                title: `${openChecklistStudentIds.size} dossier${openChecklistStudentIds.size > 1 ? "s ont" : " a"} au moins une étape ouverte`,
                description: `${openChecklistItems.length} étape${openChecklistItems.length > 1 ? "s sont" : " est"} en statut todo. Aucune responsabilité étudiant/AlmaGo n’est déduite de ce statut.`,
                href: "/admin/students",
                action: "Consulter les dossiers",
                tone: "neutral" as const,
              }
            : catalogueQualityIssues > 0
              ? {
                  badge: "Catalogue à vérifier",
                  title: `${catalogueQualityIssues} fiche${catalogueQualityIssues > 1 ? "s du catalogue demandent" : " du catalogue demande"} une vérification`,
                  description: `Le catalogue contient ${catalogueSourceGaps} source${catalogueSourceGaps > 1 ? "s" : ""} à compléter, ${catalogueVerificationGaps} date${catalogueVerificationGaps > 1 ? "s" : ""} de vérification à renseigner et ${programParentGaps} programme${programParentGaps > 1 ? "s" : ""} rattaché${programParentGaps > 1 ? "s" : ""} à une université inactive.`,
                  href: cataloguePriorityHref,
                  action: "Maintenir le catalogue",
                  tone: "warning" as const,
                }
              : {
                  badge: "Files prioritaires à jour",
                  title: "Aucun blocage prioritaire n’est visible",
                  description: "Les états structurés du cockpit ne signalent actuellement aucune correction, vérification, échéance dépassée ou lacune catalogue prioritaire.",
                  href: "/admin/students",
                  action: "Voir les dossiers étudiants",
                  tone: "neutral" as const,
                };

  const historyProfilesById = new Map(
    (historyProfiles || []).map((profile) => [profile.id, profile]),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Administration"
        title="Vue d’ensemble"
        description="Voyez les dossiers qui demandent une action ou une vérification, les dates importantes et les files de travail, uniquement à partir de données réellement enregistrées."
        actions={
          <>
            <ButtonLink href="/admin/students">Ouvrir les dossiers étudiants</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">Suivre les candidatures</ButtonLink>
          </>
        }
      />

      <section aria-label="Priorité opérationnelle" className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <Badge variant={priority.tone}>{priority.badge}</Badge>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">À traiter maintenant</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {priority.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{priority.description}</p>
            <div className="mt-6">
              <ButtonLink href={priority.href}>{priority.action}</ButtonLink>
            </div>
          </div>
        </Card>

        <Card className="bg-[#fbfbfd] shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Ordre de lecture</p>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">1</span>
              <span><strong className="text-slate-950">Dossiers étudiants</strong><br />Corrections explicites et étapes ouvertes.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">2</span>
              <span><strong className="text-slate-950">Échéances & candidatures</strong><br />Dates dépassées, proches et actions manquantes.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</span>
              <span><strong className="text-slate-950">Catalogue</strong><br />Maintenir les sources et vérifications fiables.</span>
            </li>
          </ol>
        </Card>
      </section>

      <section className="mt-9" aria-labelledby="admin-overview-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Files de travail</p>
          <h2 id="admin-overview-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            État opérationnel AlmaGo
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminSummaryCard
            href="/admin/students"
            title="Dossiers étudiants"
            value={students.length}
            detail="Profils ayant le rôle student"
            tone="neutral"
          />
          <AdminSummaryCard
            href="/admin/students"
            title="Corrections étudiant"
            value={correctionStudentIds.size}
            detail={correctionDocuments.length ? `${correctionDocuments.length} pièce${correctionDocuments.length > 1 ? "s" : ""} à corriger ou remplacer` : "Aucune correction documentaire explicite"}
            tone={correctionStudentIds.size ? "warning" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/documents"
            title="Documents chez AlmaGo"
            value={documentsWithAlmaGo.length}
            detail="Pièces pending ou reviewed"
            tone={documentsWithAlmaGo.length ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/applications"
            title="Échéances dépassées"
            value={overdueApplications.length}
            detail={overdueApplications.length ? `Plus ancienne : ${formatDeadline(overdueApplications[0].deadline)}` : "Aucune candidature active en retard"}
            tone={overdueApplications.length ? "warning" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/applications"
            title="Échéances sous 30 jours"
            value={upcomingApplications.length}
            detail={upcomingApplications.length ? `Prochaine : ${formatDeadline(upcomingApplications[0].deadline)}` : "Aucune échéance active proche"}
            tone={upcomingApplications.length ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/applications"
            title="Sans prochaine action"
            value={applicationsWithoutNextAction.length}
            detail="Candidatures actives sans next_action"
            tone={applicationsWithoutNextAction.length ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/students"
            title="Dossiers avec démarche ouverte"
            value={openChecklistStudentIds.size}
            detail={openChecklistItems.length ? `${openChecklistItems.length} étape${openChecklistItems.length > 1 ? "s" : ""} todo, sans responsable déduit` : "Aucune étape todo"}
            tone={openChecklistStudentIds.size ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href={cataloguePriorityHref}
            title="Catalogue à vérifier"
            value={catalogueQualityIssues}
            detail={
              catalogueQualityIssues
                ? `${catalogueSourceGaps} source${catalogueSourceGaps > 1 ? "s" : ""} · ${catalogueVerificationGaps} vérification${catalogueVerificationGaps > 1 ? "s" : ""} · ${programParentGaps} rattachement${programParentGaps > 1 ? "s" : ""}`
                : `${catalogue} fiches actives sans anomalie de publication visible`
            }
            tone={catalogueQualityIssues ? "warning" : "neutral"}
          />
        </div>
      </section>

      <section className="mt-9" aria-labelledby="recent-activity-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Suivi récent</p>
            <h2 id="recent-activity-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Activité récente des dossiers
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Derniers événements du journal étudiant, sans métadonnée technique ni note interne.
            </p>
          </div>
          <ButtonLink href="/admin/students" variant="secondary">Tous les dossiers</ButtonLink>
        </div>

        <Card className="shadow-none">
          {recentHistoryError || historyProfilesError ? (
            <div role="alert">
              <p className="font-semibold text-slate-950">Activité récente temporairement indisponible</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Les autres indicateurs du cockpit restent disponibles ; aucune donnée de remplacement n’est inventée.
              </p>
            </div>
          ) : recentHistory?.length ? (
            <ol className="divide-y divide-[var(--border)]">
              {recentHistory.map((event) => {
                const profile = historyProfilesById.get(event.student_id);
                const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Étudiant";
                return (
                  <li key={event.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-950">{name}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {studentHistoryDisplayMessage(event.message)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{formatActivityDate(event.created_at)}</p>
                      </div>
                      <ButtonLink href={`/admin/students/${event.student_id}`} variant="secondary" className="w-full justify-center sm:w-auto">
                        Ouvrir le dossier
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Aucune activité récente n’est enregistrée.</p>
          )}
        </Card>
      </section>

      <Card className="mt-8 border-[var(--border)] bg-white shadow-none">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Principe de travail</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Afficher les faits, pas fabriquer une urgence.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Le cockpit utilise uniquement les statuts, dates et actions réellement enregistrés. Il ne crée aucun score de risque, classement d’étudiant ou responsabilité à partir d’un texte libre.
            </p>
          </div>
          <ButtonLink href="/admin/orientation" variant="secondary">Préparer une orientation</ButtonLink>
        </div>
      </Card>
    </main>
  );
}

function AdminOverviewUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader badge="Administration" title="Vue d’ensemble" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-bold text-slate-950">Vue d’ensemble temporairement indisponible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Nous n’arrivons pas à charger les indicateurs de l’équipe pour le moment. Rien n’a été modifié.
          </p>
        </div>
        <div className="mt-5">
          <ButtonLink href="/admin">Réessayer</ButtonLink>
        </div>
      </Card>
    </main>
  );
}

function formatActivityDate(value: string | null | undefined) {
  if (!value) return "Date non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function hasValidUniversitySource(university: {
  source_url: string | null;
  website_url: string | null;
}) {
  return isHttpSourceUrl(university.source_url) || isHttpSourceUrl(university.website_url);
}

function hasValidProgramSource(program: {
  source_url: string | null;
  application_url: string | null;
}) {
  return isHttpSourceUrl(program.source_url) || isHttpSourceUrl(program.application_url);
}

function universityQualityIssues(
  universities: Array<{
    source_url: string | null;
    website_url: string | null;
    verified_at: string | null;
  }>,
) {
  return universities.filter(
    (university) => !hasVerifiedUniversitySource(university),
  ).length;
}

function hasActiveProgramUniversity(program: {
  universities?:
    | { is_active?: boolean | null }
    | { is_active?: boolean | null }[]
    | null;
}) {
  const university = Array.isArray(program.universities)
    ? program.universities[0]
    : program.universities;
  return university?.is_active === true;
}

function programQualityIssues(
  programs: Array<{
    source_url: string | null;
    application_url: string | null;
    verified_at: string | null;
    universities?:
      | { is_active?: boolean | null }
      | { is_active?: boolean | null }[]
      | null;
  }>,
) {
  return programs.filter(
    (program) =>
      !hasVerifiedProgramSource(program) ||
      !hasActiveProgramUniversity(program),
  ).length;
}

function AdminSummaryCard({
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
  return (
    <Link
      href={href}
      aria-label={`Ouvrir ${title}`}
      className="professional-hover group rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 place-items-center rounded-full text-sm transition-transform group-hover:translate-x-0.5 ${
            tone === "warning"
              ? "bg-amber-50 text-amber-800"
              : tone === "info"
                ? "bg-blue-50 text-blue-800"
                : "bg-[var(--brand-soft)] text-[var(--brand)]"
          }`}
        >
          →
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}
