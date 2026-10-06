import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

export function AdminLoadError({
  title,
  description,
  retryHref,
}: {
  title: string;
  description: string;
  retryHref: string;
}) {
  return (
    <Card className="pc-card shadow-none">
      <div role="alert" className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Chargement interrompu</p>
          <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-[var(--foreground)]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Les données existantes n’ont pas été modifiées.</p>
        </div>
        <ButtonLink href={retryHref}>Réessayer</ButtonLink>
      </div>
    </Card>
  );
}
