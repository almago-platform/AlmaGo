import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { ProspectProgrammeCatalogueCard } from "@/components/prospect/ProspectProgrammeCatalogueCard";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { enrichProspectCatalogueUniversityMedia } from "@/lib/prospect/catalogue-media";
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
    university?: string;
    sort?: string;
    view?: string;
  }>;
}) {
  const [access, locale, params, rawCatalogue] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
    searchParams,
    loadVerifiedProgrammeCatalogue(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const [state, catalogue] = await Promise.all([
    loadProspectHubState({
      userId: access.user.id,
      email: access.user.email,
      emailConfirmed: Boolean(access.user.email_confirmed_at),
    }),
    enrichProspectCatalogueUniversityMedia(rawCatalogue),
  ]);

  const t = prospectHubCopy[locale].catalogue;
  const recommendations = prospectCatalogueRecommendations(state.answers, catalogue);
  const recommendedIds = new Set(
    recommendations.map((recommendation) => recommendation.programme.id),
  );
  const profileDefaults = prospectCatalogueProfileDefaults(state.answers, catalogue);

  const requestedDegree = (params.degree || "").trim();
  const requestedField = (params.field || "").trim();
  const requestedCity = (params.city || "").trim();
  const requestedUniversity = (params.university || "").trim();
  const requestedSort = (params.sort || "").trim();
  const explicitFilters = Boolean(
    requestedDegree
    || requestedField
    || requestedCity
    || requestedUniversity
    || requestedSort,
  );
  const generalMode = params.view === "all" || explicitFilters;
  const degree = generalMode ? requestedDegree : profileDefaults.degree;
  const field = generalMode ? requestedField : profileDefaults.field;
  const city = generalMode ? requestedCity : profileDefaults.city;
  const university = generalMode ? requestedUniversity : "";
  const sort = ["university", "city"].includes(requestedSort)
    ? requestedSort
    : "relevance";
  const showGeneralResults = generalMode || recommendations.length === 0;

  const degrees = [...new Set(catalogue.map((item) => item.degreeLevel).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const fields = [...new Set(catalogue.map((item) => item.field).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));
  const cities = [...new Set(catalogue.map((item) => item.university.city).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));
  const universities = [
    ...new Map(
      catalogue.map((item) => [item.university.id, item.university.name]),
    ).entries(),
  ]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filtered = catalogue
    .filter((programme) => !degree || normalized(programme.degreeLevel) === normalized(degree))
    .filter((programme) => !field || normalized(programme.field).includes(normalized(field)))
    .filter((programme) => !city || normalized(programme.university.city) === normalized(city))
    .filter((programme) => !university || normalized(programme.university.name) === normalized(university))
    .filter((programme) => generalMode || !recommendedIds.has(programme.id))
    .sort((a, b) => {
      if (sort === "university") {
        const universityOrder = a.university.name.localeCompare(b.university.name);
        if (universityOrder) return universityOrder;
        return a.name.localeCompare(b.name);
      }

      if (sort === "city") {
        const cityOrder = (a.university.city || "").localeCompare(b.university.city || "");
        if (cityOrder) return cityOrder;
        const universityOrder = a.university.name.localeCompare(b.university.name);
        return universityOrder || a.name.localeCompare(b.name);
      }

      const aMatch = matchesProject(a, state.answers) ? 1 : 0;
      const bMatch = matchesProject(b, state.answers) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      const cityOrder = (a.university.city || "").localeCompare(b.university.city || "");
      const universityOrder = a.university.name.localeCompare(b.university.name);
      return cityOrder || universityOrder || a.name.localeCompare(b.name);
    });

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

  const catalogueCardLabels = {
    projectMatch: t.projectMatch,
    generalCatalogue: t.generalCatalogue,
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
          <div className="grid gap-5 xl:grid-cols-2">
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

      <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {t.generalCatalogue}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{t.browseAllTitle}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {t.browseAllSubtitle}
              </p>
            </div>
            <p className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
              {t.results(catalogue.length)}
            </p>
          </div>
        </div>

        <form action="/prospect/catalogue" className="p-5">
          <input type="hidden" name="view" value="all" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

            <label className="text-sm font-semibold">
              {t.university}
              <select name="university" defaultValue={university} className="field mt-2">
                <option value="">{t.all}</option>
                {universities.map(({ id, name }) => (
                  <option key={id} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
              >
                {t.apply}
              </button>
              <Link
                href="/prospect/catalogue?view=all"
                className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-semibold transition hover:border-[var(--brand-border)] hover:bg-[var(--surface-subtle)]"
              >
                {t.reset}
              </Link>
            </div>

            <label className="min-w-56 text-sm font-semibold">
              {t.sort}
              <select name="sort" defaultValue={sort} className="field mt-2">
                <option value="relevance">{t.sortRelevance}</option>
                <option value="university">{t.sortUniversity}</option>
                <option value="city">{t.sortCity}</option>
              </select>
            </label>
          </div>
        </form>
      </section>

      {showGeneralResults ? (
        <section aria-labelledby="prospect-catalogue-results">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="prospect-catalogue-results" className="text-2xl font-bold">
                {t.browseAllTitle}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
                {t.results(filtered.length)}
              </p>
            </div>
          </div>

          {filtered.length ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {filtered.map((programme) => (
                <ProspectProgrammeCatalogueCard
                  key={programme.id}
                  programme={programme}
                  projectMatch={matchesProject(programme, state.answers)}
                  labels={catalogueCardLabels}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
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
