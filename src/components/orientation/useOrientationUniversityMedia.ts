"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";

export type UniversityPhotoRequest = { institution: string; city: string | null };
export const universityPhotoKey = (name: string, city: string | null) =>
  `${name.trim().toLocaleLowerCase("en")}|${(city || "").trim().toLocaleLowerCase("en")}`;

type MediaResponse = { items?: Array<UniversityPhotoRequest & { media: OrientationUniversityMedia | null }> };

/** Resolves once per rendered shortlist, outside the orientation/Gemini request. */
export function useOrientationUniversityMedia(items: UniversityPhotoRequest[]) {
  const serialized = JSON.stringify(
    [...new Map(items.filter((item) => item.institution && item.institution.length <= 160)
      .map((item) => [universityPhotoKey(item.institution, item.city), item])).values()].slice(0, 20),
  );
  const [photos, setPhotos] = useState<Record<string, OrientationUniversityMedia>>({});

  useEffect(() => {
    const inputs = JSON.parse(serialized) as UniversityPhotoRequest[];
    if (inputs.length === 0) return;
    const controller = new AbortController();
    void fetch("/api/orientation/university-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universities: inputs }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() as Promise<MediaResponse> : null)
      .then((result) => {
        if (controller.signal.aborted || !result?.items) return;
        const next: Record<string, OrientationUniversityMedia> = {};
        for (const item of result.items) {
          if (item.media?.coverImageUrl) {
            next[universityPhotoKey(item.institution, item.city)] = item.media;
          }
        }
        setPhotos(next);
      }).catch(() => {
        // Unavailable media never blocks the orientation or a saved PDF.
      });
    return () => controller.abort();
  }, [serialized]);

  return useMemo(() => photos, [photos]);
}
