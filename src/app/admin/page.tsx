import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminEntry() {
  const supabase = await createClient();

  const [
    { count: universityCount, error: universitiesError },
    { count: programCount, error: programsError },
    { count: applicationCount, error: applicationsError },
    { count: documentsToReview, error: documentsError },
    { count: orientationCount, error: orientationError },
    { data: universityQualityRows, error: universityQualityError },
    { data: programQualityRows, error: programQualityError },
  ] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).in("status", ["pending", "replace_required"]),
    supabase.from("program_recommendations").select("id", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("universities").select("id,website_url,source_url,verified_at").eq("is_active", true),
    supabase.from("programs").select("id,application_url,source_url,verified_at").eq("is_active", true),
  ]);

  if (
    universitiesError ||
    programsError ||
    applicationsError ||
    documentsError ||
    orientationError ||
    universityQualityError ||
    programQualityError
  ) {
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

  const documents = documentsToReview || 0;
  const applications = applicationCount || 0;
  const orientations = orientationCount || 0;
  const catalogue = (universityCount || 0) + (programCount || 0);
  const universitiesQuality = universityQualityRows || [];
  const programsQuality = programQualityRows || [];
  const universitySourceGaps = universitiesQuality.filter(
    (university) => !university.source_url && !university.website_url,
  ).length;
  const programSourceGaps = programsQuality.filter(
    (program) => !program.source_url && !program.application_url,
  ).length;
  const universityVerificationGaps = universitiesQuality.filter(
    (university) => !university.verified_at,
  ).length;
  const programVerificationGaps = programsQuality.filter(
    (program) => !program.verified_at,
  ).length;
  const catalogueQualityIssues =
    universitiesQuality.filter(
      (university) =>
        !university.verified_at || (!university.source_url && !university.website_url),
    ).length +
    programsQuality.filter(
      (program) =>
        !program.verified_at || (!program.source_url && !program.application_url),
    ).length;
  const catalogueSourceGaps = universitySourceGaps + programSourceGaps;
  const catalogueVerificationGaps = universityVerificationGaps + programVerificationGaps;

  const priority = documents > 0
    ? {
        badge: "Documents à traiter",
        title: `${documents} document${documents > 1 ? "s" : ""} demande${documents > 1 ? "nt" : ""} votre attention`,
        description: "Commencez par la file documentaire : une vérification ou un remplacement demandé peut bloquer la suite du dossier étudiant.",
        href: "/admin/documents",
        action: "Ouvrir la file documents",
      }
    : applications > 0
      ? {
          badge: "Candidatures actives",
          title: `${applications} candidature${applications > 1 ? "s" : ""} reste${applications > 1 ? "nt" : ""} en suivi`,
          description: "Aucun document n’attend de revue. Vérifiez maintenant les échéances, statuts et prochaines actions des candidatures actives.",
          href: "/admin/applications",
          action: "Suivre les candidatures",
        }
      : catalogueQualityIssues > 0
        ? {
            badge: "Catalogue à vérifier",
            title: `${catalogueQualityIssues} fiche${catalogueQualityIssues > 1 ? "s" : ""} du catalogue demande${catalogueQualityIssues > 1 ? "nt" : ""} une vérification`,
            description: `Les dossiers opérationnels ne signalent pas de priorité plus urgente. Le catalogue contient ${catalogueSourceGaps} source${catalogueSourceGaps > 1 ? "s" : ""} à compléter et ${catalogueVerificationGaps} date${catalogueVerificationGaps > 1 ? "s" : ""} de vérification à renseigner.`,
            href: universityQualityIssues(universitiesQuality) >= programQualityIssues(programsQuality)
              ? "/admin/universities"
              : "/admin/programs",
            action: "Maintenir le catalogue",
          }
        : {
            badge: "Files prioritaires à jour",
            title: "Aucun blocage prioritaire n’est visible",
            description: "Les documents, candidatures et fiches actives du catalogue ne signalent pas de travail prioritaire dans cette vue.",
            href: "/admin/orientation",
            action: "Voir l’orientation",
          };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Administration"
        title="Vue d’ensemble"
        description="Voyez d’abord ce qui demande l’attention de l’équipe, puis accédez directement à la bonne file de travail."
        actions={
          <>
            <ButtonLink href="/admin/documents">Traiter les documents</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">Suivre les candidatures</ButtonLink>
          </>
        }
      />

      <section aria-label="Priorité opérationnelle" className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <Badge variant={documents > 0 ? "warning" : applications > 0 ? "info" : catalogueQualityIssues > 0 ? "warning" : "success"}>{priority.badge}</Badge>
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Ordre de traitement</p>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">1</span>
              <span><strong className="text-slate-950">Documents</strong><br />Traiter les pièces qui bloquent le dossier.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">2</span>
              <span><strong className="text-slate-950">Candidatures & orientation</strong><br />Mettre à jour statuts et prochaines actions.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</span>
              <span><strong className="text-slate-950">Catalogue</strong><br />Maintenir universités et programmes fiables.</span>
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
            title="Pistes d’orientation"
            value={orientations}
            detail="Pistes actives enregistrées"
            tone="neutral"
          />
          <AdminSummaryCard
            href="/admin/universities"
            title="Catalogue à vérifier"
            value={catalogueQualityIssues}
            detail={
              catalogueQualityIssues
                ? `${catalogueSourceGaps} source${catalogueSourceGaps > 1 ? "s" : ""} à compléter · ${catalogueVerificationGaps} date${catalogueVerificationGaps > 1 ? "s" : ""} à renseigner`
                : `${catalogue} fiches actives sans anomalie de vérification visible`
            }
            tone={catalogueQualityIssues ? "warning" : "neutral"}
          />
        </div>
      </section>

      <Card className="mt-8 border-[var(--border)] bg-white shadow-none">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Principe de travail</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Résoudre les blocages avant d’enrichir le catalogue.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cette vue utilise uniquement les états réellement enregistrés dans AlmaGo. Elle n’ajoute aucun classement ni niveau de priorité artificiel.
            </p>
          </div>
          <ButtonLink href="/admin/orientation" variant="secondary">Préparer une orientation</ButtonLink>
        </div>
      </Card>
    </main>
  );
}

function universityQualityIssues(
  universities: Array<{
    source_url: string | null;
    website_url: string | null;
    verified_at: string | null;
  }>,
) {
  return universities.filter(
    (university) =>
      !university.verified_at || (!university.source_url && !university.website_url),
  ).length;
}

function programQualityIssues(
  programs: Array<{
    source_url: string | null;
    application_url: string | null;
    verified_at: string | null;
  }>,
) {
  return programs.filter(
    (program) =>
      !program.verified_at || (!program.source_url && !program.application_url),
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
