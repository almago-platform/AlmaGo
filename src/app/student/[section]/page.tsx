import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { StudentPageState } from "@/components/student/StudentPageState";
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
    <StudentPageFrame>
      <StudentPageState
        centered
        variant="neutral"
        eyebrow={t.eyebrow}
        title={label}
        description={t.text}
        actions={
          <>
            <ButtonLink href="/student">{t.back}</ButtonLink>
            <ButtonLink href="/student/checklist" variant="secondary">{t.steps}</ButtonLink>
          </>
        }
      />
    </StudentPageFrame>
  );
}
