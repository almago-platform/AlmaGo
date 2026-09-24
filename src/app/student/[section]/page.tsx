import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

const labels: Record<string, string> = {
  documents: "Documents",
  orientation: "Orientation",
  checklist: "Démarches",
  applications: "Candidatures",
};

export default async function StudentSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const label = labels[section] || "Espace étudiant";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Card className="border-dashed bg-white/70 text-center">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{label}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Cette adresse ne correspond pas à une page active de votre espace. Rien n’a été modifié dans votre dossier.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/student">Retour à mon dossier</ButtonLink>
          <ButtonLink href="/student/checklist" variant="secondary">Voir mes démarches</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
