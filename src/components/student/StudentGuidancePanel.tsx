import Image from "next/image";

type GuidanceImage = {
  src: string;
  alt: string;
  credit?: string;
};

export function StudentGuidancePanel({
  eyebrow,
  title,
  description,
  points,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  points: readonly string[];
  image?: GuidanceImage;
}) {
  return (
    <section
      className={`student-guidance-panel pc-panel mb-7 overflow-hidden bg-[var(--premium-cream-soft)] ${
        image ? "grid lg:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]" : ""
      }`}
      aria-label={title}
    >
      {image && (
        <figure className="relative min-h-56 bg-slate-200 lg:min-h-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 34vw, 100vw"
          />
          {image.credit && (
            <figcaption className="absolute bottom-3 start-3 rounded-[var(--radius-control)] bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur">
              {image.credit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="student-guidance-content p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--warning-strong)]">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {points.map((point, index) => (
            <div key={point} className="pc-card p-3.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--foreground-soft)]">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
