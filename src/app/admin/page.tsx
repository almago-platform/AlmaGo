import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { catalogVerificationCutoff } from "@/lib/catalog-freshness";
import { isActiveApplication } from "@/lib/application-workflow";
import { isOpenAdminAction } from "@/lib/admin/people";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const supabase = await createClient();

  const now = new Date();
  const staleCutoff = catalogVerificationCutoff(now);
  const dueSoonCutoff = new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000).toISOString();
  const staleContactCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const today = now.toISOString().slice(0, 10);
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
    { count: staleLanguageCount, error: staleLanguageError },
    { count: dueLanguageCount, error: dueLanguageError },
    { count: staleFinanceCount, error: staleFinanceError },
    { count: dueFinanceCount, error: dueFinanceError },
    unreadNotificationsResult,
    accessRowsResult,
    intakeRowsResult,
    assignmentsResult,
    recentContactsResult,
    actionsResult,
    applicationRowsResult,
  ] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewed"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).in("status", ["student_question", "campus_review", "paid_pending_validation"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).eq("status", "student_question"),
    supabase.from("program_recommendations").select("id", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
    currentAdmin
      ? supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", currentAdmin.id).is("read_at", null)
      : Promise.resolve({ count: 0, error: null }),
    supabase.from("customer_access").select("user_id,status").limit(1000),
    supabase.from("student_intake_cases").select("student_id,status").limit(1000),
    supabase.from("student_case_assignments").select("student_id,assigned_admin_id").limit(1000),
    supabase.from("student_case_notes").select("student_id,kind,occurred_at").neq("kind", "internal_note").gte("occurred_at", staleContactCutoff).limit(3000),
    supabase.from("student_checklist_items").select("id,student_id,title,status,owner,due_date,deadline_kind,official_source_url,official_source_verified_at,deadline_cycle,template_id").limit(5000),
    supabase.from("applications").select("student_id,status,next_action,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle").limit(5000),
  ]);

  if (
    universitiesError || programsError || applicationsError || documentsError
    || intakeAttentionError || studentQuestionError || orientationError
    || staleLanguageError || dueLanguageError || staleFinanceError || dueFinanceError
    || unreadNotificationsResult.error || accessRowsResult.error || intakeRowsResult.error
    || assignmentsResult.error || recentContactsResult.error || actionsResult.error || applicationRowsResult.error
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
  const catalogue = (universityCount || 0) + (programCount || 0);
  const staleLanguage = staleLanguageCount || 0;
  const dueLanguage = dueLanguageCount || 0;
  const staleFinance = staleFinanceCount || 0;
  const dueFinance = dueFinanceCount || 0;
  const staleCatalogue = staleLanguage + staleFinance;
  const dueCatalogue = dueLanguage + dueFinance;

  const unreadNotifications = unreadNotificationsResult.count || 0;
  const operationalIds = new Set<string>();
  for (const item of accessRowsResult.data || []) {
    if (item.status !== "client_completed") operationalIds.add(item.user_id);
  }
  for (const item of intakeRowsResult.data || []) operationalIds.add(item.student_id);

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
  const explicitActionIds = new Set<string>();
  const humanActions = (actionsResult.data || []).filter((item) =>
    isOpenAdminAction(item.status) && item.template_id === null
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
    if (isActiveApplication(item.status) && applicationDeadlineIsTrusted(item)) {
      registerDue(item.student_id, item.deadline);
    }
  }

  const operationalList = [...operationalIds];
  const unassignedCases = operationalList.filter((id) => !assignedIds.has(id)).length;
  const staleContactCases = operationalList.filter((id) => !contactedRecentlyIds.has(id)).length;
  const missingNextActionCases = operationalList.filter((id) => !explicitActionIds.has(id)).length;
  const myCases = currentAdmin
    ? operationalList.filter((id) => assignmentByStudent.get(id) === currentAdmin.id).length
    : 0;
  const myHumanActions = currentAdmin
    ? humanCampusActions
        .filter((item) => assignmentByStudent.get(item.student_id) === currentAdmin.id)
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

  const priority = studentQuestions > 0
    ? {
        badge: "Réponse étudiant reçue",
        title: studentQuestions > 1
          ? `${studentQuestions} étudiants attendent une réponse de Campus Allemagne`
          : "1 étudiant attend une réponse de Campus Allemagne",
        description: "Une demande de discussion a été envoyée depuis l’espace étudiant. Ouvrez la file des parcours pour répondre ou ajuster la proposition.",
        href: "/admin/intake",
        action: "Répondre aux étudiants",
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
        : applications > 0
          ? {
              badge: "Candidatures actives",
              title: `${applications} candidature${applications > 1 ? "s" : ""} reste${applications > 1 ? "nt" : ""} en suivi`,
              description: "Aucun dossier Campus ne demande d’action immédiate. Vérifiez les échéances, statuts et prochaines actions des candidatures actives.",
              href: "/admin/applications",
              action: "Suivre les candidatures",
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
        title="Vue d’ensemble"
        description="Voyez d’abord ce qui demande l’attention de l’équipe, puis ouvrez directement la bonne file de travail."
        actions={
          <>
            <ButtonLink href="/admin/people">Ouvrir Personnes</ButtonLink>
            <ButtonLink href="/admin/team" variant="secondary">Voir l’équipe</ButtonLink>
            <ButtonLink href="/admin/intake" variant="secondary">Dossiers Campus</ButtonLink>
            <ButtonLink href="/admin/documents" variant="secondary">Traiter les documents</ButtonLink>
          </>
        }
      />

      <section aria-labelledby="daily-cockpit-title" className="mb-6">
        <PremiumSectionHeader
          eyebrow="Cockpit quotidien"
          title={<span id="daily-cockpit-title">Ce que l’équipe doit traiter maintenant</span>}
          description="Les premières cartes montrent la charge datée et votre portefeuille. Les suivantes signalent les dossiers qui risquent de disparaître du radar."
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
      </section>

      <section className="mb-6" aria-labelledby="my-actions-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Mon travail</p>
            <h2 id="my-actions-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">
              Mes prochaines actions
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Seulement les actions humaines des dossiers qui vous sont attribués. Les étapes système restent hors de cette liste.
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
                  <Link
                    key={item.id}
                    href={`/admin/dossiers/${item.student_id}#actions`}
                    className="group grid gap-3 px-4 py-4 transition-colors hover:bg-[var(--surface-subtle)] sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-center sm:px-5"
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

      <section aria-label="Priorité opérationnelle" className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.7fr)]">
        <Card className="pc-card relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <Badge variant={studentQuestions > 0 || documents > 0 ? "warning" : intakeAttention > 0 || applications > 0 ? "info" : staleCatalogue > 0 ? "warning" : "success"}>{priority.badge}</Badge>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">À traiter maintenant</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {priority.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{priority.description}</p>
            <div className="mt-6">
              <ButtonLink href={priority.href}>{priority.action}</ButtonLink>
            </div>
          </div>
        </Card>

        <Card className="pc-soft-strip bg-[var(--premium-cream)] shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">Ordre de traitement</p>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
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
        </Card>
      </section>

      <section className="mt-6" aria-labelledby="admin-overview-title">
        <PremiumSectionHeader
          eyebrow="Files de travail"
          title={<span id="admin-overview-title">À traiter par l’équipe</span>}
          description="Les volumes ci-dessous ouvrent directement la file concernée."
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
              title="Orientations publiées"
              value={orientations}
              detail="Recommandations actives enregistrées"
              tone="neutral"
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

      <section className="mt-6" aria-labelledby="catalogue-health-title">
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

function actionDeadlineIsTrusted(action: {
  due_date: string | null;
  deadline_kind: string | null;
  official_source_url: string | null;
  official_source_verified_at: string | null;
  deadline_cycle: string | null;
}) {
  if (!action.due_date) return false;
  if (action.deadline_kind === "internal_target" || action.deadline_kind === "source_review_date") return true;
  return Boolean(
    action.official_source_url
    && action.official_source_verified_at
    && action.deadline_cycle,
  );
}

function applicationDeadlineIsTrusted(application: {
  deadline: string | null;
  deadline_kind: string | null;
  deadline_source_url: string | null;
  deadline_verified_at: string | null;
  deadline_cycle: string | null;
}) {
  if (!application.deadline) return false;
  if (application.deadline_kind === "internal_target" || application.deadline_kind === "source_review_date") return true;
  return Boolean(
    application.deadline_source_url
    && application.deadline_verified_at
    && application.deadline_cycle,
  );
}

function formatDashboardDate(value: string) {
  const timestamp = Date.parse(value + "T12:00:00Z");
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(timestamp));
}
