import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";

function universityInitials(name: string) {
  const words = name
    .replace(/[()–—-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !["university", "universität", "hochschule", "of", "der", "die", "the"].includes(word.toLocaleLowerCase("de")));

  const initials = words
    .slice(0, 3)
    .map((word) => word[0]?.toLocaleUpperCase("de"))
    .join("");

  return initials || name.slice(0, 2).toLocaleUpperCase("de");
}

export function ProspectUniversityCover({
  universityName,
  city,
  media,
  compact = false,
}: {
  universityName: string;
  city: string | null;
  media: OrientationUniversityMedia | null;
  compact?: boolean;
}) {
  const imageUrl = media?.coverImageUrl || null;
  const heightClass = compact ? "h-28" : "h-40";
  const imageStyle = imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(19,33,49,0.04), rgba(19,33,49,0.52)), url(${JSON.stringify(imageUrl)})`,
      }
    : undefined;

  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(135deg,#192b3d_0%,#2a4054_48%,#c79a37_140%)] bg-cover bg-center ${heightClass}`}
      style={imageStyle}
      aria-hidden="true"
    >
      {!imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl font-extrabold tracking-[-0.04em] text-white shadow-sm backdrop-blur-sm">
            {universityInitials(universityName)}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <div className="min-w-0 text-white">
          <p className="truncate text-xs font-bold drop-shadow-sm">
            <bdi dir="auto">{universityName}</bdi>
          </p>
          {city ? (
            <p className="mt-0.5 truncate text-[11px] text-white/80">
              <bdi dir="auto">{city}</bdi>
            </p>
          ) : null}
        </div>

        {imageUrl && media?.coverImageSourceUrl ? (
          <a
            href={media.coverImageSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[9px] font-semibold text-white/90 backdrop-blur-sm hover:bg-black/50"
            title={[
              media.coverImageAttribution,
              media.coverImageLicense,
            ].filter(Boolean).join(" · ") || "Wikimedia Commons"}
            onClick={(event) => event.stopPropagation()}
          >
            Photo
          </a>
        ) : null}
      </div>
    </div>
  );
}
