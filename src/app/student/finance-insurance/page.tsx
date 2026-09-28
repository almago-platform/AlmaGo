import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentResourceHeader } from "@/components/student/StudentResourceHeader";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import {
  financeInsuranceKinds,
  isPublishableFinanceInsuranceOption,
  type FinanceInsuranceKind,
  type FinanceInsuranceOption,
} from "@/lib/finance-insurance";
import { catalogVerificationCutoff, catalogVerificationExpiresAt } from "@/lib/catalog-freshness";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const kindDetails: Record<FinanceInsuranceKind, { title: string; description: string }> = {
  blocked_account_provider: {
    title: "Compte bloqué",
    description: "Comparez les offres et vérifiez les conditions sur la source officielle.",
  },
  health_insurance_provider: {
    title: "Assurance santé",
    description: "Comparez les offres et vérifiez les conditions auprès de l’assureur.",
  },
  student_financing_option: {
    title: "Financement étudiant",
    description: "Comparez les solutions et vérifiez qui peut en bénéficier.",
  },
};

export default async function StudentFinanceInsurancePage() {
  const supabase = await createClient();
  const now = new Date();
  const cutoff = catalogVerificationCutoff(now);
  if (!cutoff) return <CatalogueUnavailable />;

  const { data, error } = await supabase
    .from("finance_insurance_catalog")
    .select("id,provider_name,product_name,kind,description,official_source_url,application_url,price_notes,eligibility_notes,verified_at,is_active")
    .eq("is_active", true)
    .lte("verified_at", now.toISOString())
    .gt("verified_at", cutoff)
    .order("kind", { ascending: true })
    .order("provider_name", { ascending: true });

  if (error) return <CatalogueUnavailable />;

  const options = (data || []).filter((option) =>
    isPublishableFinanceInsuranceOption(option, now),
  ) as FinanceInsuranceOption[];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentResourceHeader
        current="finance"
        title="Financement et assurance"
        description="Comparez des options dont la source et la date de vérification sont visibles. AlmaGo ne classe pas les fournisseurs et ne déduit ni votre éligibilité ni une exigence de visa."
        actions={<ButtonLink href="/student/pathway" variant="secondary">Retour à mon parcours</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow="Avant toute démarche ou paiement"
        title="Vérifiez la source officielle avant de choisir."
        description="Les prix et les conditions peuvent changer. Vérifiez toujours la source officielle avant de choisir."
        points={[
          "Regarder la date de vérification.",
          "Lire les conditions du fournisseur.",
          "Vérifier les exigences auprès de l’autorité compétente.",
        ]}
      />

      <div className="mt-8 space-y-8">
        {financeInsuranceKinds.map((kind) => {
          const section = kindDetails[kind];
          const sectionOptions = options.filter((option) => option.kind === kind);

          return (
            <section key={kind} aria-labelledby={"finance-" + kind}>
              <div className="mb-4">
                <h2 id={"finance-" + kind} className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{section.description}</p>
              </div>

              {sectionOptions.length ? (
                <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
                  {sectionOptions.map((option) => (
                    <OptionCard key={option.id} option={option} />
                  ))}
                </div>
              ) : (
                <Card className="bg-[var(--surface-subtle)] shadow-none">
                  <Badge variant="neutral">Aucune option publiée</Badge>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Aucune option vérifiée n’est disponible dans cette catégorie pour le moment.
                  </p>
                </Card>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-xs leading-5 text-slate-500">
        Les fournisseurs fixent leurs conditions. Les autorités décident des exigences de visa, de séjour et d’assurance.
      </p>
    </main>
  );
}

function OptionCard({ option }: { option: FinanceInsuranceOption }) {
  return (
    <article className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.45fr)]">
      <div>
        <Badge variant="success">Source vérifiée</Badge>
        <p className="mt-3 text-lg font-bold text-slate-950">{option.provider_name}</p>
        {option.product_name && <p className="mt-1 text-sm font-semibold text-slate-700">{option.product_name}</p>}
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={option.official_source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            Source officielle
          </a>
          {option.application_url && (
            <a
              href={option.application_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Site du fournisseur
            </a>
          )}
        </div>
      </div>

      <div>
        {option.description && <p className="text-sm leading-6 text-slate-600">{option.description}</p>}
        <dl className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          <Fact label="Prix / frais" value={option.price_notes || "À confirmer sur la source officielle"} />
          <Fact label="Conditions publiées" value={option.eligibility_notes || "À confirmer auprès du fournisseur"} />
          <Fact label="Dernière vérification" value={formatVerifiedAt(option.verified_at)} />
          <Fact label="À revalider avant" value={formatVerifiedAt(catalogVerificationExpiresAt(option.verified_at))} />
        </dl>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-slate-700">{label}</dt>
      <dd className="text-sm leading-6 text-slate-600">{value}</dd>
    </div>
  );
}

function formatVerifiedAt(value: string | null) {
  if (!value) return "À confirmer";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "À confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function CatalogueUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentResourceHeader current="finance" title="Financement et assurance" description="Les options vérifiées sont temporairement indisponibles." />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Catalogue temporairement indisponible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Impossible de charger les options vérifiées pour le moment. Réessayez.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/finance-insurance">Réessayer</ButtonLink>
          <ButtonLink href="/student/pathway" variant="secondary">Retour à mon parcours</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
