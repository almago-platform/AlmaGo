import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import {
  CANDIDATE_JOURNEY,
  OFFICIAL_PROCESS_LINKS,
  TUNISIA_GERMANY_VISA_TRACKS,
  VISA_FINANCIAL_REFERENCE_YEAR,
  VISA_SOURCE_REVIEWED,
  firstKnownMilestone,
  recommendedOperatorAction,
  sourceIsValidForYear,
  type CaseOperationalEvidence,
} from "@/lib/admin/candidate-journey";
import { createClient } from "@/lib/supabase/server";
import { isVisaStatus, visaStatusLabels } from "@/lib/admin/visa-workflow";
import {
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  campusTodayDateKey,
} from "@/lib/admin/application-risk";

export const dynamic = "force-dynamic";

function displayName(profile: { first_name: string | null; last_name: string | null; full_name: string | null } | undefined, email: string) {
  const full = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  return full || profile?.full_name?.trim() || email.split("@")[0] || "Candidat";
}

type CaseView = {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  route: string | null;
  customerStatus: string | null;
  visaStatus: string | null;
  evidence: CaseOperationalEvidence;
  updatedAt: string;
};

function caseOrder(item: CaseView) {
  if (item.evidence.officialDeadlineRisk === "overdue") return 0;
  if (item.evidence.officialDeadlineRisk === "within_7") return 1;
  if (item.evidence.unreadStudentMessages > 0) return 2;
  if (item.evidence.pendingDocuments > 0) return 3;
  if (item.evidence.intakeStatus === "paid_pending_validation") return 4;
  if (item.evidence.intakeStatus === "student_question") return 5;
  if (item.evidence.applications > 0) return 6;
  if (item.evidence.currentProcedures > 0) return 7;
  if (item.evidence.intakeStatus) return 8;
  if (item.evidence.orientationCount > 0) return 9;
  return 10;
}

export default async function AdminCandidateJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q || "").trim().toLocaleLowerCase("fr").slice(0, 100);
  const supabase = await createClient();
  const [
    prospectsResult,
    orientationsResult,
    intakeResult,
    accessResult,
    profilesResult,
    recommendationsResult,
    applicationsResult,
    proceduresResult,
    documentsResult,
    messagesResult,
    visaResult,
  ] = await Promise.all([
    supabase.from("prospects").select("id,user_id,email,updated_at").order("updated_at", { ascending: false }).limit(250),
    supabase.from("orientations").select("prospect_id").limit(3000),
    supabase.from("student_intake_cases").select("student_id,status,proposed_route_key,updated_at").limit(500),
    supabase.from("customer_access").select("user_id,status").limit(1000),
    supabase.from("profiles").select("id,first_name,last_name,full_name").limit(1000),
    supabase.from("program_recommendations").select("student_id").eq("is_archived", false).limit(1000),
    supabase.from("applications").select("student_id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle").limit(1000),
    supabase.from("student_procedures").select("student_id").eq("is_current", true).limit(1000),
    supabase.from("documents").select("student_id,status").in("status", ["pending", "reviewed"]).limit(3000),
    supabase.from("student_dossier_messages").select("student_id").eq("sender_role", "student").is("admin_read_at", null).limit(3000),
    supabase.from("visa_cases").select("student_id,status").limit(1000),
  ]);

  const errors = [
    prospectsResult.error,
    orientationsResult.error,
    intakeResult.error,
    accessResult.error,
    profilesResult.error,
    recommendationsResult.error,
    applicationsResult.error,
    proceduresResult.error,
    documentsResult.error,
    messagesResult.error,
  ];
  if (errors.some(Boolean)) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminPageHeader section="Opérations" title="Accompagnement de A à Z" description="Les données de suivi sont temporairement indisponibles." />
        <AdminLoadError
          title="Impossible de charger le suivi candidat"
          description="Aucune donnée n’a été modifiée. Réessayez avant de prendre une décision."
          retryHref="/admin/accompagnement"
        />
      </main>
    );
  }

  const countBy = (rows: Array<{ student_id: string }> | null) => {
    const result = new Map<string, number>();
    for (const row of rows || []) result.set(row.student_id, (result.get(row.student_id) || 0) + 1);
    return result;
  };
  const orientationCountByProspect = new Map<string, number>();
  for (const row of orientationsResult.data || []) {
    orientationCountByProspect.set(row.prospect_id, (orientationCountByProspect.get(row.prospect_id) || 0) + 1);
  }
  const recommendationCount = countBy(recommendationsResult.data || []);
  const applicationCount = countBy(applicationsResult.data || []);
  const today = campusTodayDateKey();
  const officialRiskByStudent = new Map<string, "overdue" | "within_7">();
  for (const application of applicationsResult.data || []) {
    if (!applicationDateIsTrusted(application)) continue;
    const urgency = applicationOfficialDeadlineUrgency(
      { status: application.status, deadline: application.deadline, deadline_kind: application.deadline_kind, deadlineTrusted: true },
      today,
    );
    if (!urgency || !["overdue", "d3", "d7"].includes(urgency.kind)) continue;
    if (urgency.kind === "overdue") {
      officialRiskByStudent.set(application.student_id, "overdue");
    } else if (!officialRiskByStudent.has(application.student_id)) {
      officialRiskByStudent.set(application.student_id, "within_7");
    }
  }
  const procedureCount = countBy(proceduresResult.data || []);
  const pendingDocumentCount = countBy(documentsResult.data || []);
  const unreadMessageCount = countBy(messagesResult.data || []);
  const profileById = new Map((profilesResult.data || []).map((p) => [p.id, p]));
  const intakeById = new Map((intakeResult.data || []).map((c) => [c.student_id, c]));
  const accessById = new Map((accessResult.data || []).map((a) => [a.user_id, a.status]));
  const visaStatusById = new Map((visaResult.data || []).map((v) => [v.student_id, v.status]));

  const seenUsers = new Set<string>();
  const candidates: CaseView[] = [];
  for (const prospect of prospectsResult.data || []) {
    if (prospect.email.startsWith("erased-") || prospect.email.endsWith("@invalid.local")) continue;
    const userId = prospect.user_id;
    if (userId && seenUsers.has(userId)) continue;
    if (userId) seenUsers.add(userId);
    const intake = userId ? intakeById.get(userId) : undefined;
    candidates.push({
      key: prospect.id,
      userId,
      name: displayName(userId ? profileById.get(userId) : undefined, prospect.email),
      email: prospect.email,
      route: intake?.proposed_route_key || null,
      customerStatus: userId ? accessById.get(userId) || null : null,
      visaStatus: userId ? visaStatusById.get(userId) || null : null,
      evidence: {
        hasAccount: Boolean(userId),
        orientationCount: orientationCountByProspect.get(prospect.id) || 0,
        intakeStatus: intake?.status || null,
        recommendations: userId ? recommendationCount.get(userId) || 0 : 0,
        applications: userId ? applicationCount.get(userId) || 0 : 0,
        currentProcedures: userId ? procedureCount.get(userId) || 0 : 0,
        pendingDocuments: userId ? pendingDocumentCount.get(userId) || 0 : 0,
        unreadStudentMessages: userId ? unreadMessageCount.get(userId) || 0 : 0,
        officialDeadlineRisk: userId ? officialRiskByStudent.get(userId) || null : null,
      },
      updatedAt: intake?.updated_at || prospect.updated_at,
    });
  }
  for (const intake of intakeResult.data || []) {
    if (seenUsers.has(intake.student_id)) continue;
    const profile = profileById.get(intake.student_id);
    candidates.push({
      key: intake.student_id,
      userId: intake.student_id,
      name: displayName(profile, "Candidat"),
      email: "",
      route: intake.proposed_route_key,
      customerStatus: accessById.get(intake.student_id) || null,
      visaStatus: visaStatusById.get(intake.student_id) || null,
      evidence: {
        hasAccount: true,
        orientationCount: 0,
        intakeStatus: intake.status,
        recommendations: recommendationCount.get(intake.student_id) || 0,
        applications: applicationCount.get(intake.student_id) || 0,
        currentProcedures: procedureCount.get(intake.student_id) || 0,
        pendingDocuments: pendingDocumentCount.get(intake.student_id) || 0,
        unreadStudentMessages: unreadMessageCount.get(intake.student_id) || 0,
        officialDeadlineRisk: officialRiskByStudent.get(intake.student_id) || null,
      },
      updatedAt: intake.updated_at,
    });
  }

  const filtered = candidates
    .filter((item) => !search || [item.name, item.email, item.route || ""].some((part) => part.toLocaleLowerCase("fr").includes(search)))
    .sort((a, b) => caseOrder(a) - caseOrder(b) || b.updatedAt.localeCompare(a.updatedAt));
  const queueCount = candidates.filter((item) =>
    Boolean(item.evidence.officialDeadlineRisk) || item.evidence.unreadStudentMessages > 0 ||
    item.evidence.pendingDocuments > 0 ||
    item.evidence.intakeStatus === "student_question" ||
    item.evidence.intakeStatus === "paid_pending_validation"
  ).length;
  const phaseCounts = new Map(CANDIDATE_JOURNEY.map((step) => [step.id, candidates.filter((item) => firstKnownMilestone(item.evidence, item.visaStatus) === step.id).length]));
  const year = Number(campusTodayDateKey().slice(0, 4));
  const referenceCurrent = sourceIsValidForYear(VISA_FINANCIAL_REFERENCE_YEAR, year);

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-6 px-4 py-6 sm:px-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Accompagnement A à Z"
        description="Une seule vue du premier contact au suivi d’arrivée. Les étapes correspondent à des données enregistrées, jamais à des admissions ou visas supposés."
        actions={
          <>
            <Link href="/admin/prospects" className={buttonClassName("secondary", "px-4")}>Prospects</Link>
            <Link href="/admin/intake" className={buttonClassName("secondary", "px-4")}>Pré-dossiers</Link>
            <Link href="/admin/people" className={buttonClassName("primary", "px-4")}>Dossiers 360°</Link>
          </>
        }
      />

      <nav aria-label="Étapes de l’accompagnement" className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {CANDIDATE_JOURNEY.map((step, index) => (
          <Link key={step.id} href={step.where} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-3 transition-colors hover:border-[var(--brand-border)]">
            <span className="flex items-center justify-between gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-strong)]">{index + 1}</span>
              <span className="text-lg font-bold tabular-nums text-slate-900">{phaseCounts.get(step.id) || 0}</span>
            </span>
            <span className="mt-2 block text-xs font-bold text-slate-950">{step.title.replace(/^\d+\. /, "")}</span>
            <span className="mt-1 block text-[11px] text-slate-600">Repère de dossier, non preuve</span>
          </Link>
        ))}
      </nav>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950">Ma file de prise en charge</h2>
        <p className="mt-2 text-sm text-slate-600">
          {candidates.length} prospect{candidates.length > 1 ? "s" : ""} ou candidat{candidates.length > 1 ? "s" : ""} repéré{candidates.length > 1 ? "s" : ""} ·
          {" "}{queueCount} avec réponse, document ou validation à traiter en priorité.
          Les deadlines urgentes ne sont signalées qu’après validation de leur source et de leur cycle ; les phases ne prouvent ni admission ni visa.
        </p>
        {(prospectsResult.data || []).length >= 250 ? (
          <p className="mt-2 text-xs font-semibold text-amber-800">Affichage limité aux 250 derniers prospects : utilisez les files métier pour retrouver les enregistrements plus anciens.</p>
        ) : null}
        <form method="get" className="mt-4 flex flex-wrap gap-2">
          <label className="min-w-0 flex-1 text-sm font-semibold text-slate-700">
            Rechercher un candidat
            <input name="q" type="search" className="field mt-2 bg-white" defaultValue={params.q || ""} placeholder="Nom, e-mail ou parcours" />
          </label>
          <button type="submit" className={buttonClassName("secondary", "self-end px-4")}>Rechercher</button>
        </form>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {filtered.length === 0 ? (
            <p className="py-4 text-sm text-slate-600">Aucun dossier correspondant dans la sélection chargée.</p>
          ) : filtered.map((item) => {
            const phase = firstKnownMilestone(item.evidence, item.visaStatus);
            const phaseLabel = CANDIDATE_JOURNEY.find((step) => step.id === phase)?.title || "Orientation";
            const href = item.userId ? `/admin/dossiers/${item.userId}` : "/admin/prospects";
            return (
              <details key={item.key} className="group border-b border-[var(--border)] last:border-b-0">
                <summary className="grid cursor-pointer list-item gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">{item.name}</span>
                    <span className="mt-1 block truncate text-xs text-slate-600">{phaseLabel}</span>
                  </span>
                  <span className="text-xs leading-5 text-slate-700">{recommendedOperatorAction(item.evidence, item.visaStatus)}</span>
                  <span className="text-xs font-bold text-[var(--brand-strong)]">Ouvrir →</span>
                </summary>
              <article className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={item.customerStatus === "client_completed" ? "neutral" : item.evidence.unreadStudentMessages || item.evidence.pendingDocuments ? "warning" : "info"}>
                      {item.customerStatus === "client_completed" ? "Accompagnement terminé" : item.customerStatus === "client_active" ? "Client actif" : item.userId ? "Compte lié" : "Prospect sans compte lié"}
                    </Badge>
                    {item.evidence.officialDeadlineRisk ? <Badge variant="error">{item.evidence.officialDeadlineRisk === "overdue" ? "Deadline officielle dépassée" : "Deadline officielle sous 7 jours"}</Badge> : null}
                    {item.evidence.unreadStudentMessages ? <Badge variant="warning">{item.evidence.unreadStudentMessages} message(s) non lu(s)</Badge> : null}
                    {item.evidence.pendingDocuments ? <Badge variant="warning">{item.evidence.pendingDocuments} document(s) à revoir</Badge> : null}
                    {item.visaStatus && isVisaStatus(item.visaStatus) ? <Badge variant={item.visaStatus === "approved" ? "success" : "info"}>{visaStatusLabels[item.visaStatus]}</Badge> : null}
                  </div>
                  <h3 className="mt-2 break-words text-base font-semibold text-slate-950">{item.name}</h3>
                  {item.email ? <p className="break-words text-xs text-slate-500"><bdi dir="auto">{item.email}</bdi></p> : null}
                  <p className="mt-1 text-xs text-slate-500">Repère : {phaseLabel} · {item.evidence.orientationCount} orientation(s) · {item.evidence.recommendations} recommandation(s) · {item.evidence.applications} candidature(s)</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">À faire : {recommendedOperatorAction(item.evidence, item.visaStatus)}</p>
                  <p className="mt-1 text-xs text-amber-800">{visaResult.error ? "Visa : suivi non déployé ou indisponible." : item.visaStatus && isVisaStatus(item.visaStatus) ? "Visa : état interne historisé et soumis à preuve documentaire." : "Visa : aucune étape officiellement justifiée enregistrée."}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link href={href} className={buttonClassName("secondary", "px-4")}>
                    {item.userId ? "Dossier 360°" : "Ouvrir Prospects"} →
                  </Link>
                  {item.userId ? <Link href={`/admin/visa/${item.userId}`} className={buttonClassName("secondary", "px-4")}>Suivi visa →</Link> : null}
                </div>
              </article>
              </details>
            );
          })}
        </div>
      </section>

      <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5" aria-label="Méthode complète de traitement">
        <summary className="cursor-pointer text-sm font-bold text-slate-950">Consulter les six procédures détaillées et les preuves attendues</summary>
      <section className="mt-4" aria-labelledby="journey-steps">
        <h2 id="journey-steps" className="text-xl font-semibold text-slate-950">Ma méthode de traitement</h2>
        <p className="mt-2 text-sm text-slate-600">Chaque étape possède un responsable et une preuve de clôture. Les données et décisions officielles restent dans les modules métier.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CANDIDATE_JOURNEY.map((step) => (
            <article key={step.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5">
              <Badge variant="neutral">{step.owner}</Badge>
              <h3 className="mt-3 text-base font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step.instruction}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600"><strong>Preuve attendue : </strong>{step.completionEvidence}</p>
              <Link href={step.where} className="mt-4 inline-block text-sm font-bold text-[var(--brand-strong)] hover:underline">Ouvrir la file →</Link>
            </article>
          ))}
        </div>
      </section>
      </details>

      <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5" aria-label="Référentiel visa depuis la Tunisie">
        <summary className="cursor-pointer text-sm font-bold text-slate-950">Référentiel visa et checklists officielles · consultation experte</summary>
      <section className="mt-4" aria-labelledby="visa-guide-title">
        <h2 id="visa-guide-title" className="text-xl font-semibold text-slate-950">Visa : référentiel vérifié pour une demande depuis la Tunisie</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Ces trois voies sont distinctes et ne sont pas attribuées automatiquement à un candidat.
          Contrôler d’abord nationalité, résidence habituelle, motif juridique, diplôme et représentation compétente.
          Sources relues le {VISA_SOURCE_REVIEWED}.
        </p>
        {!referenceCurrent ? (
          <p role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
            Les références financières portent sur {VISA_FINANCIAL_REFERENCE_YEAR}. Nouvelle année : revalider les montants avant de les utiliser dans un dossier.
          </p>
        ) : null}
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {TUNISIA_GERMANY_VISA_TRACKS.map((track) => (
            <article key={track.key} className="min-w-0 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <h3 className="font-semibold text-slate-950">{track.title}</h3>
              <p className="mt-2 text-xs font-medium text-slate-600">{track.purpose}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{referenceCurrent ? track.financialNote : "Financement : montant à revalider pour l’année en cours."}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600">{track.scope}</p>
              <h4 className="mt-4 text-sm font-semibold text-slate-950">Preuves à contrôler</h4>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-700">
                {track.evidence.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <h4 className="mt-4 text-sm font-semibold text-slate-950">Points d’attention</h4>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-700">
                {track.extraChecks.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <a href={track.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-[var(--brand-strong)] underline">
                Vérifier la checklist officielle ↗
              </a>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-slate-950">Règles de dépôt et d’échéances</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            L’ambassade à Tunis annonce le dépôt numérique possible pour études/préparation via le portail consulaire.
            Une comparution personnelle demeure nécessaire pour la biométrie et les originaux.
            Les dates de candidature sont celles du programme concerné ; uni-assist recommande une marge
            d’au moins huit semaines, qui n’est PAS une nouvelle deadline officielle.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
            <a href={OFFICIAL_PROCESS_LINKS.tunisVisa} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-strong)] underline">Ambassade de Tunis ↗</a>
            <a href={OFFICIAL_PROCESS_LINKS.consularPortal} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-strong)] underline">Portail consulaire ↗</a>
            <a href={OFFICIAL_PROCESS_LINKS.uniAssistDeadlines} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-strong)] underline">Délais uni-assist ↗</a>
            <a href={OFFICIAL_PROCESS_LINKS.daadAdmission} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-strong)] underline">Admissibilité DAAD ↗</a>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-600">
          AlmaGo peut préparer, suivre et vérifier le dossier avec consentement. L’étudiant reste demandeur,
          l’université décide de l’admission et l’autorité consulaire décide du visa. Les convocations,
          traitements et décisions ne sont ni générés ni garantis par ce tableau.
        </p>
      </section>
      </details>
    </main>
  );
}
