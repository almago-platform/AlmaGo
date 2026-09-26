import Link from "next/link";

type AuthStoryPanelProps = {
  mode: "login" | "signup";
};

const content = {
  login: {
    eyebrow: "Votre dossier AlmaGo",
    title: "Reprenez votre parcours là où vous l’avez laissé.",
    description:
      "Votre projet, vos documents, vos candidatures et vos prochaines actions restent réunis dans un dossier structuré.",
    points: [
      ["01", "Une prochaine action lisible", "Identifiez rapidement ce qui demande votre attention."],
      ["02", "Des sources et statuts visibles", "Distinguez les informations vérifiées, les étapes internes et les décisions externes."],
      ["03", "Un espace personnel", "Retrouvez les éléments enregistrés dans votre dossier sans les disperser."],
    ],
  },
  signup: {
    eyebrow: "Créer votre dossier",
    title: "Commencez par structurer votre projet d’études.",
    description:
      "AlmaGo vous guide étape par étape sans transformer une recommandation, un statut interne ou une progression en promesse d’admission.",
    points: [
      ["01", "Définir le projet", "Diplôme, domaine, langue et objectif académique."],
      ["02", "Rassembler les preuves", "Documents, critères et informations vérifiables."],
      ["03", "Suivre les démarches", "Candidatures, préparation et prochaines actions."],
    ],
  },
} as const;

export function AuthStoryPanel({ mode }: AuthStoryPanelProps) {
  const story = content[mode];

  return (
    <section className="hidden overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white shadow-none lg:block">
      <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] p-7">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
          <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">A</span>
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-950">AlmaGo</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Études en Allemagne</span>
          </span>
        </Link>
      </div>

      <div className="p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">{story.eyebrow}</p>
        <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950">{story.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{story.description}</p>

        <ol className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {story.points.map(([number, title, detail]) => (
            <li key={number} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
              <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">{number}</span>
              <div>
                <p className="text-sm font-bold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-7 border-l-2 border-[var(--brand)] pl-4">
          <p className="text-sm font-bold text-slate-900">AlmaGo organise votre dossier.</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Les décisions d’admission, de visa et de titre de séjour restent du ressort des organismes compétents.</p>
        </div>
      </div>
    </section>
  );
}
