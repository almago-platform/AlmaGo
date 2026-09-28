import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { accountStateCopy } from "@/content/account-state-copy";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function StudentSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const [{ section }, locale] = await Promise.all([params, getRequestLocale()]);
  const t = accountStateCopy[locale].unknownStudent;
  const label = t.labels[section] || t.fallback;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <Card className="border-dashed bg-white/80 py-8 text-center shadow-none sm:py-10">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{t.eyebrow}</p>
        <h1 className="editorial-accent mt-2 text-3xl leading-tight text-[var(--foreground)]">{label}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{t.text}</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/student">{t.back}</ButtonLink>
          <ButtonLink href="/student/checklist" variant="secondary">{t.steps}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
