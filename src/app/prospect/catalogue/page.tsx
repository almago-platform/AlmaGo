import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { loadProspectHubState } from "@/lib/prospect/hub";
import {
  prospectCatalogueProfileDefaults,
  prospectCatalogueRecommendations,
} from "@/lib/prospect/programmes";

function normalized(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function matchesProject(
  programme: OrientationProgrammeRecord,
  answers: Awaited<ReturnType<typeof loadProspectHubState>>["answers"],
) {
  if (!answers) return false;

  const degreeMatch = normalized(programme.degreeLevel) === normalized(answers.targetDegree);
  const cityMatch = answers.preferredCities.some(
    (city) => normalized(city) === normalized(programme.university.city),
  );

  return degreeMatch && cityMatch;
}

export const dynamic = "force-dynamic";

export default async function ProspectCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{
    degree?: string;
    field?: string;
    city?: string;
    view?: string;
  }>;
}) {
  const [access, locale, params, catalogue] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
    searchParams,
    loadVerifiedProgrammeCatalogue(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const state = await loadProspectHubState({
    userId: access.user.id,
    email: access.user.email,
    emailConfirmed: Boolean(access.user.email_confirmed_at),
  });
  const t = prospectHubCopy[locale].catalogue;
  const recommendations = prospectCatalogueRecommendations(state.answers, catalogue);
  const recommendedIds = new Set(
    recommendations.map((recommendation) => recommendation.programme.id),
  );
  const profileDefaults = prospectCatalogueProfileDefaults(state.answers, catalogue);

  const requestedDegree = (params.degree || "").trim();
  const requestedField = (params.field || "").trim();
  const requestedCity = (params.city || "").trim();
  const explicitFilters = Boolean(requestedDegree || requestedField || requestedCity);
  const generalMode = params.view === "all" || explicitFilters;
  const degree = generalMode ? requestedDegree : profileDefaults.degree;
  const field = generalMode ? requestedField : profileDefaults.field;
  const city = generalMode ? requestedCity : profileDefaults.city;
  const hasFilters = Boolean(degree || field || city);
  const showGeneralResults = generalMode || recommendations.length === 0;

  const degrees = [...new Set(catalogue.map((item) => item.degreeLevel).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const fields = [...new Set(catalogue.map((item) => item.field).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));
  const cities = [...new Set(catalogue.map((item) => item.university.city).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));

  const filtered = catalogue
    .filter((programme) => !degree || normalized(programme.degreeLevel) === normalized(degree))
    .filter((programme) => !field || normalized(programme.field).includes(normalized(field)))
    .filter((programme) => !city || normalized(programme.university.city) === normalized(city))
    .filter((programme) => generalMode || !recommendedIds.has(programme.id))
    .sort((a, b) => {
      const aMatch = matchesProject(a, state.answers) ? 1 : 0;
      const bMatch = matchesProject(b, state.answers) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      const cityOrder = (a.university.city || "").localeCompare(b.university.city || "");
      return cityOrder || a.name.localeCompare(b.name);
    })
    .slice(0, 80);

  const recommendationLabels = {
    projectMatch: t.projectMatch,
    preferredCity: t.preferredCity,
    requirementCheck: t.requirementCheck,
    field: t.field,
    german: t.german,
    uniAssist: t.uniAssist,
    yes: t.yes,
    source: t.source,
    applyLink: t.applyLink,
  };

  return (
    <main className="space-y-6">
      <ProspectPageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      {recommendations.length ? (
        <section aria-labelledby="prospect-recommended-programmes">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                {t.projectMatch}
              </p>
              <h2 id="prospect-recommended-programmes" className="mt-1 text-2xl font-bold">
                {t.recommendedTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {t.recommendedSubtitle}
              </p>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {recommendations.map((recommendation) => (
              <ProspectProgrammeRecommendationCard
                key={recommendation.programme.id}
                recommendation={recommendation}
                labels={recommendationLabels}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {t.generalCatalogue}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{t.browseAllTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {t.browseAllSubtitle}
        </p>

        <form action="/prospect/catalogue" className="mt-5">
          <input type="hidden" name="view" value="all" />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              {t.degree}
              <select name="degree" defaultValue={degree} className="field mt-2">
                <option value="">{t.all}</option>
                {degrees.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold">
              {t.field}
              <select name="field" defaultValue={field} className="field mt-2">
                <option value="">{t.all}</option>
                {fields.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold">
              {t.city}
              <select name="city" defaultValue={city} className="field mt-2">
                <option value="">{t.all}</option>
                {cities.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
            >
              {t.apply}
            </button>
            <Link
              href="/prospect/catalogue?view=all"
              className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-semibold transition hover:border-[var(--brand-border)]"
            >
              {t.reset}
            </Link>
          </div>
        </form>
      </section>

      {showGeneralResults ? (
      <section aria-labelledby="prospect-catalogue-results">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="prospect-catalogue-results" className="text-2xl font-bold">{t.browseAllTitle}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{t.results(filtered.length)}</p>
          </div>
        </div>

        {filtered.length ? (
          <div className="grid gap-4">
            {filtered.map((programme) => {
              const projectMatch = matchesProject(programme, state.answers);
              return (
                <article
                  key={programme.id}
                  className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--brand-border)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                        {projectMatch ? t.projectMatch : t.generalCatalogue}
                      </p>
                      <h3 className="mt-2 text-xl font-bold [overflow-wrap:anywhere]">
                        <bdi dir="auto">{programme.name}</bdi>
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        <bdi dir="auto">{programme.university.name}</bdi>
                        {programme.university.city ? <> · <bdi dir="auto">{programme.university.city}</bdi></> : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold">
                        {programme.degreeLevel}
                      </span>
                      {programme.teachingLanguage ? (
                        <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold">
                          <bdi dir="auto">{programme.teachingLanguage}</bdi>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
                    <div className="bg-[var(--surface-subtle)] p-3">
                      <dt className="text-xs font-semibold text-[var(--muted)]">{t.field}</dt>
                      <dd className="mt-1 text-sm font-semibold"><bdi dir="auto">{programme.field || "—"}</bdi></dd>
                    </div>
                    <div className="bg-[var(--surface-subtle)] p-3">
                      <dt className="text-xs font-semibold text-[var(--muted)]">{t.german}</dt>
                      <dd className="mt-1 text-sm font-semibold">{programme.germanLevelRequired || t.requirementCheck}</dd>
                    </div>
                    <div className="bg-[var(--surface-subtle)] p-3">
                      <dt className="text-xs font-semibold text-[var(--muted)]">{t.uniAssist}</dt>
                      <dd className="mt-1 text-sm font-semibold">{programme.uniAssistRequired ? t.yes : t.requirementCheck}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {programme.programmeSourceUrl ? (
                      <a
                        href={programme.programmeSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
                      >
                        {t.source}
                      </a>
                    ) : null}
                    {programme.applicationUrl ? (
                      <a
                        href={programme.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
                      >
                        {t.applyLink}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
            {t.noResults}
          </div>
        )}
      </section>
      ) : null}

      <p className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-xs leading-5 text-[var(--foreground)]">
        {t.boundary}
      </p>
    </main>
  );
}
