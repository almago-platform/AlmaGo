import Link from "next/link";
import { ProspectQualificationReviewForm } from "@/components/admin/ProspectQualificationReviewForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkflowSection } from "@/components/admin/AdminWorkflowSection";
import { buttonClassName } from "@/components/ui/Button";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { acquisitionContextFromStoredInput } from "@/lib/phase2/acquisition";
import { customerLifecycleStatusLabel } from "@/lib/phase2/access";
import {
  evaluateSmartOrientationPriority,
  type SmartOrientationPriorityResult,
  type SmartOrientationPriorityState,
} from "@/lib/phase2/smart-orientation";
import { createClient } from "@/lib/supabase/server";

type ProspectRow = {
  id: string;
  email: string;
  user_id: string | null;
  contact_consent: boolean;
  contact_consent_at: string | null;
  contact_consent_version: string | null;
  created_at: string;
  updated_at: string;
};

type OrientationRow = {
  id: string;
  prospect_id: string;
  input: unknown;
  created_at: string;
};

type QualificationRow = {
  id: string;
  orientation_id: string;
  state: string;
  origin: string;
  created_at: string;
};

type AccessRow = {
  user_id: string;
  status: string;
};

type InterestRow = {
  prospect_id: string;
  orientation_id: string;
  source: "orientation_result" | "email_followup";
  signal_version: string;
  created_at: string;
};

type QueueItem = {
  prospect: ProspectRow;
  orientation: OrientationRow | null;
  qualification: QualificationRow | null;
  accessStatus: string | null;
  interest: InterestRow | null;
  answers: ReturnType<typeof restorePublicOrientationAnswers>;
  smartPriority: SmartOrientationPriorityResult;
  acquisition: ReturnType<typeof acquisitionContextFromStoredInput>;
};

type PageSearchParams = {
  priority?: string | string[];
  bac?: string | string[];
  contact?: string | string[];
  interest?: string | string[];
  field?: string | string[];
};

const qualificationLabels: Record<string, string> = {
  not_evaluated: "À évaluer",
  too_early: "Préparation P2.7",
  needs_information: "Informations manquantes",
  needs_verification: "À vérifier",
  ready_for_review: "Prêt pour revue",
  qualified_prospect: "Qualifié",
};


const priorityLabels: Record<SmartOrientationPriorityState, string> = {
  priority_ready: "Priorité haute",
  priority_prepare_now: "Préparer maintenant",
  priority_standard: "Priorité normale",
  priority_follow_up: "À suivre",
};

const priorityDescriptions: Record<SmartOrientationPriorityState, string> = {
  priority_ready: "Projet structuré avec un signal de moyenne supérieur à 12/20.",
  priority_prepare_now: "Bac en préparation avec un projet déjà assez structuré pour commencer.",
  priority_standard: "Projet accompagnable sans signal de priorité forte pour le moment.",
  priority_follow_up: "Projet à conserver et compléter lorsque de nouvelles informations arrivent.",
};

const priorityRank: Record<SmartOrientationPriorityState, number> = {
  priority_ready: 0,
  priority_prepare_now: 1,
  priority_standard: 2,
  priority_follow_up: 3,
};

const reasonLabels: Record<string, string> = {
  bac_obtained: "Bac obtenu",
  bac_preparing: "Bac en préparation",
  no_bac: "Sans Bac",
  average_above_12: "Moyenne > 12/20",
  average_12_or_below: "Moyenne ≤ 12/20",
  average_missing: "Moyenne à compléter",
  target_degree_defined: "Niveau visé défini",
  target_field_defined: "Domaine défini",
  project_information_missing: "Informations à compléter",
  sensitive_field_human_review: "Revue humaine renforcée",
  language_preparation_needed: "Langue à poursuivre",
  ready_for_priority_review: "Prêt pour revue prioritaire",
  prepare_now_before_bac: "Préparation utile avant le Bac",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function answersFromOrientation(orientation: OrientationRow | null) {
  if (!orientation?.input || typeof orientation.input !== "object") {
    return restorePublicOrientationAnswers(null);
  }

  const input = orientation.input as Record<string, unknown>;
  return restorePublicOrientationAnswers(input.answers);
}

function priorityBadgeClass(state: SmartOrientationPriorityState) {
  if (state === "priority_ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (state === "priority_prepare_now") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (state === "priority_standard") {
    return "border-blue-200 bg-blue-50 text-blue-900";
  }
  return "border-slate-200 bg-slate-100 text-slate-800";
}

function averageLabel(item: QueueItem) {
  const value = item.answers.generalAverage;
  if (!value) return "À compléter";

  const provenance = item.answers.averageType === "official"
    ? "officielle"
    : item.answers.averageType === "current_estimate"
      ? "actuelle / estimée"
      : "non précisée";

  return `${value}/20 · ${provenance}`;
}

export const dynamic = "force-dynamic";

export default async function AdminProspectsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const priorityFilter = firstParam(params.priority);
  const bacFilter = firstParam(params.bac);
  const contactFilter = firstParam(params.contact);
  const interestFilter = firstParam(params.interest);
  const fieldFilter = firstParam(params.field);

  const supabase = await createClient();

  const { data: prospectData, error: prospectError } = await supabase
    .from("prospects")
    .select("id,email,user_id,contact_consent,contact_consent_at,contact_consent_version,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (prospectError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Prospects"
          title="À traiter en priorité"
          description="La file Smart Orientation est temporairement indisponible."
        />
      </main>
    );
  }

  const prospects = (prospectData ?? []) as ProspectRow[];
  const prospectIds = prospects.map((prospect) => prospect.id);
  const userIds = prospects.flatMap((prospect) => prospect.user_id ? [prospect.user_id] : []);

  let orientations: OrientationRow[] = [];
  if (prospectIds.length) {
    const { data } = await supabase
      .from("orientations")
      .select("id,prospect_id,input,created_at")
      .in("prospect_id", prospectIds)
      .order("created_at", { ascending: false })
      .limit(500);
    orientations = (data ?? []) as OrientationRow[];
  }

  const latestOrientationByProspect = new Map<string, OrientationRow>();
  for (const orientation of orientations) {
    if (!latestOrientationByProspect.has(orientation.prospect_id)) {
      latestOrientationByProspect.set(orientation.prospect_id, orientation);
    }
  }

  const currentOrientationIds = [...latestOrientationByProspect.values()].map(
    (orientation) => orientation.id,
  );

  let qualifications: QualificationRow[] = [];
  if (currentOrientationIds.length) {
    const { data } = await supabase
      .from("prospect_qualifications")
      .select("id,orientation_id,state,origin,created_at")
      .in("orientation_id", currentOrientationIds)
      .order("created_at", { ascending: false })
      .limit(500);
    qualifications = (data ?? []) as QualificationRow[];
  }

  const latestQualificationByOrientation = new Map<string, QualificationRow>();
  for (const qualification of qualifications) {
    if (!latestQualificationByOrientation.has(qualification.orientation_id)) {
      latestQualificationByOrientation.set(qualification.orientation_id, qualification);
    }
  }

  let accessRows: AccessRow[] = [];
  if (userIds.length) {
    const { data } = await supabase
      .from("customer_access")
      .select("user_id,status")
      .in("user_id", userIds);
    accessRows = (data ?? []) as AccessRow[];
  }
  const accessByUser = new Map(accessRows.map((row) => [row.user_id, row.status]));

  let interestRows: InterestRow[] = [];
  if (prospectIds.length) {
    const { data } = await supabase
      .from("free_validation_interest_signals")
      .select("prospect_id,orientation_id,source,signal_version,created_at")
      .in("prospect_id", prospectIds)
      .order("created_at", { ascending: false })
      .limit(500);
    interestRows = (data ?? []) as InterestRow[];
  }

  const latestInterestByProspect = new Map<string, InterestRow>();
  for (const interest of interestRows) {
    if (!latestInterestByProspect.has(interest.prospect_id)) {
      latestInterestByProspect.set(interest.prospect_id, interest);
    }
  }

  const queue: QueueItem[] = prospects
    .map((prospect) => {
      const orientation = latestOrientationByProspect.get(prospect.id) ?? null;
      const answers = answersFromOrientation(orientation);
      const qualification = orientation
        ? latestQualificationByOrientation.get(orientation.id) ?? null
        : null;

      return {
        prospect,
        orientation,
        qualification,
        accessStatus: prospect.user_id
          ? accessByUser.get(prospect.user_id) ?? null
          : null,
        interest: latestInterestByProspect.get(prospect.id) ?? null,
        answers,
        smartPriority: evaluateSmartOrientationPriority(answers),
        acquisition: orientation
          ? acquisitionContextFromStoredInput(orientation.input)
          : null,
      };
    })
    .sort((a, b) => {
      const priorityDifference =
        priorityRank[a.smartPriority.state] - priorityRank[b.smartPriority.state];
      if (priorityDifference !== 0) return priorityDifference;

      const aDate = new Date(a.prospect.updated_at).getTime();
      const bDate = new Date(b.prospect.updated_at).getTime();
      return bDate - aDate;
    });

  const availableFields = [...new Set(
    queue.map((item) => item.answers.targetField).filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, "fr"));

  const filteredQueue = queue.filter((item) => {
    if (priorityFilter && item.smartPriority.state !== priorityFilter) return false;
    if (bacFilter && item.answers.bacStatus !== bacFilter) return false;
    if (contactFilter === "yes" && !item.prospect.contact_consent) return false;
    if (contactFilter === "no" && item.prospect.contact_consent) return false;
    if (interestFilter === "yes" && !item.interest) return false;
    if (interestFilter === "no" && item.interest) return false;
    if (fieldFilter && item.answers.targetField !== fieldFilter) return false;
    return true;
  });

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const urgentCount = queue.filter((item) =>
    item.smartPriority.state === "priority_ready"
    || item.smartPriority.state === "priority_prepare_now"
  ).length;
  const contactableCount = queue.filter((item) => item.prospect.contact_consent).length;
  const interestedCount = queue.filter((item) => item.interest).length;
  const linkedAccountCount = queue.filter((item) => item.prospect.user_id).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Prospects"
        title="Prospects"
        description="Priorisez les demandes, vérifiez le consentement et qualifiez chaque projet. Ces signaux aident à décider ; ils ne décident pas automatiquement si le marché est validé."
      />

      <section className="mb-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5" aria-label="Résumé de la file prospects">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">File prospects</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
              {urgentCount
                ? `${urgentCount} prospect${urgentCount > 1 ? "s" : ""} à traiter en priorité`
                : "Aucune priorité forte détectée"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les indicateurs décrivent les signaux réellement enregistrés. La décision de qualification reste humaine.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] grid-cols-2 sm:grid-cols-5 xl:min-w-[44rem]">
            <ProspectMetric label="prospects sauvegardés" value={queue.length} />
            <ProspectMetric label="Contact autorisé" value={contactableCount} />
            <ProspectMetric label="Veulent continuer" value={interestedCount} tone="brand" />
            <ProspectMetric label="Comptes gratuits liés" value={linkedAccountCount} />
            <ProspectMetric label="Priorité haute / maintenant" value={urgentCount} tone={urgentCount ? "warning" : "neutral"} />
          </div>
        </div>
      </section>

      <form
        method="get"
        className="mb-6 grid gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 md:grid-cols-3 xl:grid-cols-6"
      >
        <label className="text-sm font-semibold text-slate-800">
          Priorité
          <select name="priority" defaultValue={priorityFilter} className="field">
            <option value="">Toutes</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Bac
          <select name="bac" defaultValue={bacFilter} className="field">
            <option value="">Tous</option>
            <option value="obtained">Obtenu</option>
            <option value="preparing">En préparation</option>
            <option value="no_bac">Sans Bac</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Contact autorisé
          <select name="contact" defaultValue={contactFilter} className="field">
            <option value="">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Veut continuer
          <select name="interest" defaultValue={interestFilter} className="field">
            <option value="">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Domaine
          <select name="field" defaultValue={fieldFilter} className="field">
            <option value="">Tous</option>
            {availableFields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Filtrer
          </button>
          <Link
            href="/admin/prospects"
            className="rounded-[var(--radius-control)] border border-[var(--border-strong)] px-3 py-2.5 text-sm font-semibold"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      {!filteredQueue.length ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Aucun prospect dans cette vue</h2>
          <p className="mt-2 text-sm text-slate-600">
            Modifiez les filtres ou attendez de nouvelles orientations. Aucun candidat n’est supprimé par Smart Orientation.
          </p>
        </section>
      ) : (
        <div className="grid gap-2">
          {filteredQueue.map((item) => {
            const {
              prospect,
              orientation,
              qualification,
              accessStatus,
              interest,
              answers,
              smartPriority,
              acquisition,
            } = item;
            const canReview =
              qualification?.state === "ready_for_review"
              && accessStatus === "prospect_account";

            return (
              <details key={prospect.id} className="group overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white open:border-[var(--brand-border)]">
                <summary className="grid cursor-pointer list-item gap-3 p-4 hover:bg-[var(--surface-subtle)] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950"><bdi dir="auto">{prospect.email}</bdi></span>
                    <span className="mt-1 block text-xs text-slate-600">{answers.targetDegree || "Diplôme à préciser"} · {answers.targetField || "Domaine à compléter"}</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityBadgeClass(smartPriority.state)}`}>{priorityLabels[smartPriority.state]}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {qualification ? qualificationLabels[qualification.state] ?? qualification.state : "Qualification non persistée"}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-[var(--brand-strong)]">Examiner →</span>
                </summary>
              <article className="border-t border-[var(--border)] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">
                      <bdi dir="auto">{prospect.email}</bdi>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Mis à jour le <bdi dir="auto">{dateFormatter.format(new Date(prospect.updated_at))}</bdi>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityBadgeClass(smartPriority.state)}`}
                    >
                      {priorityLabels[smartPriority.state]}
                    </span>
                    {interest ? (
                      <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--foreground)]">
                        Veut continuer
                      </span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {qualification
                        ? qualificationLabels[qualification.state] ?? qualification.state
                        : "Qualification non persistée"}
                    </span>
                    {prospect.user_id ? (
                      <Link
                        href={`/admin/dossiers/${prospect.user_id}`}
                        className={buttonClassName("ghost", "min-h-8 px-2.5 py-1 text-xs")}
                      >
                        Dossier 360°
                      </Link>
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {priorityDescriptions[smartPriority.state]}
                </p>

                <div className="mt-4 space-y-3">
                  <AdminWorkflowSection
                    step="A"
                    title="Projet étudiant"
                    description="Diplôme, moyenne, niveau visé, domaine et signaux utilisés pour organiser la file."
                    defaultOpen
                  >
                    <dl className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
                      <ProspectFact
                        label="Bac"
                        value={`${answers.bacStatus === "obtained"
                          ? "Obtenu"
                          : answers.bacStatus === "preparing"
                            ? "En préparation"
                            : answers.bacStatus === "no_bac"
                              ? "Sans Bac"
                              : "À compléter"}${answers.bacYear ? ` · ${answers.bacYear}` : ""}`}
                      />
                      <ProspectFact label="Moyenne" value={averageLabel(item)} />
                      <ProspectFact label="Niveau visé" value={answers.targetDegree || "À compléter"} />
                      <ProspectFact label="Domaine" value={answers.targetField || "À compléter"} />
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Raisons de priorité">
                      {smartPriority.reasonCodes.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {reasonLabels[reason] ?? reason}
                        </span>
                      ))}
                    </div>

                    {smartPriority.requiresHumanReview ? (
                      <div className="mt-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                        <strong>Revue humaine renforcée.</strong> Ce domaine nécessite une vérification des conditions académiques officielles avant toute conclusion sur les possibilités réelles.
                      </div>
                    ) : null}
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="B"
                    title="Demande et contact"
                    description="Vérifiez le consentement, le signal d’intérêt et l’état du compte avant toute action commerciale."
                    defaultOpen={Boolean(interest) || prospect.contact_consent}
                    tone={interest ? "brand" : "neutral"}
                  >
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <ProspectInfo
                        label="Contact"
                        value={prospect.contact_consent
                          ? "Autorisé explicitement"
                          : "Non autorisé — ne pas contacter à des fins commerciales"}
                      />
                      <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                        <p className="font-semibold text-slate-900">Demande réelle</p>
                        {interest ? (
                          <>
                            <p className="mt-1 font-semibold text-slate-900">Veut continuer avec Campus Allemagne</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {interest.source === "orientation_result" ? "Depuis le résultat d’orientation" : "Depuis un suivi e-mail"} · <bdi dir="auto">{dateFormatter.format(new Date(interest.created_at))}</bdi>
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-slate-700">Aucun signal explicite enregistré</p>
                        )}
                      </div>
                      <ProspectInfo label="Compte / accès" value={customerLifecycleStatusLabel(accessStatus)} />
                    </div>

                    {acquisition ? (
                      <p className="mt-4 text-xs font-semibold text-slate-600">
                        Acquisition : <bdi dir="auto">{acquisition.kind} · {acquisition.sourceId}</bdi>
                      </p>
                    ) : null}
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="C"
                    title="Orientation et qualification"
                    description="Consultez la dernière orientation et l’état de qualification persistant."
                    defaultOpen={Boolean(orientation)}
                  >
                    {!orientation ? (
                      <p className="text-sm text-slate-600">Aucune orientation enregistrée.</p>
                    ) : qualification ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <ProspectInfo
                          label="Dernière orientation"
                          value={dateFormatter.format(new Date(orientation.created_at))}
                        />
                        <ProspectInfo
                          label="Qualification"
                          value={qualificationLabels[qualification.state] ?? qualification.state}
                        />
                        <ProspectInfo
                          label="Origine"
                          value={qualification.origin === "automatic" ? "Automatique" : "Revue humaine"}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Cette orientation n’a pas encore de qualification P2.7 persistée.
                      </p>
                    )}
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="D"
                    title="Décision de qualification"
                    description="La revue humaine ne devient disponible que lorsque les conditions de qualification et d’accès le permettent."
                    defaultOpen={canReview}
                    tone={canReview ? "brand" : "neutral"}
                  >
                    {canReview && orientation && qualification ? (
                      <ProspectQualificationReviewForm
                        orientationId={orientation.id}
                        qualificationId={qualification.id}
                      />
                    ) : (
                      <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">Aucune décision manuelle disponible maintenant.</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Le prospect doit atteindre l’état « Prêt pour revue » et conserver un compte prospect avant qu’une revue de qualification puisse être enregistrée ici.
                        </p>
                      </div>
                    )}
                  </AdminWorkflowSection>
                </div>
              </article>
              </details>
            );
          })}
        </div>
      )}
    </main>
  );
}

function ProspectMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "warning" | "brand" | "neutral";
}) {
  return (
    <div className={`bg-white p-3 ${tone === "warning" && value ? "bg-amber-50/70" : tone === "brand" && value ? "bg-[var(--brand-soft)]/55" : ""}`}>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function ProspectFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ProspectInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}

