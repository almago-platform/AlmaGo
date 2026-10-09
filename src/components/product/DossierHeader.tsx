import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function DossierHeader({
  eyebrow,
  title,
  description,
  status,
  statusVariant = "neutral",
  facts,
  actions,
  imageSrc,
  imageAlt = "",
  imagePriority = false,
  compact = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  statusVariant?: "success" | "info" | "warning" | "error" | "neutral";
  facts?: Array<{ label: ReactNode; value: ReactNode }>;
  actions?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  compact?: boolean;
}) {
  const intro = (
    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {eyebrow ? (
            <p className="pc-kicker pc-kicker-inverse">{eyebrow}</p>
          ) : null}
          {status ? <Badge variant={statusVariant}>{status}</Badge> : null}
        </div>
        <h1 className={compact
          ? "mt-2 text-[clamp(1.8rem,2.7vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-white"
          : "mt-2.5 text-[clamp(1.9rem,3.45vw,3.05rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white"}>
          {title}
        </h1>
        {description ? (
          <p className={compact
            ? "mt-2 max-w-3xl text-sm leading-6 text-white/85"
            : "mt-3 max-w-3xl text-sm leading-6 text-white/66 sm:text-[0.95rem] sm:leading-6"}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2 [&_a]:shadow-sm [&_button]:shadow-sm">
          {actions}
        </div>
      ) : null}
    </div>
  );

  const factsBlock = facts?.length ? (
    <dl className="relative grid overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[.055] backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-4">
      {facts.map((fact, index) => (
        <div
          key={index}
          className={`min-w-0 border-b border-white/10 last:border-b-0 sm:border-e sm:[&:nth-child(even)]:border-e-0 xl:border-b-0 xl:[&:nth-child(even)]:border-e xl:last:border-e-0 ${compact ? "px-3 py-2.5" : "px-4 py-3.5"}`}
        >
          <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-white/45">
            {fact.label}
          </dt>
          <dd className="m-0 mt-1.5 text-sm font-semibold text-white [overflow-wrap:anywhere]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  ) : null;

  if (imageSrc) {
    return (
      <header className="pc-hero overflow-hidden p-0">
        <div className="pc-hero-orbit" aria-hidden="true" />

        <div className="relative grid min-w-0 lg:grid-cols-[minmax(0,1.28fr)_minmax(18rem,0.72fr)]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            {intro}
          </div>

          <div
            className="prospect-dossier-hero-media relative min-h-52 overflow-hidden sm:min-h-60 lg:min-h-full"
            aria-hidden={imageAlt ? undefined : true}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority={imagePriority}
              sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 34vw, 100vw"
              quality={75}
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(19,33,49,.46),rgba(19,33,49,.05)_58%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(19,33,49,.28))]"
              aria-hidden="true"
            />
          </div>
        </div>

        {factsBlock ? <div className="relative px-5 pb-5 sm:px-6 sm:pb-6 lg:px-7 lg:pb-7">{factsBlock}</div> : null}
      </header>
    );
  }

  return (
    <header className={compact ? "pc-hero p-4 sm:p-5 lg:p-5" : "pc-hero p-5 sm:p-6 lg:p-7"}>
      <div className="pc-hero-orbit" aria-hidden="true" />
      {intro}
      {factsBlock ? <div className={compact ? "mt-4" : "mt-5"}>{factsBlock}</div> : null}
    </header>
  );
}
