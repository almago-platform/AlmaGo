import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { findWikimediaUniversityMedia } from "@/lib/orientation-engine/discovery/university-media";
import { findCuratedUniversityMedia } from "@/lib/orientation-engine/discovery/curated-university-media";
import { persistUniversityMediaFile } from "@/lib/orientation-engine/discovery/university-storage";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";
import {
  acquireRequestConcurrency,
  concurrencyLimitedResponse,
  enforceRequestRateLimit,
  PUBLIC_ABUSE_POLICIES,
} from "@/lib/security/abuse";

const MAX_BODY_BYTES = 4_096;
const MAX_UNIVERSITIES = 20;
const MAX_NEW_LOOKUPS = 3;
const RETRY_MS = 30 * 24 * 60 * 60 * 1_000;

type RequestedUniversity = { institution: string; city: string | null };
type Row = {
  id: string; name: string; city: string | null;
  cover_image_url: string | null; cover_image_source_url: string | null;
  cover_image_attribution: string | null; cover_image_license: string | null;
  media_verified_at: string | null;
};

function cleanRequest(value: unknown): RequestedUniversity[] | null {
  if (!value || typeof value !== "object") return null;
  const input = (value as { universities?: unknown }).universities;
  if (!Array.isArray(input) || input.length > MAX_UNIVERSITIES) return null;
  const unique = new Map<string, RequestedUniversity>();
  for (const candidate of input) {
    if (!candidate || typeof candidate !== "object") return null;
    const raw = candidate as Record<string, unknown>;
    if (typeof raw.institution !== "string" || raw.institution.trim().length < 2
      || raw.institution.length > 160
      || (raw.city !== null && raw.city !== undefined && typeof raw.city !== "string")
      || (typeof raw.city === "string" && raw.city.length > 100)) return null;
    const university = {
      institution: raw.institution.trim(),
      city: typeof raw.city === "string" ? raw.city.trim() || null : null,
    };
    unique.set(`${university.institution.toLocaleLowerCase("en")}|${university.city?.toLocaleLowerCase("en") || ""}`, university);
  }
  return [...unique.values()];
}

function licensed(row: Row) {
  return Boolean(row.cover_image_url?.startsWith("https://")
    && row.cover_image_source_url?.startsWith("https://")
    && row.cover_image_license
    && /^(?:CC BY(?:-SA)?(?:\s|$)|CC0)/i.test(row.cover_image_license));
}

function shouldSearch(row: Row) {
  if (licensed(row)) return false;
  if (!row.media_verified_at) return true;
  const checkedAt = new Date(row.media_verified_at).getTime();
  return !Number.isFinite(checkedAt) || Date.now() - checkedAt >= RETRY_MS;
}

function toMedia(row: Row): OrientationUniversityMedia | null {
  if (!licensed(row)) return null;
  return {
    universityId: row.id,
    canonicalName: row.name,
    coverImageUrl: row.cover_image_url,
    coverImageSourceUrl: row.cover_image_source_url,
    coverImageAttribution: row.cover_image_attribution,
    coverImageLicense: row.cover_image_license,
  };
}

function matchingRow(rows: Row[], requested: RequestedUniversity) {
  return rows.find((row) => row.name.toLocaleLowerCase("en") === requested.institution.toLocaleLowerCase("en")
    && (!requested.city || row.city?.toLocaleLowerCase("en") === requested.city.toLocaleLowerCase("en"))) || null;
}

/**
 * Safe public media lookup: only *existing* canonical university rows can be
 * enriched; visitor input cannot insert institutions or edit their identity.
 * The educational recommendation engine and Gemini never wait for this route.
 */
export async function POST(request: Request) {
  const blocked = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationMedia);
  if (blocked) return blocked;
  if (Number(request.headers.get("content-length") || "0") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  let raw: unknown;
  try { raw = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (JSON.stringify(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const universities = cleanRequest(raw);
  if (!universities) return NextResponse.json({ error: "Invalid universities" }, { status: 400 });
  if (!universities.length) return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });

  const lease = acquireRequestConcurrency("orientation_media", 3);
  if (!lease) return concurrencyLimitedResponse("orientation_media");

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase.from("universities")
      .select("id,name,city,cover_image_url,cover_image_source_url,cover_image_attribution,cover_image_license,media_verified_at")
      .in("name", universities.map((entry) => entry.institution))
      .limit(MAX_UNIVERSITIES);
    if (error) throw error;
    const rows = (data || []) as Row[];
    let budget = MAX_NEW_LOOKUPS;
    const items: Array<RequestedUniversity & { media: OrientationUniversityMedia | null }> = [];
    for (const requested of universities) {
      const row = matchingRow(rows, requested);
      const curated = findCuratedUniversityMedia(requested.institution, requested.city);
      if (!row) {
        // A researched university can be documented before its canonical
        // registry row has been promoted. Use only our reviewed, exact-match
        // photo seed; never insert arbitrary visitor-provided institutions.
        if (curated) items.push({ ...requested, media: curated });
        continue;
      }
      if (curated && !licensed(row)) {
        const checkedAt = new Date().toISOString();
        const durableUrl = await persistUniversityMediaFile(supabase, row.id, curated);
        const update = {
          cover_image_url: durableUrl,
          cover_image_source_url: curated.coverImageSourceUrl,
          cover_image_attribution: curated.coverImageAttribution,
          cover_image_license: curated.coverImageLicense,
          media_verified_at: checkedAt,
          updated_at: checkedAt,
        };
        const { error: seedError } = await supabase.from("universities")
          .update(update).eq("id", row.id);
        if (!seedError) Object.assign(row, update);
      }
      if (!curated && shouldSearch(row) && budget > 0) {
        budget -= 1;
        const found = await findWikimediaUniversityMedia(row.name, row.city);
        const checkedAt = new Date().toISOString();
        const licensedFound = found && /^(?:CC BY(?:-SA)?(?:\s|$)|CC0)/i.test(found.coverImageLicense || "")
          && Boolean(found.coverImageAttribution || found.coverImageLicense === "CC0");
        const durableUrl = licensedFound
          ? await persistUniversityMediaFile(supabase, row.id, found)
          : null;
        const update = licensedFound && found
          ? {
              cover_image_url: durableUrl || found.coverImageUrl,
              cover_image_source_url: found.coverImageSourceUrl,
              cover_image_attribution: found.coverImageAttribution,
              cover_image_license: found.coverImageLicense,
              media_verified_at: checkedAt,
              updated_at: checkedAt,
            }
          : { media_verified_at: checkedAt, updated_at: checkedAt };
        const { error: updateError } = await supabase.from("universities").update(update).eq("id", row.id);
        if (!updateError) Object.assign(row, update);
      } else if (budget > 0 && licensed(row)
        && row.cover_image_url
        && /^https:\/\/(?:upload|thumb)\.wikimedia\.org\//.test(row.cover_image_url)) {
        // Existing cached Commons photo: upgrade to durable Storage once.
        // No new discovery call; preserve the original Commons source + credit.
        budget -= 1;
        const storedUrl = await persistUniversityMediaFile(supabase, row.id, {
          coverImageUrl: row.cover_image_url,
          coverImageSourceUrl: row.cover_image_source_url!,
          coverImageAttribution: row.cover_image_attribution,
          coverImageLicense: row.cover_image_license,
        });
        if (storedUrl !== row.cover_image_url) {
          const { error: migrationError } = await supabase.from("universities")
            .update({ cover_image_url: storedUrl, updated_at: new Date().toISOString() })
            .eq("id", row.id);
          if (!migrationError) row.cover_image_url = storedUrl;
        }
      }
      items.push({ ...requested, media: toMedia(row) || curated });
    }
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Media enrichment is optional: never turn a university orientation into a 503.
    return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
  } finally {
    lease.release();
  }
}
