import "server-only";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const MEDIA_TIMEOUT_MS = 3_000;
const MAX_RESULTS = 8;
const MEDIA_CACHE_SECONDS = 30 * 24 * 60 * 60;
const WIKIMEDIA_USER_AGENT = "AlmaGoUniversityMedia/1.0 (https://github.com/almago-platform/AlmaGo)";

type CommonsMetadataValue = {
  value?: string;
};

type CommonsImageInfo = {
  url?: string;
  thumburl?: string;
  width?: number;
  height?: number;
  mime?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, CommonsMetadataValue>;
};

type CommonsPage = {
  index?: number;
  title?: string;
  imageinfo?: CommonsImageInfo[];
};

type CommonsResponse = {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
};

export type UniversityMediaLookup = {
  coverImageUrl: string;
  coverImageSourceUrl: string;
  coverImageAttribution: string | null;
  coverImageLicense: string | null;
};

function stripHtml(value: string | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function sourceUrl(page: CommonsPage, info: CommonsImageInfo) {
  if (info.descriptionurl?.startsWith("https://")) return info.descriptionurl;
  if (!page.title) return null;

  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(
    page.title.replace(/ /g, "_"),
  )}`;
}

function usefulPhoto(page: CommonsPage) {
  const info = page.imageinfo?.[0];
  if (!info) return false;

  const title = (page.title || "").toLocaleLowerCase("en");
  if (
    /logo|wordmark|seal|crest|coat.of.arms|wappen|location.map|karte|icon/.test(
      title,
    )
  ) {
    return false;
  }

  if (info.mime && !info.mime.startsWith("image/")) return false;
  if ((info.width || 0) < 600 || (info.height || 0) < 300) return false;

  const ratio = (info.width || 1) / Math.max(info.height || 1, 1);
  return ratio >= 0.9;
}

async function searchCommonsPhoto(query: string): Promise<UniversityMediaLookup | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: String(MAX_RESULTS),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1200",
    iiextmetadatafilter: "Artist|Credit|LicenseShortName|UsageTerms",
    iiextmetadatalanguage: "en",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEDIA_TIMEOUT_MS);

  try {
    const response = await fetch(`${COMMONS_API_URL}?${params.toString()}`, {
      signal: controller.signal,
      next: {
        revalidate: MEDIA_CACHE_SECONDS,
      },
      headers: {
        Accept: "application/json",
        "User-Agent": WIKIMEDIA_USER_AGENT,
        "Api-User-Agent": WIKIMEDIA_USER_AGENT,
      },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as CommonsResponse;
    const pages = Object.values(payload.query?.pages || {})
      .sort((a, b) => (a.index || 999) - (b.index || 999));
    const page = pages.find(usefulPhoto);
    const info = page?.imageinfo?.[0];

    if (!page || !info) return null;

    const coverImageUrl =
      (info.thumburl?.startsWith("https://") ? info.thumburl : null)
      || (info.url?.startsWith("https://") ? info.url : null);
    const coverImageSourceUrl = sourceUrl(page, info);

    if (!coverImageUrl || !coverImageSourceUrl) return null;

    const metadata = info.extmetadata || {};
    // Commons search ranking alone is not enough to establish usage rights.
    // Reject unknown/non-commercial/no-derivatives licences rather than
    // storing a photo that the public orientation cannot lawfully display.
    const license = stripHtml(metadata.LicenseShortName?.value)
      || stripHtml(metadata.UsageTerms?.value);
    const author = stripHtml(metadata.Artist?.value)
      || stripHtml(metadata.Credit?.value);
    if (!license || !/^(?:CC BY(?:-SA)?(?:\\s|$)|CC0)/i.test(license)) return null;
    if (!author && license !== "CC0") return null;
    return {
      coverImageUrl,
      coverImageSourceUrl,
      coverImageAttribution: author,
      coverImageLicense: license,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function findWikimediaUniversityMedia(
  universityName: string,
  city: string | null,
): Promise<UniversityMediaLookup | null> {
  const queries = [
    [universityName, city],
    [universityName, city, "campus"],
  ]
    .map((parts) =>
      parts
        .filter((value): value is string => Boolean(value?.trim()))
        .join(" ")
    )
    .filter((query, index, all) => query && all.indexOf(query) === index);

  for (const query of queries) {
    const media = await searchCommonsPhoto(query);
    if (media) return media;
  }

  return null;
}
