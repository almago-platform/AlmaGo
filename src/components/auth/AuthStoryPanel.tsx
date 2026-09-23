import Image from "next/image";
import Link from "next/link";

type AuthStoryPanelProps = {
  mode: "login" | "signup";
};

const content = {
  login: {
    eyebrow: "Votre dossier, au même endroit",
    title: "Reprenez votre parcours d’études avec une vue claire sur la suite.",
    description:
      "Profil, documents, orientation, démarches et candidatures restent regroupés dans un espace conçu pour rendre la prochaine action lisible.",
    points: [
      ["Suivi structuré", "Les étapes enregistrées sont reliées à des actions concrètes."],
      ["Dossier centralisé", "Les éléments utiles de votre parcours restent accessibles au même endroit."],
    ],
  },
  signup: {
    eyebrow: "Commencer avec une base claire",
    title: "Construisez votre dossier étudiant étape par étape.",
    description:
      "AlmaGo vous aide à structurer les informations utiles dès le départ, sans transformer le suivi interne en promesse d’admission.",
    points: [
      ["1 · Créer le profil", "Renseignez votre parcours et votre projet d’études."],
      ["2 · Préparer le dossier", "Ajoutez ensuite les documents et démarches utiles."],
    ],
  },
} as const;

export function AuthStoryPanel({ mode }: AuthStoryPanelProps) {
  const story = content[mode];

  return (
    <section className="hidden overflow-hidden rounded-[calc(var(--radius-panel)+0.25rem)] border border-[var(--brand-border)] bg-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.5)] lg:block">
      <div className="relative h-72 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1760111085279-6c4b6d831acc?auto=format&fit=crop&q=85&w=1400"
          alt="Étudiants traversant un campus universitaire"
          fill
          sizes="44vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/10" />

        <Link
          href="/"
          className="absolute left-7 top-7 inline-flex items-center gap-3 rounded-[var(--radius-control)] bg-white/95 px-3 py-2 shadow-lg backdrop-blur"
          aria-label="Retour à l'accueil AlmaGo"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">
            A
            <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-slate-950">AlmaGo</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Études en Allemagne
            </span>
          </span>
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">{story.eyebrow}</p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-[1.08] tracking-[-0.03em]">{story.title}</h1>
        </div>
      </div>

      <div className="p-7">
        <p className="text-base leading-7 text-slate-700">{story.description}</p>

        <div className="mt-6 grid gap-3">
          {story.points.map(([title, detail]) => (
            <div key={title} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Photo :{" "}
          <a
            href="https://unsplash.com/photos/students-walking-through-a-university-campus-archway-MUiv880yORo"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline decoration-slate-300 underline-offset-2 hover:text-[var(--brand)]"
          >
            Brelyn Bashrum / Unsplash
          </a>
        </p>
      </div>
    </section>
  );
}
