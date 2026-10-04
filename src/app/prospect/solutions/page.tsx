import { redirect } from "next/navigation";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { studentFinanceCopy } from "@/content/student-finance-copy";
import { catalogVerificationCutoff } from "@/lib/catalog-freshness";
import {
  financeInsuranceKinds,
  isPublishableFinanceInsuranceOption,
  type FinanceInsuranceOption,
} from "@/lib/finance-insurance";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

type LanguageCourse = {
  id: string;
  title: string;
  provider_name: string;
  city: string | null;
  language: string;
  purpose: string;
  level_from: string | null;
  level_to: string | null;
  hours_per_week: number | null;
  starts_on: string | null;
  ends_on: string | null;
  price_cents: number | null;
  currency: string | null;
  source_url: string | null;
  application_url: string | null;
  verified_at: string | null;
};

function formatPrice(value: number | null, currency: string | null, locale: string) {
  if (value === null || !currency) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value / 100);
  } catch {
    return null;
  }
}

function languageLevel(course: LanguageCourse) {
  if (course.level_from && course.level_to) {
    return course.level_from === course.level_to
      ? course.level_from
      : `${course.level_from} → ${course.level_to}`;
  }
  return course.level_from || course.level_to || null;
}

export const dynamic = "force-dynamic";

export default async function ProspectSolutionsPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const t = prospectHubCopy[locale].solutions;
  const financeCopy = studentFinanceCopy[locale];
  const now = new Date();
  const cutoff = catalogVerificationCutoff(now);

  const languagePromise = cutoff
    ? access.supabase
        .from("language_courses")
        .select("id,title,provider_name,city,language,purpose,level_from,level_to,hours_per_week,starts_on,ends_on,price_cents,currency,source_url,application_url,verified_at")
        .eq("is_active", true)
        .lte("verified_at", now.toISOString())
        .gt("verified_at", cutoff)
        .order("provider_name", { ascending: true })
        .order("title", { ascending: true })
        .limit(24)
    : Promise.resolve({ data: [], error: null });

  const financePromise = cutoff
    ? access.supabase
        .from("finance_insurance_catalog")
        .select("id,provider_name,product_name,kind,description,official_source_url,application_url,price_notes,eligibility_notes,verified_at,is_active")
        .eq("is_active", true)
        .lte("verified_at", now.toISOString())
        .gt("verified_at", cutoff)
        .order("kind", { ascending: true })
        .order("provider_name", { ascending: true })
    : Promise.resolve({ data: [], error: null });

  const [languageResult, financeResult] = await Promise.all([
    languagePromise,
    financePromise,
  ]);

  const languageCourses = (languageResult.data || []) as LanguageCourse[];
  const financeOptions = ((financeResult.data || []) as FinanceInsuranceOption[])
    .filter((option) => isPublishableFinanceInsuranceOption(option, now));

  const intlLocale = financeCopy.intlLocale;

  return (
    <main className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">{t.title}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">{t.subtitle}</p>
      </header>

      <section aria-labelledby="prospect-language-solutions">
        <div className="mb-4">
          <h2 id="prospect-language-solutions" className="text-2xl font-bold">{t.language}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.languageText}</p>
        </div>

        {languageCourses.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {languageCourses.map((course) => {
              const level = languageLevel(course);
              const price = formatPrice(course.price_cents, course.currency, intlLocale);
              return (
                <article
                  key={course.id}
                  className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                    <bdi dir="auto">{course.provider_name}</bdi>
                  </p>
                  <h3 className="mt-2 text-xl font-bold"><bdi dir="auto">{course.title}</bdi></h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {course.city ? (
                      <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1">
                        <bdi dir="auto">{course.city}</bdi>
                      </span>
                    ) : null}
                    {level ? <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1">{level}</span> : null}
                    {price ? <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1">{price}</span> : null}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {course.source_url ? (
                      <a
                        href={course.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold"
                      >
                        {t.official}
                      </a>
                    ) : null}
                    {course.application_url ? (
                      <a
                        href={course.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white"
                      >
                        {t.provider}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            {t.empty}
          </div>
        )}
      </section>

      <section aria-labelledby="prospect-finance-solutions">
        <div className="mb-4">
          <h2 id="prospect-finance-solutions" className="text-2xl font-bold">{t.finance}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.financeText}</p>
        </div>

        <div className="space-y-7">
          {financeInsuranceKinds.map((kind) => {
            const options = financeOptions.filter((option) => option.kind === kind);
            const sectionCopy = financeCopy.kinds[kind];

            return (
              <section key={kind}>
                <h3 className="text-xl font-bold">{sectionCopy.title}</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{sectionCopy.description}</p>

                {options.length ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {options.map((option) => (
                      <article
                        key={option.id}
                        className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5"
                      >
                        <p className="text-sm font-bold text-[var(--brand)]"><bdi dir="auto">{option.provider_name}</bdi></p>
                        {option.product_name ? (
                          <h4 className="mt-1 text-lg font-bold"><bdi dir="auto">{option.product_name}</bdi></h4>
                        ) : null}
                        {option.description ? (
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{option.description}</p>
                        ) : null}
                        <dl className="mt-4 grid gap-2 text-sm">
                          {option.price_notes ? (
                            <div className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
                              <dt className="font-semibold">{financeCopy.facts.price}</dt>
                              <dd className="mt-1 text-[var(--muted)]">{option.price_notes}</dd>
                            </div>
                          ) : null}
                          {option.eligibility_notes ? (
                            <div className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
                              <dt className="font-semibold">{financeCopy.facts.eligibility}</dt>
                              <dd className="mt-1 text-[var(--muted)]">{option.eligibility_notes}</dd>
                            </div>
                          ) : null}
                        </dl>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <a
                            href={option.official_source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold"
                          >
                            {t.official}
                          </a>
                          {option.application_url ? (
                            <a
                              href={option.application_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white"
                            >
                              {t.provider}
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[var(--radius-control)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
                    {t.empty}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      <p className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-xs leading-5">
        {t.boundary}
      </p>
    </main>
  );
}
