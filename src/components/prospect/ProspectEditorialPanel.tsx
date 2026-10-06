import Image from "next/image";
import type { ReactNode } from "react";

export function ProspectEditorialPanel({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt = "",
  actions,
  children,
  mediaPosition = "end",
}: Readonly<{
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  imageSrc: string;
  imageAlt?: string;
  actions?: ReactNode;
  children?: ReactNode;
  mediaPosition?: "start" | "end";
}>) {
  const mediaOrder = mediaPosition === "start" ? "lg:order-first" : "lg:order-last";
  const contentOrder = mediaPosition === "start" ? "lg:order-last" : "lg:order-first";

  return (
    <section className="prospect-editorial-panel pc-panel overflow-hidden">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.28fr)_minmax(17rem,0.72fr)]">
        <div className={`min-w-0 p-5 sm:p-6 lg:p-7 ${contentOrder}`}>
          <p className="pc-kicker text-[var(--brand)]">{eyebrow}</p>
          <h2 className="mt-2.5 max-w-3xl text-[clamp(1.45rem,2.5vw,2rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--premium-ink)]">
            {title}
          </h2>
          {description ? (
            <div className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-soft)]">
              {description}
            </div>
          ) : null}
          {children ? <div className="mt-5">{children}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap gap-2.5">{actions}</div> : null}
        </div>

        <div
          className={`prospect-editorial-panel-media relative min-h-52 overflow-hidden sm:min-h-60 lg:min-h-full ${mediaOrder}`}
          aria-hidden={imageAlt ? undefined : true}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 34vw, 100vw"
            quality={75}
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(145deg,rgba(19,33,49,.08),rgba(19,33,49,.18))]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(19,33,49,.22))]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
