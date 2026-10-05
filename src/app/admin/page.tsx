import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { catalogVerificationCutoff } from "@/lib/catalog-freshness";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const supabase = await createClient();

  const now = new Date();
  const staleCutoff = catalogVerificationCutoff(now);
  const dueSoonCutoff = new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000).toISOString();

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
  ] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).in("status", ["pending", "replace_required"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).in("status", ["student_question", "campus_review", "paid_pending_validation"]),
    supabase.from("student_intake_cases").select("student_id", { count: "exact", head: true }).eq("status", "student_question"),
    supabase.from("program_recommendations").select("id", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("language_courses").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).lte("verified_at", staleCutoff),
    supabase.from("finance_insurance_catalog").select("id", { count: "exact", head: true }).eq("is_active", true).gt("verified_at", staleCutoff).lte("verified_at", dueSoonCutoff),
  ]);

  if (
    universitiesError || programsError || applicationsError || documentsError
    || intakeAttentionError || studentQuestionError || orientationError
    || staleLanguageError || dueLanguageError || staleFinanceError || dueFinanceError
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
          description: "Commencez par la file documentaire : une vérification ou un remplacement demandé peut bloquer la suite du dossier étudiant.",
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
            <ButtonLink href="/admin/intake">Valider les parcours</ButtonLink>
            <ButtonLink href="/admin/documents" variant="secondary">Traiter les documents</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">Suivre les candidatures</ButtonLink>
          </>
        }
      />

      <section aria-label="Priorité opérationnelle" className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.7fr)]">
        <Card className="relative overflow-hidden rounded-[1.3rem] border-black/[.07] bg-white shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)]">
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

        <Card className="rounded-[1.3rem] border-black/[.06] bg-[#f6f3ed] shadow-[0_18px_52px_-44px_rgba(0,0,0,.28)]">
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

      <section className="mt-7" aria-labelledby="admin-overview-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Files de travail</p>
          <h2 id="admin-overview-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            État opérationnel AlmaGo
          </h2>
        </div>

        <section aria-labelledby="admin-load-title" className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Charge opérationnelle</p>
            <h2 id="admin-load-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">Ce qui demande l’attention de l’équipe</h2>
          </div>
          <p className="hidden text-xs text-[var(--muted)] sm:block">Traiter les blocages avant l’enrichissement du catalogue.</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminSummaryCard
            href="/admin/intake"
            title="Dossiers Campus"
            value={intakeAttention}
            detail={studentQuestions ? `${studentQuestions} réponse${studentQuestions > 1 ? "s" : ""} étudiant à traiter` : "Décisions et validations en attente"}
            tone={studentQuestions ? "warning" : intakeAttention ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/documents"
            title="Documents à traiter"
            value={documents}
            detail={documents ? "Vérification ou remplacement en attente" : "Aucune pièce en attente"}
            tone={documents ? "warning" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/applications"
            title="Candidatures actives"
            value={applications}
            detail="Dossiers encore en suivi"
            tone={applications ? "info" : "neutral"}
          />
          <AdminSummaryCard
            href="/admin/orientation"
            title="Orientations publiées"
            value={orientations}
            detail="Recommandations actives enregistrées"
            tone="neutral"
          />
          <AdminSummaryCard
            href="/admin/universities"
            title="Catalogue actif"
            value={catalogue}
            detail={`${universityCount || 0} université${(universityCount || 0) > 1 ? "s" : ""} · ${programCount || 0} programme${(programCount || 0) > 1 ? "s" : ""}`}
            tone="neutral"
          />
        </div>
      </section>

      <section className="mt-7" aria-labelledby="catalogue-health-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Fraîcheur des sources</p>
          <h2 id="catalogue-health-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Révalidations du catalogue Allemagne
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Une vérification catalogue expire automatiquement après 30 jours. Les fiches expirées restent visibles ici pour l’équipe, mais disparaissent de l’espace étudiant.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CatalogHealthCard href="/admin/language-courses" title="Cours de langue" stale={staleLanguage} dueSoon={dueLanguage} />
          <CatalogHealthCard href="/admin/finance-insurance" title="Finance & assurance" stale={staleFinance} dueSoon={dueFinance} />
        </div>

        {staleCatalogue === 0 && dueCatalogue === 0 && (
          <p className="mt-4 text-sm font-semibold text-emerald-700">Aucune revalidation n’est requise dans les 7 prochains jours.</p>
        )}
      </section>

      <Card className="mt-7 rounded-[1.25rem] border-black/[.07] bg-white shadow-[0_20px_56px_-44px_rgba(0,0,0,.3)]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Principe de travail</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">Résoudre les blocages avant d’enrichir le catalogue.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cette vue utilise uniquement les états réellement enregistrés dans AlmaGo. Elle ne calcule aucun score de performance ou de priorité artificiel.
            </p>
          </div>
          <ButtonLink href="/admin/orientation" variant="secondary">Préparer une orientation</ButtonLink>
        </div>
      </Card>
    </main>
  );
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
      className="professional-hover group rounded-[1.2rem] border border-black/[.07] bg-white p-5 shadow-[0_18px_52px_-44px_rgba(0,0,0,.28)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-sm ${
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


function CatalogHealthCard({
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
      className="rounded-[1.2rem] border border-black/[.07] bg-white p-5 shadow-[0_18px_52px_-44px_rgba(0,0,0,.28)] transition-all duration-200 hover:-translate-y-px hover:border-[var(--brand-border)] hover:shadow-[0_24px_60px_-42px_rgba(0,0,0,.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {stale ? `${stale} fiche${stale > 1 ? "s" : ""} expirée${stale > 1 ? "s" : ""}` : "Aucune fiche expirée"}
            {" · "}
            {dueSoon ? `${dueSoon} à revoir sous 7 jours` : "aucune échéance sous 7 jours"}
          </p>
        </div>
        <Badge variant={stale ? "warning" : dueSoon ? "info" : "success"}>
          {stale ? "Action requise" : dueSoon ? "À planifier" : "À jour"}
        </Badge>
      </div>
    </Link>
  );
}
