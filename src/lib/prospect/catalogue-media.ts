import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { findWikimediaUniversityMedia } from "@/lib/orientation-engine/discovery/university-media";
import type { OrientationProgrammeRecord, OrientationUniversityMedia } from "@/lib/orientation-engine/types";

const MAX_MEDIA_LOOKUPS_PER_REQUEST = 10;
const MEDIA_RETRY_DAYS = 30;

type RegistryMediaRow = {
  id: string;
  cover_image_url: string | null;
  cover_image_source_url: string | null;
  cover_image_attribution: string | null;
  cover_image_license: string | null;
  media_verified_at: string | null;
};

function shouldRetryMedia(row: RegistryMediaRow) {
  if (row.cover_image_url) return false;
  if (!row.media_verified_at) return true;

  const checkedAt = new Date(row.media_verified_at);
  if (Number.isNaN(checkedAt.getTime())) return true;

  return Date.now() - checkedAt.getTime()
    >= MEDIA_RETRY_DAYS * 24 * 60 * 60 * 1_000;
}

function asMedia(
  row: RegistryMediaRow,
  universityName: string,
): OrientationUniversityMedia {
  return {
    universityId: row.id,
    canonicalName: universityName,
    coverImageUrl: row.cover_image_url,
    coverImageSourceUrl: row.cover_image_source_url,
    coverImageAttribution: row.cover_image_attribution,
    coverImageLicense: row.cover_image_license,
  };
}

export async function enrichProspectCatalogueUniversityMedia(
  catalogue: OrientationProgrammeRecord[],
) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
    || !process.env.SUPABASE_SECRET_KEY
    || catalogue.length === 0
  ) {
    return catalogue;
  }

  const missingCounts = new Map<string, {
    name: string;
    city: string | null;
    count: number;
  }>();

  for (const programme of catalogue) {
    if (programme.university.media?.coverImageUrl) continue;

    const current = missingCounts.get(programme.university.id);
    missingCounts.set(programme.university.id, {
      name: programme.university.name,
      city: programme.university.city,
      count: (current?.count || 0) + 1,
    });
  }

  const universityIds = [...missingCounts.keys()];
  if (universityIds.length === 0) return catalogue;

  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase
    .from("universities")
    .select([
      "id",
      "cover_image_url",
      "cover_image_source_url",
      "cover_image_attribution",
      "cover_image_license",
      "media_verified_at",
    ].join(","))
    .in("id", universityIds);

  if (error || !data) return catalogue;

  const rows = data as unknown as RegistryMediaRow[];
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const mediaById = new Map<string, OrientationUniversityMedia>();

  for (const [id, meta] of missingCounts) {
    const row = rowById.get(id);
    if (row?.cover_image_url) {
      mediaById.set(id, asMedia(row, meta.name));
    }
  }

  const lookupIds = [...missingCounts.entries()]
    .filter(([id]) => {
      const row = rowById.get(id);
      return row ? shouldRetryMedia(row) : false;
    })
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, MAX_MEDIA_LOOKUPS_PER_REQUEST)
    .map(([id]) => id);

  const checkedAt = new Date().toISOString();

  await Promise.all(
    lookupIds.map(async (id) => {
      const meta = missingCounts.get(id);
      if (!meta) return;

      const found = await findWikimediaUniversityMedia(meta.name, meta.city);
      const update = found
        ? {
            cover_image_url: found.coverImageUrl,
            cover_image_source_url: found.coverImageSourceUrl,
            cover_image_attribution: found.coverImageAttribution,
            cover_image_license: found.coverImageLicense,
            media_verified_at: checkedAt,
            updated_at: checkedAt,
          }
        : {
            media_verified_at: checkedAt,
            updated_at: checkedAt,
          };

      const { error: updateError } = await supabase
        .from("universities")
        .update(update)
        .eq("id", id);

      if (!updateError && found) {
        mediaById.set(id, {
          universityId: id,
          canonicalName: meta.name,
          coverImageUrl: found.coverImageUrl,
          coverImageSourceUrl: found.coverImageSourceUrl,
          coverImageAttribution: found.coverImageAttribution,
          coverImageLicense: found.coverImageLicense,
        });
      }
    }),
  );

  if (mediaById.size === 0) return catalogue;

  return catalogue.map((programme) => {
    const media = mediaById.get(programme.university.id);
    if (!media) return programme;

    return {
      ...programme,
      university: {
        ...programme.university,
        media,
      },
    };
  });
}
