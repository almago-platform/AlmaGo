import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import {
  summarizeAcademicEvidence,
  type AcademicEvidenceRecord,
} from "@/lib/academic-evidence";
import { isPublishableLanguageCourse } from "@/lib/language-courses";
import { isPublishableFinanceInsuranceOption } from "@/lib/finance-insurance";
import { catalogVerificationCutoff } from "@/lib/catalog-freshness";
import {
  determineRegulatoryPath,
  type RegulatoryPathDecision,
  type RegulatoryRoute,
} from "@/lib/regulatory-path-engine";
import { isRegulatoryRuleCurrent } from "@/lib/regulatory";
import { projectPathOptions } from "@/lib/student/project";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentPathwayCopy } from "@/content/student-pathway-copy";
import { studentProjectCopy } from "@/content/student-project-copy";

export const dynamic = "force-dynamic";

export default async function StudentPathwayPage() {
  const locale = await getRequestLocale();
  const t = studentPathwayCopy[locale];
  const projectCopy = studentProjectCopy[locale];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date();
  const catalogueCutoff = catalogVerificationCutoff(now);
  if (!catalogueCutoff) return <PathwayUnavailable copy={t} />;

  const [
    projectResult,
    documentsResult,
    evidenceResult,
    coursesResult,
    financeResult,
    checklistResult,
    regulatorySourcesResult,
    languageSelectionResult,
  ] = await Promise.all([
    supabase
      .from("student_projects")
      .select("path,target_degree,target_field,target_intake,current_german_level,target_german_level,filing_country")
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
      .from("language_courses")
      .select("id,title,provider_name,language,purpose,source_url,application_url,verified_at,is_active")
      .eq("is_active", true)
      .lte("verified_at", now.toISOString())
      .gt("verified_at", catalogueCutoff),
    supabase
      .from("finance_insurance_catalog")
      .select("id,provider_name,product_name,kind,description,official_source_url,application_url,price_notes,eligibility_notes,verified_at,is_active")
      .eq("is_active", true)
      .lte("verified_at", now.toISOString())
      .gt("verified_at", catalogueCutoff),
    supabase
      .from("student_checklist_items")
      .select("id,status")
      .eq("student_id", user.id),
    supabase
      .from("regulatory_sources")
      .select("authority,title,source_url,topic,jurisdiction,origin_country,destination_country,checked_on,summary,amount,currency,periodicity,verification_status,verified_at,review_due_at,is_active")
      .eq("is_active", true)
      .order("authority"),
    supabase
      .from("student_language_course_selections")
      .select("language_course_id")
      .eq("student_id", user.id)
      .maybeSingle(),
  ]);

  if (
    projectResult.error
    || documentsResult.error
    || evidenceResult.error
    || coursesResult.error
    || financeResult.error
    || checklistResult.error
    || regulatorySourcesResult.error
    || languageSelectionResult.error
  ) {
    return <PathwayUnavailable copy={t} />;
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
  const selectedLanguageCourseId = languageSelectionResult.data?.language_course_id || null;
  const selectedLanguageCourse = selectedLanguageCourseId
    ? (coursesResult.data || []).find((course) => course.id === selectedLanguageCourseId) || null
    : null;
  const hasPublishableStudyPreparationCourse = Boolean(
    selectedLanguageCourse
    && selectedLanguageCourse.purpose === "study_preparation"
    && isPublishableLanguageCourse(selectedLanguageCourse, now),
  );

  const publishableFinanceOptions = (financeResult.data || []).filter((option) =>
    isPublishableFinanceInsuranceOption(option, now),
  );
  const checklistItems = checklistResult.data || [];
  const completedChecklistItems = checklistItems.filter((item) => item.status === "completed").length;

  const facts = {
    project_path: projectResult.data?.path || null,
    accepted_definitive_admission: evidenceSummary.accepted_definitive_admission,
    accepted_preparatory_basis: evidenceSummary.accepted_preparatory_basis,
    has_publishable_study_preparation_course: hasPublishableStudyPreparationCourse,
    has_pending_academic_review: evidenceSummary.has_pending_review,
    has_replacement_required: evidenceSummary.has_replacement_required,
  };

  const decision = determineRegulatoryPath(facts);
  const currentRegulatorySources = (regulatorySourcesResult.data || []).filter((source) =>
    isRegulatoryRuleCurrent(source, now),
  );
  const filingCountry = projectResult.data?.filing_country || null;
  const relevantRegulatorySources = currentRegulatorySources.filter((source) =>
    regulatoryTopicsForRoute(decision.route).includes(source.topic)
    && regulatorySourceMatchesFilingCountry(source.origin_country, filingCountry),
  );
  const needsFilingCountry =
    (decision.route === "STUDIENVORBEREITUNG" || decision.route === "SPRACHKURS")
    && !filingCountry;
  const project = projectPathOptions.find(
    (option) => option.value === projectResult.data?.path,
  );
  const projectLabel = projectResult.data?.path
    ? projectCopy.paths[projectResult.data.path as keyof typeof projectCopy.paths]?.title
    : null;
  const routeInfo = decision.route ? t.routes[decision.route] : null;
  const nextAction = nextActionFor(decision, t);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="pathway"
        eyebrow="Mon dossier"
        title="Mon parcours Allemagne"
        description="Cette page montre les étapes utiles selon votre dossier. Elle ne constitue ni une décision d’admission ni une décision de visa ou de titre de séjour."
        actions={<ButtonLink href="/student/project" variant="secondary">Modifier mon projet</ButtonLink>}
      />

      <Card className="mt-7 relative overflow-hidden border-[var(--brand-border)] bg-white shadow-none">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
        <div className="flex flex-col gap-5 pl-2 lg:flex-row lg:items-start lg:justify-between sm:pl-3">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusVariant(decision.status)}>{statusLabel(decision.status)}</Badge>
              {decision.route && (
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {decision.route}
                </span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {routeInfo?.title || "Parcours à préciser"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {decision.student_explanation}
            </p>
            {routeInfo && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {routeInfo.description}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink>
          </div>
        </div>
      </Card>

      <section className="mt-8" aria-labelledby="pathway-steps-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Les étapes de votre parcours</p>
          <h2 id="pathway-steps-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            De votre projet aux prochaines démarches
          </h2>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
          <PathwayCard
            number="1"
            title="Projet académique"
            state={project ? "Renseigné" : "À compléter"}
            detail={project
              ? project.title + (projectResult.data?.target_degree ? " · " + projectResult.data.target_degree : "")
              : "Choisissez votre objectif réel en Allemagne avant de poursuivre."}
            href="/student/project"
            linkLabel={project ? "Modifier" : "Définir mon projet"}
            tone={project ? "done" : "attention"}
          />

          <PathwayCard
            number="2"
            title="Base académique"
            state={academicBasisLabel(evidenceSummary)}
            detail={academicBasisDetail(evidenceSummary)}
            href="/student/documents"
            linkLabel="Voir mes preuves"
            tone={
              evidenceSummary.accepted_definitive_admission || evidenceSummary.accepted_preparatory_basis
                ? "done"
                : evidenceSummary.has_pending_review || evidenceSummary.has_replacement_required
                  ? "attention"
                  : "neutral"
            }
          />

          <PathwayCard
            number="3"
            title="Préparation linguistique"
            state={selectedLanguageCourse ? "Cours sélectionné" : "Aucun cours sélectionné"}
            detail={selectedLanguageCourse
              ? `${selectedLanguageCourse.provider_name} · ${selectedLanguageCourse.title} · ${selectedLanguageCourse.purpose === "study_preparation" ? "Préparation aux études" : "Cours de langue autonome"}`
              : "Choisissez explicitement une fiche vérifiée dans le catalogue. AlmaGo ne sélectionne aucun cours à votre place."}
            href="/student/language-courses"
            linkLabel="Voir les cours"
            tone={selectedLanguageCourse ? "done" : "neutral"}
          />

          <PathwayCard
            number="4"
            title="Étape administrative à vérifier"
            state={routeInfo?.title || "Non déterminé"}
            detail={
              decision.status === "confirmed_basis"
                ? "Une base factuelle vérifiée permet d’identifier ce parcours dans AlmaGo, sans remplacer la décision officielle."
                : decision.status === "candidate"
                  ? "Ce parcours est une piste à examiner à partir des informations actuellement enregistrées."
                  : "Un élément du dossier manque ou doit être vérifié avant d’aller plus loin."
            }
            href={nextAction.href}
            linkLabel={nextAction.label}
            tone={decision.status === "confirmed_basis" ? "done" : decision.status === "blocked" ? "attention" : "neutral"}
          />

          <PathwayCard
            number="5"
            title="Financement & assurance"
            state={publishableFinanceOptions.length ? `${publishableFinanceOptions.length} option${publishableFinanceOptions.length > 1 ? "s" : ""} vérifiée${publishableFinanceOptions.length > 1 ? "s" : ""}` : "Catalogue à compléter"}
            detail={publishableFinanceOptions.length
              ? "Consultez les options publiées avec leur source officielle. AlmaGo ne les classe pas et ne déduit pas votre éligibilité."
              : "Aucune option vérifiée n’est actuellement publiée. Aucun fournisseur n’est proposé par défaut."}
            href="/student/finance-insurance"
            linkLabel="Voir les options"
            tone={publishableFinanceOptions.length ? "done" : "neutral"}
          />

          <PathwayCard
            number="6"
            title="Démarches finales"
            state={checklistItems.length ? `${completedChecklistItems}/${checklistItems.length} terminées` : "Aucune étape enregistrée"}
            detail={checklistItems.length
              ? "La checklist regroupe les actions opérationnelles réellement enregistrées dans votre dossier."
              : "Les démarches apparaîtront ici lorsqu’elles seront enregistrées dans votre dossier."}
            href="/student/checklist"
            linkLabel="Voir mes démarches"
            tone={checklistItems.length > 0 && completedChecklistItems === checklistItems.length ? "done" : "neutral"}
          />
        </div>
      </section>

      <section className="mt-8" aria-labelledby="official-sources-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Sources officielles</p>
          <h2 id="official-sources-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Règles à vérifier pour votre situation
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Ces informations viennent de sources officielles vérifiées. Vérifiez-les encore sur la source officielle avant votre démarche.
          </p>
          {needsFilingCountry && (
            <div className="mt-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/60 p-4 text-sm leading-6 text-amber-900">
              Indiquez votre pays de résidence / dépôt dans « Mon projet ». AlmaGo ne déduit pas ce pays de votre nationalité.
            </div>
          )}
        </div>

        {relevantRegulatorySources.length ? (
          <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
            {relevantRegulatorySources.map((source) => (
              <RegulatorySourceCard key={source.topic + source.source_url} source={source} />
            ))}
          </div>
        ) : (
          <Card className="border-amber-200 bg-amber-50/40 shadow-none">
            <Badge variant="warning">Revalidation requise</Badge>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Aucune source réglementaire actuellement vérifiée n’est disponible pour ce parcours. AlmaGo n’affiche donc pas de règle par défaut.
            </p>
          </Card>
        )}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Pourquoi ce résultat ?</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Pourquoi cette étape ?</h2>
          <dl className="mt-5 divide-y divide-slate-100">
            <FactRow label="Projet défini" value={facts.project_path ? "Oui" : "Non"} />
            <FactRow label="Pays de résidence / dépôt" value={filingCountry || "À renseigner"} />
            <FactRow label="Admission définitive acceptée" value={facts.accepted_definitive_admission ? "Oui" : "Non"} />
            <FactRow label="Base préparatoire acceptée" value={facts.accepted_preparatory_basis ? "Oui" : "Non"} />
            <FactRow label="Cours de préparation vérifié publié" value={facts.has_publishable_study_preparation_course ? "Oui" : "Non"} />
            <FactRow label="Preuve en vérification" value={facts.has_pending_academic_review ? "Oui" : "Non"} />
            <FactRow label="Preuve à remplacer" value={facts.has_replacement_required ? "Oui" : "Non"} />
          </dl>
        </Card>

        <Card className="bg-[var(--surface-subtle)] shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Prochaine action</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">{nextAction.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{nextAction.description}</p>
          <div className="mt-5">
            <ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink>
          </div>
        </Card>
      </section>

      <p className="mt-7 text-xs leading-5 text-slate-500">
        Les catégories affichées servent à structurer votre dossier AlmaGo. L’admission universitaire et toute décision relative à un visa ou à un titre de séjour restent du ressort des établissements et autorités compétents.
      </p>
    </main>
  );
}

function statusVariant(status: RegulatoryPathDecision["status"]): "success" | "info" | "warning" {
  if (status === "confirmed_basis") return "success";
  if (status === "candidate") return "info";
  return "warning";
}

function statusLabel(status: RegulatoryPathDecision["status"]) {
  if (status === "confirmed_basis") return "Base vérifiée";
  if (status === "candidate") return "Parcours à examiner";
  return "Action requise";
}

function academicBasisLabel(summary: ReturnType<typeof summarizeAcademicEvidence>) {
  if (summary.accepted_definitive_admission) return "Admission définitive acceptée";
  if (summary.accepted_preparatory_basis) return "Base préparatoire acceptée";
  if (summary.has_replacement_required) return "Document à remplacer";
  if (summary.has_pending_review) return "Vérification en cours";
  return "Aucune base acceptée";
}

function academicBasisDetail(summary: ReturnType<typeof summarizeAcademicEvidence>) {
  if (summary.accepted_definitive_admission) {
    return "Une admission définitive officielle a été vérifiée et acceptée comme preuve de parcours.";
  }
  if (summary.accepted_preparatory_basis) {
    return "Une admission conditionnelle, Bewerberbestätigung ou correspondance universitaire admissible a été acceptée comme base préparatoire.";
  }
  if (summary.has_replacement_required) {
    return "Une preuve académique doit être remplacée avant de pouvoir être utilisée.";
  }
  if (summary.has_pending_review) {
    return "Une preuve académique est enregistrée mais doit encore être vérifiée ou complétée.";
  }
  return "Aucune preuve académique acceptée pour le parcours n’est enregistrée à ce stade.";
}

function nextActionFor(decision: RegulatoryPathDecision) {
  switch (decision.reason_code) {
    case "definitive_admission_accepted":
      return {
        title: "Préparer les démarches après admission",
        description: "Votre admission acceptée permet de passer aux démarches opérationnelles enregistrées dans votre dossier.",
        label: "Voir mes démarches",
        href: "/student/checklist",
      };
    case "preparatory_basis_and_course_confirmed":
      return {
        title: "Organiser la préparation aux études",
        description: "Votre base académique préparatoire et le catalogue de cours vérifiés permettent d’organiser la suite du dossier.",
        label: "Voir mes démarches",
        href: "/student/checklist",
      };
    case "preparatory_course_missing":
      return {
        title: "Identifier un cours préparatoire vérifié",
        description: "La base académique existe, mais il manque encore un cours de préparation aux études vérifié dans les données disponibles.",
        label: "Voir les cours",
        href: "/student/language-courses",
      };
    case "academic_evidence_replacement_required":
      return {
        title: "Remplacer la preuve académique",
        description: "Corrigez le document signalé avant de recalculer le parcours.",
        label: "Voir mes documents",
        href: "/student/documents",
      };
    case "academic_evidence_pending_review":
      return {
        title: "Attendre ou compléter la vérification académique",
        description: "Une preuve est encore en cours de vérification. Consultez vos documents pour voir son état.",
        label: "Voir mes documents",
        href: "/student/documents",
      };
    case "language_only_project":
      return {
        title: "Comparer les cours de langue vérifiés",
        description: "Votre objectif enregistré est linguistique. Consultez le catalogue avant d’organiser les démarches suivantes.",
        label: "Voir les cours",
        href: "/student/language-courses",
      };
    case "study_place_search_candidate":
      return {
        title: "Continuer la recherche de programme",
        description: "Aucune admission acceptée n’est encore enregistrée. Continuez l’orientation et la préparation de vos candidatures.",
        label: "Voir mon orientation",
        href: "/student/orientation",
      };
    default:
      return {
        title: "Définir votre projet",
        description: "Précisez d’abord votre objectif en Allemagne pour que le parcours puisse être calculé.",
        label: "Définir mon projet",
        href: "/student/project",
      };
  }
}

function PathwayCard({
  number,
  title,
  state,
  detail,
  href,
  linkLabel,
  tone,
}: {
  number: string;
  title: string;
  state: string;
  detail: string;
  href: string;
  linkLabel: string;
  tone: "done" | "attention" | "neutral";
}) {
  const statusClass =
    tone === "done"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "attention"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-[var(--border)] bg-[var(--surface-subtle)] text-slate-700";

  return (
    <div className="grid gap-4 p-5 sm:grid-cols-[2.75rem_minmax(9rem,0.72fr)_minmax(0,1.28fr)_auto] sm:items-center sm:p-6">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">
        {number}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}>
          {state}
        </span>
      </div>
      <p className="text-sm leading-6 text-slate-600">{detail}</p>
      <div className="justify-self-start sm:justify-self-end">
        <ButtonLink href={href} variant="secondary">{linkLabel}</ButtonLink>
      </div>
    </div>
  );
}

function regulatorySourceMatchesFilingCountry(originCountry: string | null, filingCountry: string | null) {
  if (!originCountry) return true;
  return Boolean(filingCountry && originCountry.toUpperCase() === filingCountry.toUpperCase());
}

function regulatoryTopicsForRoute(route: RegulatoryRoute | null) {
  if (route === "STUDIUM") return ["study_visa", "study_visa_financing", "university_admission"];
  if (route === "STUDIENVORBEREITUNG") return ["study_preparation_tunisia", "study_visa_financing", "university_admission"];
  if (route === "STUDIENPLATZSUCHE") return ["study_place_search", "university_admission"];
  if (route === "SPRACHKURS") return ["standalone_language_tunisia"];
  return ["study_visa", "study_preparation_tunisia", "study_place_search", "standalone_language_tunisia", "university_admission"];
}

function RegulatorySourceCard({
  source,
}: {
  source: {
    authority: string;
    title: string;
    source_url: string;
    topic: string;
    jurisdiction: string;
    origin_country: string | null;
    destination_country: string | null;
    checked_on: string;
    summary: string;
    amount: number | null;
    currency: string | null;
    periodicity: string | null;
    verified_at: string | null;
    review_due_at: string | null;
  };
}) {
  return (
    <article className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(10rem,0.55fr)_minmax(0,1.45fr)_auto] lg:items-start">
      <div>
        <Badge variant="success">Vérifiée</Badge>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{source.authority}</p>
        <p className="mt-1 text-xs text-slate-500">
          Contrôlée le {formatSourceDate(source.checked_on)}
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-950">{source.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{source.summary}</p>
        {source.amount !== null && source.currency && (
          <p className="mt-3 text-sm font-semibold text-slate-800">
            Montant publié : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: source.currency }).format(source.amount)}
            {source.periodicity === "monthly" ? " / mois" : source.periodicity === "yearly" ? " / an" : ""}
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">À revoir avant le {formatSourceDate(source.review_due_at)}</p>
      </div>

      <a
        href={source.source_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]"
      >
        Source officielle
      </a>
    </article>
  );
}

function formatSourceDate(value: string | null) {
  if (!value) return "—";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(timestamp));
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-3 text-sm">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function PathwayUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="pathway" eyebrow="Mon dossier" title="Parcours temporairement indisponible" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Impossible de calculer le parcours pour le moment</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Une donnée nécessaire au calcul n’a pas pu être chargée. AlmaGo ne propose aucun parcours par défaut lorsque les faits du dossier sont indisponibles.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/pathway">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
