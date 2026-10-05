import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/product/ActivityTimeline";
import { DossierHeader } from "@/components/product/DossierHeader";
import { DocumentRow } from "@/components/product/DocumentRow";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { Badge } from "@/components/ui/Badge";
import { DataList } from "@/components/ui/DataList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  applicationStatusLabels,
  isActiveApplication,
  type KnownApplicationStatus,
} from "@/lib/application-workflow";
import { campusRouteLabel } from "@/lib/campus-intake";
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
import { createClient } from "@/lib/supabase/server";

type ApplicationRow = {
  id: string;
  status: string;
  intake: string | null;
  deadline: string | null;
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

type PurchaseRow = {
  id: string;
  offer_snapshot: unknown;
  amount_minor: number | string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
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
    applicationsResult,
    purchasesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,full_name")
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
      .from("applications")
      .select("id,status,intake,deadline,next_action,result,created_at,programs(name,universities(name,city)),application_events(id,event_type,message,visible_to_student,created_at)")
      .eq("student_id", studentId)
      .order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("commercial_purchases")
      .select("id,offer_snapshot,amount_minor,currency,status,created_at,updated_at")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const profile = profileResult.data;
  const prospect = prospectResult.data;
  const intake = intakeResult.data;
  const access = accessResult.data;
  const documents = (documentsResult.data || []) as DocumentRowData[];
  const applications = (applicationsResult.data || []) as unknown as ApplicationRow[];
  const purchase = ((purchasesResult.data || []) as PurchaseRow[])[0] ?? null;

  if (!profile && !prospect && !intake) {
    notFound();
  }

  const fatalError =
    profileResult.error
    || prospectResult.error
    || intakeResult.error
    || accessResult.error
    || documentsResult.error
    || applicationsResult.error
    || purchasesResult.error;

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
              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold"
            >
              Retour aux dossiers
            </Link>
          }
        />
      </main>
    );
  }

  let orientation = null as {
    id: string;
    input: unknown;
    created_at: string;
  } | null;

  if (intake?.orientation_id) {
    const orientationResult = await supabase
      .from("orientations")
      .select("id,input,created_at")
      .eq("id", intake.orientation_id)
      .maybeSingle();
    orientation = orientationResult.data;
  } else if (prospect?.id) {
    const orientationResult = await supabase
      .from("orientations")
      .select("id,input,created_at")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(1);
    orientation = orientationResult.data?.[0] ?? null;
  }

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
  const currentStage = adminDossierStageIndex(intake?.status, applications.length > 0);
  const nextAction = adminDossierNextAction(intake?.status, applications.length > 0);

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
            : index === 6 ? "/admin/applications"
              : undefined,
  }));

  const timeline: ActivityTimelineItem[] = [];
  if (orientation?.created_at) {
    timeline.push({
      title: "Orientation enregistrée",
      description: projectFacts.length ? projectFacts.join(" · ") : "Projet enregistré dans AlmaGo.",
      timestamp: formatDate(orientation.created_at),
      tone: "brand",
    });
  }
  if (intake?.student_responded_at) {
    timeline.push({
      title: "Réponse de l’étudiant",
      description: intake.student_response_note || "Une réponse a été envoyée depuis l’espace Prospect.",
      timestamp: formatDate(intake.student_responded_at),
      tone: "warning",
    });
  }
  if (purchase?.created_at) {
    timeline.push({
      title: "Achat créé",
      description: `${offerName(purchase.offer_snapshot) || "Offre Campus Allemagne"} · ${purchaseStatusLabel(purchase.status)}`,
      timestamp: formatDate(purchase.created_at),
      tone: purchase.status === "client_active" ? "success" : "info",
    });
  }

  for (const application of applications) {
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

  const documentDefinitions = [
    { category: "passport", title: "Passeport", optional: answers.bacStatus === "preparing" },
    { category: "baccalaureate", title: "Baccalauréat", optional: answers.bacStatus === "preparing" },
    { category: "transcripts", title: "Relevé de notes", optional: answers.bacStatus === "preparing" },
    { category: "language_certificate", title: "Certificat de langue", optional: true },
  ];

  const purchaseAmount = purchase
    ? formatMinorCurrency(purchase.amount_minor, purchase.currency, "fr-FR")
    : null;
  const proposedOfferAmount = offer?.price_minor !== null && offer?.price_minor !== undefined && offer?.currency
    ? formatMinorCurrency(offer.price_minor, offer.currency, "fr-FR")
    : null;

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-7 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <DossierHeader
        eyebrow="Dossier étudiant · vue 360°"
        title={name}
        description="Une seule vue pour comprendre le projet, les pièces, la proposition, le paiement et la suite du parcours."
        status={adminDossierStatusLabel(intake?.status)}
        statusVariant={adminDossierStatusVariant(intake?.status)}
        facts={[
          { label: "Contact", value: <bdi dir="auto">{email}</bdi> },
          { label: "Accès", value: customerAccessLabel(access?.status) },
          { label: "Parcours", value: campusRouteLabel(intake?.proposed_route_key) },
          { label: "Dernière mise à jour", value: formatDate(intake?.updated_at || prospect?.updated_at) },
        ]}
        actions={
          <Link
            href="/admin/intake"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
          >
            Retour à la file
          </Link>
        }
      />

      <section className="space-y-3">
        <SectionHeader
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

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <div className="space-y-7">
          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Projet"
              title="Orientation retenue"
              description="Les informations ci-dessous proviennent de l’orientation actuellement rattachée au dossier."
            />
            <DataList
              className="mt-5"
              items={[
                { label: "Diplôme visé", value: answers.targetDegree || "À confirmer" },
                { label: "Domaine", value: answers.targetField || "À confirmer" },
                { label: "Allemand", value: answers.germanLevel || "À confirmer" },
                { label: "Situation Bac", value: bacStatusLabel(answers.bacStatus) },
                {
                  label: "Villes préférées",
                  value: answers.preferredCities.length ? answers.preferredCities.join(", ") : "Aucune préférence enregistrée",
                },
                {
                  label: "Rentrée visée",
                  value: [answers.targetIntakeSeason, answers.targetIntakeYear].filter(Boolean).join(" ") || "À confirmer",
                },
              ]}
            />
          </section>

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Pièces"
              title="Documents du dossier"
              description="Cette vue résume les derniers états enregistrés. Les décisions documentaires restent dans la file Documents."
              actions={
                <Link href="/admin/documents" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
                  Ouvrir Documents →
                </Link>
              }
            />
            <div className="mt-4">
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
                    metadata={document ? `Ajouté le ${formatDate(document.created_at)}` : undefined}
                    note={document?.admin_comment || undefined}
                  />
                );
              })}
            </div>
          </section>

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
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

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Candidatures"
              title={applications.length ? `${applications.length} candidature${applications.length > 1 ? "s" : ""} rattachée${applications.length > 1 ? "s" : ""}` : "Aucune candidature enregistrée"}
              description="Le détail opérationnel et les changements de statut restent dans la file Candidatures."
              actions={
                applications.length ? (
                  <Link href="/admin/applications" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
                    Ouvrir Candidatures →
                  </Link>
                ) : undefined
              }
            />

            {applications.length ? (
              <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {applications.slice(0, 6).map((application) => {
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
              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                Les candidatures apparaîtront ici lorsque la phase étudiante aura commencé.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-7">
          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <SectionHeader eyebrow="Synthèse" title="Repères du dossier" />
            <div className="mt-4 flex flex-wrap gap-2">
              {projectFacts.length ? projectFacts.map((fact) => (
                <Badge key={fact} variant="neutral">{fact}</Badge>
              )) : <Badge variant="neutral">Projet à compléter</Badge>}
            </div>
            <div className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
              Les informations techniques, identifiants et états internes inutiles ne sont pas affichés dans cette vue.
            </div>
          </section>

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <SectionHeader
              eyebrow="Historique"
              title="Activité récente"
              description="Événements utiles à la continuité du suivi."
            />
            <div className="mt-5">
              <ActivityTimeline
                items={timeline.slice(0, 8)}
                empty="Aucune activité récente n’est disponible pour ce dossier."
              />
            </div>
          </section>

          <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
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
