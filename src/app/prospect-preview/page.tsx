import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ProvisionalEmailVerification } from "@/components/prospect/ProvisionalEmailVerification";
import { ProvisionalProgrammeSearch, type ProvisionalProgramme } from "@/components/prospect/ProvisionalProgrammeSearch";
import { provisionalCopy } from "@/content/prospect-provisional-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";
import { loadProvisionalOrientation } from "@/lib/prospect/provisional";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function safeSource(raw: string | null) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default async function ProvisionalProspectPage() {
  if (!isPhase2AccountLinkingEnabled()) notFound();

  const [locale, orientation, catalogue] = await Promise.all([
    getRequestLocale(),
    loadProvisionalOrientation(),
    loadVerifiedProgrammeCatalogue().catch(() => []),
  ]);

  const t = provisionalCopy[locale];
  const recommendations = prospectCatalogueRecommendations(orientation, catalogue);
  const ordered = [...recommendations.map((item) => item.programme),
    ...catalogue.filter((item) => !recommendations.some((rec) => rec.programme.id === item.id))];

  // Only public catalogue attributes are serialized to the browser.
  const programmes: ProvisionalProgramme[] = ordered.slice(0, 36).map((item) => ({
    id: item.id,
    name: item.name,
    university: item.university.name,
    city: item.university.city || "",
    field: item.field || "",
    degree: item.degreeLevel,
    language: item.teachingLanguage || "",
    officialUrl: safeSource(item.programmeSourceUrl),
    recommended: recommendations.some((rec) => rec.programme.id === item.id),
  }));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-9">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center"><BrandLogo className="h-auto w-40 sm:w-52"/></Link>
          <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand)] underline underline-offset-4">{t.login}</Link>
        </header>

        <section className="pc-panel p-5 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--brand)]">{t.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">{t.intro}</p>
          <div className="mt-5 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4" aria-label={t.verify}>
            <h2 className="text-lg font-bold">{t.verify}</h2>
            <p className="mt-2 text-sm leading-6">{t.alert}</p>
            <ProvisionalEmailVerification locale={locale}/>
          </div>
        </section>

        <section id="orientation" className="pc-panel p-5 sm:p-7">
          <h2 className="text-2xl font-bold">{t.orientation}</h2>
          {orientation ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                [t.degree, orientation.targetDegree],
                [t.field, orientation.targetField],
                [t.language, orientation.germanLevel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <dt className="text-xs font-semibold text-[var(--muted)]">{label}</dt>
                  <dd className="mt-1 font-bold">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[var(--muted)]">{t.orientationEmpty}</p>
              <Link href="/orientation" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 font-semibold text-white">{t.orientationAction}</Link>
            </div>
          )}
        </section>

        <ProvisionalProgrammeSearch items={programmes} locale={locale}/>

        <div className="grid gap-5 md:grid-cols-2">
          <section id="steps" className="pc-panel p-5 sm:p-7">
            <h2 className="text-xl font-bold">{t.steps}</h2>
            <ol className="mt-4 space-y-3">
              {[t.step1, t.step2, t.step3, t.step4].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6"><span className="font-bold text-[var(--brand)]">{index + 1}.</span>{step}</li>
              ))}
            </ol>
          </section>
          <section id="solutions" className="pc-panel p-5 sm:p-7">
            <h2 className="text-xl font-bold">{t.solutions}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{t.solutionsText}</p>
            <h3 className="mt-5 font-semibold">{t.sensitive}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{t.restricted}</p>
          </section>
        </div>
        <footer className="space-y-3 pb-8 text-center text-xs leading-6 text-[var(--muted)]">
          <p>{t.notice}</p>
          <Link href="/prospect-preview/leave" className="inline-flex min-h-11 items-center underline underline-offset-4">{t.quit}</Link>
        </footer>
      </div>
    </main>
  );
}
