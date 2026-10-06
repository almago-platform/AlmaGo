import Image from "next/image";
import type { ReactNode } from "react";

export function ProspectPageHero({
  eyebrow,
  title,
  subtitle,
  children,
  variant = "default",
  imageSrc,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  children?: ReactNode;
  variant?: "default" | "split" | "compact";
  imageSrc?: string;
  imageAlt?: string;
}) {
  const text = (
    <>
      <p className="pc-kicker pc-kicker-inverse">{eyebrow}</p>

      <h1
        className={
          variant === "compact"
            ? "mt-2.5 max-w-4xl text-[clamp(1.7rem,2.8vw,2.45rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-white"
            : "mt-2.5 max-w-4xl text-[clamp(1.85rem,3.35vw,3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white"
        }
      >
        {title}
      </h1>

      {subtitle ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/66 sm:text-[0.95rem] sm:leading-6">
          {subtitle}
        </p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </>
  );

  if (variant === "split" && imageSrc) {
    return (
      <header className="prospect-page-hero prospect-page-hero--split pc-hero overflow-hidden p-0">
        <div className="pc-hero-orbit" aria-hidden="true" />
        <div className="absolute -end-5 -top-4 h-24 w-24 rounded-full border border-white/[.05]" aria-hidden="true" />

        <div className="relative grid min-w-0 lg:grid-cols-[minmax(0,1.28fr)_minmax(18rem,0.72fr)]">
          <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            <div className="max-w-5xl">{text}</div>
          </div>

          <div
            className="prospect-page-hero-media relative min-h-52 overflow-hidden sm:min-h-60 lg:min-h-full"
            aria-hidden={imageAlt ? undefined : true}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority={false}
              sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 34vw, 100vw"
              quality={75}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(19,33,49,.42),rgba(19,33,49,.05)_55%)]" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(19,33,49,.25))]" aria-hidden="true" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={
        "prospect-page-hero pc-hero " +
        (variant === "compact"
          ? "px-5 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-5"
          : "px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7")
      }
    >
      <div className="pc-hero-orbit" aria-hidden="true" />
      <div className="absolute -end-5 -top-4 h-24 w-24 rounded-full border border-white/[.05]" aria-hidden="true" />

      <div className="relative max-w-5xl">{text}</div>
    </header>
  );
}
