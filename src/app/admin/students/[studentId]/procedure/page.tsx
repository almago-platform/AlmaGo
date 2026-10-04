/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline, isActiveApplication } from "@/lib/phase4";
import {
  buildCampusInternalTargets,
  evaluateCampusApplicationDeadline,
  type CampusApplicationMethod,
} from "@/lib/orientation-engine/deadline";

export const dynamic = "force-dynamic";

function relation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function statusTone(status: string): "success" | "warning" | "info" | "neutral" {
  if (["completed", "ready", "accepted_original", "authenticated", "translated"].includes(status)) return "success";
  if (["blocked", "replacement_required", "requested", "waiting_student"].includes(status)) return "warning";
  if (["in_progress", "waiting_almago", "waiting_external", "uploaded", "under_review"].includes(status)) return "info";
  return "neutral";
}

function studentName(profile: any) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Étudiant";
}

function deadlineLabel(status: string) {
  if (status === "open") return "Officielle vérifiée";
  if (status === "closed") return "Officielle dépassée";
  if (status === "to_verify") return "À vérifier";
  return "Date inconnue";
}

function applicationMethod(value: unknown): CampusApplicationMethod {
  return ["direct", "uni_assist", "vpd_then_direct", "other_documented", "unknown"].includes(String(value))
    ? value as CampusApplicationMethod
    : "unknown";
}

export default async function AdminStudentProcedurePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const supabase = await createClient();

  const [
    profileResult,
    projectResult,
    procedureResult,
    requirementsResult,
    checklistResult,
    applicationsResult,
    historyResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id,first_name,last_name,education_level,target_degree,target_field").eq("id", studentId).maybeSingle(),
    supabase.from("student_projects").select("id,path,target_degree,target_field,target_intake,preferred_cities,current_german_level,target_german_level,updated_at").eq("student_id", studentId).maybeSingle(),
    supabase.from("student_procedures").select("id,procedure_template_key,procedure_template_version,route_key,target_intake,status,template_snapshot,created_at,updated_at").eq("student_id", studentId).eq("is_current", true).maybeSingle(),
    supabase.from("student_document_requirements").select("id,requirement_key,label,category,status,document_id,requested_from_student,student_request_reason,student_request_due_date,requires_tunisian_authentication,requires_translation,requires_german_legalisation,legalisation_status,legalisation_reason,due_date,deadline_kind,source_url,source_verified_at,updated_at").eq("student_id", studentId).order("created_at", { ascending: true }),
    supabase.from("student_checklist_items").select("id,title,description,status,owner,requires_student_action,student_action_reason,student_action_kind,due_date,deadline_kind,deadline_cycle,official_source_url,official_source_verified_at,blocked_reason,updated_at").eq("student_id", studentId).order("created_at", { ascending: true }),
    supabase.from("applications").select("id,status,intake,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,next_action,required_documents,submitted_at,programs(name,universities(name,city))").eq("student_id", studentId).order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("student_history").select("id,event_type,message,metadata,created_at").eq("student_id", studentId).order("created_at", { ascending: false }).limit(30),
  ]);

  if (!profileResult.data) notFound();

  const profile = profileResult.data;
  const project = projectResult.data;
  const procedure = procedureResult.data;
  const requirements = requirementsResult.data || [];
  const checklist = checklistResult.data || [];
  const applications = applicationsResult.data || [];
  const history = historyResult.data || [];
  const loadErrors = [
    projectResult.error,
    procedureResult.error,
    requirementsResult.error,
    checklistResult.error,
    applicationsResult.error,
    historyResult.error,
  ].filter(Boolean);

  const studentActions = [
    ...requirements.filter((item) => item.requested_from_student && ["requested", "replacement_required"].includes(item.status)),
    ...checklist.filter((item) => item.requires_student_action && !["completed", "not_applicable"].includes(item.status)),
  ];
  const waitingAlmago = checklist.filter((item) => item.owner === "almago" && !["completed", "not_applicable"].includes(item.status));
  const waitingExternal = checklist.filter((item) => item.owner === "external" && !["completed", "not_applicable"].includes(item.status));
  const blocked = checklist.filter((item) => item.status === "blocked");

  const deadlineRows = applications
    .filter((item) => isActiveApplication(item.status))
    .map((item) => {
      const evaluation = evaluateCampusApplicationDeadline(item);
      return {
        application: item,
        evaluation,
        internalTargets: buildCampusInternalTargets(evaluation, applicationMethod(item.application_method)),
      };
    });

  const verifiedOfficial = deadlineRows.filter((row) => ["open", "closed"].includes(row.evaluation.status));
  const toVerify = deadlineRows.filter((row) => ["to_verify", "unknown"].includes(row.evaluation.status));

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Campus Allemagne"
        title={studentName(profile)}
        description="Cockpit opérationnel consolidé du dossier. Les actions étudiant restent exceptionnelles et les objectifs internes restent distincts des échéances officielles."
        actions={
          <>
            <ButtonLink href="/admin/documents" variant="secondary">Documents</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">Candidatures</ButtonLink>
          </>
        }
      />

      {loadErrors.length > 0 && (
        <p role="alert" className="mb-5 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
          Certaines données opérationnelles sont temporairement indisponibles. Aucun état n’a été inventé pour les remplacer.
        </p>
      )}

      <section aria-label="Résumé du dossier" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Summary title="Route" value={procedure?.route_key || project?.path || "À définir"} detail={procedure ? `Template v${procedure.procedure_template_version}` : "Procédure non générée"} />
        <Summary title="Rentrée cible" value={procedure?.target_intake || project?.target_intake || "À confirmer"} detail="Contexte de cycle du dossier" />
        <Summary title="Actions étudiant" value={String(studentActions.length)} detail={studentActions.length ? "Demandes ciblées uniquement" : "Aucune action requise actuellement"} tone={studentActions.length ? "warning" : "success"} />
        <Summary title="Campus Allemagne" value={String(waitingAlmago.length)} detail="Étapes internes encore ouvertes" tone={waitingAlmago.length ? "info" : "neutral"} />
        <Summary title="À vérifier" value={String(toVerify.length)} detail="Dates officielles non vérifiées" tone={toVerify.length ? "warning" : "success"} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-6">
          <Card aria-labelledby="procedure-status-title" className="shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Procédure</p>
                <h2 id="procedure-status-title" className="mt-1 text-xl font-semibold text-slate-950">État opérationnel</h2>
              </div>
              <Badge variant={statusTone(procedure?.status || "not_started")}>{procedure?.status || "Non générée"}</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact label="Projet" value={[project?.target_degree, project?.target_field].filter(Boolean).join(" · ") || "À confirmer"} />
              <Fact label="Langue actuelle" value={project?.current_german_level || "À confirmer"} />
              <Fact label="Langue cible" value={project?.target_german_level || "À confirmer"} />
              <Fact label="Villes préférées" value={project?.preferred_cities?.length ? project.preferred_cities.join(", ") : "Non renseigné"} />
            </div>

            {blocked.length > 0 && (
              <div className="mt-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-4">
                <p className="font-bold text-red-950">{blocked.length} blocage{blocked.length > 1 ? "s" : ""}</p>
                <ul className="mt-2 space-y-1 text-sm text-red-900">
                  {blocked.map((item) => <li key={item.id}>• {item.title}{item.blocked_reason ? ` — ${item.blocked_reason}` : ""}</li>)}
                </ul>
              </div>
            )}
          </Card>

          <Card aria-labelledby="documents-title" className="shadow-none">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Dossier documentaire</p>
                <h2 id="documents-title" className="mt-1 text-xl font-semibold text-slate-950">Exigences et responsabilités</h2>
              </div>
              <Badge variant="neutral">{requirements.length} exigence{requirements.length > 1 ? "s" : ""}</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {requirements.length === 0 ? (
                <Empty>Aucune exigence documentaire Campus Allemagne n’est encore matérialisée.</Empty>
              ) : requirements.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.category} · {item.requirement_key}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusTone(item.status)}>{item.status}</Badge>
                      <Badge variant={item.requested_from_student ? "warning" : "info"}>
                        {item.requested_from_student ? "Action étudiant" : "Campus Allemagne"}
                      </Badge>
                    </div>
                  </div>
                  {item.requested_from_student && (
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <strong>Motif :</strong> {item.student_request_reason || "Motif manquant — à corriger"}
                      {item.student_request_due_date ? <> · <strong>Échéance :</strong> {formatDeadline(item.student_request_due_date)}</> : null}
                    </p>
                  )}
                  {item.requires_german_legalisation !== null && (
                    <p className="mt-2 text-sm text-slate-600">
                      Légalisation allemande : {item.requires_german_legalisation ? "requise" : "non requise / à confirmer"} · état {item.legalisation_status || "à vérifier"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card aria-labelledby="deadlines-title" className="shadow-none">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Dates</p>
              <h2 id="deadlines-title" className="mt-1 text-xl font-semibold text-slate-950">Échéances officielles et objectifs internes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Une échéance officielle sans source, vérification et cycle reste « À vérifier ». Les dates D-84/D-70/D-56/D-21/D-7 sont des objectifs internes Campus Allemagne.</p>
            </div>

            <div className="mt-5 space-y-4">
              {deadlineRows.length === 0 ? (
                <Empty>Aucune candidature active avec suivi de date.</Empty>
              ) : deadlineRows.map(({ application, evaluation, internalTargets }) => {
                const program = relation(application.programs);
                const university = relation(program?.universities);
                return (
                  <article key={application.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{program?.name || "Programme"}</p>
                        <p className="mt-1 text-xs text-slate-500">{university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}</p>
                      </div>
                      <Badge variant={evaluation.status === "open" ? "success" : evaluation.status === "closed" ? "warning" : "neutral"}>
                        {deadlineLabel(evaluation.status)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Fact label="Deadline officielle" value={["open", "closed"].includes(evaluation.status) ? formatDeadline(application.deadline) : "À vérifier"} />
                      <Fact label="Cycle" value={application.deadline_cycle || "À vérifier"} />
                      <Fact label="Méthode" value={application.application_method || "unknown"} />
                    </div>
                    {evaluation.status === "to_verify" || evaluation.status === "unknown" ? (
                      <p className="mt-3 rounded-[var(--radius-control)] bg-amber-50 p-3 text-sm text-amber-900">
                        Aucun objectif interne n’est calculé tant que la deadline officielle n’est pas vérifiée.
                      </p>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {internalTargets.map((target) => (
                          <span key={target.key} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
                            Campus Allemagne · {target.key} · {formatDeadline(target.date)}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </Card>

          <Card aria-labelledby="workflow-title" className="shadow-none">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Workflow</p>
              <h2 id="workflow-title" className="mt-1 text-xl font-semibold text-slate-950">Étapes ouvertes</h2>
            </div>
            <div className="mt-4 space-y-2">
              {checklist.length === 0 ? <Empty>Aucune étape de checklist matérialisée.</Empty> : checklist.map((item) => (
                <div key={item.id} className="grid gap-2 rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    {item.description && <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>}
                    {item.requires_student_action && <p className="mt-1 text-xs text-amber-800">Motif étudiant : {item.student_action_reason || "motif manquant"}</p>}
                  </div>
                  <Badge variant="neutral">{item.owner || "non assigné"}</Badge>
                  <Badge variant={statusTone(item.status)}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card aria-labelledby="attention-title" className="shadow-none">
            <h2 id="attention-title" className="text-lg font-semibold text-slate-950">À traiter maintenant</h2>
            <div className="mt-4 space-y-3">
              <Attention label="Étudiant" count={studentActions.length} detail="Demandes exceptionnelles avec motif." tone={studentActions.length ? "warning" : "success"} />
              <Attention label="Campus Allemagne" count={waitingAlmago.length} detail="Étapes internes ouvertes." tone={waitingAlmago.length ? "info" : "neutral"} />
              <Attention label="Externe" count={waitingExternal.length} detail="Attente d’une institution ou d’un tiers." tone="neutral" />
              <Attention label="Sources/dates" count={toVerify.length} detail="Échéances à vérifier avant affichage officiel." tone={toVerify.length ? "warning" : "success"} />
              <Attention label="Deadlines vérifiées" count={verifiedOfficial.length} detail="Échéances officielles actuellement vérifiées." tone="info" />
            </div>
          </Card>

          <Card aria-labelledby="history-title" className="shadow-none">
            <h2 id="history-title" className="text-lg font-semibold text-slate-950">Historique dossier</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Derniers événements audités du dossier étudiant.</p>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? <Empty>Aucun événement enregistré.</Empty> : history.map((event) => (
                <article key={event.id} className="border-l-2 border-[var(--brand-border)] pl-3">
                  <p className="text-sm font-semibold text-slate-900">{event.message || event.event_type}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.created_at))}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card className="shadow-none">
            <h2 className="text-lg font-semibold text-slate-950">Outils existants</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Le cockpit consolide la vérité. Les opérations spécialisées restent dans leurs files existantes.</p>
            <div className="mt-4 grid gap-2">
              <ButtonLink href="/admin/documents" variant="secondary" className="w-full justify-center">Ouvrir la revue Documents</ButtonLink>
              <ButtonLink href="/admin/applications" variant="secondary" className="w-full justify-center">Ouvrir les Candidatures</ButtonLink>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Summary({ title, value, detail, tone = "neutral" }: { title: string; value: string; detail: string; tone?: "neutral" | "warning" | "success" | "info" }) {
  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <Badge variant={tone}>{tone === "neutral" ? "Dossier" : tone === "warning" ? "Attention" : tone === "success" ? "OK" : "Suivi"}</Badge>
      </div>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Attention({ label, count, detail, tone }: { label: string; count: number; detail: string; tone: "neutral" | "warning" | "success" | "info" }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] p-3">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <Badge variant={tone}>{count}</Badge>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[var(--radius-control)] border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-slate-600">{children}</p>;
}
