import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import {
  countDocumentsNeedingStudentAction,
  countDocumentsWithAlmaGo,
  selectNextChecklistDueDate,
  selectNextKnownDeadline,
  selectRecordedNextAction,
  summarizeChecklist,
} from "@/lib/admin/student-case";
import {
  applicationEventDisplayMessage,
  applicationStatusLabels,
  formatDeadline,
  isActiveApplication,
  isPastDeadline,
} from "@/lib/phase4";
import { isPublishableProgram } from "@/lib/source-verification";

type Profile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  nationality?: string | null;
  current_city?: string | null;
  last_diploma?: string | null;
  bac_track?: string | null;
  bac_year?: number | null;
  general_average?: number | null;
  institution?: string | null;
  current_university_studies?: string | null;
  current_field?: string | null;
  university_semesters?: number | null;
  german_level?: string | null;
  english_level?: string | null;
  french_level?: string | null;
  target_degree?: string | null;
  target_field?: string | null;
  study_language?: string | null;
  target_intake?: string | null;
  preferred_cities?: string[] | null;
  budget_range?: string | null;
  onboarding_completed?: boolean | null;
};

type DocumentItem = {
  id: string;
  category?: string | null;
  original_filename?: string | null;
  status: string;
  admin_comment?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
};

type ChecklistItem = {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: string;
  completed_at?: string | null;
  created_at?: string | null;
};

type University = {
  name?: string | null;
  city?: string | null;
  is_active?: boolean | null;
};

type RecommendationProgram = {
  id?: string;
  name?: string | null;
  degree_level?: string | null;
  field?: string | null;
  source_url?: string | null;
  application_url?: string | null;
  verified_at?: string | null;
  is_active?: boolean | null;
  universities?: University | University[] | null;
};

type Recommendation = {
  id: string;
  status: string;
  note?: string | null;
  is_archived?: boolean | null;
  created_at?: string | null;
  programs?: RecommendationProgram | RecommendationProgram[] | null;
};

type ApplicationEvent = {
  id: string;
  event_type: string;
  message?: string | null;
  visible_to_student?: boolean | null;
  created_at?: string | null;
};

type ApplicationProgram = {
  name?: string | null;
  degree_level?: string | null;
  universities?: University | University[] | null;
};

type Application = {
  id: string;
  status: string;
  intake?: string | null;
  deadline?: string | null;
  submitted_at?: string | null;
  next_action?: string | null;
  required_documents?: string[] | null;
  student_notes?: string | null;
  result?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  programs?: ApplicationProgram | ApplicationProgram[] | null;
  application_events?: ApplicationEvent[] | null;
};

type HistoryItem = {
  id: string;
  event_type: string;
  message?: string | null;
  created_at?: string | null;
};

type AdminNote = {
  id: string;
  note: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Props = {
  profile: Profile;
  documents: DocumentItem[];
  checklist: ChecklistItem[];
  recommendations: Recommendation[];
  applications: Application[];
  history: HistoryItem[];
  adminNotes: AdminNote[];
  adminNotesUnavailable?: boolean;
};

const recommendationLabels: Record<string, string> = {
  recommended: "Correspondance relevée",
  possible: "Piste à examiner",
  ambitious: "Prérequis élevés",
  missing_requirements: "Prérequis à compléter",
  not_recommended: "Écart avec le profil enregistré",
};

const documentLabels: Record<string, string> = {
  pending: "En vérification",
  reviewed: "Revu par AlmaGo",
  approved: "Validé",
  rejected: "À corriger",
  replace_required: "À remplacer",
  quarantined: "À vérifier",
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Date non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function profileValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Non renseigné" : String(value);
}

export function AdminStudentCase({
  profile,
  documents,
  checklist,
  recommendations,
  applications,
  history,
  adminNotes,
  adminNotesUnavailable = false,
}: Props) {
  const activeApplications = applications.filter((application) => isActiveApplication(application.status));
  const documentsNeedingAction = countDocumentsNeedingStudentAction(documents);
  const documentsWithAlmaGo = countDocumentsWithAlmaGo(documents);
  const checklistSummary = summarizeChecklist(checklist);
  const nextDeadlineApplication = selectNextKnownDeadline(activeApplications);
  const nextActionApplication = selectRecordedNextAction(activeApplications);
  const nextChecklist = selectNextChecklistDueDate(checklist);
  const overdueApplications = activeApplications
    .filter((application) => Boolean(application.deadline) && isPastDeadline(String(application.deadline)))
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));

  const currentPriority = documentsNeedingAction
    ? {
        label: "Document à corriger",
        detail: documentsNeedingAction === 1
          ? "Une pièce demande une correction ou un remplacement."
          : `${documentsNeedingAction} pièces demandent une correction ou un remplacement.`,
        responsibility: "Action étudiant",
        tone: "warning" as const,
      }
    : overdueApplications.length
      ? {
          label: "Échéance dépassée",
          detail: overdueApplications.length === 1
            ? `Une candidature active a une échéance dépassée (${formatDeadline(overdueApplications[0].deadline)}).`
            : `${overdueApplications.length} candidatures actives ont une échéance dépassée.`,
          responsibility: "À vérifier",
          tone: "warning" as const,
        }
      : nextActionApplication
        ? {
            label: "Action enregistrée",
            detail: nextActionApplication.next_action?.trim() || "Action enregistrée dans la candidature.",
            responsibility: "Visible par l’étudiant",
            tone: "info" as const,
          }
        : documentsWithAlmaGo
          ? {
              label: "Document en vérification",
              detail: documentsWithAlmaGo === 1
                ? "Une pièce est actuellement en vérification chez AlmaGo."
                : `${documentsWithAlmaGo} pièces sont actuellement en vérification chez AlmaGo.`,
              responsibility: "Chez AlmaGo",
              tone: "info" as const,
            }
          : checklistSummary.todo
            ? {
                label: "Étape ouverte",
                detail: checklistSummary.todo === 1
                  ? "Une démarche est enregistrée comme ouverte."
                  : `${checklistSummary.todo} démarches sont enregistrées comme ouvertes.`,
                responsibility: "Responsabilité non attribuée",
                tone: "neutral" as const,
              }
            : {
                label: "Aucune priorité enregistrée",
                detail: "Aucun blocage ou prochaine action prioritaire n’est actuellement enregistré.",
                responsibility: "Aucune attribution",
                tone: "neutral" as const,
              };

  const activity = [
    ...history.map((item) => ({
      id: `history-${item.id}`,
      created_at: item.created_at || null,
      message: item.message || "Mise à jour du dossier.",
      visibility: "Visible par l’étudiant" as const,
    })),
    ...applications.flatMap((application) =>
      (application.application_events || []).map((event) => ({
        id: `application-${event.id}`,
        created_at: event.created_at || null,
        message: applicationEventDisplayMessage(event.event_type, event.message),
        visibility: event.visible_to_student ? "Visible par l’étudiant" as const : "Interne à AlmaGo" as const,
      })),
    ),
  ]
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, 12);

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Étudiant";
  const project = [profile.target_degree, profile.target_field].filter(Boolean).join(" · ") || "Projet non renseigné";

  return (
    <div className="space-y-8">
      <section aria-labelledby="current-situation-title">
        <SectionHeading
          eyebrow="Synthèse"
          title="Situation actuelle"
          id="current-situation-title"
          description="Résumé factuel des éléments enregistrés dans le dossier, sans score ni priorité inventée."
        />

        <div className="grid gap-4 lg:grid-cols-4">
          <SituationCard
            title="Blocage principal factuel"
            value={currentPriority.label}
            detail={currentPriority.detail}
            badge={currentPriority.responsibility}
            tone={currentPriority.tone}
          />
          <SituationCard
            title="Suivi AlmaGo"
            value={documentsWithAlmaGo ? `${documentsWithAlmaGo} document${documentsWithAlmaGo > 1 ? "s" : ""}` : "Aucun document"}
            detail={documentsWithAlmaGo ? "Pièces en vérification." : "Aucune pièce en vérification enregistrée."}
            badge={documentsWithAlmaGo ? "Chez AlmaGo" : "Aucun suivi documentaire"}
            tone={documentsWithAlmaGo ? "info" : "neutral"}
          />
          <SituationCard
            title="Prochaine échéance"
            value={nextDeadlineApplication?.deadline ? formatDeadline(nextDeadlineApplication.deadline) : "Aucune date"}
            detail="Échéance la plus proche parmi les candidatures actives."
            badge={nextDeadlineApplication?.deadline && isPastDeadline(nextDeadlineApplication.deadline) ? "Dépassée" : "Date enregistrée"}
            tone={nextDeadlineApplication?.deadline && isPastDeadline(nextDeadlineApplication.deadline) ? "warning" : "neutral"}
          />
          <SituationCard
            title="Prochaine étape datée"
            value={nextChecklist?.due_date ? formatDeadline(nextChecklist.due_date) : "Aucune date"}
            detail={nextChecklist?.title || "Aucune démarche ouverte avec date connue."}
            badge="Démarche enregistrée"
            tone={nextChecklist ? "info" : "neutral"}
          />
        </div>
      </section>

      <section aria-labelledby="academic-profile-title">
        <SectionHeading
          eyebrow="Profil"
          title="Profil académique"
          id="academic-profile-title"
          description={`${name} · ${project}`}
        />
        <Card className="shadow-none">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileField label="Nationalité" value={profileValue(profile.nationality)} />
            <ProfileField label="Ville actuelle" value={profileValue(profile.current_city)} />
            <ProfileField label="Dernier diplôme" value={profileValue(profile.last_diploma)} />
            <ProfileField label="Filière du bac" value={profileValue(profile.bac_track)} />
            <ProfileField label="Année du bac" value={profileValue(profile.bac_year)} />
            <ProfileField label="Moyenne générale" value={profileValue(profile.general_average)} />
            <ProfileField label="Établissement" value={profileValue(profile.institution)} />
            <ProfileField label="Études universitaires" value={profileValue(profile.current_university_studies)} />
            <ProfileField label="Domaine actuel" value={profileValue(profile.current_field)} />
            <ProfileField label="Semestres universitaires" value={profileValue(profile.university_semesters)} />
            <ProfileField label="Allemand" value={profileValue(profile.german_level)} />
            <ProfileField label="Anglais" value={profileValue(profile.english_level)} />
            <ProfileField label="Français" value={profileValue(profile.french_level)} />
            <ProfileField label="Diplôme visé" value={profileValue(profile.target_degree)} />
            <ProfileField label="Domaine visé" value={profileValue(profile.target_field)} />
            <ProfileField label="Langue d’études" value={profileValue(profile.study_language)} />
            <ProfileField label="Rentrée visée" value={profileValue(profile.target_intake)} />
            <ProfileField label="Villes préférées" value={profile.preferred_cities?.length ? profile.preferred_cities.join(", ") : "Non renseigné"} />
            <ProfileField label="Budget" value={profileValue(profile.budget_range)} />
            <ProfileField label="Onboarding" value={profile.onboarding_completed ? "Terminé" : "À compléter"} />
          </dl>
        </Card>
      </section>

      <section aria-labelledby="documents-title">
        <SectionHeading
          eyebrow="Pièces"
          title="Documents"
          id="documents-title"
          description="Synthèse documentaire. Les actions détaillées restent dans la file Documents."
          action={<ButtonLink href="/admin/documents" variant="secondary">Ouvrir la file Documents</ButtonLink>}
        />

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <CompactMetric label="À corriger / remplacer" value={documentsNeedingAction} tone={documentsNeedingAction ? "warning" : "neutral"} />
          <CompactMetric label="Chez AlmaGo" value={documentsWithAlmaGo} tone={documentsWithAlmaGo ? "info" : "neutral"} />
          <CompactMetric label="Total enregistré" value={documents.length} tone="neutral" />
        </div>

        <div className="space-y-3">
          {documents.length ? documents.map((document) => (
            <Card as="article" key={document.id} className="shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-950">{document.original_filename || document.category || "Document"}</h3>
                  <p className="mt-1 text-sm text-slate-600">{document.category || "Catégorie non renseignée"}</p>
                </div>
                <Badge variant={
                  ["rejected", "replace_required"].includes(document.status)
                    ? "warning"
                    : ["pending", "reviewed"].includes(document.status)
                      ? "info"
                      : document.status === "approved"
                        ? "success"
                        : "neutral"
                }>
                  {documentLabels[document.status] || "Statut à vérifier"}
                </Badge>
              </div>
              {document.admin_comment && (
                <div className="mt-4 rounded-[var(--radius-control)] border border-blue-200 bg-blue-50/40 p-3">
                  <Badge variant="info">Visible par l’étudiant</Badge>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{document.admin_comment}</p>
                </div>
              )}
            </Card>
          )) : <EmptyState text="Aucun document n’est enregistré dans ce dossier." />}
        </div>
      </section>

      <section aria-labelledby="checklist-title">
        <SectionHeading
          eyebrow="Suivi"
          title="Démarches"
          id="checklist-title"
          description="Les étapes todo restent ouvertes, sans attribution automatique d’un responsable."
        />

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <CompactMetric label="Étapes ouvertes" value={checklistSummary.todo} tone={checklistSummary.todo ? "info" : "neutral"} />
          <CompactMetric label="Terminées" value={checklistSummary.completed} tone="neutral" />
        </div>

        <div className="space-y-3">
          {checklist.length ? checklist.map((item) => (
            <Card as="article" key={item.id} className="shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  {item.description && <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>}
                  {item.due_date && <p className="mt-2 text-xs text-slate-500">Date enregistrée : {formatDeadline(item.due_date)}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={item.status === "completed" ? "success" : item.status === "todo" ? "info" : "neutral"}>
                    {item.status === "completed" ? "Terminée" : item.status === "todo" ? "Étape ouverte" : "Statut à vérifier"}
                  </Badge>
                  {item.status === "todo" && <Badge variant="neutral">Responsabilité non attribuée</Badge>}
                </div>
              </div>
            </Card>
          )) : <EmptyState text="Aucune démarche n’est enregistrée dans ce dossier." />}
        </div>
      </section>

      <section aria-labelledby="orientation-title">
        <SectionHeading
          eyebrow="Études"
          title="Orientation"
          id="orientation-title"
          description="Les pistes restent historiques, mais seules les pistes actives avec programme publiable sont actuellement visibles par l’étudiant."
          action={<ButtonLink href="/admin/orientation" variant="secondary">Ouvrir Orientation</ButtonLink>}
        />

        <div className="space-y-3">
          {recommendations.length ? recommendations.map((recommendation) => {
            const program = firstRelation(recommendation.programs);
            const university = firstRelation(program?.universities);
            const currentlyVisible = !recommendation.is_archived && isPublishableProgram(program);

            return (
              <Card as="article" key={recommendation.id} className="shadow-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950">{program?.name || "Programme"}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{recommendationLabels[recommendation.status] || "Statut à vérifier"}</Badge>
                    <Badge variant={currentlyVisible ? "info" : "neutral"}>
                      {currentlyVisible ? "Visible par l’étudiant" : "Non publiée actuellement"}
                    </Badge>
                  </div>
                </div>
                {recommendation.note && (
                  <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Justification enregistrée</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.note}</p>
                  </div>
                )}
              </Card>
            );
          }) : <EmptyState text="Aucune piste d’orientation n’est enregistrée dans ce dossier." />}
        </div>
      </section>

      <section aria-labelledby="applications-title">
        <SectionHeading
          eyebrow="Admissions"
          title="Candidatures"
          id="applications-title"
          description="Statuts, dates et messages enregistrés pour les dossiers de candidature."
          action={<ButtonLink href="/admin/applications" variant="secondary">Ouvrir Candidatures</ButtonLink>}
        />

        <div className="space-y-4">
          {applications.length ? applications.map((application) => {
            const program = firstRelation(application.programs);
            const university = firstRelation(program?.universities);
            const active = isActiveApplication(application.status);
            const overdue = active && Boolean(application.deadline) && isPastDeadline(String(application.deadline));

            return (
              <Card as="article" key={application.id} className={overdue ? "border-amber-300 bg-amber-50/20" : "shadow-none"}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950">{program?.name || "Programme"}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">Échéance : {formatDeadline(application.deadline)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {overdue && <Badge variant="warning">Échéance dépassée</Badge>}
                    <Badge variant={active ? "info" : "neutral"}>
                      {applicationStatusLabels[application.status] || "Statut à vérifier"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <InfoPanel label="Prochaine action enregistrée" value={application.next_action || "Aucune action explicite enregistrée"} visibility />
                  <InfoPanel label="Résultat" value={application.result || "Aucun résultat enregistré"} visibility />
                </div>

                {application.student_notes && (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-blue-200 bg-blue-50/40 p-3">
                    <Badge variant="info">Visible par l’étudiant</Badge>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{application.student_notes}</p>
                  </div>
                )}

                {application.required_documents?.length ? (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Documents requis enregistrés</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{application.required_documents.join(", ")}</p>
                  </div>
                ) : null}
              </Card>
            );
          }) : <EmptyState text="Aucune candidature n’est enregistrée dans ce dossier." />}
        </div>
      </section>

      <section aria-labelledby="activity-title">
        <SectionHeading
          eyebrow="Historique"
          title="Activité récente"
          id="activity-title"
          description="Historique étudiant et événements de candidature, avec leur frontière de visibilité explicite."
        />
        <Card className="shadow-none">
          {activity.length ? (
            <ol className="divide-y divide-[var(--border)]">
              {activity.map((event) => (
                <li key={event.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm leading-6 text-slate-700">{event.message}</p>
                    <Badge variant={event.visibility === "Visible par l’étudiant" ? "info" : "neutral"}>
                      {event.visibility}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(event.created_at)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Aucune activité récente n’est enregistrée.</p>
          )}
        </Card>
      </section>

      <section aria-labelledby="internal-notes-title">
        <SectionHeading
          eyebrow="Interne"
          title="Notes internes AlmaGo"
          id="internal-notes-title"
          description="Ces notes sont réservées à l’équipe AlmaGo et restent séparées de tout message destiné à l’étudiant."
        />
        <Card className="border-slate-300 bg-slate-50/70 shadow-none">
          <div className="mb-4">
            <Badge variant="neutral">Interne à AlmaGo</Badge>
          </div>
          {adminNotesUnavailable ? (
            <div role="alert">
              <p className="font-semibold text-slate-900">Notes internes temporairement indisponibles</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Aucune autre donnée n’est utilisée à leur place.</p>
            </div>
          ) : adminNotes.length ? (
            <div className="space-y-3">
              {adminNotes.map((note) => (
                <article key={note.id} className="rounded-[var(--radius-control)] border border-slate-200 bg-white p-4">
                  <p className="text-sm leading-6 text-slate-700">{note.note}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(note.updated_at || note.created_at)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Aucune note interne n’est enregistrée pour ce dossier.</p>
          )}
        </Card>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  id,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  id: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function SituationCard({
  title,
  value,
  detail,
  badge,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  badge: string;
  tone: "warning" | "info" | "neutral";
}) {
  return (
    <Card as="article" className="shadow-none">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <p className="mt-3 text-lg font-bold leading-7 text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      <div className="mt-4"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function CompactMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "info" | "neutral";
}) {
  return (
    <Card as="article" className="shadow-none">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-3xl font-bold text-slate-950">{value}</p>
        <Badge variant={tone}>{value}</Badge>
      </div>
    </Card>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-slate-900">{value}</dd>
    </div>
  );
}

function InfoPanel({ label, value, visibility = false }: { label: string; value: string; visibility?: boolean }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        {visibility && <Badge variant="info">Visible par l’étudiant</Badge>}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="border-dashed bg-white/70 py-8 text-center shadow-none">
      <p className="text-sm leading-6 text-slate-600">{text}</p>
    </Card>
  );
}
