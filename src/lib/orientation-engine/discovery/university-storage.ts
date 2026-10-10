import "server-only";

import { createHash } from "node:crypto";
import type { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import type { UniversityMediaLookup } from "@/lib/orientation-engine/discovery/university-media";

export const ORIENTATION_PUBLIC_MEDIA_BUCKET = "orientation-university-media";
const MAX_BYTES = 4 * 1024 * 1024;
const PHOTO_FETCH_TIMEOUT_MS = 5_000;

type Client = ReturnType<typeof createPrivilegedSupabaseClient>;

function permittedWikimediaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(url.hostname)
      && url.pathname.startsWith("/wikipedia/commons/");
  } catch {
    return false;
  }
}

function permittedLicense(media: UniversityMediaLookup) {
  return /^(?:CC BY(?:-SA)?(?:\s|$)|CC0)/i.test(media.coverImageLicense || "")
    && Boolean(media.coverImageSourceUrl.startsWith("https://commons.wikimedia.org/wiki/"))
    && Boolean(media.coverImageAttribution || media.coverImageLicense === "CC0");
}

/**
 * Store a stable 1200px Wikimedia photo once, where licence and attribution permit.
 * No user URL is ever fetched: this helper accepts only Wikimedia Commons media.
 * If Storage is unavailable, the original (already credited) URL remains usable.
 */
export async function persistUniversityMediaFile(
  supabase: Client,
  universityId: string,
  media: UniversityMediaLookup,
): Promise<string> {
  if (!/^[a-f0-9-]{36}$/i.test(universityId)
    || !permittedLicense(media)
    || !permittedWikimediaUrl(media.coverImageUrl)) return media.coverImageUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PHOTO_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(media.coverImageUrl, {
      signal: controller.signal,
      headers: { Accept: "image/avif,image/webp,image/jpeg,image/png" },
    });
    const kind = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!response.ok || !extensions[kind]) return media.coverImageUrl;
    const announcedSize = Number(response.headers.get("content-length") || 0);
    if (announcedSize > MAX_BYTES) return media.coverImageUrl;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.byteLength > MAX_BYTES) return media.coverImageUrl;

    const digest = createHash("sha256").update(media.coverImageSourceUrl).digest("hex").slice(0, 24);
    const path = `${universityId}/${digest}.${extensions[kind]}`;
    const { error } = await supabase.storage.from(ORIENTATION_PUBLIC_MEDIA_BUCKET)
      .upload(path, bytes, { contentType: kind, cacheControl: "31536000", upsert: true });
    if (error) return media.coverImageUrl;
    const { data } = supabase.storage.from(ORIENTATION_PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
    const storedUrl = data.publicUrl;
    return storedUrl.startsWith("https://") ? storedUrl : media.coverImageUrl;
  } catch {
    return media.coverImageUrl;
  } finally {
    clearTimeout(timeout);
  }
}
