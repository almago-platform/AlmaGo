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
        <section aria-labelledby="prospect-recommended-programmes" className="rounded-[1.4rem] border border-black/[.05] bg-white/55 p-5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.28)] backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
                {t.projectMatch}
              </p>
              <h2 id="prospect-recommended-programmes" className="mt-2 text-[clamp(1.55rem,2.5vw,2.15rem)] font-semibold tracking-[-0.035em] text-[#1b1e20]">
                {t.recommendedTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
                {t.recommendedSubtitle}
              </p>
            </div>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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

      <section className="overflow-hidden rounded-[1.45rem] border border-black/[.07] bg-white shadow-[0_26px_70px_-44px_rgba(0,0,0,.38)]">
        <div className="border-b border-white/10 bg-[#17191b] px-5 py-5 text-white sm:px-6 sm:py-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
            {t.generalCatalogue}
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[clamp(1.55rem,2.5vw,2.15rem)] font-semibold tracking-[-0.035em] text-white">{t.browseAllTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                {t.browseAllSubtitle}
              </p>
            </div>
            <p className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75">
              {t.results(catalogue.length)}
            </p>
          </div>
        </div>

        <form action="/prospect/catalogue" className="bg-white p-5 sm:p-6">
          <input type="hidden" name="view" value="all" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-semibold">
              {t.degree}
              <select name="degree" defaultValue={degree} className="field mt-2 w-full rounded-xl border-black/10 bg-[#fbfaf7] shadow-none">
                <option value="">{t.all}</option>
                {degrees.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold">
              {t.field}
              <select name="field" defaultValue={field} className="field mt-2 w-full rounded-xl border-black/10 bg-[#fbfaf7] shadow-none">
                <option value="">{t.all}</option>
                {fields.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold">
              {t.city}
              <select name="city" defaultValue={city} className="field mt-2 w-full rounded-xl border-black/10 bg-[#fbfaf7] shadow-none">
                <option value="">{t.all}</option>
                {cities.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="text-sm font-semibold">
              {t.university}
              <select name="university" defaultValue={university} className="field mt-2 w-full rounded-xl border-black/10 bg-[#fbfaf7] shadow-none">
                <option value="">{t.all}</option>
                {universities.map(({ id, name }) => (
                  <option key={id} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-black/[.06] pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
              >
                {t.apply}
              </button>
              <Link
                href="/prospect/catalogue?view=all"
                className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:bg-[#faf8f3] hover:shadow-md"
              >
                {t.reset}
              </Link>
            </div>

            <label className="min-w-56 text-sm font-semibold">
              {t.sort}
              <select name="sort" defaultValue={sort} className="field mt-2 w-full rounded-xl border-black/10 bg-[#fbfaf7] shadow-none">
                <option value="relevance">{t.sortRelevance}</option>
                <option value="university">{t.sortUniversity}</option>
                <option value="city">{t.sortCity}</option>
              </select>
            </label>
          </div>
        </form>
      </section>

      {showGeneralResults ? (
        <section aria-labelledby="prospect-catalogue-results" className="pt-1">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="prospect-catalogue-results" className="text-[clamp(1.55rem,2.5vw,2.15rem)] font-semibold tracking-[-0.035em] text-white">
                {t.browseAllTitle}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
                {t.results(filtered.length)}
              </p>
            </div>
          </div>

          {filtered.length ? (
            <div className="grid items-start gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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
            <div className="rounded-[1.35rem] border border-dashed border-black/15 bg-white/70 p-10 text-center text-sm text-[var(--muted)] shadow-[0_18px_50px_-40px_rgba(0,0,0,.3)]">
              {t.noResults}
            </div>
          )}
        </section>
      ) : null}

      <p className="rounded-[1.15rem] border border-[#ead59a] bg-[#fff9e9] p-4 text-xs leading-5 text-[#4f4631] shadow-[0_16px_42px_-36px_rgba(139,98,0,.35)]">
        {t.boundary}
      </p>
    </main>
  );
}
