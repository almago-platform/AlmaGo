import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const dashboardCards = [
  {
    key: "universities",
    title: "Universités actives",
    description: "Catalogue visible dans les recommandations.",
    href: "/admin/universities",
  },
  {
    key: "programs",
    title: "Programmes actifs",
    description: "Formations et conditions suivies.",
    href: "/admin/programs",
  },
  {
    key: "applications",
    title: "Candidatures ouvertes",
    description: "Dossiers encore en suivi.",
    href: "/admin/applications",
  },
  {
    key: "documents",
    title: "Documents en attente",
    description: "Pièces à vérifier ou corriger.",
    href: "/admin/documents",
  },
] as const;

export default async function AdminEntry() {
  const supabase = await createClient();
  const [{ count: universityCount, error: universitiesError }, { count: programCount, error: programsError }, { count: applicationCount, error: applicationsError }, { count: pendingDocuments, error: documentsError }] =
    await Promise.all([
      supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  if (universitiesError || programsError || applicationsError || documentsError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader badge="Administration" title="Pilotage AlmaGo" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-semibold text-slate-950">Indicateurs indisponibles</h2>
            <p className="mt-2 text-sm text-slate-600">Impossible de charger les données pour le moment. Réessayez dans quelques instants.</p>
          </div>
          <div className="mt-5"><ButtonLink href="/admin">Réessayer</ButtonLink></div>
        </Card>
      </main>
    );
  }

  const counts = {
    universities: universityCount || 0,
    programs: programCount || 0,
    applications: applicationCount || 0,
    documents: pendingDocuments || 0,
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Administration"
        title="Pilotage AlmaGo"
        description="Gardez une vue claire sur le catalogue, les dossiers étudiants et les actions qui demandent l’attention de l’équipe."
        actions={
          <>
            <ButtonLink href="/admin/orientation">Préparer une orientation</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">
              Suivre les candidatures
            </ButtonLink>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicateurs administration">
        {dashboardCards.map(({ key, title, description, href }) => (
          <DashboardCard key={key} title={title} value={counts[key]} description={description} href={href} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <Card className="bg-slate-950 text-white shadow-xl">
          <Badge variant="info">Priorité opérationnelle</Badge>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">Traiter les blocages dossier avant d&apos;ajouter du volume.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Les documents en attente et les candidatures ouvertes donnent la meilleure lecture de la charge réelle. Commencez par ces éléments avant d&apos;enrichir le catalogue.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/admin/documents">Vérifier les documents</ButtonLink>
            <ButtonLink href="/admin/applications" variant="secondary">
              Voir les dossiers
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Rythme conseillé</h2>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <li>
              <span className="font-bold text-slate-950">1. Vérifier</span> les documents en attente.
            </li>
            <li>
              <span className="font-bold text-slate-950">2. Mettre à jour</span> les candidatures ouvertes.
            </li>
            <li>
              <span className="font-bold text-slate-950">3. Enrichir</span> universités et programmes actifs.
            </li>
          </ol>
        </Card>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Ouvrir ${title}`}
      className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
    >
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-xl">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{description}</p>
        <p className="mt-4 text-sm font-bold text-[var(--accent-strong)]">
          Ouvrir <span aria-hidden="true">→</span>
        </p>
      </Card>
    </Link>
  );
}
