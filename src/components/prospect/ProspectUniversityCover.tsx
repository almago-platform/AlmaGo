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
  wide = false,
  usePhoto = true,
}: {
  universityName: string;
  city: string | null;
  media: OrientationUniversityMedia | null;
  compact?: boolean;
  wide?: boolean;
  usePhoto?: boolean;
}) {
  const imageUrl = usePhoto ? media?.coverImageUrl || null : null;
  const heightClass = wide
    ? "h-48 lg:h-full lg:min-h-[22rem]"
    : compact
      ? "h-36"
      : "h-52";
  const imageStyle = imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(12,14,15,0.02) 0%, rgba(12,14,15,0.16) 42%, rgba(12,14,15,0.86) 100%), url(${JSON.stringify(imageUrl)})`,
      }
    : undefined;

  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(135deg,#111315_0%,#24272a_54%,#7b101f_112%,#d19b00_145%)] bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.015] ${heightClass}`}
      style={imageStyle}
    >
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(216,6,33,.12),transparent_40%,rgba(244,180,0,.08))]" aria-hidden="true" />

      {!imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid min-w-24 place-items-center rounded-[1.65rem] border border-white/15 bg-white/[.08] px-5 py-6 text-2xl font-extrabold tracking-[-0.05em] text-white shadow-2xl backdrop-blur-md">
            {universityInitials(universityName)}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 text-white">
          <p className="truncate text-sm font-bold tracking-[-0.015em] drop-shadow">
            <bdi dir="auto">{universityName}</bdi>
          </p>
          {city ? (
            <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-medium text-white/72">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <bdi dir="auto">{city}</bdi>
            </p>
          ) : null}
        </div>

        {imageUrl && media?.coverImageSourceUrl ? (
          <a
            href={media.coverImageSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-semibold text-white/80 backdrop-blur-md transition hover:bg-black/55 hover:text-white"
            title={[
              media.coverImageAttribution,
              media.coverImageLicense,
            ].filter(Boolean).join(" · ") || "Wikimedia Commons"}
          >
            Photo
          </a>
        ) : null}
      </div>
    </div>
  );
}
