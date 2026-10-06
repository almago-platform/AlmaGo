import { Badge } from "@/components/ui/Badge";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { StudentPageState } from "@/components/student/StudentPageState";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentResourceHeader } from "@/components/student/StudentResourceHeader";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { studentFinanceCopy } from "@/content/student-finance-copy";
import { rebrandCopy } from "@/lib/brand";
import {
  financeInsuranceKinds,
  isPublishableFinanceInsuranceOption,
  type FinanceInsuranceOption,
} from "@/lib/finance-insurance";
import { catalogVerificationCutoff, catalogVerificationExpiresAt } from "@/lib/catalog-freshness";
import { getRequestLocale } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";
import { localizeCatalogueLabel, localizeFinanceCatalogueField } from "@/lib/student/arabic-display";

export const dynamic = "force-dynamic";

export default async function StudentFinanceInsurancePage() {
  const locale = await getRequestLocale();
  const t = rebrandCopy(studentFinanceCopy[locale]);
  const supabase = await createClient();
  const now = new Date();
  const cutoff = catalogVerificationCutoff(now);
  if (!cutoff) return <CatalogueUnavailable copy={t} />;

  const { data, error } = await supabase
    .from("finance_insurance_catalog")
    .select("id,provider_name,product_name,kind,description,official_source_url,application_url,price_notes,eligibility_notes,verified_at,is_active")
    .eq("is_active", true)
    .lte("verified_at", now.toISOString())
    .gt("verified_at", cutoff)
    .order("kind", { ascending: true })
    .order("provider_name", { ascending: true });

  if (error) return <CatalogueUnavailable copy={t} />;

  const options = (data || []).filter((option) =>
    isPublishableFinanceInsuranceOption(option, now),
  ) as FinanceInsuranceOption[];

  return (
    <StudentPageFrame>
      <StudentResourceHeader
        current="finance"
        title={t.title}
        description={t.description}
        actions={<ButtonLink href="/student/pathway" variant="secondary">{t.back}</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow={t.guidance.eyebrow}
        title={t.guidance.title}
        description={t.guidance.description}
        points={[...t.guidance.points]}
      />

      <div className="mt-8 space-y-8">
        {financeInsuranceKinds.map((kind) => {
          const section = t.kinds[kind];
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
                    <OptionCard key={option.id} option={option} copy={t} locale={locale} />
                  ))}
                </div>
              ) : (
                <Card className="bg-[var(--surface-subtle)] shadow-none">
                  <Badge variant="neutral">{t.emptyBadge}</Badge>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{t.emptyText}</p>
                </Card>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-xs leading-5 text-slate-500">{t.boundary}</p>
    </StudentPageFrame>
  );
}

function OptionCard({
  option,
  copy,
  locale,
}: {
  option: FinanceInsuranceOption;
  copy: (typeof studentFinanceCopy)["fr"];
  locale: "fr" | "ar" | "en" | "de";
}) {
  return (
    <article className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.45fr)]">
      <div>
        <Badge variant="success">{copy.verified}</Badge>
        <p className="mt-3 text-lg font-bold text-slate-950"><bdi dir="auto">{option.provider_name}</bdi></p>
        {option.product_name && <p className="mt-1 text-sm font-semibold text-slate-700"><bdi dir="auto">{localizeCatalogueLabel(locale, option.product_name)}</bdi></p>}
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={option.official_source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            {copy.officialSource}
          </a>
          {option.application_url && (
            <a
              href={option.application_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {copy.providerSite}
            </a>
          )}
        </div>
      </div>

      <div>
        {option.description && <p className="text-sm leading-6 text-slate-600">{localizeFinanceCatalogueField(locale, option.provider_name, "description", option.description)}</p>}
        <dl className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          <Fact label={copy.facts.price} value={option.price_notes ? localizeFinanceCatalogueField(locale, option.provider_name, "price", option.price_notes) : copy.unknownOfficial} />
          <Fact label={copy.facts.eligibility} value={option.eligibility_notes ? localizeFinanceCatalogueField(locale, option.provider_name, "eligibility", option.eligibility_notes) : copy.unknownProvider} />
          <Fact label={copy.facts.verifiedAt} value={formatVerifiedAt(option.verified_at, copy)} />
          <Fact label={copy.facts.revalidateBefore} value={formatVerifiedAt(catalogVerificationExpiresAt(option.verified_at), copy)} />
        </dl>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-slate-700">{label}</dt>
      <dd dir="auto" className="text-sm leading-6 text-slate-600">{value}</dd>
    </div>
  );
}

function formatVerifiedAt(value: string | null, copy: (typeof studentFinanceCopy)["fr"]) {
  if (!value) return copy.unknown;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return copy.unknown;
  return new Intl.DateTimeFormat(copy.intlLocale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function CatalogueUnavailable({ copy }: { copy: (typeof studentFinanceCopy)["fr"] }) {
  return (
    <StudentPageFrame>
      <StudentResourceHeader current="finance" title={copy.title} description={copy.unavailableDescription} />
      <StudentPageState
        variant="warning"
        title={copy.unavailableTitle}
        description={copy.unavailableText}
        actions={
          <>
            <ButtonLink href="/student/finance-insurance">{copy.retry}</ButtonLink>
            <ButtonLink href="/student/pathway" variant="secondary">{copy.back}</ButtonLink>
          </>
        }
      />
    </StudentPageFrame>
  );
}
