import "server-only";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const MEDIA_TIMEOUT_MS = 5_000;
const MAX_RESULTS = 6;

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

export async function findWikimediaUniversityMedia(
  universityName: string,
  city: string | null,
): Promise<UniversityMediaLookup | null> {
  const query = [universityName, city, "campus"]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");

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
      cache: "no-store",
      headers: {
        Accept: "application/json",
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
    return {
      coverImageUrl,
      coverImageSourceUrl,
      coverImageAttribution:
        stripHtml(metadata.Artist?.value)
        || stripHtml(metadata.Credit?.value),
      coverImageLicense:
        stripHtml(metadata.LicenseShortName?.value)
        || stripHtml(metadata.UsageTerms?.value),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
