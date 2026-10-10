"use client";

import { useState } from "react";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";
import {
  selectStudentLifePhoto,
  type CuratedLifePhoto,
} from "@/lib/orientation/media/student-life";

type Locale = "fr" | "ar" | "en" | "de";

const captions = {
  fr: { life: "Vie étudiante en Allemagne", illustrative: "Illustration de la vie universitaire en Allemagne", photo: "Photo associée à l'université", source: "Crédit photo", alt: "Étudiants sur un campus universitaire en Allemagne" },
  ar: { life: "الحياة الطلابية في ألمانيا", illustrative: "صورة توضيحية للحياة الجامعية في ألمانيا", photo: "صورة مرتبطة بالجامعة", source: "حقوق الصورة", alt: "طلبة في حرم جامعي في ألمانيا" },
  en: { life: "Student life in Germany", illustrative: "Illustration of university life in Germany", photo: "Photo associated with the university", source: "Photo credit", alt: "Students on a university campus in Germany" },
  de: { life: "Studierendenleben in Deutschland", illustrative: "Beispielfoto aus dem Studierendenleben in Deutschland", photo: "Foto zur Hochschule", source: "Bildnachweis", alt: "Studierende auf einem Universitätscampus in Deutschland" },
} as const;

export function OrientationRealPhoto({
  universityName,
  media,
  locale,
  kind = "university",
  lifePhoto = selectStudentLifePhoto(),
  className = "",
}: {
  universityName?: string | null;
  media?: OrientationUniversityMedia | null;
  locale: Locale;
  kind?: "university" | "student-life";
  lifePhoto?: CuratedLifePhoto;
  className?: string;
}) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const t = captions[locale];
  const validUniversityMedia = kind === "university"
    && Boolean(media?.coverImageUrl && media.coverImageSourceUrl && media.coverImageLicense
      && /^(?:CC BY(?:-SA)?(?:\s|$)|CC0)/i.test(media.coverImageLicense));
  const universityUrl = validUniversityMedia ? media?.coverImageUrl || null : null;
  const useUniversityPhoto = universityUrl !== null && brokenUrl !== universityUrl;
  const imageUrl = useUniversityPhoto && universityUrl ? universityUrl : lifePhoto.imageUrl;
  const imageIsBroken = brokenUrl === imageUrl;
  const sourceUrl = useUniversityPhoto ? media?.coverImageSourceUrl || lifePhoto.sourceUrl : lifePhoto.sourceUrl;
  const author = useUniversityPhoto ? media?.coverImageAttribution || t.source : lifePhoto.author;
  const license = useUniversityPhoto ? media?.coverImageLicense || "" : lifePhoto.license;
  const label = kind === "student-life" ? t.life : useUniversityPhoto ? t.photo : t.illustrative;
  const alt = kind === "student-life"
    ? t.alt
    : useUniversityPhoto
      ? `${t.photo}: ${universityName || media?.canonicalName || ""}`
      : t.alt;

  return (
    <figure className={`relative overflow-hidden rounded-xl bg-[var(--surface-subtle)] ${className}`}>
      {imageIsBroken ? (
        <div className="flex h-full min-h-36 items-center justify-center bg-[var(--premium-cream-soft)] px-4 text-center text-xs text-[var(--muted)]">{t.life}</div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={alt}
          width={640}
          height={426}
          loading="lazy"
          decoding="async"
          onError={() => setBrokenUrl(imageUrl)}
          className="h-full w-full object-cover"
        />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 pt-8 text-[10px] leading-4 text-white">
        <span className="block font-semibold">{label}</span>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" title={license} className="inline-block text-white/90 underline decoration-white/50 underline-offset-2">{author} · {license}</a>
      </figcaption>
    </figure>
  );
}
