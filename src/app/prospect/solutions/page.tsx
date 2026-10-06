import { redirect } from "next/navigation";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
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
import { loadProspectHubState } from "@/lib/prospect/hub";

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

  const [languageResult, financeResult, state] = await Promise.all([
    languagePromise,
    financePromise,
    loadProspectHubState({
      userId: access.user.id,
      email: access.user.email,
      emailConfirmed: Boolean(access.user.email_confirmed_at),
    }),
  ]);

  const preferredCities = new Set(
    (state.answers?.preferredCities || []).map((city) =>
      city
        .trim()
        .toLocaleLowerCase("de")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
    ),
  );

  const languageCourses = ((languageResult.data || []) as LanguageCourse[])
    .sort((a, b) => {
      const aCity = (a.city || "")
        .trim()
        .toLocaleLowerCase("de")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      const bCity = (b.city || "")
        .trim()
        .toLocaleLowerCase("de")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      const aPreferred = preferredCities.has(aCity) ? 1 : 0;
      const bPreferred = preferredCities.has(bCity) ? 1 : 0;
      if (aPreferred !== bPreferred) return bPreferred - aPreferred;
      return a.provider_name.localeCompare(b.provider_name);
    });
  const financeOptions = ((financeResult.data || []) as FinanceInsuranceOption[])
    .filter((option) => isPublishableFinanceInsuranceOption(option, now));

  const intlLocale = financeCopy.intlLocale;

  return (
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        variant="compact"
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs font-semibold text-white/75">
            {languageCourses.length} · {t.language}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs font-semibold text-white/75">
            {financeOptions.length} · {t.finance}
          </span>
        </div>
      </ProspectPageHero>

      <nav aria-label={t.title} className="grid gap-3 md:grid-cols-2">
        <a
          href="#prospect-language-solutions"
          className="pc-card pc-card-interactive pc-premium-card pc-theme-red group flex min-w-0 items-center gap-4 p-4 sm:p-5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-black text-[var(--brand)]">A</span>
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--premium-ink)]">{t.language}</span>
            <span className="mt-1 block text-sm leading-5 text-[var(--foreground-soft)]">{t.languageText}</span>
          </span>
          <span className="ms-auto text-lg text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>

        <a
          href="#prospect-finance-solutions"
          className="pc-card pc-card-interactive pc-premium-card pc-theme-blue group flex min-w-0 items-center gap-4 p-4 sm:p-5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--premium-ink)] text-lg font-black text-white">€</span>
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--premium-ink)]">{t.finance}</span>
            <span className="mt-1 block text-sm leading-5 text-[var(--foreground-soft)]">{t.financeText}</span>
          </span>
          <span className="ms-auto text-lg text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>
      </nav>

      <section aria-labelledby="prospect-language-solutions">
        <div className="mb-4">
          <PremiumSectionHeader
            title={<span id="prospect-language-solutions">{t.language}</span>}
            description={t.languageText}
          />
        </div>

        {languageCourses.length ? (
          <div className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {languageCourses.map((course) => {
              const level = languageLevel(course);
              const price = formatPrice(course.price_cents, course.currency, intlLocale);
              const normalizedCity = (course.city || "")
                .trim()
                .toLocaleLowerCase("de")
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "");
              const isPreferredCity = preferredCities.has(normalizedCity);
              return (
                <article
                  key={course.id}
                  className="pc-card pc-card-interactive pc-premium-card p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
                      <bdi dir="auto">{course.provider_name}</bdi>
                    </p>
                    {isPreferredCity ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        {t.forYourProject}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]"><bdi dir="auto">{course.title}</bdi></h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {course.city ? (
                      <span className="rounded-full border border-black/[.05] bg-[#f3f0ea] px-2.5 py-1">
                        <bdi dir="auto">{course.city}</bdi>
                      </span>
                    ) : null}
                    {level ? <span className="rounded-full border border-black/[.05] bg-[#f3f0ea] px-2.5 py-1">{level}</span> : null}
                    {price ? <span className="rounded-full border border-black/[.05] bg-[#f3f0ea] px-2.5 py-1">{price}</span> : null}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {course.source_url ? (
                      <a
                        href={course.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("secondary", "min-h-10 px-4 py-2")}
                      >
                        {t.official}
                      </a>
                    ) : null}
                    {course.application_url ? (
                      <a
                        href={course.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("primary", "min-h-10 px-4 py-2")}
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
          <PremiumEmptyState title={t.empty} compact />
        )}
      </section>

      <section aria-labelledby="prospect-finance-solutions">
        <div className="mb-4">
          <PremiumSectionHeader
            title={<span id="prospect-finance-solutions">{t.finance}</span>}
            description={t.financeText}
          />
        </div>

        <div className="space-y-5">
          {financeInsuranceKinds.map((kind) => {
            const options = financeOptions.filter((option) => option.kind === kind);
            const sectionCopy = financeCopy.kinds[kind];

            return (
              <section key={kind}>
                <h3 className="text-xl font-bold">{sectionCopy.title}</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{sectionCopy.description}</p>

                {options.length ? (
                  <div className="mt-4 grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    {options.map((option) => (
                      <article
                        key={option.id}
                        className="pc-card pc-card-interactive pc-premium-card pc-theme-blue p-4 sm:p-5"
                      >
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]"><bdi dir="auto">{option.provider_name}</bdi></p>
                        {option.product_name ? (
                          <h4 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]"><bdi dir="auto">{option.product_name}</bdi></h4>
                        ) : null}
                        {option.description ? (
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{option.description}</p>
                        ) : null}
                        <dl className="mt-4 grid gap-2 text-sm">
                          {option.price_notes ? (
                            <div className="pc-soft-strip p-3.5">
                              <dt className="font-semibold">{financeCopy.facts.price}</dt>
                              <dd className="mt-1 text-[var(--muted)]">{option.price_notes}</dd>
                            </div>
                          ) : null}
                          {option.eligibility_notes ? (
                            <div className="pc-soft-strip p-3.5">
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
                            className={buttonClassName("secondary", "min-h-10 px-4 py-2")}
                          >
                            {t.official}
                          </a>
                          {option.application_url ? (
                            <a
                              href={option.application_url}
                              target="_blank"
                              rel="noreferrer"
                              className={buttonClassName("premium", "min-h-10 px-4 py-2")}
                            >
                              {t.provider}
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <PremiumEmptyState title={t.empty} compact />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      <p className="pc-waiting-strip p-4 text-xs leading-5 text-[var(--foreground-soft)]">
        {t.boundary}
      </p>
    </main>
  );
}
