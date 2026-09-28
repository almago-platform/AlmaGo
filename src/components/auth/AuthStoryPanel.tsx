"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";

type AuthStoryPanelProps = {
  mode: "login" | "signup";
};

const images = {
  login: {
    src: "https://images.pexels.com/photos/6684514/pexels-photo-6684514.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Students working together in a university library.",
  },
  signup: {
    src: "https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Students reviewing documents outside a university building.",
  },
} as const;

export function AuthStoryPanel({ mode }: AuthStoryPanelProps) {
  const { copy, direction } = useLocale();
  const story = mode === "login" ? copy.auth.loginStory : copy.auth.signupStory;

  return (
    <section className="auth-story-panel hidden min-h-[700px] overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-52px_rgba(28,33,36,0.55)] lg:flex lg:flex-col">
      <div className="auth-story-header flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-7 py-5">
        <Link href="/" className="inline-flex items-center" aria-label={copy.common.homeAria}>
          <BrandLogo className="h-auto w-36" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <span className="auth-student-badge rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600">
            {copy.auth.studentSpace}
          </span>
        </div>
      </div>

      <div className="auth-story-image relative h-64 shrink-0 overflow-hidden">
        <Image
          src={images[mode].src}
          alt={images[mode].alt}
          fill
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,33,36,0.58)] via-transparent to-transparent" />
        <p className={`absolute bottom-5 m-0 max-w-sm text-sm font-semibold leading-6 text-white ${direction === "rtl" ? "right-6 left-6" : "left-6 right-6"}`}>
          {story.badge}
        </p>
      </div>

      <div className="auth-story-body flex flex-1 flex-col p-7">
        <p className="auth-story-eyebrow text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{story.eyebrow}</p>
        <h1 className="auth-story-title editorial-accent mt-3 max-w-xl text-[2rem] leading-[1.08] text-[var(--foreground)]">
          {story.title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">{story.description}</p>

        <ol className="mt-6 grid gap-2">
          {story.points.map(([title, detail], index) => (
            <li
              key={title}
              className="grid grid-cols-[2.75rem_1fr] gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3"
            >
              <span className="pt-0.5 text-xs font-bold tracking-[0.14em] text-[var(--brand-strong)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-6">
          <div className={`border-[var(--brand)] ${direction === "rtl" ? "border-r-2 pr-4" : "border-l-2 pl-4"}`}>
            <p className="text-sm font-bold text-[var(--foreground)]">{copy.auth.boundaryTitle}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{copy.auth.boundaryText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
