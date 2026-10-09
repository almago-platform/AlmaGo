import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { ProspectProgrammeCatalogueCard } from "@/components/prospect/ProspectProgrammeCatalogueCard";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { loadProspectHubState } from "@/lib/prospect/hub";
import { prospectMedia } from "@/lib/prospect/media";
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

  // Academic information comes only from the verified catalogue. Media already stored
  // with a university is displayed, while missing photos use the card's visual fallback.
  // Do not perform external Wikimedia requests or privileged DB writes while rendering
  // an authenticated user's page: they can block navigation for tens of seconds.
  const catalogue = rawCatalogue;
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

  const recommendationPhotoUniversities = new Set<string>();
  const recommendationPresentation = recommendations.map((recommendation) => {
    const universityId = recommendation.programme.university.id;
    const showUniversityPhoto = !recommendationPhotoUniversities.has(universityId);
    recommendationPhotoUniversities.add(universityId);
    return { recommendation, showUniversityPhoto };
  });

  const resultPhotoUniversities = new Set<string>();
  const filteredPresentation = filtered.map((programme) => {
    const universityId = programme.university.id;
    const showUniversityPhoto = !resultPhotoUniversities.has(universityId);
    resultPhotoUniversities.add(universityId);
    return { programme, showUniversityPhoto };
  });

  return (
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        variant="split"
        imageSrc={prospectMedia.catalogueHero}
      />

      {recommendations.length ? (
        <section aria-labelledby="prospect-recommended-programmes" className="pc-panel pc-premium-card pc-theme-gold p-5 sm:p-6">
          <PremiumSectionHeader
            eyebrow={t.projectMatch}
            eyebrowTone="success"
            title={<span id="prospect-recommended-programmes">{t.recommendedTitle}</span>}
            description={t.recommendedSubtitle}
          />
          <div className="prospect-programme-grid mt-4">
            {recommendationPresentation.map(({ recommendation, showUniversityPhoto }) => (
              <ProspectProgrammeRecommendationCard
                key={recommendation.programme.id}
                recommendation={recommendation}
                labels={recommendationLabels}
                locale={locale}
                showUniversityPhoto={showUniversityPhoto}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="pc-panel overflow-hidden">
        <div className="border-b border-white/10 bg-[var(--premium-ink)] px-5 py-5 text-white sm:px-6 sm:py-6">
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

        <form action="/prospect/catalogue" className="bg-[linear-gradient(145deg,rgba(242,246,248,.68),rgba(255,255,255,.96))] p-5 sm:p-6">
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
                className={buttonClassName("primary")}
              >
                {t.apply}
              </button>
              <Link
                href="/prospect/catalogue?view=all"
                className={buttonClassName("secondary")}
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
          <div className="mb-4">
            <PremiumSectionHeader
              title={<span id="prospect-catalogue-results">{t.browseAllTitle}</span>}
              description={<span aria-live="polite">{t.results(filtered.length)}</span>}
            />
          </div>

          {filtered.length ? (
            <div className="prospect-programme-grid">
              {filteredPresentation.map(({ programme, showUniversityPhoto }) => (
                <ProspectProgrammeCatalogueCard
                  key={programme.id}
                  programme={programme}
                  projectMatch={matchesProject(programme, state.answers)}
                  labels={catalogueCardLabels}
                  locale={locale}
                  wide={filtered.length === 1}
                  showUniversityPhoto={showUniversityPhoto}
                />
              ))}
            </div>
          ) : (
            <PremiumEmptyState
              eyebrow={t.generalCatalogue}
              title={t.noResults}
              compact
              action={
                <Link href="/prospect/catalogue?view=all" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
                  {t.reset}
                </Link>
              }
            />
          )}
        </section>
      ) : null}

      <p className="pc-waiting-strip p-4 text-xs leading-5 text-[var(--foreground-soft)]">
        {t.boundary}
      </p>
    </main>
  );
}
